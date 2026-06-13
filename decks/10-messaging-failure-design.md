---
theme: default
title: "第10回: メッセージングと失敗設計"
---

# 第10回: メッセージングと失敗設計

Command / Event、同期 / 非同期、Retry、Outbox を分けて考える

<!--
話すこと:
- 第10回は通信手段とメッセージの意味を分ける回。
- Queue は輸送手段、Event はメッセージの意味。ここを混ぜない。
- 失敗することを前提に、再試行、冪等性、Outbox まで扱う。
-->
---

<DiscussionQuestion>
関数呼び出しを Queue や Event に変えると、何が変わるのか？
</DiscussionQuestion>

<!--
話すこと:
- 「疎結合になる」だけで止めない。何の結合が減り、何の契約が残るかを見る。
-->
---

## この回で目指す状態

今日のゴール:

- Command と Event の意味を区別できる
- 同期 / 非同期、Point-to-point / Publish-subscribe を分けられる
- 冪等性、Retry、DLQ の必要性を説明できる
- Outbox が解く失敗シナリオを説明できる

<!--
話すこと:
- 用語一覧で終わらせず、請求書発行とメール送信の失敗を題材にする。
-->
---

## 軸を分ける

| 軸 | 選択肢 |
|---|---|
| メッセージの意味 | Command / Event |
| 応答 | Synchronous / Asynchronous |
| 配信形態 | Point-to-point / Publish-subscribe |
| 実装 | Function call / HTTP / Queue / Broker |
| 整合性 | Immediate / Eventual |

`Queue` は実装手段。
`Event` は「何が起きたか」を表すメッセージの意味。

<!--
話すこと:
- Direct Call / Queue / Event-driven と一列に並べない。
- プロセス内同期イベントもあり得るため、Event-driven = 非同期分散ではない。
-->
---

## Command と Event

```txt
Command:
  SendInvoiceEmail
  請求書メールを送ってほしい

Event:
  InvoiceIssued
  請求書が発行された
```

Command は相手にやってほしいこと。
Event は過去に起きた事実。

<!--
話すこと:
- デザインパターンとしての GoF Command とは違う。ここではシリアライズ可能な Command Message を扱う。
- メッセージには Handler があり、Handler が実行処理へ変換する。
-->
---

## GoF Command との違い

```ts
type InMemoryCommand = () => Promise<void>

type SendInvoiceEmailMessage = {
  invoiceId: string
  requestedAt: Date
}

type Handler<TMessage> = (message: TMessage) => Promise<void>
```

クロージャはインメモリの遅延実行には使える。
外部 Queue へ保存するなら、シリアライズ可能なデータと Handler に分ける。

<!--
話すこと:
- デザインパターンとしての GoF Command と、実務上のメッセージングをここで区別する。
- キューイングという言葉を使うときは、永続化できるデータかを確認する。
-->
---

## イベントで減る結合、残る結合

イベント発行者は購読者を直接知らない。

ただし、結合は消えない。

| 減るもの | 残るもの |
|---|---|
| 宛先への直接依存 | イベント名 |
| 呼び出し順序の固定 | スキーマ |
| 同期的な待ち合わせ | 意味 |
| 購読者の数への依存 | 発生タイミング |

イベントは宛先結合を減らすが、契約結合と時間的・意味的結合は残る。

<!--
話すこと:
- 「疎結合」を雑に使わない。どの結合が減るのかを言葉にする。
-->
---

## 失敗を前提にする

非同期メッセージングでは、最低限これを見る。

- 重複配信
- 順序保証
- Retry
- Dead Letter Queue
- イベントスキーマの互換性
- 「配信済み」と「処理済み」の違い
- eventual consistency

重複して届いても壊れない処理を、冪等という。

<!--
話すこと:
- 全部を深掘りしない。今日は請求書メールの例で、重複配信と再試行を中心に説明する。
-->
---

## Outbox が必要になる失敗

失敗シナリオ:

```txt
1. invoice を DB へ保存
2. commit 成功
3. event publish 失敗
4. invoice は発行済みだが、メール処理は起動しない
```

DB 更新とイベント発行が別々だと、片方だけ成功する。

<!--
話すこと:
- ここは必ず図としてゆっくり説明する。
- 「DBは更新されたのにメールが送られない」状態が、監視しないと静かに残る。
-->
---

## Transactional Outbox

同じ DB transaction:

```txt
invoice
outbox_message
commit
```

commit 後:

```txt
outbox worker
  -> publish message
  -> mark as published
```

DB 更新と「送るべきメッセージの記録」を同じ transaction に入れる。

<!--
話すこと:
- Outbox はメッセージ送信そのものをDB transactionに入れるのではない。
- 送るべき事実をDBに残し、後でworkerが送る。
- worker側にはRetry、重複送信、冪等なHandlerが必要になる。
-->
---

## 個人ワーク: メール送信をどう設計するか

制約:

- 請求書発行は画面から同期実行
- 請求書の保存と監査ログは必ず成功させたい
- メール送信は遅れてもよい
- メール送信は失敗したら再試行したい

考えること:

- 同じ transaction に入れるものは何か
- Queue に入れるメッセージは Command か Event か
- Handler はどう冪等にするか

<!--
話すこと:
- 「メール送信を同じ同期処理に入れる」案も比較対象にする。
- どの要求が同期整合性で、どの要求が eventual consistency でよいかを見る。
-->
---

## 答え合わせ

判断例:

| 要素 | 判断 |
|---|---|
| 請求書保存 | 同期 transaction |
| 監査ログ | 同じ DB なら同一 transaction |
| メール送信 | Outbox + Queue |
| メッセージ | `SendInvoiceEmail` Command Message |
| Handler | `invoiceId` で重複送信を防ぐ |

非同期にする理由は「先進的だから」ではない。
失敗時に再試行でき、画面応答と切り離せるから。

<!--
話すこと:
- Event にする案もあり得るが、メールを送る明確な作業なら Command Message が分かりやすい。
- 複数の購読者が独立反応するなら Event を検討する。
-->
---

## 今日の判断基準

| 問い | 見ること |
|---|---|
| Command か Event か | やってほしいことか、起きた事実か |
| 同期か非同期か | 呼び出し元が結果を今必要とするか |
| Queue が必要か | 再試行、平準化、切り離しが必要か |
| Outbox が必要か | DB更新とメッセージ発行の片成功を避けたいか |
| 冪等性が必要か | 重複実行で壊れるか |

次回は、読み書きモデルと状態保存の分離、CQRS と Event Sourcing を扱う。

<!--
話すこと:
- 最後に「Queueを入れれば疎結合」ではなく、失敗設計の責任が増えると締める。
-->
