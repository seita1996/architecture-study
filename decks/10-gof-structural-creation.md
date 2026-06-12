---
theme: default
title: "第10回: GoFデザインパターン後編"
---

# 第10回: GoF デザインパターン後編

構造と生成に関する主要パターンを、既存コードを説明する語彙として使う

<!--
話すこと:
- この回は「第10回: GoF デザインパターン後編」を学ぶ時間だと伝える。最初に正解を覚える場ではなく、判断材料を増やす場だと置く。
- ジュニア向けには、用語を知っているかではなく、あとで会話に参加できる状態を目標にする。
- 最後に現在の Vertical Slice + Hexagonal 構成へつながる観点を一つ持ち帰る、と予告する。
-->
---

<DiscussionQuestion>
デザインパターンは導入するものだけでなく、既存コードを説明する言葉として使えているか？
</DiscussionQuestion>

<!--
話すこと:
- このスライドでは「今回の問い」を、第10回: GoF デザインパターン後編 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## この回で目指す状態

構造と生成のパターンを、クラス図ではなく TypeScript の実装感で理解する。

今日のゴール:

- Adapter、Facade、Decorator、Factory、Observer の目的を言える
- 既存コードの中にあるパターンを見つけられる
- パターン名に引っ張られて過剰に分割しない
- 関数合成や `type` で表現できるとわかる

<!--
話すこと:
- 到達目標を先に共有し、今日どこまで分かれば十分かを明確にする。
- 全部を暗記する必要はなく、似た言葉の違いを自分の言葉で説明できればよいと伝える。
- 各項目は後続スライドで扱うので、この時点では全体像として眺めてもらう。
-->
---

## なぜこの話が必要か

設計パターンは「新しく導入するもの」と思われがち。

でも実際には、すでに書いているコードに名前が付くことが多い。

| よくあるコード | 名前が付くと |
|---|---|
| 外部 API を自分たちの型に合わせる | Adapter |
| 複数処理を 1 つの入口にまとめる | Facade |
| ログや計測を外から足す | Decorator |
| 生成ルールを関数に閉じ込める | Factory |
| イベントに複数処理を反応させる | Observer |

<!--
話すこと:
- いきなり用語の定義に入らず、現場で起きる困りごとから話す。
- 設計の話は抽象的に見えるが、変更時の迷い、影響範囲、レビューの難しさを減らすためのものだと結びつける。
- 参加者に、最近変更が怖かった箇所を一つ思い出してもらう。
-->
---

## まず構造パターンとは何か

構造パターンは「部品同士のつなぎ方」に名前を付けたもの。

例:

- 外部 API と自分たちの型をつなぐ
- 複雑な処理群に入口を作る
- 既存処理にログを追加する

コードの形より、何をつないでいるかを見る。

<!--
話すこと:
- ここでは前提の言葉をゆっくり揃える。専門用語は、正確さよりも会話で同じものを指せることを優先する。
- 似た言葉が出ても、粒度が違う話なのか、目的が違う話なのかを見分ける姿勢を強調する。
- 分からない言葉があれば、この場で止めて確認してよいと伝える。
-->
---

## Adapter

```ts
type PaymentGateway = (input: ChargePayment) => Promise<ChargeResult>

const createStripePaymentGateway =
  (stripe: Stripe): PaymentGateway =>
  async (input) => {
    const result = await stripe.paymentIntents.create({
      amount: input.amount.value,
      currency: input.amount.currency,
    })

    return { type: "charged", providerId: result.id }
  }
```

異なる境界の形を接続する。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Adapter を見る問い

Adapter を作る前に、次を確認する。

- 外部 API の型を内側に漏らしたくないか
- 失敗や例外を自分たちの結果型に変換したいか
- テストで外部 API を差し替えたいか
- 外部 API の変更から内側を守りたいか

全部に当てはまらないなら、まだ直接呼び出しでよい場合もある。

<!--
話すこと:
- このスライドでは「Adapter を見る問い」を、第10回: GoF デザインパターン後編 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## Facade

複雑なサブシステムに単純な入口を提供する。

```ts
type BillingFacade = (command: IssueInvoiceCommand) => Promise<Invoice>

const createBillingFacade =
  (deps: { issueInvoice: IssueInvoice; sendInvoiceMail: SendInvoiceMail }): BillingFacade =>
  async (command) => {
    const invoice = await deps.issueInvoice(command)
    await deps.sendInvoiceMail(invoice.id)
    return invoice
  }
```

便利な入口と、責務の集中は紙一重。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Facade の注意点

Facade は入口を簡単にする。

ただし、何でも集めると巨大な手続きになる。

よい Facade:

- 呼び出し側に見せたい入口が明確
- 内部の複雑さを隠している
- 責務の名前が説明できる

危ない Facade:

- 便利だから全部置いている
- 変更理由が多すぎる

<!--
話すこと:
- このスライドでは「Facade の注意点」を、第10回: GoF デザインパターン後編 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## Decorator

```ts
const withLogging = (inner: InvoiceRepository): InvoiceRepository => ({
  ...inner,
  save: async (invoice) => {
    console.info("save invoice", invoice.id)
    return inner.save(invoice)
  },
})
```

元の処理を変更せず、ログ、計測、キャッシュなどを追加する。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Factory

```ts
type Invoice = {
  contractId: string
  status: "draft" | "issued" | "paid"
}

const createInvoice = (command: IssueInvoiceCommand): Invoice => ({
  contractId: command.contractId,
  status: "draft",
})
```

生成方法と初期不変条件を隠す。

<!--
話すこと:
- 表は上から読むだけでなく、横に比べる。何が違うからコストや適用場面が変わるのかを見る。
- 一つを優秀、一つを劣っていると扱わず、問題設定が変わると選択も変わると説明する。
- 参加者には、現在のプロダクトならどの列が重要かを考えてもらう。
-->
---

## Observer

```ts
eventBus.subscribe("InvoiceIssued", sendEmail)
eventBus.subscribe("InvoiceIssued", updateAccounting)
eventBus.subscribe("InvoiceIssued", recordAnalytics)
```

あるイベントに複数の処理を反応させる。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 判断基準

| パターン | 効く場面 | 注意点 |
|---|---|---|
| Adapter | 外部 API やライブラリを境界に合わせる | すべてを包むと冗長 |
| Facade | 複雑な処理に安定した入口が必要 | God Service 化 |
| Decorator | 横断的な処理を足す | 実行順序が見えにくい |
| Factory | 生成ルールが重要 | 単純なオブジェクト生成の置換だけなら不要 |
| Observer | 複数の反応を分離 | 追跡困難性 |

<!--
話すこと:
- このスライドは結論を押し付ける場ではなく、今日の判断材料を短く言語化する場にする。
- どの選択肢にも向き不向きがあり、要求と制約に照らして選ぶという軸を繰り返す。
- チームの言葉として残したい一文を、その場で一つ決める。
-->
---

## 個人ワーク: 名前のないパターンを読む

次のコードは、どのパターンとして説明できるか考える。

```ts
type PaymentGateway = {
  charge: (amount: number) => Promise<void>
}

const createStripePaymentGateway = (stripe: StripeClient): PaymentGateway => ({
  charge: async (amount) => {
    await stripe.paymentIntents.create({
      amount,
      currency: "jpy",
    })
  },
})

const withLogging = (gateway: PaymentGateway): PaymentGateway => ({
  charge: async (amount) => {
    console.log("charge", amount)
    await gateway.charge(amount)
  },
})
```

考えること:

- Stripe の形を合わせている部分はどこか
- ログを足している部分はどこか
- 生成ルールを隠している部分はどこか

<!--
話すこと:
- ここは個人で頭の中で考える時間にする。発言を求めず、コードや構成を見てどこが判断ポイントかを探してもらう。
- 正解を急がず、迷った箇所を自分で印を付けるくらいで十分だと伝える。
- 次のスライドで答え合わせをするので、ここでは自分なりの仮説を持ってもらう。
-->
---

## 答え合わせ: 複数のパターンが重なることもある

このコードは、1つの名前だけで説明しなくてよい。

| 箇所 | 説明できるパターン |
|---|---|
| `createStripePaymentGateway` | Adapter |
| `withLogging` | Decorator |
| `create...` という生成関数 | Factory 的な役割 |

読み方:

- Adapter は外部ライブラリの形を自分たちの境界に合わせる
- Decorator は元の処理を包んでログなどを足す
- Factory は作り方の詳細を呼び出し側から隠す

デザインパターンは、既存コードを説明する語彙としても使える。

<!--
話すこと:
- 答え合わせでは唯一の正解としてではなく、判断の筋道として説明する。
- どの情報を見てそう判断したのかを明示し、参加者が自分の考えと照合できるようにする。
- 最後に、この回の判断基準へ短く接続する。
-->
---

## 今日の判断基準

構造と生成のパターンは、境界、入口、横断処理、生成ルールを説明する語彙になる。

| パターン | 使う合図 |
|---|---|
| Adapter | 外部の形を内側の境界に合わせたい |
| Facade | 複雑な処理に安定した入口が必要 |
| Decorator | ログ、計測、キャッシュを外側から足したい |
| Factory | 生成ルールを呼び出し側から隠したい |
| Observer | 起きたことに複数処理を反応させたい |

次回は、コード内の境界からプロセス境界、サービス境界へ視野を広げる。

<!--
話すこと:
- 最後に、この回で使える判断基準を短く回収する。
- 新しいパターン名を覚えたかではなく、どの制約なら選ぶのかを言えることを確認する。
- 次回のテーマに接続し、今日の内容が次の比較材料になると伝える。
-->
