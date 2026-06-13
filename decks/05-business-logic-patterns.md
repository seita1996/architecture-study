---
theme: default
title: "第5回: アプリケーション境界と処理フロー"
---

# 第5回: アプリケーション境界と処理フロー

業務ロジックの置き場所を比較する

<!--
話すこと:
- この回は「第5回: アプリケーション境界と処理フロー」を学ぶ時間だと伝える。最初に正解を覚える場ではなく、判断材料を増やす場だと置く。
- ジュニア向けには、用語を知っているかではなく、あとで会話に参加できる状態を目標にする。
- 最後に現在の設計判断を見直すための観点を一つ持ち帰る、と予告する。
-->
---

<DiscussionQuestion>
業務ルールは手続きとして書くべきか、データ型と関数に分けて表現するべきか？
</DiscussionQuestion>

<!--
話すこと:
- 業務ルールの置き場所は、手続きが悪くモデルが偉いという話ではなく、複雑さと変更理由で選ぶ話だと置く。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## この回で目指す状態

業務ロジックの置き場所を、好みではなく状況で選べるようにする。

今日のゴール:

- Transaction Script が悪い設計ではないと理解する
- Domain Model が必要になる場面を説明できる
- Service Layer が何を調整する場所か言える
- 複雑さに見合う表現を選べる

<!--
話すこと:
- 到達目標を先に共有し、今日どこまで分かれば十分かを明確にする。
- 全部を暗記する必要はなく、似た言葉の違いを自分の言葉で説明できればよいと伝える。
- 各項目は後続スライドで扱うので、この時点では全体像として眺めてもらう。
-->
---

## なぜこの話が必要か

バックエンドでは、業務ルールが少しずつ増える。

最初は単純でも、次のような条件が足される。

- 支払い済みの請求書は取消できない
- 発行済みの請求書は契約ごとに 1 つだけ
- 取消時は監査ログを残す
- 発行時はメールと会計連携を行う

このとき、どこにルールを書くかで読みやすさが変わる。

<!--
話すこと:
- いきなり用語の定義に入らず、現場で起きる困りごとから話す。
- 設計の話は抽象的に見えるが、変更時の迷い、影響範囲、レビューの難しさを減らすためのものだと結びつける。
- 参加者に、最近変更が怖かった箇所を一つ思い出してもらう。
-->
---

## まず業務ロジックとは何か

業務ロジックは、フレームワークや DB ではなく、仕事上のルール。

| ルール | 業務ロジックか |
|---|---|
| 請求書は契約がないと発行できない | はい |
| `POST /invoices` で受け取る | HTTP の話 |
| Prisma で `invoice.create` を呼ぶ | 永続化技術の話 |
| 支払い済みは取消できない | はい |

<!--
話すこと:
- ここでは前提の言葉をゆっくり揃える。専門用語は、正確さよりも会話で同じものを指せることを優先する。
- 似た言葉が出ても、粒度が違う話なのか、目的が違う話なのかを見分ける姿勢を強調する。
- 分からない言葉があれば、この場で止めて確認してよいと伝える。
-->
---

## Transaction Script

```ts
type CancelInvoiceScript = (invoiceId: string) => Promise<CancelInvoiceScriptResult>

const cancelInvoiceScript: CancelInvoiceScript = async (invoiceId) => {
  const invoice = await repository.find(invoiceId)

  if (!invoice) {
    return { type: "not_found" }
  }

  if (invoice.status === "paid") {
    return { type: "cannot_cancel_paid_invoice" }
  }

  await repository.updateStatus(invoiceId, "cancelled")
  return { type: "cancelled" }
}
```

処理を 1 つの手続きとして素直に書く。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Transaction Script が向く場面

Transaction Script は、処理の流れをそのまま書く。

向いている場面:

- 入力を受ける
- DB から読む
- 条件を少し見る
- DB を更新する
- 結果を返す

単純な CRUD なら、これが一番読みやすいことも多い。

<!--
話すこと:
- このスライドでは「Transaction Script が向く場面」を、第5回: アプリケーション境界と処理フロー の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## Domain Model

```ts
type Invoice = {
  id: string
  status: "draft" | "issued" | "paid" | "cancelled"
}

type CancelInvoiceResult =
  | { type: "cancelled"; invoice: Invoice }
  | { type: "cannot_cancel_paid_invoice" }

const cancelInvoice = (invoice: Invoice): CancelInvoiceResult => {
  if (invoice.status === "paid") {
    return { type: "cannot_cancel_paid_invoice" }
  }

  return {
    type: "cancelled",
    invoice: { ...invoice, status: "cancelled" },
  }
}
```

状態遷移や不変条件をデータ型と純粋関数に寄せる。

<!--
話すこと:
- 表は上から読むだけでなく、横に比べる。何が違うからコストや適用場面が変わるのかを見る。
- 一つを優秀、一つを劣っていると扱わず、問題設定が変わると選択も変わると説明する。
- 参加者には、現在のプロダクトならどの列が重要かを考えてもらう。
-->
---

## Domain Model が欲しくなる場面

業務ルールが増えると、手続きの中に条件が散らばる。

例:

- 発行できる状態
- 取消できる状態
- 支払いできる状態
- 再発行できる条件
- 金額の不変条件

このようなルールを「請求書のルール」として近くに置きたいとき、Domain Model が効く。

<!--
話すこと:
- このスライドでは「Domain Model が欲しくなる場面」を、第5回: アプリケーション境界と処理フロー の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## 用語を固定する

この教材では、近い言葉を次のように使い分ける。

| 用語 | この教材での意味 |
|---|---|
| Use Case | ユーザーや外部アクターが達成したい操作 |
| Input Port | アプリケーションが外部へ公開する操作の契約 |
| Application Service | Input Port を実装し、ユースケースを進行する処理 |
| Service Layer | Application Service 群によって形成されるアプリケーション境界 |
| Domain Service | 特定の Entity や Value Object に自然に属さないドメイン判断 |

完全に一つの言葉へ統一するより、どの粒度を指しているかを明確にする。

<!--
話すこと:
- Service という語は曖昧なので、この回以降の読み方をここで固定する。
- `CancelInvoiceUseCase` は Use Case を実装する Application Service の例だと説明する。
- Domain Service は I/O の調整役ではなく、ドメイン判断を置く候補だと強調する。
-->
---

## Service Layer

```ts
type CancelInvoiceUseCase = (invoiceId: string) => Promise<CancelInvoiceResult>

const createCancelInvoiceUseCase =
  (deps: {
    transaction: TransactionRunner
  }): CancelInvoiceUseCase =>
  async (invoiceId) => {
    return deps.transaction.run(async ({ invoices, auditLog }) => {
      const invoice = await invoices.findById(invoiceId)

      if (!invoice) {
        return { type: "not_found" }
      }

      const result = cancelInvoice(invoice)

      if (result.type === "cancelled") {
        await invoices.save(result.invoice)
        await auditLog.record("invoice_cancelled", invoiceId)
      }

      return result
    })
  }
```

アプリケーションが提供する操作の入口になる。
外部依存、トランザクション、応答の形を調整する。
`transaction.run` の中で使う Repository は、同じ transaction に束縛されたものを受け取る。

<!--
話すこと:
- `transaction.run(async () => deps.invoices.save(...))` と書くだけでは、同じDB接続を使う保証はない。
- callback に transaction-bound な Repository を渡す、または tx client から Repository を作る必要があると補足する。
- Application Service は処理を調整する場所であり、すべての業務判断を抱え込む場所ではない。
-->
---

## Service Layer は何をする場所か

Service Layer は、業務ルールそのものを全部置く場所ではない。

主な役割は「アプリケーション操作の境界」と「ユースケースの進行役」。

| 役割 | 例 |
|---|---|
| 読み込み | 請求書を Repository から読む |
| 業務判断の呼び出し | `cancelInvoice(invoice)` を呼ぶ |
| トランザクション | どこからどこまでを一貫して保存するか決める |
| 保存 | 変更後の請求書を保存する |
| 外部処理 | 監査ログ、メール、Queue を呼ぶ |

<!--
話すこと:
- Application Service は、永続化、ドメイン判断、外部処理を順番に調整する。
- 監査ログやQueueを呼ぶ場合も、transaction内で行うのか、Outboxへ出すのかで失敗時の意味が変わる。
-->
---

## 判断基準

名前を選ぶのではなく、観点を分けて考える。

| 観点 | 考えること |
|---|---|
| 外部へ公開する契約 | Input Port |
| ユースケースを進行する単位 | Application Service |
| アプリケーション全体の境界 | Service Layer |
| 業務ロジックの表現 | Transaction Script / Domain Model |
| ドメイン判断の置き場所 | Entity / Value Object / Domain Service |

Application Service は個々のユースケースを実装する単位。
Service Layer は Application Service 群が形成する境界。
業務ルールが単純なら、Application Service 内の Transaction Script で十分。
状態遷移や不変条件が増えたら Domain Model へ移す。

<!--
話すこと:
- このスライドは結論を押し付ける場ではなく、今日の判断材料を短く言語化する場にする。
- どの選択肢にも向き不向きがあり、要求と制約に照らして選ぶという軸を繰り返す。
- チームの言葉として残したい一文を、その場で一つ決める。
-->
---

## 避けたい結論

<div class="study-warning">
Domain Model は Transaction Script より常に上等、という話にしない。
</div>

複雑さに見合う設計を選ぶ。

<!--
話すこと:
- このスライドでは「避けたい結論」を、第5回: アプリケーション境界と処理フロー の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## 個人ワーク: どちらの表現が合うか

「支払い済みの請求書はキャンセルできない」という仕様を考える。

案 A:

```ts
const cancelInvoice = async (invoiceId: string): Promise<CancelResult> => {
  const invoice = await repository.findById(invoiceId)
  if (!invoice) return { type: "not_found" }
  if (invoice.status === "paid") return { type: "cannot_cancel_paid" }

  await repository.updateStatus(invoiceId, "cancelled")
  return { type: "cancelled" }
}
```

案 B:

```ts
type Invoice = { status: "draft" | "issued" | "paid" | "cancelled" }

const cancel = (invoice: Invoice): CancelResult => {
  if (invoice.status === "paid") return { type: "cannot_cancel_paid" }
  return { type: "cancelled", invoice: { ...invoice, status: "cancelled" } }
}
```

どちらが合うか、仕様の複雑さを想像する。

次の形式で短く書く。

```txt
Decision:
案A / 案B / 条件付き

Drivers:
重視した要求や制約

Trade-offs:
得るものと増えるコスト
```

<!--
話すこと:
- ここは長い発表ではなく、各自で判断文を書いてから答え合わせへ進む。
- 正解を急がず、何を重視したかと何を犠牲にしたかを外に出す。
- 次のスライドで答え合わせをするので、ここでは自分なりの仮説を持ってもらう。
-->
---

## 答え合わせ: 複雑さに合わせて選ぶ

この仕様だけなら、案 A の Transaction Script でも十分。

| 状況 | 向く表現 |
|---|---|
| ルールが1つだけ | Application Service 内の Transaction Script で十分 |
| 状態遷移が増える | Domain Model へ移す |
| 外部処理の順序が重要 | Application Service で調整する |
| ドメイン型に自然に置けない判断 | Domain Service を検討する |

もし次の仕様が増えるなら、案 B が効き始める。

- 発行済みだけキャンセル可能
- キャンセル期限がある
- 一部返金がある
- 監査イベントを必ず残す

「Domain Model が上等」ではなく、ルールの密度に見合うかを見る。

<!--
話すこと:
- 答え合わせでは唯一の正解としてではなく、判断の筋道として説明する。
- どの情報を見てそう判断したのかを明示し、参加者が自分の考えと照合できるようにする。
- 最後に、この回の判断基準へ短く接続する。
-->
---

## 今日の判断基準

業務ロジックの置き場所は、軸を分けて考える。

| 状況 | 選びやすい形 |
|---|---|
| ユースケースを外部へ公開する | Input Port |
| ユースケースを進行する | Application Service |
| 手順が短く、分岐が少ない | Application Service 内の Transaction Script |
| 状態遷移や不変条件が増える | Domain Model |
| ドメイン型に置きにくい業務判断 | Domain Service |

次回は、DB や ORM とドメインをどう分けるかを見る。

<!--
話すこと:
- 最後に、この回で使える判断基準を短く回収する。
- 新しいパターン名を覚えたかではなく、どの制約なら選ぶのかを言えることを確認する。
- 次回のテーマに接続し、今日の内容が次の比較材料になると伝える。
-->
