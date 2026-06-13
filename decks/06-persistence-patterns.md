---
theme: default
title: "第6回: 永続化と整合性"
---

# 第6回: 永続化と整合性

永続化周辺のパターンを整理する

<!--
話すこと:
- この回は「第6回: 永続化と整合性」を学ぶ時間だと伝える。最初に正解を覚える場ではなく、判断材料を増やす場だと置く。
- ジュニア向けには、用語を知っているかではなく、あとで会話に参加できる状態を目標にする。
- 最後に現在の設計判断を見直すための観点を一つ持ち帰る、と予告する。
-->
---

<DiscussionQuestion>
Repository は何を抽象化しているのか？ ORM を包めば Repository なのか？
</DiscussionQuestion>

<!--
話すこと:
- このスライドでは「今回の問い」を、第6回: 永続化と整合性 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## この回で目指す状態

永続化パターンを、名前ではなく目的から見られるようにする。

今日のゴール:

- Prisma 直接利用でよい場合を説明できる
- DB row と業務型を分ける場合を説明できる
- Repository が隠すものを説明できる
- Query と Repository の違いを説明できる
- transaction と unique constraint の役割を分けられる
- Prisma を包むだけでは設計判断にならないと理解する

<!--
話すこと:
- 到達目標を先に共有し、今日どこまで分かれば十分かを明確にする。
- 全部を暗記する必要はなく、似た言葉の違いを自分の言葉で説明できればよいと伝える。
- 各項目は後続スライドで扱うので、この時点では全体像として眺めてもらう。
-->
---

## 今日の主役と補足

30分では、すべてを同じ重さで扱わない。

| 優先度 | 扱うこと |
|---|---|
| 主役 | Prisma 直接利用でよい場合 |
| 主役 | DB row と業務型を分ける場合 |
| 主役 | Repository を作る理由 |
| 主役 | Query と Repository の違い |
| 主役 | transaction、unique constraint、冪等性 |
| 補足 | Active Record、古典的な Unit of Work |

補足は、書籍や別フレームワークで出てきたときに迷わないための語彙として扱う。
時間がなければ Active Record と Unit of Work は飛ばし、質問があれば開く。

<!--
話すこと:
- Active Record と Unit of Work は重要な用語だが、このチームで今日使う判断軸の中心ではない。
- 主役は「Prismaをどう扱うか」「一貫性をどう守るか」に置く。
- 30分で実施する場合、補足2枚は読まなくても成立する。
-->
---

## なぜこの話が必要か

業務アプリは、ほぼ必ずデータを保存する。

だから永続化の設計は、すぐ全体に影響する。

| よくある迷い | 本当の問い |
|---|---|
| Prisma を直接使ってよいか | どこまで DB 詳細を見せてよいか |
| Repository は必要か | 何を隠したいのか |
| Mapper は必要か | DB モデルと業務モデルは違うのか |
| transaction はどこで張るか | どこからどこまでが 1 つの変更か |

<!--
話すこと:
- いきなり用語の定義に入らず、現場で起きる困りごとから話す。
- 設計の話は抽象的に見えるが、変更時の迷い、影響範囲、レビューの難しさを減らすためのものだと結びつける。
- 参加者に、最近変更が怖かった箇所を一つ思い出してもらう。
-->
---

## まず永続化とは何か

永続化は、アプリを止めても残る場所にデータを保存すること。

代表例:

- PostgreSQL
- MySQL
- Redis など、設定により永続化可能なデータストア
- 外部 SaaS
- ファイルストレージ

永続化パターンは「業務処理と保存処理をどう分けるか」の話。

<!--
話すこと:
- ここでは前提の言葉をゆっくり揃える。最初は直感的な説明から入る。ただし、正式な定義との差と、この回で省略している範囲を明示する。
- 似た言葉が出ても、粒度が違う話なのか、目的が違う話なのかを見分ける姿勢を強調する。
- 分からない言葉があれば、この場で止めて確認してよいと伝える。
-->
---

## 補足: Active Record

```ts
const invoice = await InvoiceRecord.findById(id)

invoice.markAsPaid()

await invoice.save()
```

データベース上の行に対応するオブジェクト自身が、状態変更と保存操作を持つ。

このリポジトリで採用するという意味ではなく、まず正統な形を知る。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 補足: Active Record の見方

Active Record は、データと保存操作が近い。

理解しやすい一方で、業務ルールが複雑になると保存の都合と混ざりやすい。

| 向く場面 | 注意する場面 |
|---|---|
| 単純 CRUD | 複雑な状態遷移 |
| 小さな管理画面 | DB 形状と業務概念が違う |
| すぐ作りたい機能 | テストで保存処理を分けたい |

<!--
話すこと:
- Active Record は「古い/悪い」ではなく、データと保存操作を近づける選択肢として説明する。
- ただし今回のプロダクトで中心になるのは、Prisma直接利用、Mapper、Repository、transaction の使い分け。
-->
---

## Mapper / マッピング責務

```ts
const row = await prisma.invoice.findUnique({ where: { id } })

if (!row) {
  return null
}

const invoice = toInvoice(row)
```

DB モデルとドメインオブジェクトを分離する。
この例は、Data Mapper パターン全体ではなく、DB row から業務型への mapping の一部。

<!--
話すこと:
- `toInvoice` のような変換関数をすべてData Mapperパターンと呼ばない。
- ここではまず、DB row と業務型を分ける責務として理解してもらう。
-->
---

## Data Mapper パターンの全体像

Data Mapper は、ドメインオブジェクトとDBを互いに独立させ、両者の間でデータを移動する層。

```ts
type InvoiceRowMapper = {
  toDomain: (row: InvoiceRow) => Invoice
  toRow: (invoice: Invoice) => InvoiceRow
}

type InvoiceDataMapper = {
  findById: (id: InvoiceId) => Promise<Invoice | null>
  insert: (invoice: Invoice) => Promise<void>
  update: (invoice: Invoice) => Promise<void>
}
```

DB では `amount: number`、業務上は `Money` のように形が違う場合、変換責務が明確になる。
Aggregate は、同一の不変条件を守るために一貫して扱うまとまり。

<!--
話すこと:
- FowlerのData Mapperは、単なるtoX関数ではなく、オブジェクトとDBの間でデータを移す責務を持つ層として扱う。
- Row変換だけを `InvoiceRowMapper`、DBとの出し入れまで含む責務を `InvoiceDataMapper` と分けて読む。
- この教材では、実装名よりも「DBの都合を業務ルールへ直接持ち込まない」ことを重視する。
-->
---

## Repository

```ts
type InvoiceRepository = {
  findById: (id: InvoiceId) => Promise<Invoice | null>
  save: (invoice: Invoice) => Promise<void>
}
```

ドメインオブジェクトのコレクションのような入口を提供し、永続化の詳細とマッピングを隠す。

<!--
話すこと:
- Repository はテーブルごとのCRUDラッパーではなく、業務側から見た保存・取得の入口だと説明する。
- 名前だけRepositoryでも Prisma の型やDB都合が漏れていれば、隠せているものは少ない。
-->
---

## Repository は何を隠すのか

Repository は「DB アクセス関数の置き場」ではない。

隠したいものがあるときに意味を持つ。

| 隠したいもの | 例 |
|---|---|
| クエリの詳細 | Prisma の `where` や `include` |
| DB スキーマ | テーブル分割や JOIN |
| 変換処理 | DB row から業務型への変換 |
| 保存方式 | DB、インメモリ、テスト用実装 |

外部 API や Queue は出力ポートにはできるが、Repository そのものではない。
複数 Repository をまたぐトランザクション境界は、Application Service または Unit of Work が調整する。

<!--
話すこと:
- 外部APIやQueueはOutput Portにはできるが、Repositoryは永続化されたドメインオブジェクトの入口として扱う。
- 複数保存先の一貫性はRepository単体ではなく、Application Serviceやtransaction境界で見る。
-->
---

## 補足: 古典的な Unit of Work

```ts
const unitOfWork = createUnitOfWork()

unitOfWork.registerDirty(invoice)
unitOfWork.registerNew(auditLog)

await unitOfWork.commit()
```

業務トランザクション中の変更を追跡し、まとめて永続化する。

`prisma.$transaction(...)` の薄いラッパーは、トランザクション境界の抽象化ではあるが、それだけで Unit of Work とは呼ばない。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 論点

- ORM は Repository なのか
- Prisma を Application 層で使うのは悪いのか
- Repository が CRUD の薄いラッパーになっていないか
- Domain Model を採用しない場合でも Repository は必要か
- トランザクション境界はどこで管理するか
- 変更追跡が必要なのか、単に `transaction` を張りたいだけなのか

<!--
話すこと:
- このスライドでは「論点」を、第6回: 永続化と整合性 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## Repository が意味を持つ場合

- 永続化のクエリを業務用語に変換している
- DB モデルとドメインモデルが違う
- テストで外部 I/O を差し替えたい
- 複数テーブルを 1 つの集約として扱う
- ドメインオブジェクトの保存と取得を、コレクションのように見せたい

すべての読み取り処理を Repository に通す必要はない。

| 用途 | 例 |
|---|---|
| Domain Model を取得・保存する | `InvoiceRepository.findById` / `save` |
| 画面用の一覧を返す | `InvoiceListQuery.search` |
| 集計やレポートを返す | SQL / ORM の read query |

一覧、検索、集計まで無理に Repository と呼ぶと、かえって意図が曖昧になる。

<!--
話すこと:
- このスライドでは「Repository が意味を持つ場合」を、第6回: 永続化と整合性 の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## Repository が薄いだけの例

```ts
type PrismaInvoiceRepository = {
  findUnique: (args: Prisma.InvoiceFindUniqueArgs) => Promise<InvoiceRow | null>
}

const createInvoiceRepository = (
  prisma: PrismaClient,
): PrismaInvoiceRepository => ({
  findUnique: (args) => prisma.invoice.findUnique(args),
})
```

呼び出し側は Prisma の詳細をまだ知っている。

<!--
話すこと:
- Prisma の型をそのまま渡しているため、呼び出し側は依然として Prisma のAPI変更やDB形状に影響を受ける。
- この例では名前を Repository にしても、隠しているものが少ない。
-->
---

## 個人ワーク: この Repository は何を隠しているか

次の Repository を見て、抽象化として意味があるか考える。

```ts
type InvoiceRepository = {
  findById: (id: string) => Promise<Invoice | null>
}

const createInvoiceRepository = (prisma: PrismaClient): InvoiceRepository => ({
  findById: async (id) => {
    const row = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    })

    return row ? toInvoice(row) : null
  },
})
```

考えること:

- Prisma の型は呼び出し側に出ているか
- DB の `row` はどこで止まっているか
- `toInvoice` は何を隠しているか
- 単なる薄いラッパーか

次の形式で短く書く。

```txt
Decision:
Repositoryとして意味がある / 薄い / 追加情報が必要

Drivers:
何を隠したいと判断したか

Trade-offs:
得るものと増えるコスト
```

<!--
話すこと:
- ここは各自で短く判断を書いてから答え合わせへ進む。
- Repository を作るかではなく、何を隠しているかを言葉にする。
- 次のスライドで答え合わせをするので、ここでは自分なりの仮説を持ってもらう。
-->
---

## 答え合わせ: 隠しているものを言えるか

この例では、Repository に一定の意味がある。

| 隠しているもの | 根拠 |
|---|---|
| ORM の詳細 | `findUnique` と `include` が中に閉じている |
| DB スキーマ | `row` を外に出していない |
| ドメイン型への変換 | `toInvoice(row)` が境界になっている |

ただし、次の形なら弱い抽象になりやすい。

```ts
type InvoiceRepository = {
  findUnique: (args: Prisma.InvoiceFindUniqueArgs) => Promise<InvoiceRow | null>
}
```

呼び出し側が Prisma の形を知るなら、Repository という名前だけでは疎結合にならない。

<!--
話すこと:
- 答え合わせでは唯一の正解としてではなく、判断の筋道として説明する。
- どの情報を見てそう判断したのかを明示し、参加者が自分の考えと照合できるようにする。
- 最後に、この回の判断基準へ短く接続する。
-->
---

## 並行実行で壊れる例

「未発行なら発行する」を check-then-save で書くと、同時実行で壊れることがある。

```txt
Request A: 未発行を確認
Request B: 未発行を確認
Request A: insert invoice
Request B: insert invoice
```

Repository を作っても、この競合は自動では消えない。

| 仕組み | 役割 |
|---|---|
| unique constraint | 競合しても不変条件を最後に守る |
| transaction | 複数操作を一つの原子的変更にする |
| isolation | 並行実行時に何が見えるかを制御する |
| idempotency | 同じ論理要求が再送されても結果を重複させない |

<!--
話すこと:
- Repositoryは永続化詳細の境界であり、整合性保証そのものではない。
- 二重発行のような不変条件は、DB制約、transaction、isolation、idempotencyを組み合わせて見る。
-->
---

## 今日の判断基準

Repository を作る前に、何を隠すのかを言葉にする。

| 隠したいもの | Repository の意味 |
|---|---|
| ORM のクエリ形状 | 呼び出し側を ORM から離す |
| DB スキーマ | テーブル構造変更の影響を閉じる |
| ドメイン型への変換 | 永続化モデルと業務モデルを分ける |

Repository はトランザクション全体の責任者ではない。
複数の保存先をまたぐ一貫性は、Application Service、トランザクション境界、または Unit of Work の責務として分けて考える。

永続化で必ず確認すること:

- 業務上の一意性は DB の unique constraint で守れているか
- check-then-save を同時実行しても壊れないか
- transaction の範囲はユースケースの整合性境界と合っているか
- リトライ時に二重作成しない冪等性キーが必要か

次回は、この境界をアーキテクチャ全体の依存方向として見る。

<!--
話すこと:
- 最後に、この回で使える判断基準を短く回収する。
- 新しいパターン名を覚えたかではなく、どの制約なら選ぶのかを言えることを確認する。
- 次回のテーマに接続し、今日の内容が次の比較材料になると伝える。
-->
