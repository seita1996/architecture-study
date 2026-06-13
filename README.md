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

事前に GitHub のリポジトリ設定で、Pages の Source を `GitHub Actions` にしてください。`main` ブランチへ push すると、全12回のスライドをビルドし、トップページ付きで Pages に公開します。

ローカルで Pages 用ビルドを確認する場合は次を実行します。

```bash
BASE_PATH=/architecture-study/ pnpm build:pages
```

出力先は `decks/dist/` です。トップページの `index.html` から各回のスライドへ移動できます。

## カリキュラム

| 回 | テーマ | 主な問い |
|---:|---|---|
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

30 分を固定フォーマットにします。

| 時間 | 内容 |
|---:|---|
| 5 分 | 前回の復習と今回の問い |
| 10 分 | パターン、原則、背景の説明 |
| 10 分 | コードまたは設計比較 |
| 5 分 | 個人ワーク、答え合わせ、まとめまたは次回への問い |

演習はグループワーク前提にせず、スライド上の実例やコード断片を各自で読み、頭の中で判断してもらう形式にしています。直後のスライドで答え合わせを行い、最後にその回の判断基準や次回につなげる問いへ接続します。

各スライドには発表者向けの話すことを記述しているため、講師は本文を読み上げるのではなく、ノートを見ながら補足、問いかけ、判断基準の整理を進める想定です。

## 蓄積する成果物

- アーキテクチャ用語集
- パターン比較表
- 現在の依存関係図
- チームの設計判断基準
- アンチパターン集
- ADR
- コードレビュー用チェックリスト

## 中心メッセージ

パターンは解決策ではなく、特定の制約と問題に対する、名前の付いたトレードオフである。
