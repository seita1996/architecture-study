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
    title: "第1回: アーキテクチャとデザインパターンの地図",
    question: "原則、アーキテクチャ、パターン、実装技術を区別できるか",
  },
  {
    href: "./02-cohesion-coupling/",
    title: "第2回: 高凝集・疎結合と変更容易性",
    question: "共通化は本当に変更容易性を上げているか",
  },
  {
    href: "./03-solid-dependencies/",
    title: "第3回: SOLID と依存関係",
    question: "関数型の抽象はいつ境界として意味を持つか",
  },
  {
    href: "./04-layered-mvc/",
    title: "第4回: Layered Architecture、N-tier、MVC",
    question: "レイヤー分割は何を明確にし、何を分散させるか",
  },
  {
    href: "./05-business-logic-patterns/",
    title: "第5回: Transaction Script、Service Layer、Domain Model",
    question: "業務ロジックをどこに置くべきか",
  },
  {
    href: "./06-persistence-patterns/",
    title: "第6回: Active Record、Data Mapper、Repository、Unit of Work",
    question: "永続化の抽象化は何を隠しているか",
  },
  {
    href: "./07-hexagonal-onion-clean/",
    title: "第7回: Hexagonal、Onion、Clean Architecture",
    question: "依存方向を内側へ向けるとはどういうことか",
  },
  {
    href: "./08-vertical-slice/",
    title: "第8回: Vertical Slice Architecture と Package by Feature",
    question: "機能単位の凝集はレイヤー分割とどう違うか",
  },
  {
    href: "./09-gof-behavioral/",
    title: "第9回: GoF デザインパターン前編",
    question: "Strategy、State、Command はいつ効くか",
  },
  {
    href: "./10-gof-structural-creation/",
    title: "第10回: GoF デザインパターン後編",
    question: "Adapter、Facade、Decorator、Factory、Observer は既存コードをどう説明するか",
  },
  {
    href: "./11-modular-microservices-events/",
    title: "第11回: モジュラーモノリス、マイクロサービス、イベント駆動",
    question: "プロセス境界を増やすと何が難しくなるか",
  },
  {
    href: "./12-cqrs-event-sourcing-adr/",
    title: "第12回: CQRS、Event Sourcing、最終設計比較",
    question: "現在の構成を ADR として説明できるか",
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
