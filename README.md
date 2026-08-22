# Liara Docs Bot / دستیار هوش مصنوعی لیارا

پاسخ به سؤال‌های مستندات لیارا با بازیابی معنایی (RAG)، ذکر منبع و رابط کاربری فارسی.

🎬 **دموی پروژه:**  
https://uupload.ir/view/kooha-2026-08-22-15-34-18_xdac.mp4/

**Branch:** `001-liara-docs-bot` | **Index:** 1,142 صفحه → 4,924 چانک | **Embedding:** `text-embedding-3-large` (3,072 بعد)

## قابلیت‌ها

- **پرس‌وجو از مستندات:** پاسخ‌های فارسی با ذکر منبع ([Title](URL) - بخش: Section)
- **چت چندنفره:** مموری کوتاه‌مدت با بودجه توکن و خلاصه‌سازی در پایان گفتگو
- **پایبندی سمت چت:** لینک‌های مستندات مرتبط در نوار کناری
- **تعداد-withdrawal:** تشخیص ابهام + پرسش وضوح
- **بازخورد:** thumbs up/down + لاگ ناپایدار
- **پیشنهاد پرسش:** ۲–۳ پرسش مرتبط بعد از هر پاسخ
- **شاخص commit‌شده:** خود پروژه شامل Artifact شاخص است و نیازی به سرویس جداگانه برای Vector DB ندارد

## دموی پروژه

مشاهده ویدئوی دموی کامل:

🎬 https://uupload.ir/view/kooha-2026-08-22-15-34-18_xdac.mp4/
## فناوری‌ها

| لایه | ابزار |
|------|-------|
| فرانت‌اند | Next.js 14 App Router, TypeScript, Tailwind 3.4 |
| طراحی | Yekan Bakh, RTL، flat elevation |
| LLM | kilo.ai (`kilo-auto/free`) + AvalAI fallback |
| Embedding | AvalAI `text-embedding-3-large` (runtime + ایندکس) |
| ایندکس | Vector store فایل‌محور (`data/index/`) + BM25 fallback + doc-graph expansion |
| نشست | JWT stateless (HS256 via `node:crypto`) |
| دیپلوی | Liara Node platform (`output: "standalone"`) |

## ساختار پروژه

```text
apps/web/
├── src/
│   ├── app/
│   │   ├── api/            # route handlers: chat, feedback, sidebar, health, questions
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Chat/
│   │   └── Sidebar/
│   └── lib/                # server-side modules: llm, embedding, retrieval, session, cache, metrics
├── public/fonts/           # Yekan Bakh woff2
├── Dockerfile
└── next.config.js

packages/indexing/
├── src/
│   ├── crawler.ts          # خواندن docs/public/llms
│   ├── chunker.ts          # 512 توکن / 50 همپوشانی + انجز کد
│   ├── embedder.ts         # همگنه‌سازی با retry + chunk-level isolation
│   ├── indexer.ts          # crawl → chunk → embed → write → validate → swap
│   ├── eval.ts             # ارزیابی بازیابی (hit@k, miss rate, fallback)
│   ├── selfcheck.ts        # 11 تست خودکار pure-logic
│   ├── lib/
│   │   ├── embedding.ts    # local/API provider abstraction
│   │   ├── vector-store.ts # FileVectorStore + ChromaVectorStore
│   │   ├── bm25.ts         # BM25 offline fallback
│   │   └── text.ts         # heuristic tokenizer + normalize
│   └── data/
│       └── evaluation-questions.ts  # ۵۰–۱۰۰ سوال ارزیابی
└── package.json

infra/liara/
├── liara.json              # Liara env + healthcheck
└── nginx.conf              # (نگهداری برای سازگاری)

specs/001-liara-docs-bot/  # spec, plan, tasks, contracts, data-model, quickstart
specs/archive/             # snapshot آرشیو spec اولیه
```


## پیش‌نیازها

- Node.js ≥ 18
- npm (workspaces)
- AvalAI API key (برای embedding + fallback chat)
- (اختیاری) llama-server + `bge-m3` برای embedding محلی

## نصب

```bash
npm install --no-audit --no-fund
```

## پیکربندی (`.env`)

فایل `.env` در ریشه پروژه قرار دارد و در `apps/web/.env` به صورت symlink در دسترس است.

| متغیر | توضیح |
|--------|--------|
| `LLM_API_KEY` / `LLM_API_BASE` / `LLM_MODEL` | LLM اصلی (kilo.ai) |
| `LLM_FALLBACK_API_KEY` / `LLM_FALLBACK_API_BASE` / `LLM_FALLBACK_MODEL` | LLM پشتیبان (AvalAI) |
| `EMBEDDING_TYPE` | `api` (پیش‌فرض) یا `local` |
| `EMBEDDING_API_BASE` | پایه embeddings (مثال: `https://api.avalai.ir/v1`) |
| `EMBEDDING_API_KEY` | کلید embeddings |
| `EMBEDDING_API_MODEL` | مدل embedding (مثال: `text-embedding-3-large`) |
| `LLAMA_SERVER_URL` / `EMBEDDING_MODEL_PATH` | فقط برای `EMBEDDING_TYPE=local` |
| `SESSION_SECRET` | امضای JWT (ضروری در production) |
| `TOKEN_BUDGET` | سقف توکن هر گفتگو (پیش‌فرض ۸۰۰۰) |
| `CHROMA_DB_PATH` | مسیر شاخص (`./data/index`) |
| `RETRIEVAL_TOP_K` | تعداد چانک‌های بازیابی‌شده (پیش‌فرض ۵) |

> هشدار: `.env` حاوی اسرار است و هرگز commit نمی‌شود. برای deployment روی Liara از Secrets/Liara env استفاده کنید.

## ایندکس‌سازی مستندات

```bash
npm run index
```

خروجی: یک نسخه‌گذاری جدید در `data/index/<timestamp>/` نوشته می‌شود، validated و به `current` وصل می‌شود. فایل‌های نسخه‌گذاری (`vectors.f32`, `chunks.json`, `manifest.json`) در خود repository commit می‌شوند.

## توسعه محلی

```bash
npm run dev
# → http://localhost:3000
```

نکته: در سیستم‌های مبتنی‌بر NTFS (مثل `/media/E` در Ubuntu)، نوشتن `.next` کند است. این پروژه `distDir` را روی `/tmp` مسیر می‌دهد تا build روی RAM انجام شود.

## بیلد + Docker

```bash
npm run build
docker build -t liara-docs-bot -f apps/web/Dockerfile .
docker run -p 3000:3000 --env-file .env liara-docs-bot
```

## دیپلوی روی Liara

```bash
liara deploy --app liara-docs-bot --platform node
```

متغیرهای محیطی را در پنل Liara (یا `liara.json`) تنظیم کنید. Healthcheck: `/api/health`.

## ارزیابی

```bash
npm run eval            # کل دیتاست ۵۰–۱۰۰ سوال
npm run eval -- --limit 10   # smoke test سریع
npm run selfcheck       # تست‌های pure-logic (11 چک)
```

خروجی: hit@k، miss rate، fallback rate، MRR + نمره بالایی retrieval.

## انحرافات از طرح اولیه (plan.md)

| برنامه‌ریزی شده | اجرا شده | دلیل |
|----------------|---------|------|
| `output: "export"` + Nginx | `output: "standalone"` Node | امکانhosting routeهای `/api/*` در static export وجود ندارد |
| Embedding محلی (`bge-m3`) به‌صورت پیش‌فرض | AvalAI `text-embedding-3-large` | ساده‌سازی CI + حذف نیاز به llama-server در production |
| ChromaDB سرویس جدا | Vector store فایل‌محور | MVP offline-first؛ صفر سرویس اضافی |
| تست‌های گسترده (Jest/Playwright) | حذف برای MVP | سبکی + اعتماد به selfcheck + eval dataset |
| Docker: Node → Nginx | Docker: Node standalone | Liara Node platform نیاز به Nginx جدا ندارد |

## Re-index خودکار (CI)

`.github/workflows/reindex.yml` روی تغییرات `docs/public/llms` اجرا می‌شود:
1. دانلود/اجرای llama.cpp برای محاسبه embedding
2. ساخت نسخه جدید، validate، swap `current`
3. Commit خودکار artifact + prune نسخه‌های قدیمی

## لایسنس

Proprietary — Liara Cloud

> 🎬 **Project Demo:** https://uupload.ir/view/kooha-2026-08-22-15-34-18_xdac.mp4/
