---
theme: default
title: "第0回: 受講前提と基礎用語"
---

# 第0回: 受講前提と基礎用語

本編で置き去りにならないための最低限の前提をそろえる

<!--
話すこと:
- この回は設計パターンを教える時間ではなく、本編のコード例と用語を読める状態にするための準備。
- すべてを深掘りしない。分からない箇所を本編前に見つけることを目的にする。
-->
---

## この資料の目的

本編では、TypeScript の関数、DB transaction、HTTP handler、Queue worker を前提に話す。

この資料で確認すること:

- TypeScript のコード例を読めるか
- HTTP の入口と業務処理を区別できるか
- DB の一意制約と transaction の役割を説明できるか
- 同期処理と非同期処理の違いを説明できるか
- テストで外部依存を差し替える意味を説明できるか

<!--
話すこと:
- 知らない言葉があっても問題ない。ただし、本編で何度も出るため、ここで最低限の意味を押さえる。
-->
---

## TypeScript の前提

本編では `class` より、`type` と `const` 関数を多く使う。

読めるようにしておきたいもの:

- `type`
- union / discriminated union
- `Promise`、`async` / `await`
- 高階関数
- object spread
- dependency を引数で渡す書き方
- structural typing の基礎

```ts
type SendMail = (input: MailInput) => Promise<MailResult>

const createUseCase =
  (deps: { sendMail: SendMail }) =>
  async (input: Input): Promise<Result> => {
    return deps.sendMail({ to: input.email })
  }
```

<!--
話すこと:
- 関数に依存を渡す形は、class の constructor injection と同じ問題を扱える。
- structural typing は「同じ形なら同じ型として扱える」という程度でよい。
-->
---

## Web バックエンドの前提

HTTP の入口と、業務処理は分けて読む。

| 用語 | 最低限の意味 |
|---|---|
| route | URL と HTTP method を処理へ結びつける |
| handler | request を受けて response を返す入口 |
| middleware | handler の前後に共通処理を差し込む |
| 外部API呼び出し | 別サービスへネットワーク越しに依存する |
| Queue worker | Queue から message を取り出して処理する |

```txt
HTTP request -> route -> handler -> application use case -> response
```

<!--
話すこと:
- handler は HTTP の都合を扱う場所、use case は業務処理を進める場所として読む。
- worker はHTTP requestに直接応答しないが、messageを入口にして処理を進める。
-->
---

## データベースの前提

| 用語 | 最低限の意味 |
|---|---|
| table | 同じ種類のデータを保存する場所 |
| row | table 内の1件のデータ |
| primary key | row を一意に識別する値 |
| foreign key | 別 table の row を参照する制約 |
| unique constraint | 同じ値の重複をDBが拒否する制約 |
| transaction | 複数のDB操作を一つの原子的変更として扱う仕組み |

`transaction` は複数操作をまとめる。
`unique constraint` は競合しても最後に重複を防ぐ。

<!--
話すこと:
- transaction と unique constraint は役割が違う。どちらか一方で全部を解決するものではない。
-->
---

## 同時実行で起きること

二重発行は、チェックしてから保存するだけでは防げない。

```txt
Request A: 未発行を確認
Request B: 未発行を確認
Request A: insert
Request B: insert
```

考えること:

- unique constraint: 競合しても不変条件を最後に守る
- transaction: 複数操作を一つの原子的変更にする
- isolation: 並行実行時に何が見えるかを制御する
- idempotency: 同じ論理要求が再送されても結果を重複させない

<!--
話すこと:
- ここは第6回と第10回への前提。Repositoryを作っても、並行実行の問題は自動では消えない。
-->
---

## 同期処理と非同期処理

```txt
同期:
caller -> callee
caller waits until callee finishes

非同期:
caller -> queue/message
caller does not wait for final processing
worker processes later
```

非同期にすると、画面応答と後続処理を切り離せる。
ただし、後から失敗する、重複する、順序が変わる可能性がある。

<!--
話すこと:
- 非同期は便利な高速化ではなく、失敗と再試行を設計する必要が増える選択。
-->
---

## テストの前提

| 用語 | 最低限の意味 |
|---|---|
| unit test | 小さな単位を外部依存から切り離して確認する |
| integration test | DBや外部境界を含めた連携を確認する |
| test double | 本物の代わりに使うテスト用の依存 |
| fake | 動く簡易実装 |
| stub | 決まった値を返す実装 |
| mock | 呼ばれ方も検証する実装 |

外部依存を引数で渡せると、テスト時に差し替えやすい。

<!--
話すこと:
- テストしやすさは抽象を作る理由の一つ。ただし、テストのためだけに意味の薄い抽象を増やすと認知負荷が増える。
-->
---

## 事前確認

本編前に、次を自分の言葉で説明できれば十分。

1. unique constraint は何を保証するか
2. transaction は何をまとめるか
3. `Promise` を返す関数型を読めるか
4. HTTP handler と業務処理を区別できるか
5. Queue worker が失敗したら何が起きるか

<!--
話すこと:
- ここで詰まった項目は、本編中に補足を厚めにする。
- 全員を試験するためではなく、前提差を講師が把握するための確認。
-->
