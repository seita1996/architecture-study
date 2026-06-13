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

各項目は 0〜2 点で見ます。

| 点 | 状態 |
|---|---|
| 0 | 観点が出てこない |
| 1 | 講師の問いかけがあれば出せる |
| 2 | 自律的に具体化し、判断へ利用できる |
| N/A | 今回の問題に直接関係しない理由を説明できる |

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
| スコープ | コード、モジュール、プロセス、デプロイを区別できる |
| 設計軸 | 異なる軸のパターンを混同しない |
| 代替案 | 最低2案を出せる |
| Trade-off | 利点とコストを両方説明できる |
| Failure mode | 並行実行、部分失敗、再試行を考慮できる |
| 品質特性 | 性能、可用性、運用性、セキュリティなど、追加計測や専門レビューが必要な論点を識別できる |
| 判断 | 制約に基づいて一案を選べる |
| 不確実性 | 足りない情報を言える |
| 見直し条件 | 将来の再判断条件を残せる |

合計点は参考値です。常に評価する項目に0点がないか、問題に関係する項目をN/Aにした理由が妥当か、前後比較でどの観点が伸びたかを重視します。ただし、Failure mode、整合性、品質特性に関わる重大な見落としがある場合は、点数だけで合格にしません。性能、可用性、運用性、セキュリティは、この勉強会だけで解決能力までは評価せず、追加計測や専門レビューが必要な論点として識別できるかを見ます。

## 中心メッセージ

パターンは万能な正解ではない。特定の文脈で繰り返し現れる問題に対する、名前の付いた解決構造であり、利点とコストを伴う。
