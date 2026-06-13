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

- 発行済みの請求書だけ取消できる
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
| 発行済みだけ取消できる | はい |

<!--
話すこと:
- ここでは前提の言葉をゆっくり揃える。最初は直感的な説明から入る。ただし、正式な定義との差と、この回で省略している範囲を明示する。
- 似た言葉が出ても、粒度が違う話なのか、目的が違う話なのかを見分ける姿勢を強調する。
- 分からない言葉があれば、この場で止めて確認してよいと伝える。
-->
---

## Transaction Script

Transaction Script の `transaction` は、1回の業務要求を処理する業務トランザクションを指す。
必ずしも DB transaction と同義ではない。
必要な DB transaction 境界は別途設計する。

```ts
type CancelInvoiceScriptResult =
  | { type: "not_found" }
  | { type: "cannot_cancel"; currentStatus: Invoice["status"] }
  | { type: "cancelled"; invoice: Extract<Invoice, { status: "cancelled" }> }

type CancelInvoiceScript = (invoiceId: string) => Promise<CancelInvoiceScriptResult>

const cancelInvoiceScript: CancelInvoiceScript = async (invoiceId) => {
  const invoice = await repository.find(invoiceId)

  if (!invoice) {
    return { type: "not_found" }
  }

  if (invoice.status !== "issued") {
    return { type: "cannot_cancel", currentStatus: invoice.status }
  }

  const cancelled = {
    ...invoice,
    status: "cancelled" as const,
    cancelledAt: clock.now(),
  }

  await repository.save(cancelled)
  return { type: "cancelled", invoice: cancelled }
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
type InvoiceBase = {
  id: string
  contractId: string
  amount: Money
}

type Currency = "JPY" | "USD"
type Result<T, E> =
  | { type: "ok"; value: T }
  | { type: "error"; error: E }
type InvalidMoney =
  | "not_integer"
  | "out_of_range"
  | "unsupported_currency"

type Money = {
  amountInMinorUnits: number
  currency: Currency
}

declare const createMoney: (
  amountInMinorUnits: number,
  currency: Currency,
) => Result<Money, InvalidMoney>

type Invoice =
  | InvoiceBase & { status: "draft" }
  | InvoiceBase & { status: "issued"; issuedAt: Date }
  | InvoiceBase & { status: "paid"; issuedAt: Date; paidAt: Date }
  | InvoiceBase & {
      status: "cancelled"
      issuedAt: Date
      cancelledAt: Date
    }

type CancelledInvoice = Extract<Invoice, { status: "cancelled" }>

type CancelInvoiceDecision =
  | { type: "cancelled"; invoice: CancelledInvoice }
  | { type: "cannot_cancel"; currentStatus: Invoice["status"] }

const cancelInvoice = (
  invoice: Invoice,
  now: Date,
): CancelInvoiceDecision => {
  if (invoice.status !== "issued") {
    return { type: "cannot_cancel", currentStatus: invoice.status }
  }

  return {
    type: "cancelled",
    invoice: {
      ...invoice,
      status: "cancelled",
      cancelledAt: now,
    },
  }
}
```

実際には factory で整数、範囲、通貨を検証する。
この例では `Money` の構造だけを示している。
状態、業務上の型、不変条件、状態遷移を近くに置く。
純粋関数に切り出すだけで Domain Model になるわけではない。

<!--
話すこと:
- Domain Modelは、状態、不変条件、状態遷移、業務上の型、複数ユースケースからのルール再利用をまとめて考える。
- この例では issued の請求書だけcancelできる。不完全な遷移を許さないことがポイント。
- ドメイン判断は、請求書が存在しない、HTTPで404にする、といったユースケース全体の結果までは知らない。
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
| Entity | 同一性を持ち、状態が変わっても同じものとして扱う業務概念 |
| Value Object | 同一性ではなく値そのもので等価性を判断する業務概念 |
| 不変条件 | 常に守らなければならない業務ルール |
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
type CancelInvoiceUseCaseResult =
  | { type: "not_found" }
  | CancelInvoiceDecision

type CancelInvoiceUseCase = (invoiceId: string) => Promise<CancelInvoiceUseCaseResult>

type Clock = {
  now: () => Date
}

const createCancelInvoiceUseCase =
  (deps: {
    transaction: TransactionRunner
    clock: Clock
  }): CancelInvoiceUseCase =>
  async (invoiceId) => {
    return deps.transaction.run(async ({ invoices, auditLogRepository }) => {
      const invoice = await invoices.findById(invoiceId)

      if (!invoice) {
        return { type: "not_found" }
      }

      const result = cancelInvoice(invoice, deps.clock.now())

      if (result.type === "cancelled") {
        await invoices.save(result.invoice)
        await auditLogRepository.record("invoice_cancelled", invoiceId)
      }

      return result
    })
  }
```

アプリケーションが提供する操作の入口になる。
外部依存、トランザクション、応答の形を調整する。
`transaction.run` の中で使う Repository は、同じ transaction に束縛されたものを受け取る。
時間も外部依存なので、`Clock` から受け取る。
請求書が存在しない、というユースケース全体の結果は Application Service 側で表す。

同じ DB 内の更新は local transaction に入れる。
外部ネットワーク I/O は、長い DB transaction の中で実行しない。

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
| 業務判断の呼び出し | `cancelInvoice(invoice, now)` を呼ぶ |
| トランザクション | どこからどこまでを一貫して保存するか決める |
| 保存 | 変更後の請求書を保存する |
| 同一整合性境界内の保存 | 請求書、DB監査ログを保存する |
| 非同期処理の意図を記録 | Outbox message を保存する |
| 外部I/Oを起動・調整 | メール、決済、外部Queueを呼ぶ |

外部通知まで同期的に必要なら、補償や状態管理も設計する。
DB 更新と外部通知の意図を原子的に残したいなら、Outbox を検討する。

<!--
話すこと:
- Application Service は、永続化、ドメイン判断、外部I/Oの意図や起動を順番に調整する。
- 同じ「監査」でも、同一DBの監査ログと外部監査基盤では整合性境界が違う。
- Queueへ直接publishするのか、Outbox messageをDBへ保存するのかで片成功の意味が変わる。
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

「発行済みの請求書だけがキャンセルできる」という仕様を考える。

案 A:

```ts
type InvoiceBase = {
  id: string
  contractId: string
  amount: Money
}

type Currency = "JPY" | "USD"
type Result<T, E> =
  | { type: "ok"; value: T }
  | { type: "error"; error: E }
type InvalidMoney =
  | "not_integer"
  | "out_of_range"
  | "unsupported_currency"

type Money = {
  amountInMinorUnits: number
  currency: Currency
}

declare const createMoney: (
  amountInMinorUnits: number,
  currency: Currency,
) => Result<Money, InvalidMoney>

type Invoice =
  | InvoiceBase & { status: "draft" }
  | InvoiceBase & { status: "issued"; issuedAt: Date }
  | InvoiceBase & { status: "paid"; issuedAt: Date; paidAt: Date }
  | InvoiceBase & {
      status: "cancelled"
      issuedAt: Date
      cancelledAt: Date
    }

type CancelledInvoice = Extract<Invoice, { status: "cancelled" }>

type CancelUseCaseResult =
  | { type: "not_found" }
  | { type: "cannot_cancel"; currentStatus: Invoice["status"] }
  | { type: "cancelled"; invoice: CancelledInvoice }

const cancelInvoiceA = async (invoiceId: string): Promise<CancelUseCaseResult> => {
  const invoice = await repository.findById(invoiceId)
  if (!invoice) return { type: "not_found" }

  if (invoice.status !== "issued") {
    return { type: "cannot_cancel", currentStatus: invoice.status }
  }

  const cancelled = {
    ...invoice,
    status: "cancelled" as const,
    cancelledAt: clock.now(),
  }

  await repository.save(cancelled)
  return { type: "cancelled", invoice: cancelled }
}
```

案 B:

```ts
const cancelInvoiceB = async (invoiceId: string): Promise<CancelUseCaseResult> => {
  const invoice = await repository.findById(invoiceId)
  if (!invoice) return { type: "not_found" }

  const decision = cancelInvoice(invoice, clock.now())

  if (decision.type === "cancelled") {
    await repository.save(decision.invoice)
  }

  return decision
}
```

どちらもユースケース全体を表している。
差は、業務判断を Application Service 内に置くか、Domain Model に移すか。

次の形式で短く書く。

```txt
Decision:
案A / 案B / 条件付き

Driver / Priority:
最も重視した要求や制約

Trade-offs:
得るものと増えるコスト

Unknown:
判断に足りない情報
```

<!--
話すこと:
- ここは長い発表ではなく、各自で判断文を書いてから答え合わせへ進む。
- 正解を急がず、何を重視したかと何を犠牲にしたかを外に出す。
- 次のスライドで答え合わせをするので、ここでは自分なりの仮説を持ってもらう。
-->
---

## 答え合わせ: 複雑さに合わせて選ぶ

どちらも同じ仕様と同じ処理スコープで比べる。
この仕様だけなら、案 A の Transaction Script でも十分。

| 状況 | 向く表現 |
|---|---|
| 業務判断が局所的で単純 | Application Service 内の Transaction Script で十分 |
| 状態遷移、不変条件、計算規則が複数ユースケースで再利用される | Domain Model を検討する |
| 外部 I/O の順序や transaction 調整が中心 | Application Service で調整する |
| ドメイン型に自然に置けない判断 | Domain Service を検討する |

もし次の仕様が増えるなら、案 B が効き始める。

- キャンセル期限がある
- 一部返金がある
- キャンセル理由の種類で後続処理が変わる
- キャンセル後の状態や理由に応じて、複数の処理が同じ判定を使う

「Domain Model が上等」ではなく、ルールの密度、相互作用、再利用性に見合うかを見る。

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
