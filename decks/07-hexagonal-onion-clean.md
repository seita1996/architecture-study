---
theme: default
title: "第7回: Ports and Adapters"
---

# 第7回: Ports and Adapters

近縁のアーキテクチャを、同じ問題意識から比較する

<!--
話すこと:
- この回は「第7回: Ports and Adapters」を学ぶ時間だと伝える。最初に正解を覚える場ではなく、判断材料を増やす場だと置く。
- ジュニア向けには、用語を知っているかではなく、あとで会話に参加できる状態を目標にする。
- 最後に現在の設計判断を見直すための観点を一つ持ち帰る、と予告する。
-->
---

<DiscussionQuestion>
依存方向を内側へ向けるとは、コード上では何を意味するのか？
</DiscussionQuestion>

<!--
話すこと:
- このスライドでは「今回の問い」を、第7回: Ports and Adapters の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## この回で目指す状態

Hexagonal、Onion、Clean を別々の宗派として覚えない。

今日のゴール:

- 3 つが似た問題意識を持つとわかる
- 中心に置きたいものを説明できる
- Port と Adapter をコード上の境界として見られる
- 「円の図に合わせる」ことが目的ではないと言える

<!--
話すこと:
- 到達目標を先に共有し、今日どこまで分かれば十分かを明確にする。
- 全部を暗記する必要はなく、似た言葉の違いを自分の言葉で説明できればよいと伝える。
- 各項目は後続スライドで扱うので、この時点では全体像として眺めてもらう。
-->
---

## なぜこの話が必要か

フレームワーク、DB、外部 API はアプリケーションの目的そのものではない。

一方で、業務ルールやユースケースはアプリケーションの中心に置きたい。

| 外側に置きたいもの | 中心に置きたいもの |
|---|---|
| Hono | ユースケース |
| Prisma | 業務ルール |
| Stripe API | 状態遷移 |
| Queue | 不変条件 |

この分離を考える代表例が、Hexagonal、Onion、Clean。

重要なのは変更頻度だけではない。
外部プロトコルをアプリケーションの言葉へ漏らさず、外部なしでもユースケースを実行・検証できることが大事。

<!--
話すこと:
- いきなり用語の定義に入らず、現場で起きる困りごとから話す。
- 設計の話は抽象的に見えるが、変更時の迷い、影響範囲、レビューの難しさを減らすためのものだと結びつける。
- 参加者に、最近変更が怖かった箇所を一つ思い出してもらう。
-->
---

## まず「外側」と「内側」

内側は、アプリの目的に近いもの。

外側は、目的を実現するための道具。

| 内側 | 外側 |
|---|---|
| 請求書を発行する | HTTP |
| 支払い済みは取消できない | PostgreSQL |
| 契約ごとに 1 回だけ発行する | Prisma |
| 発行後に通知する | メール API |

依存は、できるだけ外側から内側へ向ける。

<!--
話すこと:
- ここでは前提の言葉をゆっくり揃える。最初は直感的な説明から入る。ただし、正式な定義との差と、この回で省略している範囲を明示する。
- 似た言葉が出ても、粒度が違う話なのか、目的が違う話なのかを見分ける姿勢を強調する。
- 分からない言葉があれば、この場で止めて確認してよいと伝える。
-->
---

## 共通する考え方

- ビジネスルールを中心に置く
- 外部技術への依存を外側に置く
- 依存方向を内側へ向ける
- 境界を通して外部と接続する
- フレームワークや DB を詳細として扱う

<!--
話すこと:
- このスライドでは「共通する考え方」を、第7回: Ports and Adapters の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## 補足: 近縁パターンの違い

| パターン | 主な焦点 |
|---|---|
| Hexagonal | Ports と Adapters |
| Onion | ドメインを中心とした層構造 |
| Clean | Policy と Detail の分離、依存ルール |

個別の教義ではなく、外部技術と業務ルールを分けるための近縁パターンとして扱う。

<!--
話すこと:
- この回の主役はPortとAdapter。Hexagonal、Onion、Cleanの細かい比較に時間を使いすぎない。
- 近縁だが同義ではない、という理解に留める。
-->
---

## Port と Adapter をゆっくり見る

Port は「アプリケーションと外部との目的を持った対話」を表す境界。

Adapter は「外側の技術を、その境界に合わせるもの」。

例:

```ts
type IssueInvoice = (input: IssueInvoiceInput) => Promise<IssueInvoiceResult>

type PaymentGateway = (input: ChargePayment) => Promise<ChargeResult>
```

`IssueInvoice` は外部からアプリへ入る Input Port。
`PaymentGateway` はアプリから外部へ出る Output Port。

どちらも Stripe や Hono の型ではなく、アプリが必要としている対話を表す。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Hexagonal Architecture

```txt
実行時の呼び出し:

HTTP Adapter -> Application Service -> Repository Adapter

契約としての関係:

HTTP Adapter -------------> Input Port
Application Service -----> implements Input Port
Application Service -----> Output Port
Repository Adapter ------> implements Output Port
```

外部から来るもの、外部へ出るものを Adapter として扱う。

Port は実行時に処理する中間クラスではなく、境界の契約。
外側の Adapter が、内側で定義された Port に適合する。

<!--
話すこと:
- Port を「毎回通過する部品」と誤解しないように、実行時の呼び出しと契約関係を分ける。
- Output Port から Repository Adapter へ import するわけではない。Adapter が Port に合わせて実装される。
-->
---

## Clean Architecture の読み方

```txt
Frameworks & Drivers
Interface Adapters
Application Business Rules
Enterprise Business Rules
```

内側ほど政策・業務意図に近く、外側の技術変更から保護したいもの。
外側ほどフレームワーク、DB、外部APIなどの技術詳細。

Onion Architecture も同じ問題意識を持つ。
中心に Domain Model を置き、その外側に Application Services、さらに外側に Infrastructure を置く。
違いを暗記するより、「何を中心に守りたいか」を見る。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## TypeScript での境界例

```ts
export type PaymentGateway = (input: ChargePayment) => Promise<ChargeResult>

export const createStripePaymentGateway =
  (stripe: Stripe): PaymentGateway =>
  async (input) => {
    try {
      const result = await stripe.paymentIntents.create({
        amount: input.amount.value,
        currency: input.amount.currency,
      })

      return { type: "charged", providerId: result.id }
    } catch (error) {
      if (!isExpectedStripeError(error)) {
        throw error
      }
      return mapStripeError(error)
    }
  }
```

ユースケースは Stripe ではなく、支払いという出力ポートに依存する。
Stripe の例外やエラーコードは Adapter の中で、アプリケーションの失敗型へ変換する。
プログラミングエラーまで業務エラーに変換しないよう、期待した外部エラーだけを変換する。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- 境界の価値は差し替えだけではない。外部サービスの失敗表現をアプリケーションの言葉へ変換することも重要。
- 金額の最小通貨単位、通貨ごとの桁、丸めなども Adapter で外部APIの形式へ変換する候補になる。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 避けたい結論

- Clean Architecture が Layered より常に優れている
- 外部サービスはすべて Port にする
- type alias があれば依存は逆転している
- 円の図に合わせれば設計が良くなる

<!--
話すこと:
- このスライドでは「避けたい結論」を、第7回: Ports and Adapters の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## 個人ワーク: これはどの役割か

次の構成を Hexagonal の言葉で分類してみる。

```txt
routes/invoice-route.ts
features/issue-invoice/issue-invoice-port.ts
features/issue-invoice/issue-invoice.ts
features/issue-invoice/invoice.ts
features/issue-invoice/ports.ts
features/issue-invoice/prisma-invoice-repository.ts
main.ts
```

ヒント:

- HTTP を受けるものは何か
- ユースケースを進めるものは何か
- 業務ルールはどこか
- Prisma に合わせているものは何か
- 依存を組み立てる場所はどこか

次の形式で短く書く。

```txt
Classification:
各ファイルをどの役割に分類したか

Reason:
そう判断した理由

Unknowns:
迷った境界
```

<!--
話すこと:
- ここは各自で短く分類と理由を書いてから答え合わせへ進む。
- Port と Adapter を、実行時の部品ではなく契約と適合として見られているか確認する。
- 次のスライドで答え合わせをするので、ここでは自分なりの仮説を持ってもらう。
-->
---

## 答え合わせ: 技術の入口と業務の中心を分ける

分類例はこうなる。

| ファイル | 役割 |
|---|---|
| `routes/invoice-route.ts` | Input Adapter |
| `issue-invoice-port.ts` | Input Port |
| `issue-invoice.ts` | Application Service / Use Case 実装 |
| `invoice.ts` | Domain |
| `ports.ts` | Output Port |
| `prisma-invoice-repository.ts` | Output Adapter |
| `main.ts` | Composition Root |

Composition Root は、依存オブジェクトを組み立て、アプリケーションの入口へ渡す場所。

重要なのは、名前を当てることではない。

外側の技術が、内側のユースケースや業務ルールへ直接漏れていないかを見る。

<!--
話すこと:
- 答え合わせでは唯一の正解としてではなく、判断の筋道として説明する。
- どの情報を見てそう判断したのかを明示し、参加者が自分の考えと照合できるようにする。
- 最後に、この回の判断基準へ短く接続する。
-->
---

## 今日の判断基準

Hexagonal、Onion、Clean は、外側の技術から内側の業務ルールを守るための考え方。

| 見るもの | 問い |
|---|---|
| Port | 外部技術ではなく、アプリケーションと外部の目的ある対話を表しているか |
| Adapter | 外側の技術を境界に合わせているか |
| Application | ユースケースの進行役になっているか |
| Domain | 業務ルールが外部技術から独立しているか |

Port を作る基準:

- アプリケーション上、意味のある外部との会話か
- 技術固有のプロトコルを内側へ漏らしたくないか
- 複数 Adapter や隔離実行に意味があるか
- 明示的な契約として保護する価値があるか

この教材では、実装規約としてユースケース単位の関数型 Input Port を基本にする。
ただし Port 数は設計判断であり、必ず 1 API = 1 Port ではない。

次回は、これを機能単位の配置である Vertical Slice と組み合わせて考える。

<!--
話すこと:
- 最後に、この回で使える判断基準を短く回収する。
- 新しいパターン名を覚えたかではなく、どの制約なら選ぶのかを言えることを確認する。
- 次回のテーマに接続し、今日の内容が次の比較材料になると伝える。
-->
