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
- 同期 / 非同期を分けられる
- Outbox が解く失敗シナリオを説明できる
- at-least-once と冪等性の関係を説明できる

30分版では、Point-to-point / Publish-subscribe、DLQ、exactly-once、Inbox、外部副作用の厳密な限界は補足として扱う。

| 区分 | 扱う内容 |
|---|---|
| 主役 | Command / Event |
| 主役 | Sync / Async |
| 主役 | Outbox が解く片成功 |
| 主役 | at-least-once |
| 主役 | 冪等性 |
| 補足 | GoF Command、Inbox、DLQ運用、exactly-once、外部副作用の厳密な限界 |

<!--
話すこと:
- 用語一覧で終わらせず、請求書発行とメール送信の失敗を題材にする。
- 30分版の主役は Command/Event、Sync/Async、Outbox、at-least-once、冪等性に絞る。
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

## 補足: GoF Command との違い

```ts
type InMemoryCommand = () => Promise<void>

type SendInvoiceEmailMessage = {
  invoiceId: string
  requestedAt: string
}

type Handler<TMessage> = (message: TMessage) => Promise<void>
```

クロージャはインメモリの遅延実行には使える。
外部 Queue へ保存するなら、シリアライズ可能なデータと Handler に分ける。
日時は `Date` オブジェクトではなく、ISO-8601 文字列などの外部表現にする。

<!--
話すこと:
- デザインパターンとしての GoF Command と、実務上のメッセージングをここで区別する。
- キューイングという言葉を使うときは、永続化できるデータかを確認する。
-->
---

## Event semantics で変わること

Event は「起きた事実」を表す。

Command のように、具体的な処理命令を表すわけではない。

Event semantics で変わること:

- 発行者が具体的な処理命令ではなく、発生した事実を表す
- 0個以上の Consumer が反応できる
- 発行者は個々の Consumer を直接知らない
- Event schema と意味への依存は残る

<!--
話すこと:
- Event は意味形式。同期か非同期かは別軸だと強調する。
- プロセス内で同期的にEventをpublishし、全Subscriberの完了を待つ構成もあり得る。
-->
---

## 非同期配送で変わること

Queue や Broker で非同期配送にすると、時間的な関係が変わる。

| 変わること | 増える設計責任 |
|---|---|
| 呼び出し元が処理完了を待たなくてよい | 後から失敗する |
| 時間的結合が弱まる | 順序をどう扱うか |
| 処理を平準化しやすい | 重複をどう扱うか |
| 再試行しやすい | 追跡、監視、DLQ が必要になる |

非同期配送は、Event でも Command Message でも使える。

<!--
話すこと:
- ここで初めて「同期的な待ち合わせが減る」と説明する。
- それはEventの効果ではなく、非同期配送を選んだ効果。
-->
---

## 失敗を前提にする

非同期メッセージングでは、最低限これを見る。

- 重複配信
- 順序保証
- Retry: 再実行しても安全な処理を、条件付きで再実行する
- Dead Letter Queue: 処理できない message を退避する場所
- message schema の互換性
- 「配信済み」と「処理済み」の違い
- eventual consistency: 一時的な不一致を許容し、配送・再試行・修復などの仕組みにより、最終的な収束を目指す整合性モデル

重複して届いても壊れない処理を、冪等という。

Retry できるのは、再実行しても安全な処理、または Idempotency Key などで重複を抑制できる処理に限る。
timeout は処理結果が不明な場合があるため、無条件に Retry しない。

| 失敗 | 例 | 方針 |
|---|---|---|
| 受付前と確認できる | connection refused、Broker からの明示的な未受付応答 | Backoff して Retry を検討 |
| 結果不明 | timeout、接続切断、一部の 5xx | 状態照会、Idempotency Key が必要 |
| 恒久的 | 入力不正、権限不足 | Retry しない |

重要なのは、対象システムが要求を受け付けていないと確認できるかどうか。
eventual consistency は放置してよいという意味ではない。
未処理状態を観測し、修復できる必要がある。

<!--
話すこと:
- 全部を深掘りしない。今日は請求書メールの例で、重複配信と再試行を中心に説明する。
- HTTPステータスだけで副作用の有無を断定しない。副作用を伴う要求では、5xxも結果不明として扱う必要がある場合がある。
-->
---

## Outbox が必要になる失敗

失敗シナリオ:

```txt
1. invoice を DB へ保存
2. commit 成功
3. message publish 失敗
4. invoice は発行済みだが、メール処理は起動しない
```

DB 更新と message publish が別々だと、片方だけ成功する。

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
ただし、publish 成功後に `mark as published` 前でクラッシュすると再送される。
Outbox は通常 at-least-once になり、重複は起きる前提で Handler を設計する。

| 配送の見方 | 意味 |
|---|---|
| at-most-once | 配送範囲内で0回または1回。失われる可能性がある |
| at-least-once | 失われにくいが、重複する可能性がある |
| exactly-once | 実装や範囲に条件が強い。業務処理では冪等性で守ることが多い |

Consumer 側では、`messageId` などを処理済みとして記録する Inbox / processed-message pattern を検討する。

ただし、外部メール送信のような非トランザクショナルな副作用は、それだけでは完全に守れない。

```txt
メール送信成功
-> 処理済み記録の前にクラッシュ
-> 再実行され、同じメールを再送する可能性

処理済み記録成功
-> メール送信前にクラッシュ
-> 再実行されず、メールが送られない可能性
```

段階を分けて考える。

- DB内の処理: Inbox テーブルと業務更新を同一 transaction に入れられる
- 外部API: プロバイダーの Idempotency Key があれば利用する
- Idempotency Key がない外部API: 送信状態、再送ポリシー、重複許容性を設計する
- 目標: exactly-once ではなく、業務上許容できる重複抑制を考える

<!--
話すこと:
- Outbox はメッセージ送信そのものをDB transactionに入れるのではない。
- 送るべき事実をDBに残し、後でworkerが送る。
- worker側にはRetry、重複送信、冪等なHandlerが必要になる。ただし外部副作用は処理済み記録だけでは完全に守れない。
-->
---

## 個人ワーク: メール送信をどう設計するか

制約:

- 請求書発行は画面から同期実行
- 請求書の保存と監査ログは同一DBにあり、両方が成功するか、両方ともロールバックされる必要がある
- メール送信は遅れてもよい
- メール送信は失敗したら再試行したい

考えること:

- 同じ transaction に入れるものは何か
- Queue に入れるメッセージは Command か Event か
- Handler はどう冪等にするか

次の形式で短く書く。

```txt
Decision:
同期処理 / Outbox + Queue / 追加調査

Driver / Priority:
最も重視した失敗シナリオや要求

Trade-offs:
得るものと増える運用コスト

Unknown:
判断に足りない情報
```

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
| DB内の重複処理 | Inbox / processed-message と業務更新を同一 transaction で扱う |
| 外部API冪等性 | プロバイダーが Idempotency Key を持つなら、`invoiceId + notificationType` などの業務キーを渡す |
| Idempotency Key がない場合 | 送信状態、再送ポリシー、重複許容性を設計する |

非同期にする理由は「先進的だから」ではない。
失敗時に再試行でき、画面応答と切り離せるから。
Command Message は発行側が「メールを送る」という後続処理を知る。
Event は発行側が「請求書が発行された」という事実だけを出し、通知側が反応を選ぶ。
Command は宛先と目的が明確だが、発行側が通知要求を知る。
Event は購読者を直接知らない。
Event を非同期配送する場合は、イベント契約に加えて eventual consistency の設計が必要になる。
冪等性キーの例は、`messageId`、`(invoiceId, notificationType)` の unique constraint、メールプロバイダーの idempotency key、配信状態テーブルなど。
ただし、外部APIが冪等性キーを持たない場合、processed-message だけで重複メールを完全には防げない。
重複メールが重大なら、プロバイダーや送信方式の変更も検討する。

<!--
話すこと:
- Event にする案もあり得るが、メールを送る明確な作業なら Command Message が分かりやすい。
- 複数の購読者が独立反応するなら Event を検討する。
- DLQ は単なる置き場ではない。監視、原因分類、修正後の再投入、毒メッセージの隔離まで設計しないと、失敗が見えない墓場になる。
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
