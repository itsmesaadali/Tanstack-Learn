# AI Web Scraper & Discover

A modern AI‑powered web scraping and discovery platform built with **Next.js App Router**, **OpenRouter**, **AI SDK**, **Firecrawl**, and **shadcn/ui**.

Paste a single link or bulk‑scrape many URLs, let AI summarize and tag the content, then explore everything in a clean discovery interface.

---

## ✨ Features

* 🔗 **Single URL scraping** – scrape and summarize any webpage
* 📦 **Bulk scraping** – process multiple links at once
* 🤖 **AI summaries** – concise, readable summaries generated via OpenRouter
* 🏷️ **Automatic tags** – AI‑generated tags for fast discovery
* 🔍 **Search & discover** – explore saved items by topic
* 🔐 **Authenticated actions** – secure server actions with session checks
* ⚡ **Streaming AI responses** – fast, real‑time summaries

---

## 🧱 Tech Stack

* **Framework**: Next.js 16 (App Router)
* **UI**: shadcn/ui + Tailwind CSS
* **AI**: ai-sdk + OpenRouter
* **Scraping**: Firecrawl
* **Database**: Prisma
* **Validation**: Zod
* **Auth**: Session‑based (App Router compatible)

---

## 📂 Project Structure

```txt
app/
├─ api/
│  └─ ai/summary/route.ts      # Streaming AI summary endpoint
├─ actions/
│  ├─ save-summary.ts          # Save summary + generate tags
│  └─ search-web.ts            # Firecrawl web search
├─ schemas/
│  └─ import.ts                # Zod schemas
├─ page.tsx                    # Landing page
└─ dashboard/
   └─ items/                   # Scraped & discovered items
```

---

## 🚀 Getting Started

### 1️⃣ Install dependencies

```bash
pnpm install
# or
npm install
```

---

### 2️⃣ Environment variables

Create a `.env.local` file:

```env
OPENROUTER_API_KEY=your_key_here
FIRECRAWL_API_KEY=your_key_here
DATABASE_URL=your_database_url
```

---

### 3️⃣ Run the app

```bash
pnpm dev
```

App will be available at:

```
http://localhost:3000
```

---

## 🤖 AI Summary Flow

```txt
Client (useCompletion)
        ↓
/api/ai/summary (streamText)
        ↓
Streaming summary
        ↓
Server Action (save + tags)
        ↓
Database
```

* AI routes are **stateless**
* Persistence happens via **Server Actions**
* Streaming is handled with `useCompletion`

---

## 🔍 Web Search (Firecrawl)

### Server Action

```ts
searchWebAction({ query: "AI scraping tools" })
```

* Validated using Zod
* Auth‑protected
* Returns normalized search results

---


## 🧠 Design Principles

* AI routes handle **only AI logic**
* Server Actions handle **DB + auth**
* Client components stay thin
* Free AI models are treated as unreliable (fallbacks included)

---

## 🛣️ Roadmap

* [ ] Chunked long‑content summarization
* [ ] Retry & regenerate summaries
* [ ] Semantic search
* [ ] Collections & folders
* [ ] Public discovery feed

---

## 📜 License

MIT

---

## 🙌 Credits

Built with ❤️ using Next.js, OpenRouter, ai-sdk, Firecrawl, and shadcn/ui.
