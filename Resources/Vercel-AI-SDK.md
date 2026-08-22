---
title: "بوت‌کمپ و دوره‌های آنلاین هوش مصنوعی"
source: "https://starcoach.ir/hackathon/vibe-coding/lessons/6"
author:
  - "[[استارکوچ]]"
published:
created: 2026-08-20
description: "مهارت‌های پردرآمد دنیای هوش مصنوعی را در بوت‌کمپ‌ها و دوره‌های آنلاین آکادمی استارکوچ یاد بگیرید؛ یادگیری پروژه‌محور Agentic AI، مهندسی نرم‌افزار با هوش مصنوعی، فول‌استک و مدیریت محصول."
tags:
  - "clippings"
---
## Vercel AI SDK

سند

تکمیل شده

### Vercel AI SDK چیست؟

**Vercel AI SDK** یک Toolkit برای ساخت سریع Applicationهای مبتنی بر AI و LLM است و مخصوصاً در پروژه‌های **React و Next.js** کاربرد زیادی دارد.

این SDK بخش زیادی از پیچیدگی‌های ارتباط Frontend با مدل‌های AI، Streaming پاسخ‌ها، مدیریت Chat و Tool Calling را ساده می‌کند.

🔗 [مستندات رسمی Vercel AI SDK](https://ai-sdk.dev/)

---

### ساخت UI برای Chatbot

یکی از نقاط قوت Vercel AI SDK، ابزارهای مربوط به ساخت **AI UI** است.

با استفاده از **AI Elements** می‌توانید Componentهای آماده مخصوص Applicationهای AI را به پروژه اضافه کنید؛ بنابراین لازم نیست رابط Chatbot را از صفر طراحی و پیاده‌سازی کنید. AI Elements بر پایه shadcn/ui ساخته شده و Componentها را مستقیماً وارد Codebase شما می‌کند.

برای مثال Componentهای آماده برای:

- Chat و Conversation
- نمایش Messageهای User و AI
- Input مخصوص Chat
- Streaming Response
- نمایش Source و Citation
- نمایش Tool Call
- Reasoning
- File Attachment
- Model Selector
- Voice Input
- Suggestion و Prompt

وجود دارد.

این موضوع برای هکاتون خیلی کاربردی است؛ چون می‌توانید در مدت کوتاهی یک **Chat UI تمیز و حرفه‌ای** بسازید و زمان بیشتری را روی منطق اصلی محصول بگذارید.

---

### ⚡ چرا استفاده کنیم؟

Vercel AI SDK کمک می‌کند:

- سریع‌تر قابلیت‌های AI را به پروژه اضافه کنید.
- Chatbot را با UI آماده بسازید.
- پاسخ‌های مدل را به صورت **Streaming** نمایش دهید.
- با Providerها و Modelهای مختلف کار کنید.
- Tool Calling و قابلیت‌های Agentic را ساده‌تر پیاده کنید.
- UI تمیزتر و یکپارچه‌تری داشته باشید.

در واقع به جای اینکه بخش زیادی از زمان هکاتون را صرف ساختن زیرساخت Chat کنید، می‌توانید از Componentهای آماده استفاده کرده و آن‌ها را متناسب با محصول خود شخصی‌سازی کنید.

---

### 🚀 نصب AI Elements

اگر shadcn/ui را در پروژه دارید، می‌توانید Componentهای مورد نیاز را با CLI اضافه کنید:

bash

برای مثال:

bash

همچنین می‌توانید از CLI خود shadcn استفاده کنید.

🔗 [مستندات AI Elements](https://elements.ai-sdk.dev/docs)

🔗 [لیست Componentها](https://elements.ai-sdk.dev/components)

---

### استفاده در Coding Agent

برای استفاده بهتر از AI Elements در Coding Agentها، یک **Skill رسمی** نیز وجود دارد.

این Skill دانش و الگوهای لازم برای کار با AI Elements، نحوه استفاده از Componentها، Integration با AI SDK و هماهنگی با shadcn/ui را در اختیار Coding Agent قرار می‌دهد.

نصب Skill:

bash

🔗 [AI Elements Skill](https://elements.ai-sdk.dev/docs/skill)