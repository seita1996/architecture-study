---
theme: default
title: "第9回: GoFデザインパターン前編"
---

# 第9回: GoF デザインパターン前編

バックエンドで頻出する振る舞いのパターンを扱う

<!--
話すこと:
- この回は「第9回: GoF デザインパターン前編」を学ぶ時間だと伝える。最初に正解を覚える場ではなく、判断材料を増やす場だと置く。
- ジュニア向けには、用語を知っているかではなく、あとで会話に参加できる状態を目標にする。
- 最後に現在の Vertical Slice + Hexagonal 構成へつながる観点を一つ持ち帰る、と予告する。
-->
---

<DiscussionQuestion>
大きな if や switch は、いつ Strategy や State に置き換える価値があるのか？
</DiscussionQuestion>

<!--
話すこと:
- このスライドでは「今回の問い」を、第9回: GoF デザインパターン前編 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## この回で目指す状態

GoF パターンを暗記リストにしない。

今日のゴール:

- パターン名を聞いたとき、解決したい問題を想像できる
- Strategy、Template Method、State、Command の違いを言える
- TypeScript では関数で自然に表せることが多いとわかる
- パターンを使わない判断もできる

<!--
話すこと:
- 到達目標を先に共有し、今日どこまで分かれば十分かを明確にする。
- 全部を暗記する必要はなく、似た言葉の違いを自分の言葉で説明できればよいと伝える。
- 各項目は後続スライドで扱うので、この時点では全体像として眺めてもらう。
-->
---

## なぜこの話が必要か

業務コードでは、条件分岐が少しずつ増える。

最初は読みやすい `if` でも、増え続けると意図が見えにくくなる。

| 困りごと | 候補になる考え方 |
|---|---|
| 料金計算ルールを差し替えたい | Strategy |
| 処理手順は同じで一部だけ違う | Template Method |
| 状態ごとに振る舞いが違う | State |
| 操作を実行可能な単位として渡したい | GoF Command |

<!--
話すこと:
- いきなり用語の定義に入らず、現場で起きる困りごとから話す。
- 設計の話は抽象的に見えるが、変更時の迷い、影響範囲、レビューの難しさを減らすためのものだと結びつける。
- 参加者に、最近変更が怖かった箇所を一つ思い出してもらう。
-->
---

## まずパターンとは何か

パターンは「よくある問題と、その解き方に付いた名前」。

名前を知るメリット:

- コードレビューで説明しやすい
- 既存コードを読み解きやすい
- 過剰設計に気づきやすい
- チームで同じ言葉を使える

名前を知ることより、使う理由を説明できることが大事。

<!--
話すこと:
- ここでは前提の言葉をゆっくり揃える。専門用語は、正確さよりも会話で同じものを指せることを優先する。
- 似た言葉が出ても、粒度が違う話なのか、目的が違う話なのかを見分ける姿勢を強調する。
- 分からない言葉があれば、この場で止めて確認してよいと伝える。
-->
---

## Strategy

```ts
type PricingStrategy = (order: Order) => Money

const campaignPricing: PricingStrategy = (order) =>
  order.total.multiply(0.9)
```

変更可能なルールを差し替える。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Strategy を使わない方がよい場面

分岐が 2 つしかなく、増える見込みもないなら、普通の条件分岐で十分なことが多い。

Strategy が効くのは、次のようなとき。

- ルールが増える
- ルールをテストで個別に見たい
- 顧客やプランごとに差し替える
- 呼び出し側は同じ形で扱いたい

<!--
話すこと:
- このスライドでは「Strategy を使わない方がよい場面」を、第9回: GoF デザインパターン前編 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## Template Method

処理の骨格を固定し、一部だけ変更する。

TypeScript では継承より、関数合成の方が自然な場合がある。

```ts
type IssueSteps = {
  load: (id: ContractId) => Promise<Contract | null>
  validate: (contract: Contract) => IssueInvoiceResult | null
  create: (contract: Contract) => Promise<Invoice>
}

const createIssueFlow =
  (steps: IssueSteps) =>
  async (contractId: ContractId): Promise<IssueInvoiceResult> => {
    const contract = await steps.load(contractId)
    if (!contract) return { type: "contract_not_found" }

    const invalid = steps.validate(contract)
    if (invalid) return invalid

    const invoice = await steps.create(contract)
    return { type: "issued", invoiceId: invoice.id }
}
```

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Template Method を関数で見る

継承で固定手順を作るより、高階関数で十分なことがある。

`createIssueFlow` は次を固定している。

- 契約を読む
- 見つからなければ失敗を返す
- 検証する
- 請求書を作る

差し替わるのは、各ステップの実装。

Decorator は既存の契約を保ったまま外側からログや計測を足す。Template Method は処理手順そのものを固定する。

<!--
話すこと:
- このスライドでは「Template Method を関数で見る」を、第9回: GoF デザインパターン前編 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## State

```ts
type InvoiceState =
  | { type: "draft" }
  | { type: "issued"; issuedAt: Date }
  | { type: "paid"; paidAt: Date }

type StateBehavior = {
  pay: (invoice: Invoice) => PayInvoiceResult
  cancel: (invoice: Invoice) => CancelInvoiceResult
}

const stateBehaviors: Record<InvoiceState["type"], StateBehavior> = {
  draft: draftBehavior,
  issued: issuedBehavior,
  paid: paidBehavior,
}
```

状態によって振る舞いを変える。

`status` の switch を散らばらせる代わりに、状態ごとの振る舞いへ委譲する設計。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## State を考える合図

次のようなコードが複数箇所に出てきたら、State 的な整理を考える。

```ts
if (invoice.status === "paid") {
  return { type: "cannot_cancel_paid_invoice" }
}
```

同じ状態判定が散らばると、仕様変更時に漏れやすい。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Command

```ts
type Command = () => Promise<void>

const createIssueInvoiceCommand =
  (deps: Dependencies, input: IssueInvoiceInput): Command =>
  async () => {
    await issueInvoice(deps, input)
  }
```

要求の実行をカプセル化する。

名前が似ているものを分ける。

```ts
type IssueInvoiceCommandMessage = {
  contractId: string
  requestedBy: string
}
```

`IssueInvoiceCommandMessage` は入力データ。GoF Command は実行可能な振る舞い。
第12回の CQRS Command は、書き込み要求を表すメッセージとして扱う。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 判断基準

| パターン | 効く場面 | コスト |
|---|---|---|
| Strategy | ルール差し替えが多い | 関数が増える |
| Template Method | 手順が固定で一部だけ違う | 継承だと硬くなりやすい |
| State | 状態遷移が複雑 | 遷移関数や状態型が増える |
| GoF Command | 操作を遅延実行、キューイング、取り消ししたい | 単純処理では冗長 |

<!--
話すこと:
- このスライドは結論を押し付ける場ではなく、今日の判断材料を短く言語化する場にする。
- どの選択肢にも向き不向きがあり、要求と制約に照らして選ぶという軸を繰り返す。
- チームの言葉として残したい一文を、その場で一つ決める。
-->
---

## 個人ワーク: if を分けるべきか

次の料金計算を見て、Strategy にする価値があるか考える。

```ts
type Plan = "free" | "standard" | "enterprise"

const assertNever = (value: never): never => {
  throw new Error(`Unexpected plan: ${value}`)
}

const calculateMonthlyFee = (plan: Plan, seats: number): number => {
  switch (plan) {
    case "free":
      return 0
    case "standard":
      return seats * 1200
    case "enterprise":
      return seats * 2000 + 50000
    default:
      return assertNever(plan)
  }
}
```

考えること:

- プラン追加はどれくらいありそうか
- 計算式はどれくらい複雑になりそうか
- テストはどの単位で書きたいか
- 今すぐ分けると読みやすくなるか

<!--
話すこと:
- ここは個人で頭の中で考える時間にする。発言を求めず、コードや構成を見てどこが判断ポイントかを探してもらう。
- 正解を急がず、迷った箇所を自分で印を付けるくらいで十分だと伝える。
- 次のスライドで答え合わせをするので、ここでは自分なりの仮説を持ってもらう。
-->
---

## 答え合わせ: 変化する軸が濃くなったら Strategy

今の3分岐だけなら、そのままでも十分読める。

Strategy が効くのは、次のような変化が見えてきたとき。

- プランごとに割引、上限、最低料金が違う
- 期間限定キャンペーンを差し替える
- プランごとにテストケースが大きく違う
- 計算式を設定やDBから選ぶ

分けるならこう読む。

```ts
type PricingStrategy = (seats: number) => number

const pricingStrategies: Record<Plan, PricingStrategy> = {
  free: () => 0,
  standard: (seats) => seats * 1200,
  enterprise: (seats) => seats * 2000 + 50000,
}
```

パターンは if を消す道具ではなく、変化するルールに名前を付ける道具。

<!--
話すこと:
- 答え合わせでは唯一の正解としてではなく、判断の筋道として説明する。
- どの情報を見てそう判断したのかを明示し、参加者が自分の考えと照合できるようにする。
- 最後に、この回の判断基準へ短く接続する。
-->
---

## 今日の判断基準

振る舞いのパターンは、変化するルールや状態に名前を付けるために使う。

| パターン | 使う合図 |
|---|---|
| Strategy | ルールを差し替えたい |
| Template Method | 手順は同じで一部だけ違う |
| State | 状態ごとの振る舞いが増えている |
| GoF Command | 実行可能な操作を渡したい |

次回は、外部 API や横断処理をつなぐ構造と生成のパターンを見る。

<!--
話すこと:
- 最後に、この回で使える判断基準を短く回収する。
- 新しいパターン名を覚えたかではなく、どの制約なら選ぶのかを言えることを確認する。
- 次回のテーマに接続し、今日の内容が次の比較材料になると伝える。
-->
