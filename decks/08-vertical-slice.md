---
theme: default
title: "第8回: Vertical Slice ArchitectureとPackage by Feature"
---

# 第8回: Vertical Slice Architecture と Package by Feature

技術レイヤー分割と機能単位分割を比較する

<!--
話すこと:
- この回は「第8回: Vertical Slice Architecture と Package by Feature」を学ぶ時間だと伝える。最初に正解を覚える場ではなく、判断材料を増やす場だと置く。
- ジュニア向けには、用語を知っているかではなく、あとで会話に参加できる状態を目標にする。
- 最後に現在の設計判断を見直すための観点を一つ持ち帰る、と予告する。
-->
---

<DiscussionQuestion>
機能単位でまとめると、どの変更が楽になり、どの問題が増えるのか？
</DiscussionQuestion>

<!--
話すこと:
- このスライドでは「今回の問い」を、第8回: Vertical Slice Architecture と Package by Feature の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## この回で目指す状態

Vertical Slice を「フォルダを features にすること」として終わらせない。

今日のゴール:

- 技術レイヤー分割と機能分割の違いを言える
- Package by Feature と Vertical Slice の違いを言える
- Slice の単位を考えられる
- 共有コードにする判断を説明できる
- Hexagonal と組み合わせられる理由を説明できる

<!--
話すこと:
- 到達目標を先に共有し、今日どこまで分かれば十分かを明確にする。
- 全部を暗記する必要はなく、似た言葉の違いを自分の言葉で説明できればよいと伝える。
- 各項目は後続スライドで扱うので、この時点では全体像として眺めてもらう。
-->
---

## なぜこの話が必要か

Layered では、1 つの機能変更が複数ディレクトリに散らばることがある。

Vertical Slice は、変更されやすい単位でコードを近づける考え方。

| 変更 | Layered で見に行く場所 |
|---|---|
| 請求書発行の条件変更 | services、models、repositories |
| 請求書取消の通知追加 | services、adapters、tests |
| 請求書送信の文面変更 | services、templates、tests |

機能単位で読む量を減らしたい。

<!--
話すこと:
- いきなり用語の定義に入らず、現場で起きる困りごとから話す。
- 設計の話は抽象的に見えるが、変更時の迷い、影響範囲、レビューの難しさを減らすためのものだと結びつける。
- 参加者に、最近変更が怖かった箇所を一つ思い出してもらう。
-->
---

## まず Slice とは何か

Slice は「ユーザーや業務から見た 1 つの変更単位」。

例:

- 請求書を発行する
- 請求書を取消する
- 請求書を送信する
- 請求書一覧を見る

必ず 1 API = 1 Slice ではない。

チームが変更をどう扱うかで決める。

Package by Feature は主に「どこに置くか」の話。
Vertical Slice は「一つの要求を、入口から結果や副作用まで、end-to-end な変更単位としてまとめる」設計方針。

Read-only、外部APIだけを呼ぶ処理、永続化しない処理も Slice になり得る。

<!--
話すこと:
- ここでは前提の言葉をゆっくり揃える。最初は直感的な説明から入る。ただし、正式な定義との差と、この回で省略している範囲を明示する。
- 似た言葉が出ても、粒度が違う話なのか、目的が違う話なのかを見分ける姿勢を強調する。
- 分からない言葉があれば、この場で止めて確認してよいと伝える。
-->
---

## Package by Layer

```txt
controllers/
services/
repositories/
models/
```

技術責務でファイルを置く。

Layered Architecture は論理構造なので、Package by Layer と同じ意味ではない。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Package by Feature と Vertical Slice

```txt
features/
  create-invoice/
  cancel-invoice/
  send-invoice/
```

Package by Feature は、機能単位でファイルを置く。

Vertical Slice はさらに、ユースケースごとの入力、アプリケーション処理、結果、副作用を一つの変更単位として扱う。

`features/` に移しただけでは Vertical Slice とは言えない。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## Slice 内で Hexagonal にする

薄い Slice:

```txt
features/
  get-invoice-list/
    route.ts
    query.ts
```

複雑な Slice:

```txt
features/
  issue-invoice/
    issue-invoice.ts
    invoice.ts
    invoice-repository.ts          # Output Port
    prisma-invoice-repository.ts   # Output Adapter
    payment-gateway.ts             # Output Port
    stripe-payment-gateway.ts      # Output Adapter
```

Vertical Slice と Hexagonal Architecture は矛盾しない。

ただし、全 Slice に小さな Clean Architecture を強制しない。
外部 I/O や業務ルールが濃い Slice だけ、Port / Adapter を厚くする。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## ただし強制しない

単純な CRUD に毎回この構造を強制すると過剰設計になる。

```txt
features/
  rename-invoice-title/
    application/
    domain/
    ports/
    adapters/
    mappers/
    errors/
```

抽象化の量が問題の複雑さを超えていないかを見る。

<!--
話すこと:
- コード例は文法の細部より、依存の向き、責務の置き場所、変更時に触る範囲を見る。
- TypeScript では type と const 関数を使った表現でも、設計上の境界や契約を表せることを確認する。
- この形を必ず採用するという話ではなく、何を隠し、何を明示しているかを読む。
-->
---

## 共有コードの考え方

Vertical Slice では、少しの重複を許すことがある。

理由は、無理な共通化で Slice 同士が結合するのを避けたいから。

| 共有してよい候補 | 慎重に見る候補 |
|---|---|
| 複数Sliceで意味・変更理由が同じで、所有者が明確な基盤型 | 業務ルール |
| 認証、ログなど横断処理 | Slice 固有の条件分岐 |
| 共通 HTTP helper | たまたま似ている処理 |
| 安定した Value Object | 変更理由が違う共通関数 |

共有 Domain は便利だが、所有者の曖昧な巨大 Shared Kernel になり得る。
`UserId`、`Money`、`NonEmptyString` のような型でも、意味や制約が同じ場合に限って共有する。
単に形が同じだけの型は共有しない。

<!--
話すこと:
- 表は上から読むだけでなく、横に比べる。何が違うからコストや適用場面が変わるのかを見る。
- 一つを優秀、一つを劣っていると扱わず、問題設定が変わると選択も変わると説明する。
- 参加者には、現在のプロダクトならどの列が重要かを考えてもらう。
-->
---

## 論点

- Slice の単位はユースケースか、機能群か
- 共有 Domain Model をどこに置くか
- Slice 間でコードを共有する基準は何か
- Slice 間の直接依存を許すか
- 横断的な認証、ログ、トランザクションをどこに置くか

判断例:

- 同じ名前の `Invoice` でも、一覧、発行、支払いでタスク固有モデルを持つことがある
- 複数ユースケースで同じ不変条件や整合性境界を守るなら、共有 Domain として置く
- 単純な参照 Slice では、Query Handler から Prisma を直接利用してよい
- 複雑な業務モデルを取得・保存する場合は、専用 Repository Adapter を検討する
- 認証は middleware、ログやメトリクスは middleware や Decorator に置ける
- 業務認可は Application / Domain 側で判断する
- トランザクションは、整合性境界を知る Application Service 側で張る
- Slice 間で依存する場合は、公開API、依存方向、循環依存、内部実装への依存、共有概念の所有者を見る
- 共有 Domain は、同じ不変条件と変更理由を持ち、所有者が明確な場合に限って慎重に置く

Decorator は、元の処理を変えずにログ、計測、キャッシュなどを外側から追加する形。

<!--
話すこと:
- このスライドでは「論点」を、第8回: Vertical Slice Architecture と Package by Feature の理解につながる部品として説明する。
- まず何の問題を扱っているのかを確認し、その後で名前や分類を紹介する。
- 最後に、現在の設計判断にどう関係するかを一言でつなげる。
-->
---

## 比較

| 観点 | Package by Layer | Package by Use Case / Feature |
|---|---|---|
| 配置の基準 | 技術責務 | 変更単位、ユースケース、機能群 |
| 論理構造 | どちらでも Layered 等を採用可能 | どちらでも Layered 等を採用可能 |
| 仕様の追跡 | 複数ディレクトリを移動しやすい | 関連コードを近くで読める |
| 技術責務 | 見えやすい | Feature 内に閉じる |
| Vertical Slice との関係 | 配置だけでは Vertical Slice ではない | end-to-end な独立性を高めれば Vertical Slice に近づく |

<!--
話すこと:
- Layered と Vertical Slice を対立させない。ここでは物理配置の比較に限定する。
- Slice 内部を Layered に分けることもできると再度確認する。
-->
---

## 個人ワーク: どの配置方針が合うか

「請求書を再送する」機能を追加する場合を考える。

Package by Layer:

```txt
controllers/invoice-controller.ts
services/invoice-service.ts
repositories/invoice-repository.ts
mailers/invoice-mailer.ts
```

Package by Use Case:

```txt
features/resend-invoice/route.ts
features/resend-invoice/resend-invoice.ts
features/resend-invoice/invoice-repository.ts
features/resend-invoice/invoice-mailer.ts
```

どちらも、内部に Presentation、Application、Domain、Infrastructure の論理構造を持ち得る。

考えること:

- 仕様を読むとき、どちらが追いやすいか
- メール送信だけ共通化したくなるか
- DB 取得は Slice 内に置くべきか、共有すべきか
- 認可ルールや DB スキーマ変更のような横断変更では、どちらが楽か
- Repository や Mailer を Port として抽象化する必要があるかは、配置とは別の問いとして考える

次の形式で短く書く。

```txt
Decision:
Package by Layerを維持する / Package by Use Caseへ寄せる / 機能群単位のPackage by Featureにする / 追加情報が必要

Drivers:
重視した変更単位や制約

Trade-offs:
得るものと増えるコスト
```

<!--
話すこと:
- ここは各自で短く判断を書いてから答え合わせへ進む。
- 仕様追跡のしやすさだけでなく、横断変更や重複のコストも書いてもらう。
- 次のスライドで答え合わせをするので、ここでは自分なりの仮説を持ってもらう。
-->
---

## 答え合わせ: 配置と論理構造を分ける

この例では、再送機能だけを追うなら Package by Use Case が読みやすい。

| 観点 | Package by Layer | Package by Use Case |
|---|---|---|
| 仕様の追跡 | 複数ディレクトリを移動する | 近い場所で読める |
| 技術責務 | 分かりやすい | Slice 内にまとまる |
| 共通化 | 早く共有しやすい | 重複を許容する判断が必要 |
| 外部依存 | 共有部品として見えやすい | Slice 内で閉じるか共有するかを選ぶ |
| 横断変更 | まとめて直しやすい場合がある | 複数 Slice の確認が必要 |

Layered と Vertical Slice は排他的ではない。
Slice 内部を Layered に分ける構成も成立する。

ただし、全 Slice に同じ構造を強制すると過剰になる。

単純な CRUD は薄く、外部依存や業務ルールが濃い Slice は境界を厚くする。
Repository や Mailer を Port として抽象化するかは、外部依存の変換、失敗契約、テスト境界が必要かで別途判断する。

<!--
話すこと:
- 答え合わせでは唯一の正解としてではなく、判断の筋道として説明する。
- どの情報を見てそう判断したのかを明示し、参加者が自分の考えと照合できるようにする。
- 最後に、この回の判断基準へ短く接続する。
-->
---

## 今日の判断基準

Vertical Slice は、変更単位をユースケースに寄せ、Slice 間の結合を小さくする設計方針。
Layered Architecture と対立するのではなく、主にコード配置と変更単位の軸で見る。

| 状況 | 判断 |
|---|---|
| 機能単位で変更される | Slice にまとめる価値が高い |
| 単純 CRUD | 薄い構造で十分な場合がある |
| 外部依存が濃い | Slice 内で Port / Adapter を検討する |
| Slice 間で依存したい | 公開API、依存方向、循環依存、所有者を確認する |
| 共有したくなる | 同じ意味と変更理由を持ち、所有者が明確な基盤型かを確認する |

次回は、モジュール境界とデプロイ境界を分けて考える。

<!--
話すこと:
- 最後に、この回で使える判断基準を短く回収する。
- 新しいパターン名を覚えたかではなく、どの制約なら選ぶのかを言えることを確認する。
- 次回は「機能単位でまとめる」話を、プロセスやデプロイの境界へ広げると接続する。
-->
