import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { spawn } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const distDir = resolve(root, "decks/dist")

const decks = [
  {
    href: "./01-architecture-map/",
    title: "第1回: アーキテクチャは何を決めるのか",
    question: "品質特性、要求、制約、設計軸をどう結びつけるか",
  },
  {
    href: "./02-cohesion-coupling/",
    title: "第2回: 高凝集・疎結合と変更容易性",
    question: "共通化は本当に変更容易性を上げているか",
  },
  {
    href: "./03-solid-dependencies/",
    title: "第3回: 契約と依存関係",
    question: "DI、DIP、LSP、ISP は境界設計にどう使えるか",
  },
  {
    href: "./04-layered-mvc/",
    title: "第4回: 論理構造とコード配置",
    question: "Layered、Package by Layer、Package by Feature、Vertical Slice は何が違うか",
  },
  {
    href: "./05-business-logic-patterns/",
    title: "第5回: アプリケーション境界と処理フロー",
    question: "Handler、Input Port、Application Service、Transaction Script の関係は何か",
  },
  {
    href: "./06-persistence-patterns/",
    title: "第6回: 永続化と整合性",
    question: "ORM直接利用、Mapper、Repository、transaction、一意制約をどう選ぶか",
  },
  {
    href: "./07-hexagonal-onion-clean/",
    title: "第7回: Ports and Adapters",
    question: "外部との目的ある対話をどこで境界にするか",
  },
  {
    href: "./08-vertical-slice/",
    title: "第8回: Vertical Slice Architecture と Package by Feature",
    question: "機能単位の凝集はレイヤー分割とどう違うか",
  },
  {
    href: "./09-module-deployment-boundaries/",
    title: "第9回: モジュール境界とデプロイ境界",
    question: "Modular Monolith と Microservices を何から判断するか",
  },
  {
    href: "./10-messaging-failure-design/",
    title: "第10回: メッセージングと失敗設計",
    question: "Command/Event、同期/非同期、冪等性、Retry、Outbox をどう扱うか",
  },
  {
    href: "./11-cqrs-event-sourcing/",
    title: "第11回: CQRS と Event Sourcing",
    question: "読み書きや状態保存を分ける価値がコストを上回るか",
  },
  {
    href: "./12-architecture-review-adr/",
    title: "第12回: 実プロダクト設計レビューと ADR",
    question: "現在の構成を各軸で説明し、見直し条件まで残せるか",
  },
]

const normalizeBasePath = (value) => {
  const base = value || "/"
  return `/${base.replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/")
}

const run = (command, args) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }

      reject(new Error(`${command} ${args.join(" ")} exited with ${code}`))
    })
  })

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

const createIndexHtml = () => `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Architecture Study</title>
    <style>
      :root {
        color: #16211f;
        background: #f7faf9;
        font-family: Inter, "Noto Sans JP", system-ui, sans-serif;
      }

      body {
        margin: 0;
      }

      main {
        width: min(1080px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0 64px;
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 5vw, 3.4rem);
        line-height: 1.08;
      }

      .lead {
        max-width: 760px;
        margin: 0 0 32px;
        color: #50615d;
        font-size: 1.05rem;
        line-height: 1.8;
      }

      .deck-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 14px;
        padding: 0;
        margin: 0;
        list-style: none;
      }

      a {
        display: block;
        min-height: 136px;
        padding: 18px;
        border: 1px solid #cbded9;
        border-radius: 8px;
        background: #ffffff;
        color: inherit;
        text-decoration: none;
      }

      a:hover {
        border-color: #0f766e;
        box-shadow: 0 10px 28px rgb(15 118 110 / 12%);
      }

      .title {
        display: block;
        margin-bottom: 10px;
        font-weight: 700;
        line-height: 1.5;
      }

      .question {
        display: block;
        color: #5a6a66;
        font-size: 0.92rem;
        line-height: 1.65;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Architecture Study</h1>
      <p class="lead">主要な設計パターンを比較し、状況に応じて選択できるようになるための全12回の Slidev 資料です。</p>
      <ol class="deck-list">
        ${decks
          .map(
            (deck) => `<li>
          <a href="${deck.href}">
            <span class="title">${escapeHtml(deck.title)}</span>
            <span class="question">${escapeHtml(deck.question)}</span>
          </a>
        </li>`,
          )
          .join("\n        ")}
      </ol>
    </main>
  </body>
</html>
`

const basePath = normalizeBasePath(process.env.BASE_PATH)
const deckEntries = (await readdir(resolve(root, "decks")))
  .filter((file) => /^[0-9][0-9]-.*\.md$/.test(file))
  .sort()
  .map((file) => ({
    entry: `decks/${file}`,
    slug: file.replace(/\.md$/, ""),
  }))

await rm(distDir, { recursive: true, force: true })
for (const deck of deckEntries) {
  await run("pnpm", [
    "exec",
    "slidev",
    "build",
    deck.entry,
    "--out",
    `dist/${deck.slug}`,
    "--base",
    `${basePath}${deck.slug}/`,
    "--router-mode",
    "hash",
  ])
}
await mkdir(distDir, { recursive: true })
await writeFile(resolve(distDir, "index.html"), createIndexHtml())
