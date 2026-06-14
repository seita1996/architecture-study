# Architecture Study

TypeScript バックエンドの設計判断をチームで揃えるための Slidev 勉強会資料です。

軸は「主要な設計パターンを比較し、状況に応じて選択できるようになる」ことです。最終的に、現在の各設計判断がどの問題と制約に対応しているのかを説明し、不要になった境界や追加すべき境界を見直せる状態を目指します。

各回は用語の前提から丁寧に説明する構成にしています。TypeScript のコード例は `class` / `interface` 中心ではなく、`type` と `const` 関数を中心にした記法で統一しています。

## セットアップ

Node.js 22.13 以上を使用します。`packageManager` は `pnpm@11.6.0` です。

```bash
corepack enable
pnpm install
```

## 使い方

特定回を表示します。

```bash
pnpm dev decks/01-architecture-map.md
```

全デッキをビルドします。

```bash
pnpm build
```

GitHub Pages と同じ形式でビルドします。

```bash
pnpm build:pages
```

PDF などへエクスポートします。

```bash
pnpm export
```

発表者ビューでは、各スライド末尾の HTML コメントを Slidev のスピーカーノートとして表示できます。

## GitHub Pages

`.github/workflows/pages.yml` で GitHub Pages へデプロイできます。

事前に GitHub のリポジトリ設定で、Pages の Source を `GitHub Actions` にしてください。`main` ブランチへ push すると、第0回と本編12回のスライドをビルドし、トップページ付きで Pages に公開します。

ローカルで Pages 用ビルドを確認する場合は次を実行します。

```bash
BASE_PATH=/architecture-study/ pnpm build:pages
```

出力先は `decks/dist/` です。トップページの `index.html` から各回のスライドへ移動できます。

## カリキュラム

| 回 | テーマ | 主な問い |
|---:|---|---|
| 0 | 受講前提と基礎用語 | TypeScript、HTTP、DB、非同期処理、テストの前提は揃っているか |
| 1 | アーキテクチャは何を決めるのか | 品質特性、要求、制約、設計軸をどう結びつけるか |
| 2 | 高凝集・疎結合と変更容易性 | 共通化は本当に変更容易性を上げているか |
| 3 | 契約と依存関係 | DI、DIP、LSP、ISP は境界設計にどう使えるか |
| 4 | 論理構造とコード配置 | Layered、Package by Layer、Package by Feature、Vertical Slice は何が違うか |
| 5 | アプリケーション境界と処理フロー | Handler、Input Port、Application Service、Transaction Script の関係は何か |
| 6 | 永続化と整合性 | ORM直接利用、Mapper、Repository、transaction、一意制約をどう選ぶか |
| 7 | Ports and Adapters | 外部との目的ある対話をどこで境界にするか |
| 8 | Vertical Slice Architecture と Package by Feature | 機能単位の凝集はレイヤー分割とどう違うか |
| 9 | モジュール境界とデプロイ境界 | Modular Monolith と Microservices を何から判断するか |
| 10 | メッセージングと失敗設計 | Command/Event、同期/非同期、冪等性、Retry、Outbox をどう扱うか |
| 11 | CQRS と Event Sourcing | 読み書きや状態保存を分ける価値がコストを上回るか |
| 12 | 実プロダクト設計レビューと ADR | 現在の構成を各軸で説明し、見直し条件まで残せるか |

## ディレクトリ構成

```txt
architecture-study/
├── package.json
├── pnpm-lock.yaml
├── decks/
│   ├── 00-prerequisites.md
│   ├── 01-architecture-map.md
│   ├── 02-cohesion-coupling.md
│   ├── 03-solid-dependencies.md
│   ├── 04-layered-mvc.md
│   ├── 05-business-logic-patterns.md
│   ├── 06-persistence-patterns.md
│   ├── 07-hexagonal-onion-clean.md
│   ├── 08-vertical-slice.md
│   ├── 09-module-deployment-boundaries.md
│   ├── 10-messaging-failure-design.md
│   ├── 11-cqrs-event-sourcing.md
│   ├── 12-architecture-review-adr.md
│   ├── components/
│   ├── layouts/
│   └── styles/
├── styles/
└── README.md
```

## 毎回の進め方

30分固定ではなく、主要概念を一通り扱うために必要な回は延長します。
基礎回は30〜40分、概念数の多い回は45〜60分、実コードを扱う最終回は事前課題と60〜90分を想定します。

| 回 | 推奨時間 | 理由 |
|---:|---|---|
| 0 | 30分または事前資料 | 前提知識の補習。理解度により可変 |
| 1 | 60分 | Driver、設計軸、分類地図を扱う |
| 2 | 30〜40分 | 凝集・結合に集中できる |
| 3 | 50〜60分 | DIP、LSP、ISP、抽象の評価、転移問題 |
| 4 | 30〜40分 | Layer、Tier、配置の区別 |
| 5 | 60分 | Transaction Script、Domain Model、Application Service |
| 6 | 60〜75分 | Mapper、Repository、Query、整合性、補足パターン |
| 7 | 45分 | Ports and Adapters と依存方向 |
| 8 | 40〜45分 | Feature、Use Case、Vertical Slice の比較 |
| 9 | 60分 | モジュール、サービス、所有・デプロイ境界 |
| 10 | 60〜75分 | メッセージング、Outbox、冪等性、失敗設計 |
| 11 | 60〜75分 | CQS、CQRS、Event Sourcing と採用コスト |
| 12 | 事前課題＋90分 | 実コードレビュー、Worksheet、ADR |

時間を延長しても、説明時間だけを増やしません。
延長分は、参加者が判断を書く時間、複数回答の比較、誤答や反対意見の検討、コード例の前提確認、実プロダクトへの転移問題、質疑に使います。

スライド内の概念は、次の二段階で扱います。

| 区分 | 扱い |
|---|---|
| Core | 判断に使えるところまで理解する |
| Supplementary | 存在、目的、主なコストを知る |

Schema evolution、Replay時の副作用制御、exactly-onceの適用範囲、Saga、分散トレーシング、複雑なtransaction isolationなどは、別勉強会や参考資料の範囲として扱います。

演習は長いグループワークにはしません。ただし、考えた内容は必ず外部化します。

請求書題材だけで終わらないように、途中で短い転移問題を入れます。

| 回 | 転移問題 |
|---:|---|
| 3 | ローカルファイルとS3の境界 |
| 6 | 座席予約の二重予約 |
| 9 | 画像変換と課金処理の分離 |
| 10 | 決済Webhookの重複配送 |
| 11 | 在庫移動履歴または会計台帳 |

演習は三種類に分けます。

| 種類 | 形式 |
|---|---|
| 想起問題 | 前回の用語を自分の言葉で1文説明する |
| 分類問題 | どの概念に該当するか、根拠を1文で書く |
| 判断問題 | 通常回は Decision / Driver / Trade-offs / Unknown を短く書く |

通常回の判断問題では、4分で書ける最小形式にします。

```txt
Decision:
選ぶ案

Driver / Priority:
最も重視した条件

Trade-offs:
得るものと失うもの

Unknown:
判断に足りない情報
```

第12回や事前課題では、次の完全版を使います。

```txt
Target:
どの機能、変更、処理か

Drivers:
要求、品質特性、制約

Priority:
どのDriverを最優先するか

Evidence / Measure:
何をもって満たしたと判断するか

Relevant axes:
今回関係する設計軸だけ選ぶ

Current design:
選んだ軸について、現在の依存、データ、transaction、外部I/O

Quality risks:
今回関係するものだけ書く
- 変更容易性
- 一貫性・データ完全性
- 性能・容量
- 可用性・回復
- 障害分離
- 観測可能性・運用性
- セキュリティ
- 開発者認知負荷

Driverは達成したい品質と優先度。
Quality risksは、現在案や代替案で満たせない可能性、検証が必要な不確実性。

Problems:
どの変更や障害が難しいか

Alternatives:
比較した案

Decision:
どの案を選ぶか

Trade-offs:
得るものと失うもの

Unknowns:
判断前に確認したいこと

Review Conditions:
どの条件で見直すか
```

各スライドには発表者向けの話すことを記述しているため、講師は本文を読み上げるのではなく、ノートを見ながら補足、問いかけ、判断基準の整理を進める想定です。

第12回は実コードレビューを扱うため、通常の30分枠では不足します。次のいずれかを選びます。

- 実コード分析を事前課題にする
- 第12回だけ60〜90分にする
- 第12回をレビュー、第13回相当をADR作成に分ける
- 対象コードとContextを講師が事前配布する

## 受講前提

第0回で確認しますが、本編は次の基礎を前提にします。

| 分野 | 前提 |
|---|---|
| TypeScript | `type`、union / discriminated union、`Promise`、`async` / `await`、高階関数、object spread、dependency を引数で渡す書き方、structural typing の基礎 |
| Webバックエンド | HTTP request / response、route / handler、middleware、外部API呼び出し、Queue worker |
| データベース | table、row、primary key、foreign key、unique constraint、transaction の原子性、同時実行による競合 |
| テスト | unit test と integration test、test double、外部依存の差し替え |

これらが曖昧な場合は、第0回を先に実施します。

## 設計判断で見る品質

各パターンは、どの品質を改善し、どのコストを増やすかで比較します。

| 品質・制約 | 見ること |
|---|---|
| 変更容易性 | 仕様変更がどこまで波及するか |
| 一貫性 | 二重実行、競合、部分失敗に耐えられるか |
| 性能・レイテンシ | 応答時間、スループット、検索負荷に合うか |
| 可用性 | 一部障害時にどこまで提供し続けるか |
| 障害分離 | 外部APIや一部機能の失敗が全体へ広がらないか |
| 運用性・観測可能性 | 追跡、再実行、原因調査ができるか |
| セキュリティ | 権限、機密情報、監査要件を満たせるか |
| 開発者認知負荷 | チームが理解し、レビューし、保守できるか |

## 蓄積する成果物

各回で次のいずれかを更新します。ただし、勉強会中に完成させる必要はありません。参加者は一文だけ提案し、講師が終了後に要約するか、次回冒頭で確定します。

| 回 | 残すもの |
|---:|---|
| 0 | 受講前提の確認結果と補足が必要な用語 |
| 1 | 設計軸と Architecture Driver のテンプレート |
| 2 | 共通化判断チェックリスト |
| 3 | 境界・契約レビュー項目 |
| 4 | 論理構造と物理配置の現状図 |
| 5 | 用語集と Application Service の責務 |
| 6 | transaction・一意制約チェックリスト |
| 7 | Port を作る基準 |
| 8 | Slice 境界と共有コードの規約 |
| 9 | モジュール所有権図 |
| 10 | メッセージ失敗設計チェックリスト |
| 11 | CQRS・Event Sourcing 採用条件 |
| 12 | 実プロダクトの ADR |

## 到達度の見方

終了後は、同じ請求書問題ではなく初見の題材で判断を見ます。例は CSV 一括インポート、外部決済 Webhook、権限付きドキュメント共有、大量通知配信、集計ダッシュボードなどです。

事前・事後で比較する場合は、問題の難易度を揃えます。外部I/Oの数、transaction対象、並行実行の有無、品質特性の数、デプロイ・所有境界の複雑さ、与える情報量が大きくずれないようにします。

各項目は 0〜2 点、または N/A で見ます。

| 点 | 状態 |
|---|---|
| 0 | 観点が出てこない |
| 1 | 講師の問いかけがあれば出せる |
| 2 | 自律的に具体化し、判断へ利用できる |
| N/A | 今回の問題に直接関係しない理由を説明できる |

採点手順:

1. 最初に無介入で回答させる
2. その時点の回答を保存する
3. 全員へ同じ標準プロンプトを出す
4. 無介入で出た観点は2点候補
5. 標準プロンプト後に出た観点は1点候補
6. それでも出なければ0点

標準プロンプト:

- 解決したい問題を一文で表すと何ですか？
- 何を最優先で守りたいですか？
- 今回判断する範囲と、判断しない範囲はどこですか？
- どの設計軸の問題ですか？
- 他に成立し得る案はありますか？
- 各案で何を得て、何を失いますか？
- 失敗すると途中状態はどうなりますか？
- 現時点ではどの案を選びますか？
- 判断に不足している情報はありますか？
- 何が変わったら見直しますか？

全問を必ず聞く必要はありません。
初回回答で欠けていた項目に対して、同じ文言を使います。
点数は出現タイミングだけで決めません。
無介入で出ても具体化や判断への利用が不十分なら2点にはせず、採点アンカーの内容条件も満たす必要があります。

N/Aは点数計算から除外します。
常に評価する項目には原則使用しません。
問題に関係する場合に評価する項目のみ、関係しない理由を説明できた場合に使用します。

常に評価する項目:

- 問題設定
- Driver
- スコープ
- 設計軸
- 代替案
- Trade-off
- 判断
- 不確実性
- 見直し条件

問題に関係する場合に評価する項目:

- Failure mode
- 品質特性

| 項目 | 2点の状態 |
|---|---|
| 問題設定 | 解決したい問題を具体化できる |
| Driver | 要求、品質特性、制約を具体的なシナリオ、優先順位、判断材料として表現できる |
| スコープ | コード、モジュール、プロセス、デプロイ、データ所有、チーム所有のうち、問題に関係するスコープを区別できる |
| 設計軸 | 異なる軸のパターンを混同しない |
| 代替案 | 現行案を含む、制約下で成立し得る代替案を最低2案比較できる |
| Trade-off | 利点とコストを両方説明できる |
| Failure mode | 並行実行、timeout、部分失敗、重複、順序、再試行・回復のうち、問題に関係するFailure modeを特定できる |
| 品質特性 | 性能、可用性、運用性、セキュリティなど、追加計測や専門レビューが必要な論点を識別できる |
| 判断 | 制約に基づいて一案を選べる |
| 不確実性 | 足りない情報を言える |
| 見直し条件 | 将来の再判断条件を残せる |

採点アンカー例:

| 項目 | 0点 | 1点 | 2点 |
|---|---|---|---|
| Driver | 「保守しやすくしたい」だけで止まる | 問われれば「メール障害の影響を減らしたい」と言える | 「メールAPI停止中も請求書発行を継続し、復旧後30分以内に送信したい」と具体化できる |
| スコープ | どの範囲の問題かを区別しない | 問われればコード内かサービス境界かを答えられる | コード、モジュール、データ所有、チーム所有など関係する範囲と対象外を区別できる |
| 設計軸 | パターン名だけで判断する | 問われれば配置、依存、永続化などの軸を分けられる | 関係する軸だけを選び、別軸の判断を混ぜずに比較できる |
| 代替案 | パターン名を一つだけ挙げる | 問われれば現状維持と変更案を挙げる | 制約下で成立する現行案と代替案を比較できる |
| Trade-off | 利点だけを述べる | 問われればコストも挙げる | 得る品質と増える実装・運用コストを判断に使える |
| Failure mode | 失敗時の途中状態を考えない | 問われればtimeoutや重複などを挙げられる | 問題に関係するFailure modeを選び、設計案やUnknownへ反映できる |
| 品質特性 | 「品質が大事」で止まる | 問われれば性能や可用性などを挙げられる | 達成条件、未検証点、専門レビューが必要な論点を分けられる |
| 不確実性 | 分からない点を出せない | 問われれば不足情報を挙げる | 許容遅延、データ量、運用能力など判断前に必要な情報を自律的に出せる |

パターン名を思い出せなくても、問題、解決構造、コストを説明できれば設計判断として評価します。用語の正確さは補助的に見ます。

評価ルーブリックの正本はREADMEです。
第12回のスライドは説明用の要約として扱います。

合計点は参考値です。常に評価する項目に0点がないか、問題に関係する項目をN/Aにした理由が妥当か、前後比較でどの観点が伸びたかを重視します。前後比較では、常に評価する項目を中心に見て、問題依存項目は定性的に比較します。ただし、Failure mode、整合性、品質特性に関わる重大な見落としがある場合は、点数だけで到達度を判断しません。性能、可用性、運用性、セキュリティは、この勉強会だけで解決能力までは評価せず、追加計測や専門レビューが必要な論点として識別できるかを見ます。

## 参考文献・発展学習

このカリキュラムでは、特定のアーキテクチャやパターンを唯一の正解として扱わず、それぞれが解決する問題、成立条件、トレードオフを理解することを重視しています。
以下は、教材レビューで参照したWeb資料と、各テーマをさらに深く学ぶための書籍です。

### Web資料

#### エンタープライズアプリケーションの業務ロジック

- [Transaction Script — Martin Fowler](https://martinfowler.com/eaaCatalog/transactionScript.html)  
  一つの業務要求を、一つの手続きとして処理するパターン。
- [Domain Model — Martin Fowler](https://martinfowler.com/eaaCatalog/domainModel.html)  
  業務データと振る舞いを一体として表現するモデル。
- [Service Layer — Martin Fowler](https://martinfowler.com/eaaCatalog/serviceLayer.html)  
  アプリケーションが提供する操作の境界と、処理の調整責務。

#### 永続化パターン

- [Repository — Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)  
  Domain ModelとData Mapperの間を、コレクションのようなインターフェースで仲介する。
- [Data Mapper — Martin Fowler](https://martinfowler.com/eaaCatalog/dataMapper.html)  
  インメモリの業務オブジェクトとDB表現を互いに独立させる。
- [Unit of Work — Martin Fowler](https://martinfowler.com/eaaCatalog/unitOfWork.html)  
  一つの業務処理で変更されたオブジェクトを追跡し、保存と競合解決を調整する。
- [Patterns of Enterprise Application Architecture — Martin Fowler](https://martinfowler.com/books/eaa.html)  
  Transaction Script、Domain Model、Repository、Data Mapper、Unit of Workなどを含むパターンカタログ。

#### 依存関係とアーキテクチャスタイル

- [Hexagonal Architecture — Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)  
  Ports and Adaptersの原典。外部技術からアプリケーションの内側を隔離する考え方。
- [The Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)  
  Dependency Ruleと、Entities、Use Cases、Interface Adapters、Frameworksの関係。
- [The Onion Architecture: Part 1 — Jeffrey Palermo](https://jeffreypalermo.com/2008/07/29/the-onion-architecture-part-1/)  
  Domain Modelを中心に置き、外部依存を外側へ配置する構造。
- [Vertical Slice Architecture — Jimmy Bogard](https://www.jimmybogard.com/vertical-slice-architecture/)  
  技術責務ではなく、変更やユースケースの単位でコードをまとめる考え方。

#### CQS、CQRS、Event Sourcing

- [Command Query Separation — Martin Fowler](https://martinfowler.com/bliki/CommandQuerySeparation.html)  
  状態を変更するCommandと、観測可能な状態を変更しないQueryを分ける原則。
- [CQRS — Martin Fowler](https://martinfowler.com/bliki/CQRS.html)  
  読み取りと書き込みで異なるモデルを使用する設計。
- [Event Sourcing — Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)  
  状態変更のイベント列を正本として状態を再構築する保存方式。
- [CQRS Pattern — Microsoft Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)  
  CQRSの適用条件、利点、同期コスト、導入上の注意。
- [Event Sourcing Pattern — Microsoft Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)  
  Event Store、Projection、再構築、競合などの実装・運用上の論点。

#### モノリスとサービス境界

- [Monolith First — Martin Fowler](https://martinfowler.com/bliki/MonolithFirst.html)  
  境界が不明確な初期段階からMicroservicesを採用することのリスク。
- [Microservices — Martin Fowler and James Lewis](https://martinfowler.com/articles/microservices.html)  
  Microservicesに共通して見られる性質と、サービス境界、データ所有、運用の考え方。

#### メッセージング、Outbox、冪等性

- [Transactional Outbox Pattern — AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)  
  DB更新とメッセージ送信の片成功を避けるためのOutboxパターン。
- [Transactional Outbox — microservices.io](https://microservices.io/patterns/data/transactional-outbox.html)  
  Outboxの構造、Relay、重複配送、Consumerの冪等性。
- [Idempotent Consumer — microservices.io](https://microservices.io/patterns/communication-style/idempotent-consumer.html)  
  at-least-once配送で同じメッセージを複数回受信することへの対処。
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)  
  Command Message、Event Message、Point-to-Point Channel、Publish-Subscribe Channel、Idempotent Receiver、Dead Letter Channelなどのパターンカタログ。
> この教材では説明を明確にするため、DBのJob行をWorkerが直接処理する構成を「Transactional Job Queue」、RelayがBrokerへメッセージを送る構成を「Transactional Outbox」と呼び分けています。呼称の境界は文献や製品によって異なります。

#### Architecture Decision Record

- [Documenting Architecture Decisions — Michael Nygard](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions)  
  Architecture Decision Recordの原典。Status、Context、Decision、Consequencesからなる簡潔な形式。

#### Domain-Driven Design

- [DDD Resources — Domain Language](https://www.domainlanguage.com/ddd/)  
  Eric EvansによるDDDの公式リソース集。DDD Referenceも公開されている。

### 技術書

#### 最初に読む

| 書籍 | 著者 | 主な対応テーマ |
|---|---|---|
| [Clean Architecture: A Craftsman's Guide to Software Structure and Design](https://www.informit.com/store/clean-architecture-a-craftsmans-guide-to-software-structure-9780134494272) | Robert C. Martin | SOLID、Dependency Rule、Use Case、境界、Ports |
| [Patterns of Enterprise Application Architecture](https://martinfowler.com/books/eaa.html) | Martin Fowlerほか | Transaction Script、Domain Model、Service Layer、Repository、Data Mapper、Unit of Work |
| [Fundamentals of Software Architecture](https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/) | Mark Richards、Neal Ford | 品質特性、Architecture Driver、アーキテクチャスタイル、トレードオフ |
| [Learning Domain-Driven Design](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/) | Vlad Khononov | 業務ロジック、Bounded Context、Domain Model、境界設計 |

#### Domain ModelとDDDを深める

| 書籍 | 著者 | 主な対応テーマ |
|---|---|---|
| [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.domainlanguage.com/ddd/) | Eric Evans | Ubiquitous Language、Entity、Value Object、Aggregate、Repository、Bounded Context |
| [Implementing Domain-Driven Design](https://www.informit.com/store/implementing-domain-driven-design-9780321834577) | Vaughn Vernon | DDDパターンの具体的な実装、Application Service、Domain Event、Repository |
| [A Philosophy of Software Design, 2nd Edition](https://web.stanford.edu/~ouster/cgi-bin/book.php) | John Ousterhout | 複雑性、深いモジュール、情報隠蔽、インターフェース設計 |

#### システム全体のアーキテクチャ判断を深める

| 書籍 | 著者 | 主な対応テーマ |
|---|---|---|
| [Software Architecture in Practice, 4th Edition](https://www.informit.com/store/software-architecture-in-practice-9780136886099) | Len Bass、Paul Clements、Rick Kazman | 品質特性シナリオ、Architecture Driver、設計・評価方法 |
| [Software Architecture: The Hard Parts](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/) | Neal Ford、Mark Richards、Pramod Sadalage、Zhamak Dehghani | サービス粒度、分散トランザクション、データ所有、ワークフロー、トレードオフ |
| [Building Evolutionary Architectures, 2nd Edition](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/) | Neal Ford、Rebecca Parsons、Patrick Kua、Pramod Sadalage | Fitness Function、変更可能性、継続的なアーキテクチャ検証 |

#### データ、整合性、分散システムを深める

| 書籍 | 著者 | 主な対応テーマ |
|---|---|---|
| [Designing Data-Intensive Applications, 2nd Edition](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/) | Martin Kleppmann、Chris Riccomini | transaction、分離レベル、レプリケーション、分散障害、整合性、ストリーム処理 |
| [Release It! Second Edition](https://pragprog.com/titles/mnee2/release-it-second-edition/) | Michael Nygard | timeout、Circuit Breaker、Bulkhead、障害連鎖、可用性、運用設計 |
| [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/) | Gregor Hohpe、Bobby Woolf | Command／Event Message、Channel、Routing、冪等性、DLQ、非同期メッセージング |

#### モジュール、Microservices、移行を深める

| 書籍 | 著者 | 主な対応テーマ |
|---|---|---|
| [Building Microservices, 2nd Edition](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) | Sam Newman | サービス境界、通信方式、データ所有、障害、運用 |
| [Monolith to Microservices](https://www.oreilly.com/library/view/monolith-to-microservices/9781492047834/) | Sam Newman | モノリスの段階的分割、Strangler Fig、データ移行、分解リスク |
| [Hexagonal Architecture Explained](https://www.hexagonalarchitectureexplained.com/) | Alistair Cockburn、Juan Manuel Garrido de Paz | Ports and Adaptersの原則、Input／Output Port、Adapter、テスト可能性 |

### 推奨読書順

#### 基礎

1. *Clean Architecture*
2. *Patterns of Enterprise Application Architecture*
3. *Fundamentals of Software Architecture*

#### 業務ロジックと境界設計

4. *Learning Domain-Driven Design*
5. *Domain-Driven Design*
6. *Implementing Domain-Driven Design*

#### 整合性・障害・分散処理

7. *Release It!*
8. *Designing Data-Intensive Applications*
9. *Enterprise Integration Patterns*

#### サービス境界と発展的な設計判断

10. *Software Architecture: The Hard Parts*
11. *Building Microservices*
12. *Building Evolutionary Architectures*
すべてを最初から通読する必要はありません。勉強会の各回で扱った概念について、Web資料で原典の定義を確認し、必要になったテーマから対応する書籍を読むことを推奨します。

## 中心メッセージ

パターンは万能な正解ではない。特定の文脈で繰り返し現れる問題に対する、名前の付いた解決構造であり、利点とコストを伴う。
