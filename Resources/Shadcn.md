---
title: "بوت‌کمپ و دوره‌های آنلاین هوش مصنوعی"
source: "https://starcoach.ir/hackathon/vibe-coding/lessons/5"
author:
  - "[[استارکوچ]]"
published:
created: 2026-08-20
description: "مهارت‌های پردرآمد دنیای هوش مصنوعی را در بوت‌کمپ‌ها و دوره‌های آنلاین آکادمی استارکوچ یاد بگیرید؛ یادگیری پروژه‌محور Agentic AI، مهندسی نرم‌افزار با هوش مصنوعی، فول‌استک و مدیریت محصول."
tags:
  - "clippings"
---
## shadcn ui

سند

تکمیل شده

### shadcn/ui چیست؟

**shadcn/ui** مجموعه‌ای از Componentهای آماده و قابل شخصی‌سازی برای ساخت رابط کاربری مدرن است.

به جای اینکه برای هر بخش از UI از صفر Component طراحی و پیاده‌سازی کنید، می‌توانید Componentهای آماده‌ای مثل:

- Button
- Input
- Card
- Dialog
- Dropdown

و بسیاری Componentهای دیگر را به پروژه اضافه کنید.

🔗 [مستندات رسمی shadcn/ui](https://ui.shadcn.com/)

---

### چرا از shadcn/ui استفاده کنیم؟

یکی از مهم‌ترین مزیت‌های shadcn/ui این است که کمک می‌کند **UI پروژه تمیزتر، یکپارچه‌تر و حرفه‌ای‌تر** باشد.

در یک هکاتون که زمان محدودی برای توسعه دارید، ساخت Componentهای پایه از صفر می‌تواند زمان زیادی بگیرد. shadcn/ui این بخش را تا حد زیادی ساده می‌کند و به شما اجازه می‌دهد بیشتر زمان خود را روی قابلیت اصلی محصول بگذارید.

#### مزایای مهم

- تعداد زیادی Component آماده
- طراحی مدرن و تمیز
- قابلیت شخصی‌سازی بالا
- مناسب برای ساخت Dashboard و Applicationهای پیچیده
- مناسب برای ساخت Chat UI و AI Application
- هماهنگی مناسب با Tailwind CSS
- امکان تغییر Theme و ظاهر Componentها
- امکان استفاده از Componentها به صورت مستقل در پروژه

یکی از ویژگی‌های مهم shadcn/ui این است که Componentها صرفاً یک Package بسته نیستند؛ Componentها به پروژه شما اضافه می‌شوند و می‌توانید کد آن‌ها را مستقیماً تغییر و شخصی‌سازی کنید.

---

## نصب shadcn/ui

روش نصب به Framework پروژه شما بستگی دارد.

مستندات رسمی نصب:

🔗 [Installation — shadcn/ui](https://ui.shadcn.com/docs/installation)

shadcn/ui در حال حاضر برای Frameworkهایی مانند:

- Next.js
- Vite
- React Router
- TanStack Start
- Astro
- Laravel

راهنمای نصب دارد.

---

### نصب در Next.js

اگر یک پروژه Next.js دارید، می‌توانید shadcn/ui را با CLI راه‌اندازی کنید:

bash

یا با npm:

bash

مستندات رسمی Next.js:

🔗 [shadcn/ui — Next.js Installation](https://ui.shadcn.com/docs/installation/next)

این دستور تنظیمات مورد نیاز shadcn/ui را در پروژه انجام می‌دهد.

---

### نصب در Vite

برای پروژه‌های Vite نیز می‌توانید از CLI استفاده کنید:

bash

یا:

bash

مستندات رسمی:

🔗 [shadcn/ui — Vite Installation](https://ui.shadcn.com/docs/installation/vite)

---

## اضافه کردن Component

بعد از نصب shadcn/ui، می‌توانید Componentهای مورد نیازتان را با CLI اضافه کنید.

برای مثال برای اضافه کردن Button:

bash

یا:

bash

برای مثال برای اضافه کردن Card:

bash

و برای اضافه کردن چند Component:

bash

بعد از اضافه کردن Component، می‌توانید آن را مستقیماً در کد پروژه استفاده کنید:

tsx

مستندات رسمی CLI:

🔗 [shadcn/ui CLI](https://ui.shadcn.com/docs/cli)

---

## 🎨 شخصی‌سازی UI

یکی از دلایل اصلی استفاده از shadcn/ui این است که Componentها را می‌توانید متناسب با Design پروژه خودتان تغییر دهید.

برای مثال می‌توانید مواردی مانند:

- رنگ‌ها
- Border Radius
- Typography
- Spacing
- Dark Mode
- Component Variants
- Theme

را شخصی‌سازی کنید.

بنابراین لازم نیست UI پروژه دقیقاً شبیه نمونه‌های پیش‌فرض shadcn باشد.

هدف این است که از Componentهای آماده به عنوان **Building Block** استفاده کنید و آن‌ها را مطابق نیاز محصول خودتان تغییر دهید.

🔗 [Theming — shadcn/ui](https://ui.shadcn.com/docs/theming)

---

## 🤖 استفاده از shadcn Skill در Coding Agentها

یکی از قابلیت‌های بسیار مفید shadcn برای هکاتون، **Skill مخصوص Coding Agentها** است.

shadcn یک Skill رسمی ارائه می‌کند که می‌توان آن را در پروژه نصب کرد تا Coding Agent در هنگام کار با shadcn/ui، شناخت بهتری از پروژه و Componentهای آن داشته باشد.

این Skill به Agent کمک می‌کند:

- Component مناسب را پیدا کند
- Componentهای مورد نیاز را نصب کند
- Componentها را به شکل صحیح Compose کند
- از APIهای درست استفاده کند
- Theme و Customization پروژه را بهتر درک کند
- با ساختار فعلی shadcn پروژه هماهنگ باشد

Skill همچنین می‌تواند اطلاعاتی مانند Framework، نسخه Tailwind، Aliasها، Componentهای نصب‌شده، Icon Library و Base Library پروژه را از `components.json` تشخیص دهد.

---

### نصب shadcn Skill

برای نصب Skill رسمی shadcn می‌توانید از دستور زیر استفاده کنید:

bash

مستندات رسمی:

🔗 [shadcn/ui Skills](https://ui.shadcn.com/docs/skills)

بعد از نصب، Coding Agent می‌تواند هنگام کار با shadcn/ui از این Skill استفاده کند.

---

### چرا Skill مهم است؟

بدون Skill ممکن است به Coding Agent بگویید:

> یک Dashboard با shadcn بساز.

اما Agent ممکن است Componentها را بدون توجه کافی به ساختار فعلی پروژه ایجاد کند.

با استفاده از Skill، Agent اطلاعات بیشتری درباره پروژه در اختیار دارد و می‌تواند قبل از پیاده‌سازی، Componentها و الگوهای مناسب shadcn را پیدا و استفاده کند.

برای مثال می‌توانید به Agent بگویید:

text

و Agent می‌تواند از Componentهای مناسب shadcn استفاده کند.

---

## پیشنهاد برای هکاتون

اگر از Coding Agent برای ساخت Frontend استفاده می‌کنید، پیشنهاد می‌شود:

text

به جای اینکه از Agent بخواهید هر Component را از صفر بسازد، ابتدا بررسی کنید آیا Component مورد نظر در shadcn/ui وجود دارد یا خیر.

این کار باعث می‌شود:

- سرعت توسعه بیشتر شود
- UI یکپارچه‌تر باشد
- Componentهای تکراری کمتری ساخته شود
- کیفیت و تمیزی رابط کاربری بهتر شود
- زمان بیشتری برای توسعه قابلیت اصلی محصول داشته باشید

---

## 📚 منابع

- 🔗 [shadcn/ui](https://ui.shadcn.com/)
- 🔗 [Installation](https://ui.shadcn.com/docs/installation)
- 🔗 [Next.js Installation](https://ui.shadcn.com/docs/installation/next)
- 🔗 [Vite Installation](https://ui.shadcn.com/docs/installation/vite)
- 🔗 [Components](https://ui.shadcn.com/docs/components)
- 🔗 [CLI](https://ui.shadcn.com/docs/cli)
- 🔗 [Theming](https://ui.shadcn.com/docs/theming)
- 🔗 [Skills](https://ui.shadcn.com/docs/skills)