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

第1〜11回は、30〜45分で実施します。30分枠の場合は、教材上は27分で収め、3分をバッファにします。

| 時間 | 内容 |
|---:|---|
| 3 分 | 前回内容の想起 |
| 6 分 | 今回の概念説明 |
| 7 分 | 事例と選択肢の比較 |
| 4 分 | 各自で判断を文章化 |
| 4 分 | 2人または全体で判断理由を共有 |
| 3 分 | 講師の整理と持ち帰り |
| 3 分 | バッファ |

30分版では、本文の主役スライドだけを扱い、共有は1名分に絞り、補足スライドは省略します。
45分版では、補足スライド、2〜3名の判断比較、実プロダクトの短い事例、誤答や反対意見の検討に時間を使います。
特に第6回、第10回、第11回は、30分版では主役概念に絞り、45分版で補足を扱います。

演習は長いグループワークにはしません。ただし、考えた内容は必ず外部化します。

演習は三種類に分けます。

| 種類 | 形式 |
|---|---|
| 想起問題 | 前回の用語を自分の言葉で1文説明する |
| 分類問題 | どの概念に該当するか、根拠を1文で書く |
| 判断問題 | Decision / Drivers / Alternatives / Trade-offs を書く |

判断問題では、次の形式でチャットや共有ドキュメントへ短く記録してから、答え合わせと整理に進みます。

```txt
Decision:
選ぶ案

Drivers:
重視した要求、品質特性、制約

Priority:
どのDriverを最優先するか

Evidence / Measure:
何をもって満たしたと判断するか

Relevant axes:
今回関係する設計軸だけ選ぶ

Alternatives:
比較した案

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

| 項目 | 2点の状態 |
|---|---|
| 問題設定 | 解決したい問題を具体化できる |
| Driver | 要求、品質特性、制約を具体的なシナリオ、優先順位、判断材料として表現できる |
| スコープ | コード、モジュール、プロセス、デプロイを区別できる |
| 設計軸 | 異なる軸のパターンを混同しない |
| 代替案 | 最低2案を出せる |
| Trade-off | 利点とコストを両方説明できる |
| Failure mode | 並行実行、部分失敗、再試行を考慮できる |
| Security | 権限、テナント境界、機密情報、監査など、専門レビューが必要な論点を検出できる |
| 判断 | 制約に基づいて一案を選べる |
| 不確実性 | 足りない情報を言える |
| 見直し条件 | 将来の再判断条件を残せる |

16点以上は目安です。ただし、Failure mode や整合性に関わる重大な見落としがある場合は、点数だけで合格にしません。セキュリティはこの勉強会だけで解決能力までは評価せず、専門レビューが必要な論点として識別できるかを見ます。

## 中心メッセージ

パターンは万能な正解ではない。特定の文脈で繰り返し現れる問題に対する、名前の付いた解決構造であり、利点とコストを伴う。
