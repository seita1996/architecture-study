# Architecture Study

TypeScript バックエンドの設計判断をチームで揃えるための Slidev 勉強会資料です。

軸は「主要な設計パターンを比較し、状況に応じて選択できるようになる」ことです。最終的に、現在の Vertical Slice Architecture と Hexagonal Architecture のハイブリッド構成を、流行ではなく要求と制約から説明できる状態を目指します。

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
| 1 | アーキテクチャとデザインパターンの地図 | 原則、アーキテクチャ、パターン、実装技術を区別できるか |
| 2 | 高凝集・疎結合と変更容易性 | 共通化は本当に変更容易性を上げているか |
| 3 | SOLID と依存関係 | 関数型の抽象はいつ境界として意味を持つか |
| 4 | Layered Architecture、N-tier、MVC | レイヤー分割は何を明確にし、何を分散させるか |
| 5 | Transaction Script、Service Layer、Domain Model | 業務ロジックをどこに置くべきか |
| 6 | Active Record、Data Mapper、Repository、Unit of Work | 永続化の抽象化は何を隠しているか |
| 7 | Hexagonal、Onion、Clean Architecture | 依存方向を内側へ向けるとはどういうことか |
| 8 | Vertical Slice Architecture と Package by Feature | 機能単位の凝集はレイヤー分割とどう違うか |
| 9 | GoF デザインパターン前編 | Strategy、State、Command はいつ効くか |
| 10 | GoF デザインパターン後編 | Adapter、Facade、Decorator、Factory、Observer は既存コードをどう説明するか |
| 11 | モジュラーモノリス、マイクロサービス、イベント駆動 | プロセス境界を増やすと何が難しくなるか |
| 12 | CQRS、Event Sourcing、最終設計比較 | 現在の構成を ADR として説明できるか |

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
│   ├── 09-gof-behavioral.md
│   ├── 10-gof-structural-creation.md
│   ├── 11-modular-microservices-events.md
│   ├── 12-cqrs-event-sourcing-adr.md
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
