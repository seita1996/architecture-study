---
theme: default
title: "第3回: 契約と依存関係"
---

# 第3回: 契約と依存関係

DIP、LSP、ISP を中心に、境界の契約と依存関係を考える

<!--
話すこと:
- この回は「第3回: 契約と依存関係」を学ぶ時間だと伝える。最初に正解を覚える場ではなく、判断材料を増やす場だと置く。
- ジュニア向けには、用語を知っているかではなく、あとで会話に参加できる状態を目標にする。
- 最後に現在の設計判断を見直すための観点を一つ持ち帰る、と予告する。
-->
---

<DiscussionQuestion>
関数型の抽象を作ると、本当に疎結合になるのか？
</DiscussionQuestion>

<!--
話すこと:
- このスライドでは「今回の問い」を、第3回: 契約と依存関係 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## この回で目指す状態

SOLID の名前を暗記する回ではない。

次のように考えられる状態を目指す。

- 変更理由が多すぎる場所に気づける
- 依存先が具体的すぎる場所に気づける
- 抽象が役に立っているかを判断できる
- `type` を作ること自体が目的ではないと説明できる

<!--
話すこと:
- 到達目標を先に共有し、今日どこまで分かれば十分かを明確にする。
- 全部を暗記する必要はなく、似た言葉の違いを自分の言葉で説明できればよいと伝える。
- 各項目は後続スライドで扱うので、この時点では全体像として眺めてもらう。
-->
---

## なぜこの話が必要か

依存関係は、普段は見えにくい。

でも仕様変更やテストのときに急に見える。

| 困りごと | 背後にあること |
|---|---|
| テストが書きにくい | 外部依存を直接呼んでいる |
| 変更が広がる | 具体実装に強く依存している |
| 使わない引数が多い | 必要以上に大きい契約に依存している |
| 差し替えたら壊れた | 同じ契約として扱えていない |

<!--
話すこと:
- いきなり用語の定義に入らず、現場で起きる困りごとから話す。
- 設計の話は抽象的に見えるが、変更時の迷い、影響範囲、レビューの難しさを減らすためのものだと結びつける。
- 参加者に、最近変更が怖かった箇所を一つ思い出してもらう。
-->
---

## 補足: SOLID の中で見るもの

| 原則 | この回での見方 |
|---|---|
| SRP | 変更理由を分ける。第2回の凝集で扱った |
| OCP | 予測した変化の軸で、安定部分を変更せず拡張できるか |
| LSP | 実装が契約を破っていないか |
| ISP | 使わないメソッドに依存していないか |
| DIP | 高水準方針と低水準詳細を抽象で分けているか |

<!--
話すこと:
- SOLID全体を暗記する回ではない。今日は契約と依存関係に関係するDIP、LSP、ISPを中心に見る。
- SRPとOCPはここでは名前だけに留め、必要なら補足で扱う。
-->
---

## SOLID を一言で見る

最初はこのくらいでよい。

| 原則 | ざっくりした意味 |
|---|---|
| SRP | 変更理由を 1 つに近づける |
| OCP | 予測した変化の軸で拡張しやすくする |
| LSP | 同じ型なら同じ期待で使えるようにする |
| ISP | 必要なものだけに依存する |
| DIP | 高水準も低水準も抽象へ依存する |

DIP は「安定しているものへ依存する」だけではない。
高水準の方針が、Prisma や外部 API のような低水準詳細に直接依存しないようにする。

<!--
話すこと:
- 表は上から読むだけでなく、横に比べる。何が違うからコストや適用場面が変わるのかを見る。
- 一つを優秀、一つを劣っていると扱わず、問題設定が変わると選択も変わると説明する。
- 参加者には、現在のプロダクトならどの列が重要かを考えてもらう。
-->
---

## 抽象とは何か

ここでの抽象は、難しいものではない。

「呼び出し側が知ってよいことだけを残した形」と考える。

```ts
type SendMail = (input: MailInput) => Promise<MailResult>
```

呼び出し側は、SMTP なのか外部 API なのかを知らなくてよい。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 直接依存

```ts
type CreateInvoice = (input: IssueInvoiceInput) => Promise<IssueInvoiceResult>

const createInvoice =
  (prisma: PrismaClient): CreateInvoice =>
  async (input) => {
    const contract = await prisma.contract.findUnique({
      where: { id: input.contractId },
    })
    if (!contract) {
      return { type: "contract_not_found" }
    }
    // issue invoice

    return { type: "issued", invoiceId: "inv_001" }
  }
```

Prisma の API と DB モデルがユースケースに見える。
複数のDB操作が増えると、トランザクション管理までユースケース側の責任になりやすい。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 抽象への依存

```ts
type LoadContract = (contractId: string) => Promise<Contract | null>
type SaveInvoice = (invoice: Invoice) => Promise<void>

type CreateInvoiceDependencies = {
  loadContract: LoadContract
  saveInvoice: SaveInvoice
}

const createInvoice =
  (deps: CreateInvoiceDependencies): CreateInvoice =>
  async (input) => {
    const contract = await deps.loadContract(input.contractId)
    if (!contract) return { type: "contract_not_found" }

    const invoice = issueInvoice(contract, input)
    await deps.saveInvoice(invoice)
    return { type: "issued", invoiceId: invoice.id }
  }
```

抽象がユースケースの言葉になっている場合、境界として意味を持つ。

ただし、抽象を作っても整合性は自動では保証されない。
業務上の一意性には DB の unique constraint、transaction、競合処理、冪等性キーなどが必要になる。

<!--
話すこと:
- 表は上から読むだけでなく、横に比べる。何が違うからコストや適用場面が変わるのかを見る。
- 一つを優秀、一つを劣っていると扱わず、問題設定が変わると選択も変わると説明する。
- 参加者には、現在のプロダクトならどの列が重要かを考えてもらう。
-->
---

## LSP はクラス継承だけの話ではない

```ts
type PaymentGateway = (amount: Money) => Promise<ChargeResult>
```

契約をこう決めたとする。

- 1 円以上の金額を受け付ける
- 失敗時は `ChargeResult` の `{ type: "failed" }` を返す
- 呼び出し側は金額によって実装を使い分けない

この契約のもとで、実装 A は 1 円以上を受け付ける。
実装 B は 1,000 円未満で独自例外を投げる。

この 2 つは同じ `PaymentGateway` として置換可能か？

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 抽象が薄いだけの例

```ts
type PrismaInvoiceRepository = {
  findUnique: (args: Prisma.InvoiceFindUniqueArgs) => Promise<InvoiceRow | null>
  create: (args: Prisma.InvoiceCreateArgs) => Promise<InvoiceRow>
}
```

これは Prisma の型を別名で包んでいるだけで、依存方向を十分に変えていない。

<!--
話すこと:
- 型名を変えても、呼び出し側が Prisma の都合に依存したままなら境界としては弱い。
- 抽象は「別名」ではなく、呼び出し側にとって安定した契約になっているかを見る。
-->
---

## ISP: 必要な依存だけを渡す

大きな依存契約を、そのまま各ユースケースへ渡していないかを見る。

```ts
type InvoiceDependencies = {
  findInvoice: (id: string) => Promise<Invoice | null>
  saveInvoice: (invoice: Invoice) => Promise<void>
  sendMail: (invoiceId: string) => Promise<void>
  exportCsv: (invoiceId: string) => Promise<void>
  deleteInvoice: (invoiceId: string) => Promise<void>
}

const cancelInvoice =
  (deps: InvoiceDependencies) =>
  async (invoiceId: string): Promise<void> => {
    const invoice = await deps.findInvoice(invoiceId)
    if (!invoice) return

    await deps.saveInvoice(invoice)
  }
```

取消処理は、メール送信、CSV出力、削除には依存していない。

<!--
話すこと:
- ISP は class の interface 分割だけの話ではない。関数に渡す依存オブジェクトでも同じ問題が起きる。
- 使わない依存があると、テスト準備、レビュー、変更影響の読み取りが重くなる。
-->
---

## ISP: 契約をユースケースに合わせる

必要なものだけを契約にすると、変更範囲が読みやすくなる。

```ts
type CancelInvoiceDependencies = {
  findInvoice: (id: string) => Promise<Invoice | null>
  saveInvoice: (invoice: Invoice) => Promise<void>
}

const cancelInvoice =
  (deps: CancelInvoiceDependencies) =>
  async (invoiceId: string): Promise<void> => {
    const invoice = await deps.findInvoice(invoiceId)
    if (!invoice) return

    await deps.saveInvoice(invoice)
  }
```

契約は小さければよいのではない。
使う側の目的と一致していることが重要。

<!--
話すこと:
- 依存を細かく分けすぎると逆に組み立てが煩雑になるため、目的単位で狭めると説明する。
- ここでの判断基準は「このユースケースが知らなくてよいものを受け取っていないか」。
-->
---

## 役に立つ抽象の見分け方

抽象が役に立っているかは、次の問いで確認する。

| 問い | 見たいこと |
|---|---|
| 呼び出し側の言葉になっているか | 業務の意図が出ているか |
| 実装詳細を隠しているか | Prisma や HTTP の詳細が漏れていないか |
| テストで差し替えたいか | 差し替える理由があるか |
| 実装が複数ありうるか | 判断材料の一つ。必要条件ではない |
| 業務上重要な境界か | 実装が一つでも分ける意味があるか |

<!--
話すこと:
- 表は上から読むだけでなく、横に比べる。何が違うからコストや適用場面が変わるのかを見る。
- 一つを優秀、一つを劣っていると扱わず、問題設定が変わると選択も変わると説明する。
- 参加者には、現在のプロダクトならどの列が重要かを考えてもらう。
-->
---

## 個人ワーク: この抽象は役に立っているか

次のユースケースを見て、依存が安定しているか考える。

```ts
type CreateInvoiceInput = {
  contractId: string
  requestedBy: string
}

const createInvoice = async (
  input: CreateInvoiceInput,
  prisma: PrismaClient,
): Promise<void> => {
  const contract = await prisma.contract.findUnique({
    where: { id: input.contractId },
    include: { customer: true },
  })

  if (!contract) return

  await prisma.invoice.create({
    data: { contractId: contract.id, customerId: contract.customer.id },
  })
}
```

考えること:

- ユースケースは何を知りすぎているか
- `PrismaClient` を差し替えたい理由はあるか
- 抽象の名前は業務の言葉にできるか

次の形式で 1 行ずつ書く。

```txt
Decision:
境界を作る / 作らない / まだ判断しない

Drivers:
重視した要求や制約

Trade-offs:
得るものと増えるコスト
```

<!--
話すこと:
- ここは長い議論ではなく、各自で短く判断を書いてから答え合わせへ進む。
- 正解を急がず、何を重視したかを外に出すことを優先する。
- 次のスライドで答え合わせをするので、ここでは自分なりの仮説を持ってもらう。
-->
---

## 答え合わせ: 依存先を業務の言葉へ向ける

問題は「Prisma を使っていること」だけではない。

| 観点 | 読み取り |
|---|---|
| ORM の詳細 | `findUnique`、`include`、`create` を知っている |
| DB 形状 | `customer` の取り方を知っている |
| 業務の言葉 | 「契約を探す」「請求書を保存する」が埋もれている |

境界を作るなら、こういう言葉に寄せる。

```ts
type ContractReader = {
  findBillableContract: (contractId: string) => Promise<BillableContract | null>
}

type InvoiceWriter = {
  saveIssuedInvoice: (invoice: IssuedInvoice) => Promise<void>
}
```

`type` を作ることではなく、ユースケースが安定した言葉に依存することが目的。

<!--
話すこと:
- 答え合わせでは唯一の正解としてではなく、判断の筋道として説明する。
- どの情報を見てそう判断したのかを明示し、参加者が自分の考えと照合できるようにする。
- 最後に、この回の判断基準へ短く接続する。
-->
---

## 今日の判断基準

抽象を作る理由は「何でも差し替え可能にする」ではない。

依存先を、ユースケースにとって安定した言葉へ向けるために使う。

<!--
話すこと:
- このスライドは結論を押し付ける場ではなく、今日の判断材料を短く言語化する場にする。
- どの選択肢にも向き不向きがあり、要求と制約に照らして選ぶという軸を繰り返す。
- チームの言葉として残したい一文を、その場で一つ決める。
-->
