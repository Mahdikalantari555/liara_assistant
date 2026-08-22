---
title: "توسعه هوش مصنوعی با AvalAI"
source: "https://docs.avalai.ir/fa/"
author:
published:
created: 2026-08-20
description: "توسعه هوش مصنوعی با AvalAI با استفاده از API سازگار با OpenAI، مثال‌های قابل اجرا، راهنماهای پیاده‌سازی و مرجع مدل‌ها و قیمت‌گذاری"
tags:
  - "clippings"
---
با یک درخواست واقعی شروع کنید و سپس مسیر مستنداتی را دنبال کنید که با محصول شما هماهنگ است. AvalAI با یک آدرس پایه واحد در کلاینت‌های سازگار با OpenAI کار می‌کند.

کاربران ممکن است AvalAI را با املاهای رایج «اول ai» یا «اول ای آی» و یا «هوش مصنوعی اول» پیدا کنند؛ نام رسمی در مستندات همیشه به همین شکل نوشته می‌شود.

## اولین درخواست خود را ارسال کنید

با Responses API مطمئن شوید کلید، کلاینت و مدل به‌درستی با هم کار می‌کنند.

1. **یک کلید API بسازید** [داشبورد AvalAI را باز کنید](https://chat.avalai.ir/platform/home) ، یک کلید پروژه بسازید و آن را فقط در سرور نگه دارید.
2. **یک کلاینت نصب کنید** از SDK سازگار با OpenAI برای Python یا JavaScript استفاده کنید یا همان درخواست را با cURL بفرستید.
3. **درخواست Responses را اجرا کنید** متغیر `AVALAI_API_KEY` را تنظیم کنید، مثال را اجرا کنید و `response.output_text` را بخوانید.

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",
)

response = client.responses.create(
    model="gpt-5.6-sol",
    input="Give me one practical idea for a developer tool.",
)

print(response.output_text)
```
```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AVALAI_API_KEY,
  baseURL: "https://api.avalai.ir/v1",
});

const response = await client.responses.create({
  model: "gpt-5.6-sol",
  input: "Give me one practical idea for a developer tool.",
});

console.log(response.output_text);
```
```bash
curl https://api.avalai.ir/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -d '{
    "model": "gpt-5.6-sol",
    "input": "Give me one practical idea for a developer tool."
  }'
```

## مسیر مناسب کار خود را انتخاب کنید

مستقیم به API و راهنماهای مرتبط با نیاز خود بروید.

## مدل مناسب و هزینه آن را پیدا کنید

ابتدا قابلیت‌های مستندشده را مقایسه کنید و سپس قیمت فعلی ورودی و خروجی را ببینید.

## پشتیبانی و وضعیت سرویس

برای حساب کاربری یا یکپارچه‌سازی خود کمک بگیرید یا بررسی کنید آیا رویداد فعالی روی درخواست‌ها اثر می‌گذارد.

---
title: "راهنمای شروع سریع"
source: "https://docs.avalai.ir/fa/quickstart"
author:
  - "[[AvalAI]]"
published:
created: 2026-08-20
description: "راهنمای شروع سریع — این راهنما به شما کمک می‌کند تا در عرض چند دقیقه با پلتفرم AvalAI شروع به کار کنید."
tags:
  - "clippings"
---
این راهنما به شما کمک می‌کند تا در عرض چند دقیقه با پلتفرم AvalAI شروع به کار کنید.

مسیر پیشنهادی برای اولین اجرا:

1. یک SDK نصب کنید.
2. متغیر محیطی `AVALAI_API_KEY` را تنظیم کنید.
3. سبک API را انتخاب کنید: `/v1/responses` برای برنامه‌های جدید متنی، استدلالی و ابزارمحور؛ `/v1/chat/completions` برای ادغام‌های چت موجود و بیشترین سازگاری با ارائه‌دهندگان.
4. اولین درخواست را ارسال کنید، سپس از `/v1/models` و `avalai-request-id` برای کشف مدل‌ها و ردیابی هزینه استفاده کنید.

## ۱. ساخت و محافظت از کلید API

1. در [داشبورد AvalAI](https://chat.avalai.ir/platform/home) یک حساب کاربری ایجاد کنید.
2. به بخش کلیدهای API بروید.
3. یک کلید API جدید ایجاد کنید.
4. کلید API خود را به صورت امن نگهداری کنید - فقط یک بار نمایش داده می‌شود!

### تنظیم متغیر محیطی کلید API

پیش از اجرای مثال‌های SDK یا curl، مقدار `AVALAI_API_KEY` را تنظیم کنید. آن را در shell profile، secret manager یا محیط deployment نگه دارید؛ کلید API را داخل source code، screenshot، issue report یا JavaScript سمت مرورگر قرار ندهید.

```bash
# macOS / Linux
export AVALAI_API_KEY="sk-..."
```
```powershell
# Windows PowerShell
setx AVALAI_API_KEY "sk-..."
```

پس از تنظیم متغیر، یک terminal جدید باز کنید یا shell profile را reload کنید و سپس مثال‌های زیر را اجرا کنید.

## ۲. نصب و پیکربندی کلاینت

### نصب یک SDK سازگار با OpenAI

AvalAI از سه رویکرد SDK پشتیبانی می‌کند:

ادغام‌های جایگزین با SDK رسمی

SDK های سازگار با OpenAI **رویکرد یکپارچه** — دسترسی به تمام مدل‌ها از چندین ارائه‌دهنده با نحو یکسان.

SDK های رسمی Anthropic **رویکرد بومی** — استفاده از SDK های رسمی Anthropic برای دسترسی به مدل‌های Anthropic، OpenAI، AWS Bedrock، Vertex AI و Gemini با نحو بومی.

SDK Google GenAI **رویکرد بومی** — استفاده از SDK رسمی GenAI گوگل برای دسترسی بومی به مدل‌های Gemini با طرحواره API بومی گوگل.

پیش از انتخاب ادغام بومی هر ارائه‌دهنده، [مستندات کتابخانه‌ها](https://docs.avalai.ir/fa/libraries) را بخوانید.

زبان مورد نظر خود را انتخاب کنید:

### پایتون (Python)

```bash
pip install openai
```

### نود.جی‌اس (Node.js)

```bash
npm install openai
```

### گو (Go)

```bash
go get github.com/openai/openai-go
```

### پی‌اچ‌پی (PHP)

```bash
composer require openai-php/client
```

### استفاده از آدرس پایه AvalAI

AvalAI چندین دامنه را برای اطمینان از اتصال بهینه بر اساس موقعیت و شرایط شبکه شما فراهم می‌کند.

### 1\. دامنه اصلی - پیشنهادی

- **آدرس**: `api.avalai.ir`
- **CDN**: شبکه جهانی
- **بهترین برای**: کاربرانی که به دنبال عملکرد بهینه با کمترین تاخیر هستند

### نحوه استفاده

کاربران می‌توانند بسته به شرایط شبکه خود، از هر یک از این دامنه‌ها استفاده کنند. تمام API endpoint ها و قابلیت‌ها در هر دو دامنه یکسان هستند.

#### مثال Python

```python
import os
from openai import OpenAI

# استفاده از دامنه اصلی
client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",  # آدرس پایه
)
```

### پیکربندی کلاینت

### پایتون (Python)

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",  # آدرس پایه
)
```

### جاوااسکریپت/تایپ‌اسکریپت (JavaScript/TypeScript)

```javascript
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.AVALAI_API_KEY,
  baseURL: "https://api.avalai.ir/v1", // نقطه پایانی API AvalAI
});
```

### گو (Go)

```
package main

import (
    openai "github.com/openai/openai-go"
    "os"
)

func main() {
    client := openai.NewClient(os.Getenv("AVALAI_API_KEY"))
    client.BaseURL = "https://api.avalai.ir/v1" // نقطه پایانی API AvalAI
}
```

### پی‌اچ‌پی (PHP)

```php
<?php

require_once 'vendor/autoload.php';

// استفاده از کتابخانه کلاینت PHP OpenAI (https://github.com/openai-php/client)
$apiKey = getenv('AVALAI_API_KEY');

if (!$apiKey) {
    die("AvalAI API key not found. Please set the AVALAI_API_KEY environment variable.");
}

// Your custom base URL
$customBaseUrl = 'https://api.avalai.ir/v1';

// Create a custom client instance using the factory
$client = OpenAI::factory()
    ->withApiKey($apiKey)
    ->withBaseUri($customBaseUrl)
    ->make();
```

## ۳. انتخاب سبک API

برای برنامه‌های جدید تولید متن، وقتی مدل انتخابی از آن پشتیبانی می‌کند، از `/v1/responses` شروع کنید. Responses از `input` استفاده می‌کند، متن نهایی را در `response.output_text` می‌دهد و برای وضعیت مکالمه، استدلال و ابزارها مناسب‌تر است. `/v1/chat/completions` را برای برنامه‌های موجود، پوشش گسترده‌تر ارائه‌دهندگان و SDKها یا فریم‌ورک‌هایی که هنوز `messages` می‌خواهند نگه دارید.

[Responses APIپیشنهادی برای برنامه‌های جدید GPT-5.5، استدلال، خروجی ساختاریافته و ابزارها.](https://docs.avalai.ir/fa/api-reference/responses)[Chat Completionsبرای ادغام‌های چت موجود و مدل‌هایی که فقط سازگاری چت دارند استفاده کنید.](https://docs.avalai.ir/fa/api-reference/chat)[راهنمای مهاجرتنگاشت `messages` به `input` ، خواندن `output_text` و انتخاب روش مدیریت وضعیت.](https://docs.avalai.ir/fa/guides/responses-vs-chat-completions)

## ۴. ارسال اولین درخواست

با یک درخواست ساده Responses شروع کنید:

### Responses API (پیشنهادی برای برنامه‌های جدید)

```bash
curl https://api.avalai.ir/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "instructions": "You are a helpful assistant.",
    "input": "سلام، دنیا!"
  }'
```
```python
response = client.responses.create(
    model="gpt-5.5",
    instructions="You are a helpful assistant.",
    input="سلام، دنیا!",
)

print(response.output_text)
```
```javascript
const response = await client.responses.create({
  model: "gpt-5.5",
  instructions: "You are a helpful assistant.",
  input: "سلام، دنیا!",
});

console.log(response.output_text);
```
```
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

func main() {
    payload := map[string]any{
        "model":        "gpt-5.5",
        "instructions": "You are a helpful assistant.",
        "input":        "سلام، دنیا!",
    }

    body, _ := json.Marshal(payload)
    req, _ := http.NewRequest("POST", "https://api.avalai.ir/v1/responses", bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer "+os.Getenv("AVALAI_API_KEY"))
    req.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    responseBody, _ := io.ReadAll(resp.Body)
    fmt.Println(string(responseBody))
}
```
```php
<?php
$apiKey = getenv('AVALAI_API_KEY');
$payload = [
    'model' => 'gpt-5.5',
    'instructions' => 'You are a helpful assistant.',
    'input' => 'سلام، دنیا!',
];

$ch = curl_init('https://api.avalai.ir/v1/responses');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
```

### هدرهای الزامی و محدودیت نرخ

هر درخواست احرازشده به `Authorization: Bearer $AVALAI_API_KEY` نیاز دارد. برای هر درخواست دارای بدنه JSON، هدر `Content-Type: application/json` را ارسال کنید. اگر API وضعیت HTTP `429` برگرداند، هدر `Retry-After` را رعایت کنید، از exponential backoff همراه jitter و سقف تعداد تلاش استفاده کنید و درخواست را بلافاصله تکرار نکنید. برای رفتار فعلی و راهنمای tierها، [محدودیت نرخ](https://docs.avalai.ir/fa/rate-limits) را ببینید.

Chat Completions برای ادغام موجود

### Chat Completions API (ادغام‌های موجود)

وقتی از قبل از `messages` استفاده می‌کنید یا مدل انتخابی فقط `/v1/chat/completions` را پشتیبانی می‌کند، این نسخه را نگه دارید.

### پایتون (Python)

```python
completion = client.chat.completions.create(
    model="gpt-5.5",  # می‌توانید از هر مدل پشتیبانی شده استفاده کنید
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, world!"},
    ],
)

print(completion.choices[0].message.content)
```

### جاوااسکریپت/تایپ‌اسکریپت (JavaScript/TypeScript)

```javascript
const completion = await client.chat.completions.create({
  model: "gpt-5.5", // می‌توانید از هر مدل پشتیبانی شده استفاده کنید
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello, world!" },
  ],
});

console.log(completion.choices[0].message.content);
```

### گو (Go)

```
resp, err := client.CreateChatCompletion(
    context.Background(),
    openai.ChatCompletionRequest{
        Model: "gpt-5.5", // می‌توانید از هر مدل پشتیبانی شده استفاده کنید
        Messages: []openai.ChatCompletionMessage{
            {
                Role:    openai.ChatMessageRoleSystem,
                Content: "You are a helpful assistant.",
            },
            {
                Role:    openai.ChatMessageRoleUser,
                Content: "Hello, world!",
            },
        },
    },
)

if err != nil {
    fmt.Printf("ChatCompletion error: %v\n", err)
    return
}

fmt.Println(resp.Choices[0].Message.Content)
```

### پی‌اچ‌پی (PHP)

```php
try {
 // ایجاد درخواست تکمیل گفتگو
 $response = $client->chat()->create([
 'model' => 'gpt-5.5', // می‌توانید از هر مدل پشتیبانی شده استفاده کنید
 'messages' => [
 ['role' => 'system', 'content' => 'You are a helpful assistant.'],
 ['role' => 'user', 'content' => 'Hello, world!']
 ]
 ]);

 // نمایش محتوای پاسخ
 echo $response->choices[0]->message->content;
} catch (\Exception $e) {
 echo "خطا: " . $e->getMessage() . "\n";
}
```

## ۵. کشف مدل‌ها و گسترش ادغام

فهرست عمومی مدل‌ها بدون احراز هویت در `https://api.avalai.ir/public/models` در دسترس است. وقتی برنامه به فهرست احرازشده نیاز دارد، از `/v1/models` همراه کلید API استفاده کنید.

پارامترهای مخصوص ارائه‌دهنده و گزینه‌های TypeScript

### استفاده از پارامترهای مخصوص ارائه‌دهنده

هنگام کار با ارائه‌دهندگان غیر OpenAI از طریق AvalAI (مانند Stability AI، Anthropic و غیره)، ممکن است نیاز به استفاده از پارامترهایی داشته باشید که به طور مستقیم توسط کتابخانه کلاینت OpenAI پشتیبانی نمی‌شوند. AvalAI دو روش برای ارسال این پارامترها فراهم می‌کند.

### استفاده از extra\_body

پارامتر [`extra_body`](https://docs.avalai.ir/fa/guides/provider-specific-params) به شما امکان می‌دهد هر پارامتر اضافی مورد نیاز توسط ارائه دهنده خاص را ارسال کنید:

### پایتون (Python)

```python
# مثال استفاده از پارامترهای مخصوص ارائه دهنده
response = client.chat.completions.create(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, world!"},
    ],
    extra_body={"provider_param1": "value1", "provider_param2": "value2"},
)
```

### جاوااسکریپت/تایپ‌اسکریپت (JavaScript/TypeScript)

#### استفاده مستقیم از پارامترهای مستندنشده

برای کاربران تایپ‌اسکریپت، می‌توانید پارامترهای مستندنشده را با استفاده از `// @ts-expect-error` به صورت مستقیم ارسال کنید:

```javascript
// مثال استفاده از پارامترهای مستندنشده به صورت مستقیم
const response = await client.chat.completions.create({
  model: "claude-sonnet-4-6",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello, world!" },
  ],
  // @ts-expect-error پارامتر مستندنشده
  provider_param1: "value1",
  // @ts-expect-error پارامتر مستندنشده دیگر
  provider_param2: "value2",
});
```

این کتابخانه در زمان اجرا بررسی نمی‌کند که درخواست با نوع مطابقت داشته باشد، بنابراین هر مقدار اضافی که ارسال می‌کنید، به همان صورت به API ارائه دهنده ارسال می‌شود. برای درخواست‌های GET، این پارامترهای اضافی در رشته پرس‌وجو قرار می‌گیرند، در حالی که برای سایر درخواست‌ها، در بدنه ارسال می‌شوند.

اگر می‌خواهید آرگومان‌های اضافی را به صورت صریح ارسال کنید، می‌توانید از گزینه‌های درخواست `query` ، `body` و `headers` نیز استفاده کنید.

### کاوش مدل‌های موجود

AvalAI دسترسی به مدل‌های چندین ارائه دهنده را فراهم می‌کند. می‌توانید مشخص کنید که از کدام مدل در درخواست‌های خود استفاده کنید:

- مدل‌های OpenAI: `gpt-5.5`, `gpt-5.4-pro`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.3-chat`, `gpt-5.3-codex`, `gpt-image-2` و غیره.
- مدل‌های Anthropic: `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5` و غیره.
- مدل‌های Google: `gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`, `gemini-3.1-flash-image`, `gemini-embedding-2`, `gemini-3-flash-preview`, `gemini-2.5-pro`, `gemma-4-26b-a4b-it` و غیره.
- مدل‌های XAI: `grok-4.3`, `grok-4.20-reasoning`, `grok-4.20-non-reasoning`, `grok-4-1-fast-reasoning` و غیره.
- مدل‌های DeepSeek: `deepseek-v4-pro`, `deepseek-v4-flash`, `deepseek-chat` و غیره.
- مدل‌های Alibaba: `qwen3.7-max`, `qwen3.7-plus`, `qwen3.6-plus`, `qwen3.6-flash`, `qwen3.6-max-preview`, `qwen-image-2.0-pro`, `qwen-image-2.0` و غیره.
- مدل‌های Moonshot.ai: `kimi-k2.7-code`, `kimi-k2.7-code-highspeed`, `kimi-k2.6`, `kimi-k2-thinking`, `kimi-latest` و غیره.
- مدل‌های Z.AI: `glm-5.2`, `glm-5.1`, `glm-5v-turbo`, `glm-5-turbo` و غیره.
- مدل‌های MiniMax: `minimax-m3`, `minimax-m2.7`, `minimax-m2.7-highspeed`, `minimax-m2.5` و غیره.
- مدل‌های Fireworks.ai: `nemotron-3-ultra` و مدل‌های متن‌باز سریع دیگر.
- مدل‌های Meta، Mistral، Cohere، Cloudflare، BytePlus و سایر ارائه‌دهندگان نیز در دسترس هستند.

### لیست مدل‌های موجود از طریق API

می‌توانید لیست تمام مدل‌های موجود را به صورت برنامه‌نویسی دریافت کنید:

```python
# لیست تمام مدل‌ها
models = client.models.list()
for model in models.data:
    print(f"{model.id} - {model.owned_by}")

# دریافت اطلاعات دقیق یک مدل خاص (شامل قیمت‌گذاری، قابلیت‌ها، محدودیت‌های نرخ)
model = client.models.retrieve("gpt-5.5")
print(model)
```
```bash
# نقطه پایانی عمومی (بدون نیاز به احراز هویت)
curl https://api.avalai.ir/public/models

# نقطه پایانی با احراز هویت
curl https://api.avalai.ir/v1/models -H "Authorization: Bearer $AVALAI_API_KEY"

# دریافت جزئیات یک مدل خاص
curl https://api.avalai.ir/v1/models/gpt-5.5 -H "Authorization: Bearer $AVALAI_API_KEY"
```

برای لیست کامل مدل‌های موجود، به [مستندات مدل‌ها](https://docs.avalai.ir/fa/models/model-details) یا [مرجع API مدل‌ها](https://docs.avalai.ir/fa/api-reference/models) مراجعه کنید.

## ۶. ردیابی استفاده و انتخاب گام بعدی

### ردیابی هزینه‌ها و استفاده از API (اختیاری)

برای برنامه‌های تولیدی، فروشندگان و سازمان‌های بزرگ، AvalAI **API کاربر** را برای ردیابی دقیق هزینه‌ها و تحلیل استفاده فراهم می‌کند.

### دریافت شناسه درخواست

هر پاسخ API شامل یک هدر [`avalai-request-id`](https://docs.avalai.ir/fa/api-reference/response-headers#avalai-request-id) است که درخواست را به طور منحصر به فرد شناسایی می‌کند:

```python
# مثال Python - دریافت هدرهای پاسخ
response = client.chat.completions.create(
    model="gpt-5.4-mini", messages=[{"role": "user", "content": "سلام!"}]
)

# شیء پاسخ به طور مستقیم هدرها را در SDK OpenAI نمایش نمی‌دهد
# برای دریافت هدرها، مستقیما از کلاینت HTTP استفاده کنید یا لاگ‌های برنامه خود را بررسی کنید
```
```bash
# استفاده از curl برای مشاهده هدرها
curl -i "https://api.avalai.ir/v1/chat/completions" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-5.4-mini", "messages": [{"role": "user", "content": "سلام"}]}'

# به دنبال این بگردید: avalai-request-id: 019ac4a0-a8f4-7041-845f-3ea8f15dcf1a
```

برای درخواست Responses، همین هدر را از `/v1/responses` دریافت کنید:

```bash
curl -i "https://api.avalai.ir/v1/responses" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-5.5", "input": "سلام"}'
```

### دریافت هزینه‌های دقیق

از [`avalai-request-id`](https://docs.avalai.ir/fa/api-reference/response-headers#avalai-request-id) برای جستجوی هزینه‌های دقیق استفاده کنید (ظرف 30 ثانیه در دسترس است):

```python
import requests
import os

# جستجوی هزینه دقیق
response = requests.post(
    "https://api.avalai.ir/user/v1/transactions/lookup",
    headers={
        "Authorization": f"Bearer {os.environ['AVALAI_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={"transaction_ids": ["019ac4a0-a8f4-7041-845f-3ea8f15dcf1a"]},
)

data = response.json()
# هزینه دقیق را به دلار و تومان با جزئیات کامل تراکنش برمی‌گرداند
```

### چرا از User API استفاده کنیم؟

- **هزینه‌های دقیق 100٪** - برخلاف `estimated_cost` در پاسخ‌ها، User API هزینه‌های دقیق تضمین‌شده را فراهم می‌کند
- **صورتحساب برای فروشندگان** - بر اساس هزینه‌های واقعی بدون اختلاف به مشتریان صورتحساب صادر کنید
- **تحلیل استفاده** - هزینه‌ها را بر اساس مدل، ارائه‌دهنده، تاریخ یا ساعت ردیابی کنید
- **رد تراکنش‌ها** - تاریخچه کامل تراکنش‌ها برای انطباق

**اطلاعات بیشتر:**

- [مستندات User API](https://docs.avalai.ir/fa/api-reference/user) - مرجع کامل API
- [راهنمای ردیابی هزینه برای فروشندگان](https://docs.avalai.ir/fa/resellers/cost-tracking-guide) - راهنمای گام به گام برای صورتحساب دقیق
- [راهنمای استفاده برای سازمان‌ها](https://docs.avalai.ir/fa/resellers/enterprise-guide) - الگوهای پیشرفته برای استقرارهای در مقیاس بزرگ
رفع اشکال با آدرس مستندات

### دریافت کمک با استفاده از مستندات

**💡 نکته کاربردی:** می‌توانید آدرس هر صفحه از مستندات docs.avalai.ir را کپی کرده و مستقیما در پیام خود در [chat.avalai.ir](https://chat.avalai.ir/) (پلتفرم چت AvalAI) قرار دهید. وقتی آدرس مستندات را در پیام خود وارد می‌کنید، مدل‌های هوش مصنوعی می‌توانند به محتوای آن صفحه دسترسی داشته باشند و به شما کمک کنند:

- از هر مدلی بخواهید بخش‌های خاص مستندات را توضیح دهد
- در رفع اشکال با استفاده از مستندات مربوطه کمک بگیرید
- نمونه‌های پیاده‌سازی بر اساس مستندات درخواست کنید
- مفاهیم پیچیده را با پرسش و پاسخ تعاملی روشن کنید

کافیست آدرس صفحه مستندات را همراه با سؤال خود در پیام چت وارد کنید و مدل آن مستندات را دریافت کرده و برای کمک به شما استفاده می‌کند. این امکان با ترکیب مستندات جامع ما با کمک هوش مصنوعی، اشکال‌زدایی و پیاده‌سازی سریع‌تر را فراهم می‌کند.

### مراحل بعدی

- در مورد [پشتیبانی چند ارائه دهنده SDK Anthropic](https://docs.avalai.ir/fa/news/2025-06-09-anthropic-sdk-multi-provider-support) بیاموزید - از SDK های رسمی Anthropic برای مدل‌های چندین ارائه دهنده استفاده کنید
- اطلاعیه اصلی [پشتیبانی از SDK Anthropic](https://docs.avalai.ir/fa/news/2025-06-03-anthropic-sdk-support-added) را مطالعه کنید
- [مستندات کتابخانه‌ها](https://docs.avalai.ir/fa/libraries) را برای راهنمای کامل راه‌اندازی SDK از جمله SDK های Anthropic کاوش کنید
- [مرجع API](https://docs.avalai.ir/fa/api-reference/introduction) را برای اطلاعات دقیق در مورد تمام نقاط پایانی موجود کاوش کنید.
- در مورد روش‌های [احراز هویت](https://docs.avalai.ir/fa/api-reference/authentication) و بهترین شیوه‌ها بیاموزید.
- [راهنماها](https://docs.avalai.ir/fa/guides/production-best-practices) را برای نکاتی در مورد استفاده مؤثر از API بررسی کنید.
- [سیاست محتوای API](https://docs.avalai.ir/fa/safety/content-policy) ما را برای جزئیات مربوط به مدیریت داده‌ها و حریم خصوصی مرور کنید.

---
title: "مرجع API"
source: "https://docs.avalai.ir/fa/api-reference/introduction"
author:
  - "[[AvalAI]]"
published:
created: 2026-08-20
description: "مرجع API — به مستندات مرجع API AvalAI خوش آمدید. AvalAI یک API یکپارچه ارائه می‌دهد که با ساختار API OpenAI سازگار است و به شما امکان می‌دهد از طریق یک رابط واحد و سازگار به مدل‌ه…"
tags:
  - "clippings"
---
به مستندات مرجع API AvalAI خوش آمدید. AvalAI یک API یکپارچه ارائه می‌دهد که با ساختار API OpenAI سازگار است و به شما امکان می‌دهد از طریق یک رابط واحد و سازگار به مدل‌های چندین ارائه دهنده دسترسی داشته باشید.

## URL پایه

تمام درخواست‌های API باید به URL پایه زیر ارسال شوند:

```
https://api.avalai.ir/v1
```

## احراز هویت

تمام نقاط پایانی API نیاز به احراز هویت دارند. شما باید کلید API خود را در هدر `Authorization` هر درخواست وارد کنید. برای جزئیات بیشتر به راهنمای [احراز هویت](https://docs.avalai.ir/fa/api-reference/authentication) مراجعه کنید.

## نقطه شروع: سطح API مناسب را انتخاب کنید

نمای کلی API در OpenAI توصیه می‌کند قبل از کدنویسی، سطح API مناسب را انتخاب کنید. برای AvalAI از این checklist مسیریابی شروع کنید:

| نیاز | مسیر AvalAI | نکته |
| --- | --- | --- |
| برنامه جدید متنی، reasoning، چندوجهی یا ابزارمحور | [`/v1/responses`](https://docs.avalai.ir/fa/api-reference/responses) | وقتی route مدل انتخابی از Responses پشتیبانی می‌کند، این مسیر را برای state، ابزارها و شیء خروجی غنی‌تر ترجیح دهید. |
| یکپارچه‌سازی chat موجود یا سازگاری گسترده با providerها | [`/v1/chat/completions`](https://docs.avalai.ir/fa/api-reference/chat) | برای برنامه‌های chat بالغ و providerهایی که schema تکمیل گفتگو را ارائه می‌کنند نگه دارید. |
| گفتار یا فایل صوتی request-based | [`/v1/audio/*`](https://docs.avalai.ir/fa/api-reference/audio) | برای transcription، translation و text-to-speech با فایل محدود یا گفتار تولیدشده استفاده کنید. |
| صدای زنده یا session کم‌تاخیر | [راهنمای معماری Realtime](https://docs.avalai.ir/fa/guides/realtime-audio) | تا وقتی route متناظر AvalAI برای حساب شما فعال نشده، مستندات Realtime OpenAI را فقط راهنمای معماری بدانید. |
| گزارش استفاده، هزینه و reseller | [`user/v1`](https://docs.avalai.ir/fa/api-reference/user) | endpointهای اختصاصی AvalAI برای تراکنش‌ها، خلاصه استفاده و reconciliation صورتحساب. |
| مدیریت سازمانی | داشبورد AvalAI یا پشتیبانی | فرض نکنید endpointهای Administration شرکت OpenAI مستقیما به مدیریت حساب AvalAI نگاشت می‌شوند. |

## نقاط پایانی API

### پاسخ‌ها (Responses)

API پاسخ‌ها نقطه شروع پیشنهادی برای workflowهای جدید OpenAI-family در تولید متن، استدلال، چندوجهی و ابزارمحور است، وقتی route مدل انتخابی از آن پشتیبانی می‌کند.

[اطلاعات بیشتر در مورد پاسخ‌ها →](https://docs.avalai.ir/fa/api-reference/responses)

### تکمیل گفتگو (Chat Completions)

API تکمیل گفتگو همچنان برای یکپارچه‌سازی‌های chat موجود و routeهایی که schema چت را ارائه می‌دهند پشتیبانی می‌شود.

[اطلاعات بیشتر در مورد تکمیل گفتگو →](https://docs.avalai.ir/fa/api-reference/chat)

### تصاویر (Images)

API تصاویر به شما امکان می‌دهد با استفاده از مدل‌های هوش مصنوعی مانند DALL·E تصاویر را تولید و ویرایش کنید.

[اطلاعات بیشتر در مورد تصاویر →](https://docs.avalai.ir/fa/api-reference/images)

### بردارهای تعبیه‌سازی (Embeddings)

API بردارهای تعبیه‌سازی به شما امکان می‌دهد متن را به نمایش‌های برداری برای استفاده در جستجو، خوشه‌بندی و سایر وظایف یادگیری ماشین تبدیل کنید.

[اطلاعات بیشتر در مورد بردارهای تعبیه‌سازی →](https://docs.avalai.ir/fa/api-reference/embeddings)

### صدا (Audio)

API صدا قابلیت‌های رونویسی، ترجمه و تولید محتوای صوتی را فراهم می‌کند.

[اطلاعات بیشتر در مورد صدا →](https://docs.avalai.ir/fa/api-reference/audio)

### نظارت (Moderation)

API نظارت به شما کمک می‌کند محتوای بالقوه مضر در متن را شناسایی کنید.

[اطلاعات بیشتر در مورد نظارت →](https://docs.avalai.ir/fa/api-reference/moderation)

### API کاربر (User API)

API کاربر ردیابی دقیق هزینه، تاریخچه تراکنش‌ها و تحلیل استفاده را برای فراخوانی‌های API شما فراهم می‌کند. مناسب برای فروشندگان، سازمان‌های بزرگ و برنامه‌های تولیدی که به صورتحساب دقیق نیاز دارند.

**ویژگی‌های کلیدی:**

- ردیابی دقیق هزینه با استفاده از [`avalai-request-id`](https://docs.avalai.ir/fa/api-reference/response-headers#avalai-request-id) از هدرهای پاسخ با دقت 100٪
- تاریخچه تراکنش‌ها با قابلیت فیلتر
- تحلیل و خلاصه استفاده
- در دسترس ظرف 30 ثانیه پس از فراخوانی API

[اطلاعات بیشتر در مورد API کاربر →](https://docs.avalai.ir/fa/api-reference/user)

## فرمت‌های درخواست و پاسخ

تمام نقاط پایانی API داده‌های JSON را می‌پذیرند و برمی‌گردانند. اطمینان حاصل کنید که هدر `Content-Type: application/json` را در درخواست‌های خود وارد کنید.

### مثال درخواست

```bash
curl https://api.avalai.ir/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -d '{
"model": "gpt-5.5",
"messages": [{"role": "user", "content": "Hello!"}]
}'
```
نسخه معادل Responses API

وقتی مدل انتخابی از `/v1/responses` پشتیبانی می‌کند، این نسخه را کنار مثال Chat Completions استفاده کنید. `messages` به `input` منتقل می‌شود و متن نهایی از `response.output_text` خوانده می‌شود.

```bash
curl https://api.avalai.ir/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -d '
  {
    "model": "gpt-5.5",
    "input": "Hello!",
    "instructions": "You are a helpful assistant."
  }'
```
- `messages` → `input`
- پیام سیستمی → `instructions` یا آیتم `developer`
- `choices[0].message.content` → `response.output_text`
- برای ابزارها و خروجی‌های چندوجهی، `response.output` را بر اساس `type` بررسی کنید.

### مثال پاسخ

```json
{
  "id": "chatcmpl-123abc",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-5.5",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "سلام! چطور می‌توانم امروز به شما کمک کنم؟"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

## مدیریت خطا

API AvalAI از کدهای پاسخ HTTP متعارف برای نشان دادن موفقیت یا شکست درخواست API استفاده می‌کند. به طور کلی:

- 2xx: موفقیت
- 4xx: خطای کلاینت (به عنوان مثال، درخواست نامعتبر، خطای احراز هویت)
- 5xx: خطای سرور

برای اطلاعات بیشتر در مورد مدیریت خطاها، به راهنمای [مدیریت خطا](https://docs.avalai.ir/fa/guides/error-handling) مراجعه کنید.

## محدودیت‌های نرخ

درخواست‌های API مشمول محدودیت نرخ هستند. هنگامی که از محدودیت‌های نرخ خود فراتر می‌روید، پاسخ 429 Too Many Requests دریافت خواهید کرد. برای اطلاعات بیشتر، به راهنمای [محدودیت‌های نرخ](https://docs.avalai.ir/fa/guides/rate-limits) مراجعه کنید.

## عیب‌یابی و شناسه‌های درخواست

نمای کلی OpenAI روی request IDها، هدرهای پاسخ و هدرهای rate-limit برای عیب‌یابی production تأکید می‌کند. همین الگو را برای AvalAI به‌کار ببرید:

- وقتی route می‌پذیرد، برای هر تلاش retryپذیر API یک `X-Client-Request-Id` یکتا بفرستید.
- `avalai-request-id` برگشتی، endpoint، model، وضعیت HTTP، تعداد retry، هدرهای rate-limit و `safety_identifier` hashشده خودتان را در صورت وجود log کنید.
- از [`avalai-request-id`](https://docs.avalai.ir/fa/api-reference/response-headers#avalai-request-id) برای reconciliation هزینه از طریق [User API](https://docs.avalai.ir/fa/api-reference/user) و دادن trace دقیق به پشتیبانی استفاده کنید.
- promptها و فایل‌های خام را در log نگه ندارید مگر اینکه policy نگه‌داری داده شما صراحتا اجازه دهد.

## SDKها و کتابخانه‌های کلاینت

AvalAI با کتابخانه‌های کلاینت OpenAI سازگار است. می‌توانید با مشخص کردن URL پایه AvalAI از این کتابخانه‌ها استفاده کنید:

### پایتون (Python)

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",  # آدرس پایه
)
```

### جاوااسکریپت/تایپ‌اسکریپت (JavaScript/TypeScript)

```javascript
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.AVALAI_API_KEY,
  baseURL: "https://api.avalai.ir/v1",
});
```

### گو (Go)

```
package main

import (
    "os"

    openai "github.com/openai/openai-go"
    "github.com/openai/openai-go/option"
)

func main() {
    client := openai.NewClient(
        option.WithAPIKey(os.Getenv("AVALAI_API_KEY")),
        option.WithBaseURL("https://api.avalai.ir/v1"),
    )
    _ = client
}
```

## نسخه‌بندی API

API AvalAI برای اطمینان از سازگاری به عقب در حین تکامل، نسخه‌بندی شده است. نسخه فعلی `v1` است.

تغییرهای سازگار API را عادی در نظر بگیرید: ممکن است endpointهای جدید، پارامترهای اختیاری، فیلدهای پاسخ و نوع eventهای streaming بدون شکستن integrationهای موجود اضافه شوند. فقط فیلدهایی را parse کنید که برنامه شما لازم دارد، propertyهای ناشناخته پاسخ را نادیده بگیرید، و روی ترتیب فیلدهای JSON یا قالب دقیق شناسه‌های opaque فرض شکننده نسازید.

رفتار مدل حتی وقتی schema API پایدار است می‌تواند بین aliasها و snapshotها تغییر کند. برای workflowهای production، جایی که ثبات مهم است model ID را pin کنید، پیش از تغییر alias مدل eval اجرا کنید، و برای promptها، ابزارها و response parsing یادداشت rollback نگه دارید.

## مراحل بعدی

مستندات دقیق برای هر نقطه پایانی API را کاوش کنید:

- [تکمیل گفتگو](https://docs.avalai.ir/fa/api-reference/chat)
- [پاسخ‌ها](https://docs.avalai.ir/fa/api-reference/responses)
- [تصاویر](https://docs.avalai.ir/fa/api-reference/images)
- [بردارهای تعبیه‌سازی](https://docs.avalai.ir/fa/api-reference/embeddings)
- [صدا](https://docs.avalai.ir/fa/api-reference/audio)
- [نظارت](https://docs.avalai.ir/fa/api-reference/moderation)
- [API کاربر](https://docs.avalai.ir/fa/api-reference/user) - ردیابی هزینه و تحلیل استفاده
- [هدرهای پاسخ](https://docs.avalai.ir/fa/api-reference/response-headers) - درک هدرهای پاسخ API


---
title: "API بردارهای تعبیه‌سازی (Embeddings)"
source: "https://docs.avalai.ir/fa/api-reference/embeddings"
author:
  - "[[AvalAI]]"
published:
created: 2026-08-20
description: "API بردارهای تعبیه‌سازی (Embeddings) — API بردارهای تعبیه‌سازی به شما امکان می‌دهد متن را به نمایش‌های برداری تبدیل کنید که می‌توانند برای جستجوی معنایی، خوشه‌بندی، طبقه‌بندی و سا…"
tags:
  - "clippings"
---
API بردارهای تعبیه‌سازی به شما امکان می‌دهد متن را به نمایش‌های برداری تبدیل کنید که می‌توانند برای جستجوی معنایی، خوشه‌بندی، طبقه‌بندی و سایر وظایف یادگیری ماشین استفاده شوند.

Embeddingها نزدیکی معنایی را حفظ می‌کنند: متن‌هایی با معنی مشابه بردارهایی نزدیک‌تر می‌گیرند و متن‌های نامرتبط از هم دورتر می‌شوند. از آن‌ها برای retrieval، پیشنهاددهی، تشخیص تکراری‌ها، تشخیص ناهنجاری، خوشه‌بندی و طبقه‌بندی سبک روی داده‌های خودتان استفاده کنید.

## گردش‌کار Embedding

1. **برای هر index یک مدل و اندازه ابعاد ثابت انتخاب کنید.** بردارهای query و سند باید با همان مدل و همان تعداد بعد ساخته شوند.
2. **متن ورودی را قبل از embedding نرمال و chunk کنید.** برای هر chunk شناسه پایدار نگه دارید تا سندهای بدون تغییر دوباره embed نشوند.
3. **بردارها را همراه metadata ذخیره کنید** ؛ مثل URL منبع، شناسه سند، مجوزها، زبان و زمان آخرین به‌روزرسانی.
4. **با cosine similarity یا dot product جستجو کنید** ؛ بسته به vector store خودتان. metric زمان index و query را یکسان نگه دارید.
5. **snippetهای بازیابی‌شده را به `/v1/responses` یا `/v1/chat/completions` بدهید** و از مدل نخواهید از حافظه حدس بزند. برای یک workflow کامل، [RAG دستی با Embeddings](https://docs.avalai.ir/fa/examples/manual_rag_with_embeddings) را ببینید.

## نقطه پایانی (Endpoint)

```
POST https://api.avalai.ir/v1/embeddings
```

## بدنه درخواست (Request Body)

| پارامتر | نوع | الزامی | توضیحات |
| --- | --- | --- | --- |
| `model` | string | بله | شناسه مدلی که باید استفاده شود. برای مدل‌های تعبیه‌سازی موجود به [مدل‌ها](https://docs.avalai.ir/fa/models/model-details) مراجعه کنید. |
| `input` | string or array | بله | متنی که باید تعبیه‌سازی شود. می‌تواند یک رشته یا آرایه‌ای از رشته‌ها باشد. |
| `encoding_format` | string | خیر | فرمتی که بردارهای تعبیه‌سازی باید در آن برگردانده شوند. می‌تواند "float" یا "base64" باشد. پیش‌فرض "float" است. |
| `dimensions` | integer | خیر | تعداد ابعادی که بردارهای تعبیه‌سازی خروجی باید داشته باشند. فقط در برخی مدل‌ها پشتیبانی می‌شود. |
| `user` | string | خیر | یک شناسه منحصر به فرد که نماینده کاربر نهایی شما است و می‌تواند به نظارت و شناسایی سو استفاده کمک کند. |

### نکته‌های درخواست

- برای embedding چند متن مستقل در یک درخواست، آرایه‌ای از رشته‌ها را در `input` بفرستید. این قابلیت در خود Embeddings API پشتیبانی می‌شود و با Batch API میزبانی‌شده AvalAI فرق دارد.
- هزینه embedding را بر اساس ورودی‌ای که می‌فرستید برنامه‌ریزی کنید. پاسخ مدل‌های متنی سازگار با OpenAI مقدارهای `usage.prompt_tokens` و `usage.total_tokens` را برمی‌گرداند؛ قیمت‌گذاری AvalAI و routeهای provider-specific می‌توانند متفاوت باشند، پس پیش از backfill بزرگ [قیمت‌گذاری](https://docs.avalai.ir/fa/pricing) را بررسی کنید.
- وقتی مدل انتخابی از بردار کوتاه‌تر پشتیبانی می‌کند، از `dimensions` استفاده کنید. بردار کوچک‌تر هزینه ذخیره‌سازی، حافظه و جستجو را کم می‌کند، اما ممکن است کیفیت retrieval را کاهش دهد.
- برای بیشتر vector databaseها و محاسبه similarity از `encoding_format: "float"` استفاده کنید. `base64` را فقط وقتی انتخاب کنید که pipeline شما مشخصا از انتقال فشرده سود می‌برد.
- قبل از embedding ورودی‌های خیلی بزرگ، تعداد توکن را بشمارید یا تخمین بزنید؛ [شمارش توکن](https://docs.avalai.ir/fa/guides/token-counting) و context window مدل انتخابی را ببینید. برای مدل‌های OpenAI `text-embedding-3-*` از tokenizer نوع `cl100k_base` استفاده کنید.
- رشته خالی نفرستید. API مرجع OpenAI برای درخواست‌های embedding محدودیت‌های per-input و aggregate request را مستند می‌کند؛ در AvalAI این محدودیت‌ها می‌توانند بر اساس مدل، route provider و سطح حساب متفاوت باشند، پس ingestهای بزرگ را به batchهای محدود تقسیم کنید و chunkهای ناموفق را ایمن retry کنید.

## مثال‌ها

### تولید تعبیه‌سازی پایه

```bash
curl https://api.avalai.ir/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -d '{
  "model": "text-embedding-3-small",
  "input": "The food was delicious and the service was excellent."
}'
```
```python
# مثال پایتون (Python)
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",
)

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="The food was delicious and the service was excellent.",
)

embeddings = response.data[0].embedding
print(f"Length of embedding vector: {len(embeddings)}")
print(f"First few values: {embeddings[:5]}")
```
```javascript
// مثال جاوااسکریپت (JavaScript)
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AVALAI_API_KEY,
  baseURL: "https://api.avalai.ir/v1"
});

const response = await client.embeddings.create({
  model: "text-embedding-3-small",
  input: "The food was delicious and the service was excellent."
});

const embeddings = response.data[0].embedding;
console.log(\`Length of embedding vector: ${embeddings.length}\`);
console.log(\`First few values: ${embeddings.slice(0, 5)}\`);
```
```
// مثال گو (Go)
package main

import (
    "context"
    "fmt"
    openai "github.com/openai/openai-go"
    "os"
)

func main() {
    client := openai.NewClient(os.Getenv("AVALAI_API_KEY"))
    client.BaseURL = "https://api.avalai.ir/v1"

    resp, err := client.CreateEmbeddings(
        context.Background(),
        openai.EmbeddingRequest{
            Model: openai.TextEmbeddingSmall,
            Input: []string{"The food was delicious and the service was excellent."},
        },
    )

    if err != nil {
        fmt.Printf("Embedding error: %v\n", err)
        return
    }

    embeddings := resp.Data[0].Embedding
    fmt.Printf("Length of embedding vector: %d\n", len(embeddings))
    fmt.Printf("First few values: %v\n", embeddings[:5])
}
```
```php
<?php
// مثال PHP برای Embeddings از طریق AvalAI

$apiKey = getenv('AVALAI_API_KEY'); // یا مستقیما با کلید خود جایگزین کنید
$apiUrl = 'https://api.avalai.ir/v1/embeddings';

$data = [
'model' => 'text-embedding-3-small',
'input' => 'The food was delicious and the service was excellent.' // متن ورودی به انگلیسی باقی می‌ماند یا ترجمه می‌شود؟
// در صورت نیاز پارامترهای دیگری مانند encoding_format، dimensions و غیره را اضافه کنید
// 'encoding_format' => 'float',
// 'dimensions' => 1024
];

$jsonData = json_encode($data);

$ch = curl_init($apiUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
'Content-Type: application/json',
'Authorization: Bearer ' . $apiKey,
'Content-Length: ' . strlen($jsonData)
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);

curl_close($ch);

if ($err) {
  echo "خطای cURL #:" . $err;
} elseif ($httpcode >= 400) {
  echo "خطای HTTP: " . $httpcode . "\n";
  echo $response;
} else {
  $responseData = json_decode($response, true);
  if (isset($responseData['data'][0]['embedding'])) {
    $embedding = $responseData['data'][0]['embedding'];
    echo "طول بردار تعبیه‌سازی: " . count($embedding) . "\n";
    echo "چند مقدار اول: [" . implode(', ', array_slice($embedding, 0, 5)) . "]\n";
  } else {
    echo "پاسخ دریافت شد:\n";
    print_r($responseData);
  }
}
?>
```

### چند ورودی در یک درخواست

Embeddings API از batching ورودی با ارسال آرایه‌ای از رشته‌ها در `input` پشتیبانی می‌کند. API میزبانی‌شده `/v1/batches` در AvalAI یک قابلیت جداگانه برای پردازش آفلاین است؛ وقتی یک پاسخ فوری شامل embedding چند متن می‌خواهید، از همین فرم آرایه‌ای استفاده کنید.

می‌توانید چندین متن را در یک درخواست واحد تعبیه‌سازی کنید:

```python
response = client.embeddings.create(
    model="text-embedding-3-small",
    input=[
        "The food was delicious and the service was excellent.",
        "The restaurant was very expensive and the food was mediocre.",
        "I highly recommend this restaurant for its amazing atmosphere.",
    ],
)

# Process each embedding
for i, embedding in enumerate(response.data):
    print(f"Embedding {i}, length: {len(embedding.embedding)}")
```

### ابعاد سفارشی

وقتی مدل انتخابی از `dimensions` پشتیبانی می‌کند، اندازه هدف را هنگام ساخت embedding تعیین کنید تا همه بردارهای index شکل یکسان داشته باشند:

```python
response = client.embeddings.create(
    model="text-embedding-3-large",
    input="مستندات routing مدل در AvalAI را خلاصه کن.",
    dimensions=1024,
    encoding_format="float",
)

vector = response.data[0].embedding
print(len(vector))
```
```javascript
const response = await client.embeddings.create({
  model: "text-embedding-3-large",
  input: "مستندات routing مدل در AvalAI را خلاصه کن.",
  dimensions: 1024,
  encoding_format: "float",
});

const vector = response.data[0].embedding;
console.log(vector.length);
```
```bash
curl https://api.avalai.ir/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -d '{
    "model": "text-embedding-3-large",
    "input": "مستندات routing مدل در AvalAI را خلاصه کن.",
    "dimensions": 1024,
    "encoding_format": "float"
  }'
```

اگر ناچارید بردارها را بعد از تولید کوتاه کنید، قبل از مقایسه آن‌ها را نرمال کنید. روش پیشنهادی استفاده از پارامتر API است، چون ابعاد تولید، ذخیره‌سازی و search را صریح نگه می‌دارد.

## فرمت پاسخ (Response Format)

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [
        0.0023064255,
        -0.009327292,
        -0.0028842222,
        ...
      ],
      "index": 0
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
```

## پارامترهای پاسخ (Response Parameters)

| پارامتر | نوع | توضیحات |
| --- | --- | --- |
| `object` | string | نوع شی، که همیشه "list" است. |
| `data` | array | آرایه‌ای از اشیا تعبیه‌سازی. |
| `model` | string | مدلی که برای تولید تعبیه‌سازی استفاده شده است. |
| `usage` | object | یک شی حاوی اطلاعات استفاده از توکن. |

### شی تعبیه‌سازی (Embedding Object)

| پارامتر | نوع | توضیحات |
| --- | --- | --- |
| `object` | string | نوع شی، که همیشه "embedding" است. |
| `embedding` | array | بردار تعبیه‌سازی که آرایه‌ای از اعداد اعشاری است. طول این آرایه به مدل استفاده شده بستگی دارد. |
| `index` | integer | شاخص تعبیه‌سازی در آرایه ورودی. |

### شی استفاده (Usage Object)

| پارامتر | نوع | توضیحات |
| --- | --- | --- |
| `prompt_tokens` | integer | تعداد توکن‌های استفاده شده در ورودی. |
| `total_tokens` | integer | تعداد کل توکن‌های استفاده شده (برای تعبیه‌سازی‌ها برابر با prompt\_tokens است). |

## پرسش‌های متداول

### چطور K نزدیک‌ترین بردار را سریع بازیابی کنیم؟

وقتی داده از یک مجموعه کوچک در حافظه بزرگ‌تر می‌شود، از vector database یا سرویس search استفاده کنید. هر بردار را همراه source ID، metadata مربوط به tenant و permission، زبان، زمان و نوع سند ذخیره کنید تا پیش از similarity search فیلتر deterministic داشته باشید.

### کدام تابع فاصله مناسب‌تر است؟

Cosine similarity یک پیش‌فرض امن است. embeddingهای متنی OpenAI به طول ۱ نرمال شده‌اند؛ بنابراین cosine similarity و Euclidean distance معمولا رتبه‌بندی یکسانی می‌دهند و برای این بردارهای نرمال‌شده می‌توانید از dot product به‌عنوان مسیر سریع‌ترِ معادل cosine استفاده کنید.

### آیا embeddingها از رویدادهای جدید خبر دارند؟

Embedding را به‌عنوان پایگاه دانش factual استفاده نکنید. مدل‌های `text-embedding-3-large` و `text-embedding-3-small` برای دانستن رویدادهای جدید طراحی نشده‌اند؛ سندهای عمومی یا خصوصی فعلی خودتان را embed کنید و هنگام پاسخ‌گویی بازیابی کنید.

### آیا می‌توان embeddingها را ذخیره یا share کرد؟

Embeddingها را داده مشتق‌شده از کاربر بدانید. متن خوانا نیستند، اما می‌توانند الگوهای similarity یا عضویت در corpus را آشکار کنند؛ پس همان سیاست retention، deletion، access control و tenant isolation سندهای منبع را روی آن‌ها هم اعمال کنید.

## مدل‌های موجود

AvalAI در حال حاضر این شناسه‌های مدل با mode برابر `embedding` را ارائه می‌کند. برای آخرین محدودیت‌ها و هزینه‌ها، [جزئیات مدل‌ها](https://docs.avalai.ir/fa/models/model-details) ، [قیمت‌گذاری](https://docs.avalai.ir/fa/pricing) و صفحه‌های rate limit را ببینید.

| ارائه‌دهنده | مدل | اندازه بردار / پنجره ورودی | نکته |
| --- | --- | --- | --- |
| OpenAI | `text-embedding-3-large` | 3072 بعد؛ 8191 توکن ورودی | embedding متنی OpenAI با ابعاد بالاتر؛ از بردار کوتاه‌تر با `dimensions` پشتیبانی می‌کند. |
| OpenAI | `text-embedding-3-small` | 1536 بعد؛ 8191 توکن ورودی | embedding متنی بهینه OpenAI برای search، clustering، classification و recommendation. |
| OpenAI | `text-embedding-ada-002` | 1536 بعد؛ 8191 توکن ورودی | مدل legacy سازگار با OpenAI برای indexهای موجود. |
| Google | `gemini-embedding-2` | تا 3072 بعد؛ 8192 توکن ورودی | embedding چندوجهی Gemini برای workflowهای متن، تصویر، صدا، ویدیو و PDF در routeهای پشتیبانی‌شده. |
| Google | `gemini-embedding-001` | تا 3072 بعد؛ 2048 توکن ورودی | مدل embedding Gemini با کنترل‌های task-specific از طریق پارامترهای provider-specific. |
| Cohere | `embed-v-4-0` | تا 3072 بعد؛ 128k توکن ورودی | Cohere Embed v4 از طریق Azure AI؛ از ورودی متن و تصویر روی `/v1/embeddings` پشتیبانی می‌کند. |
| Cohere | `cohere.embed-v4:0` | تا 1536 بعد؛ 128k توکن ورودی | Cohere Embed v4 از طریق AWS Bedrock برای workflowهای retrieval چندوجهی. |
| Cohere | `cohere.embed-multilingual-v3` | 1024 بعد؛ پنجره ورودی provider | embedding چندزبانه Cohere برای جستجو و طبقه‌بندی بین‌زبانی. |
| Alibaba | `text-embedding-v4` | 2048 بعد؛ 1024 توکن ورودی | جدیدترین embedding متنی Qwen برای semantic search و RAG. |
| Alibaba | `text-embedding-v3` | 1024 بعد؛ 1024 توکن ورودی | embedding متنی چندزبانه Qwen برای indexهای متنی موجود. |
| Alibaba | `tongyi-embedding-vision-plus` | 1152 بعد؛ 1024 توکن ورودی | embedding چندوجهی برای retrieval بین متن، تصویر و ویدیو. |
| Alibaba | `tongyi-embedding-vision-flash` | 768 بعد؛ 1024 توکن ورودی | embedding چندوجهی سریع‌تر برای search بین‌وجهی کم‌تاخیرتر. |
| Cloudflare | `cf.plamo-embedding-1b` | اندازه بردار provider؛ 4096 توکن ورودی | مدل embedding PLaMo از مسیر Cloudflare. |
| Cloudflare | `cf.embeddinggemma-300m` | اندازه بردار provider؛ 2048 توکن ورودی | مدل embedding فشرده مبتنی بر Gemma برای search سبک. |
| Nvidia NIM | `nvidia_nim.nv-embedqa-e5-v5` | اندازه بردار provider | مدل embedding میزبانی‌شده در NIM برای retrieval پرسش‌وپاسخ. |
| Nvidia NIM | `nvidia_nim.nv-embed-v1` | اندازه بردار provider | مدل embedding عمومی میزبانی‌شده در NIM. |
| BAAI از طریق Nvidia NIM | `nvidia_nim.bge-m3` | اندازه بردار provider | مدل embedding چندزبانه BGE از مسیر Nvidia NIM. |

## شباهت و فاصله

برای retrieval، query را با همان مدل و همان تعداد بعدی embed کنید که برای سندهای ذخیره‌شده استفاده کرده‌اید، سپس سندها را بر اساس شباهت برداری رتبه‌بندی کنید. cosine similarity یک پیش‌فرض خوب است؛ embeddingهای OpenAI به طول ۱ نرمال شده‌اند، بنابراین برای آن مدل‌ها dot product و cosine similarity معمولا رتبه‌بندی یکسانی می‌دهند. اگر بعد از تولید، بردارها را دستی کوتاه می‌کنید، پیش از ذخیره یا مقایسه آن‌ها را نرمال کنید.

Embeddingهای providerها یا ابعاد مختلف را در یک index مخلوط نکنید مگر اینکه vector store و مجموعه ارزیابی شما کیفیت رتبه‌بندی را تأیید کند. برای workflowهای retrieval مهم، یک eval کوچک با جواب‌های برچسب‌خورده نگه دارید تا تغییر مدل، chunking و dimensions را ایمن مقایسه کنید.

بردارهای ذخیره‌شده داده مشتق‌شده هستند. همان سیاست tenant isolation، retention، deletion و access control سندهای منبع را برای بردارها و metadata مربوط به آن‌ها هم اعمال کنید.

## موارد استفاده رایج

### جستجوی معنایی (Semantic Search)

از بردارهای تعبیه‌سازی می‌توان برای یافتن اسناد مشابه از نظر معنایی استفاده کرد:

```python
import os
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",
)

# Function to compute cosine similarity
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Create embeddings for a query and documents
query = "delicious pasta"
documents = [
    "The restaurant serves amazing Italian food.",
    "The new smartphone has excellent battery life.",
    "Their pasta dishes are incredibly tasty and authentic.",
]

# Get query embedding
query_response = client.embeddings.create(model="text-embedding-3-small", input=query)
query_embedding = query_response.data[0].embedding

# Get document embeddings
doc_response = client.embeddings.create(model="text-embedding-3-small", input=documents)
doc_embeddings = [item.embedding for item in doc_response.data]

# Compute similarities
similarities = [
    cosine_similarity(query_embedding, doc_embedding)
    for doc_embedding in doc_embeddings
]

# Print results
for i, similarity in enumerate(similarities):
    print(f"Document {i}: Similarity = {similarity:.4f}")
    print(f"Text: {documents[i]}")
```

### طبقه‌بندی متن (Text Classification)

از بردارهای تعبیه‌سازی می‌توان با مدل‌های یادگیری ماشین سنتی برای طبقه‌بندی استفاده کرد:

```python
import os
from sklearn.linear_model import LogisticRegression
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",
)

# Sample training data
texts = [
    "I love this product, it's amazing!",
    "This is the best purchase I've ever made.",
    "I'm very disappointed with the quality.",
    "This product is terrible, don't buy it.",
]
labels = [1, 1, 0, 0]  # 1 for positive, 0 for negative

# Get embeddings for training data
response = client.embeddings.create(model="text-embedding-3-small", input=texts)
embeddings = [item.embedding for item in response.data]

# Train a classifier
classifier = LogisticRegression()
classifier.fit(embeddings, labels)

# Classify new text
new_texts = ["I really enjoy using this.", "This doesn't work as advertised."]
new_response = client.embeddings.create(model="text-embedding-3-small", input=new_texts)
new_embeddings = [item.embedding for item in new_response.data]

# Predict
predictions = classifier.predict(new_embeddings)
for text, prediction in zip(new_texts, predictions):
    sentiment = "positive" if prediction == 1 else "negative"
    print(f"Text: '{text}' - Predicted sentiment: {sentiment}")
```

## تعبیه‌سازی‌ گوگل Gemini

مدل‌های تعبیه‌سازی Gemini گوگل ویژگی‌های پیشرفته‌ای از جمله بهینه‌سازی خاص وظیفه، کنترل انعطاف‌پذیر ابعاد و عملکرد برتر برای وظایف مختلف NLP ارائه می‌دهند. AvalAI از تعبیه‌سازی‌ Gemini از طریق رویکردهای سازگار با OpenAI و SDK بومی Google GenAI پشتیبانی می‌کند.

### استفاده از تعبیه‌سازی‌ Gemini با طرحواره OpenAI

می‌توانید از تعبیه‌سازی‌ Gemini از طریق نقطه پایانی استاندارد `v1/embeddings` با پارامترهای اضافی در `extra_body` برای ویژگی‌های پیشرفته استفاده کنید:

#### تعبیه‌سازی پایه Gemini

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",
)

# تعبیه‌سازی پایه Gemini
response = client.embeddings.create(
    model="gemini-embedding-001",
    input="روباه قهوه‌ای سریع از روی سگ تنبل می‌پرد",
)

embedding = response.data[0].embedding
print(f"ابعاد تعبیه‌سازی: {len(embedding)}")
print(f"چند مقدار اول: {embedding[:5]}")
```
```javascript
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.AVALAI_API_KEY,
    baseURL: "https://api.avalai.ir/v1",
});

// تعبیه‌سازی پایه Gemini
const response = await client.embeddings.create({
    model: "gemini-embedding-001",
    input: "روباه قهوه‌ای سریع از روی سگ تنبل می‌پرد",
});

const embedding = response.data[0].embedding;
console.log(\`ابعاد تعبیه‌سازی: ${embedding.length}\`);
console.log(\`چند مقدار اول: ${embedding.slice(0, 5)}\`);
```
```bash
curl https://api.avalai.ir/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -d '{
    "model": "gemini-embedding-001",
    "input": "روباه قهوه‌ای سریع از روی سگ تنبل می‌پرد"
  }'
```

#### ویژگی‌های پیشرفته با انواع وظایف

تعبیه‌سازی‌ Gemini از بهینه‌سازی خاص وظیفه و ابعاد سفارشی پشتیبانی می‌کنند:

```python
# تعبیه‌سازی پیشرفته Gemini با نوع وظیفه و ابعاد سفارشی
response = client.embeddings.create(
    model="gemini-embedding-001",
    input=["معنای زندگی چیست؟", "هدف وجود چیست؟", "چگونه کیک درست کنم؟"],
    extra_body={"task_type": "SEMANTIC_SIMILARITY", "output_dimensionality": 768},
)

# محاسبه شباهت کسینوسی بین تعبیه‌سازی‌‌ها
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

embeddings = [item.embedding for item in response.data]
embeddings_matrix = np.array(embeddings)
similarity_matrix = cosine_similarity(embeddings_matrix)

print(f"شباهت بین دو متن اول: {similarity_matrix[0, 1]:.4f}")
print(f"شباهت بین متن اول و سوم: {similarity_matrix[0, 2]:.4f}")

# نرمال‌سازی تعبیه‌سازی‌‌ها برای ابعاد < 3072 (توصیه می‌شود)
if len(embeddings[0]) < 3072:
    normalized_embeddings = []
    for embedding in embeddings:
        embedding_array = np.array(embedding)
        normalized = embedding_array / np.linalg.norm(embedding_array)
        normalized_embeddings.append(normalized)
    print("تعبیه‌سازی‌‌ها برای عملکرد بهینه نرمال‌سازی شدند")
```
```javascript
// تعبیه‌سازی پیشرفته Gemini با نوع وظیفه و ابعاد سفارشی
const response = await client.embeddings.create({
    model: "gemini-embedding-001",
    input: [
        "معنای زندگی چیست؟",
        "هدف وجود چیست؟",
        "چگونه کیک درست کنم؟"
    ],
    // @ts-expect-error extra_body is a provider-specific parameter
    extra_body: {
        task_type: "SEMANTIC_SIMILARITY",
        output_dimensionality: 768
    }
});

const embeddings = response.data.map(item => item.embedding);
console.log(\`${embeddings.length} تعبیه‌سازی با ${embeddings[0].length} بعد تولید شد\`);

// محاسبه شباهت ساده ضرب داخلی (برای تعبیه‌سازی‌ نرمال‌شده)
function dotProduct(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

const similarity = dotProduct(embeddings[0], embeddings[1]);
console.log(\`شباهت بین دو متن اول: ${similarity.toFixed(4)}\`);
```
```bash
curl https://api.avalai.ir/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AVALAI_API_KEY" \
  -d '{
    "model": "gemini-embedding-001",
    "input": ["معنای زندگی چیست؟", "هدف وجود چیست؟"],
    "extra_body": {
      "task_type": "SEMANTIC_SIMILARITY",
      "output_dimensionality": 768
    }
  }'
```

#### انواع وظایف پشتیبانی‌شده

| نوع وظیفه | توضیحات | بهترین برای |
| --- | --- | --- |
| `SEMANTIC_SIMILARITY` | بهینه‌سازی شده برای اندازه‌گیری شباهت متن | سیستم‌های توصیه، تشخیص تکراری |
| `CLASSIFICATION` | بهینه‌سازی شده برای وظایف طبقه‌بندی متن | تحلیل احساسات، تشخیص اسپم |
| `CLUSTERING` | بهینه‌سازی شده برای گروه‌بندی متن‌های مشابه | سازماندهی اسناد، تحقیقات بازار |
| `RETRIEVAL_DOCUMENT` | بهینه‌سازی شده برای نمایه‌سازی اسناد | سیستم‌های RAG، موتورهای جستجو |
| `RETRIEVAL_QUERY` | بهینه‌سازی شده برای پرس‌وجوهای جستجو | برنامه‌های جستجوی سفارشی |
| `CODE_RETRIEVAL_QUERY` | بهینه‌سازی شده برای پرس‌وجوهای جستجوی کد | جستجوی کد، جستجوی مستندات |
| `QUESTION_ANSWERING` | بهینه‌سازی شده برای سیستم‌های پرسش و پاسخ | چت‌بات‌ها، سیستم‌های FAQ |
| `FACT_VERIFICATION` | بهینه‌سازی شده برای بررسی حقایق | سیستم‌های تایید خودکار |

### استفاده از API بومی Gemini

همچنین می‌توانید از تعبیه‌سازی‌ Gemini از طریق نقطه پایانی SDK بومی Google GenAI برای دسترسی کامل به ویژگی‌های خاص Gemini استفاده کنید:

```python
import os
from google import genai

client = genai.Client(
    api_key=os.environ["AVALAI_API_KEY"],
    http_options={"api_version": "v1beta", "base_url": "https://api.avalai.ir"},
)

# تعبیه‌سازی پایه با API بومی
result = client.models.embed_content(
    model="gemini-embedding-001", contents="معنای زندگی چیست؟"
)

embedding = result.embeddings[0]
print(f"ابعاد تعبیه‌سازی: {len(embedding.values)}")
print(f"چند مقدار اول: {embedding.values[:5]}")

# استفاده پیشرفته با نوع وظیفه و ابعاد سفارشی
from google.genai import types

result = client.models.embed_content(
    model="gemini-embedding-001",
    contents=["معنای زندگی چیست؟", "هدف وجود چیست؟", "چگونه کیک درست کنم؟"],
    config=types.EmbedContentConfig(
        task_type="SEMANTIC_SIMILARITY", output_dimensionality=768
    ),
)

# محاسبه شباهت‌ها با استفاده از تعبیه‌سازی‌‌ها
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

embeddings_matrix = np.array([emb.values for emb in result.embeddings])
similarity_matrix = cosine_similarity(embeddings_matrix)

print(f"شباهت بین 'معنای زندگی' و 'هدف وجود': {similarity_matrix[0, 1]:.4f}")
print(f"شباهت بین 'معنای زندگی' و 'درست کردن کیک': {similarity_matrix[0, 2]:.4f}")
```
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.AVALAI_API_KEY,
    httpOptions: {"apiVersion": "v1beta", "baseUrl": "https://api.avalai.ir"}}
});

// تعبیه‌سازی پایه با API بومی
const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: "معنای زندگی چیست؟"
});

const embedding = response.embeddings[0];
console.log(\`ابعاد تعبیه‌سازی: ${embedding.values.length}\`);
console.log(\`چند مقدار اول: ${embedding.values.slice(0, 5)}\`);

// استفاده پیشرفته با نوع وظیفه و ابعاد سفارشی
const advancedResponse = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: [
        "معنای زندگی چیست؟",
        "هدف وجود چیست؟",
        "چگونه کیک درست کنم؟"
    ],
    taskType: "SEMANTIC_SIMILARITY",
    outputDimensionality: 768
});

console.log(\`${advancedResponse.embeddings.length} تعبیه‌سازی تولید شد\`);
```
```bash
# تعبیه‌سازی پایه با API بومی
curl "https://api.avalai.ir/v1beta/models/gemini-embedding-001:embedContent" \
  -H "x-goog-api-key: $AVALAI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [
      {"parts": [{"text": "معنای زندگی چیست؟"}]}
    ]
  }'

# استفاده پیشرفته با نوع وظیفه و ابعاد سفارشی
curl "https://api.avalai.ir/v1beta/models/gemini-embedding-001:embedContent" \
  -H "x-goog-api-key: $AVALAI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [
      {"parts": [{"text": "معنای زندگی چیست؟"}]},
      {"parts": [{"text": "هدف وجود چیست؟"}]}
    ],
    "embedding_config": {
      "task_type": "SEMANTIC_SIMILARITY",
      "output_dimensionality": 768
    }
  }'
```

### فرمت پاسخ تعبیه‌سازی Gemini (API بومی)

هنگام استفاده از API بومی Gemini، فرمت پاسخ با طرحواره OpenAI متفاوت است:

```json
{
  "embeddings": [
    {
      "values": [
        0.0023064255,
        -0.009327292,
        -0.0028842222,
        ...
      ]
    }
  ]
}
```

### کنترل ابعاد خروجی

تعبیه‌سازی‌ Gemini از یادگیری نمایش ماتریوشکا (MRL) پشتیبانی می‌کنند که امکان استفاده از ابعاد کوچک‌تر بدون از دست دادن کیفیت قابل توجه را فراهم می‌کند:

- **۳۰۷۲ بعد**: ظرفیت کامل مدل (پیش‌فرض، از قبل نرمال‌سازی شده)
- **۱۵۳۶ بعد**: عملکرد متعادل و کارایی
- **۷۶۸ بعد**: کارآمد با عملکرد خوب
- **۵۱۲ بعد**: فشرده با عملکرد قابل قبول
- **۲۵۶ بعد**: بسیار فشرده
- **۱۲۸ بعد**: حداقل اندازه

مهم

برای ابعاد غیر از ۳۰۷۲، باید تعبیه‌سازی‌‌ها را برای عملکرد بهینه شباهت معنایی نرمال‌سازی کنید:

```python
import numpy as np

# نرمال‌سازی تعبیه‌سازی‌‌ها برای ابعاد < ۳۰۷۲
def normalize_embedding(embedding):
    embedding_array = np.array(embedding)
    return embedding_array / np.linalg.norm(embedding_array)

# مثال استفاده
if len(embedding) < 3072:
    normalized_embedding = normalize_embedding(embedding)
```

### مثال سیستم RAG با تعبیه‌سازی‌ Gemini

در اینجا مثال کاملی از استفاده از تعبیه‌سازی‌ Gemini برای سیستم تولید تقویت‌شده بازیابی (RAG) آورده شده است:

```python
import os
import numpy as np
from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity

client = OpenAI(
    api_key=os.environ["AVALAI_API_KEY"],
    base_url="https://api.avalai.ir/v1",
)

# پایگاه دانش نمونه
documents = [
    "پاریس پایتخت فرانسه است و به خاطر برج ایفل مشهور است.",
    "توکیو پایتخت ژاپن است و به خاطر فناوری و فرهنگش معروف است.",
    "لندن پایتخت انگلستان است و خانه بیگ بن می‌باشد.",
    "برلین پایتخت آلمان است و به خاطر تاریخ غنی‌اش شناخته می‌شود.",
    "رم پایتخت ایتالیا است و به خاطر کولوسئوم مشهور است.",
]

# ایجاد تعبیه‌سازی برای پایگاه دانش با استفاده از نوع وظیفه RETRIEVAL_DOCUMENT
doc_response = client.embeddings.create(
    model="gemini-embedding-001",
    input=documents,
    extra_body={"task_type": "RETRIEVAL_DOCUMENT", "output_dimensionality": 768},
)

doc_embeddings = np.array([item.embedding for item in doc_response.data])

# نرمال‌سازی تعبیه‌سازی‌‌ها برای محاسبه شباهت بهینه
doc_embeddings = doc_embeddings / np.linalg.norm(doc_embeddings, axis=1, keepdims=True)

def search_knowledge_base(query, top_k=2):
    # ایجاد تعبیه‌سازی پرس‌وجو با استفاده از نوع وظیفه RETRIEVAL_QUERY
    query_response = client.embeddings.create(
        model="gemini-embedding-001",
        input=query,
        extra_body={"task_type": "RETRIEVAL_QUERY", "output_dimensionality": 768},
    )

    query_embedding = np.array(query_response.data[0].embedding)
    query_embedding = query_embedding / np.linalg.norm(query_embedding)

    # محاسبه شباهت‌ها
    similarities = cosine_similarity([query_embedding], doc_embeddings)[0]

    # دریافت top-k اسناد مشابه
    top_indices = np.argsort(similarities)[-top_k:][::-1]

    results = []
    for idx in top_indices:
        results.append({"document": documents[idx], "similarity": similarities[idx]})

    return results

# مثال استفاده
query = "پایتخت فرانسه کجاست؟"
results = search_knowledge_base(query)

print(f"پرس‌وجو: {query}")
for i, result in enumerate(results):
    print(f"{i+1}. {result['document']} (شباهت: {result['similarity']:.4f})")
```

## مدیریت خطا (Error Handling)

API ممکن است کدهای خطای مختلفی را برگرداند:

| کد وضعیت | توضیحات |
| --- | --- |
| 400 | درخواست بد - درخواست شما نامعتبر است. |
| 401 | غیرمجاز - کلید API شما اشتباه است. |
| 403 | ممنوع - شما اجازه دسترسی به این منبع را ندارید. |
| 404 | یافت نشد - منبع مشخص شده یافت نشد. |
| 429 | درخواست‌های بیش از حد - شما از محدودیت نرخ خود فراتر رفته‌اید. |
| 500 | خطای داخلی سرور - مشکلی در سرور ما وجود داشت. |

برای اطلاعات بیشتر در مورد مدیریت خطاها، به راهنمای [مدیریت خطا](https://docs.avalai.ir/fa/guides/error-handling) مراجعه کنید.

## منابع مرتبط

- [مدل‌ها](https://docs.avalai.ir/fa/models/model-details) - درباره مدل‌های تعبیه‌سازی موجود بیاموزید
- [RAG دستی با Embeddings](https://docs.avalai.ir/fa/examples/manual_rag_with_embeddings) - الگوی retrieval اقتباس‌شده از Cookbook با embeddings در AvalAI
- [بهترین شیوه‌های RAG](https://docs.avalai.ir/fa/guides/rag-best-practices) - راهنمای طراحی برای گردش‌کارهای retrieval
- [احراز هویت](https://docs.avalai.ir/fa/api-reference/authentication) - درباره روش‌های احراز هویت بیاموزید
- [محدودیت‌های نرخ](https://docs.avalai.ir/fa/guides/rate-limits) - درباره محدودیت‌های نرخ API بیاموزید