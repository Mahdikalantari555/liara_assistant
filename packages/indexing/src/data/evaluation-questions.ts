/**
 * Evaluation dataset (T071, FR-045/FR-048) — 70 real Liara documentation
 * questions spanning every service category in `docs/public/llms`.
 *
 * Two jobs:
 *  1. `npm run eval` measures retrieval accuracy / miss rate before delivery.
 *  2. The chat UI shows 3-5 random entries as starter chips (FR-048).
 *
 * `expectedAnswerTraits` are keywords/URL fragments a correct answer or its
 * citations should contain — the eval scorer looks for them in the retrieved
 * chunks, so adding a question needs no code change.
 */
import type { EvaluationQuestion } from '../types/index';

export const EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  // ---------------------------------------------------------------- PaaS core
  {
    questionId: 'q001',
    text: 'چطور پروژم رو روی زیرساخت لیارا دیپلوی کنم؟',
    expectedAnswerTraits: ['liara deploy', 'liara.json', 'paas'],
    suggestedFollowUps: ['چطور متغیرهای محیطی را تنظیم کنم؟', 'چطور دامنه سفارشی وصل کنم؟'],
    category: 'paas',
  },
  {
    questionId: 'q002',
    text: 'چطوری با داکر پروژم رو بیارم بالا؟',
    expectedAnswerTraits: ['Dockerfile', 'docker', 'platform'],
    category: 'paas/docker',
  },
  {
    questionId: 'q003',
    text: 'برای آپلود کدهای پایتونم باید چیکار کنم؟',
    expectedAnswerTraits: ['python', 'requirements.txt', 'liara deploy'],
    category: 'paas/python',
  },
  {
    questionId: 'q004',
    text: 'لیارا از کدام فریم‌ورک‌های Node.js پشتیبانی می‌کند؟',
    expectedAnswerTraits: ['nodejs', 'express', 'nextjs'],
    category: 'paas/nodejs',
  },
  {
    questionId: 'q005',
    text: 'لیارا برای پروژه‌های Django مناسب است؟',
    expectedAnswerTraits: ['django', 'wsgi', 'liara.json'],
    category: 'paas/django',
  },
  {
    questionId: 'q006',
    text: 'چطور یک اپلیکیشن Laravel را روی لیارا مستقر کنم؟',
    expectedAnswerTraits: ['laravel', 'php', 'artisan'],
    category: 'paas/laravel',
  },
  {
    questionId: 'q007',
    text: 'برای دیپلوی Next.js روی لیارا چه تنظیماتی لازم است؟',
    expectedAnswerTraits: ['nextjs', 'build', 'liara.json'],
    category: 'paas/nextjs',
  },
  {
    questionId: 'q008',
    text: 'چطور یک سایت استاتیک را روی لیارا میزبانی کنم؟',
    expectedAnswerTraits: ['static', 'html', 'platform'],
    category: 'paas/static',
  },
  {
    questionId: 'q009',
    text: 'فایل liara.json چه کاربردی دارد و چه فیلدهایی می‌گیرد؟',
    expectedAnswerTraits: ['liara.json', 'platform', 'port'],
    category: 'paas/liarajson',
  },
  {
    questionId: 'q010',
    text: 'چطور از متغیرهای محیطی در لیارا استفاده کنم؟',
    expectedAnswerTraits: ['متغیر', 'environment', 'env'],
    category: 'paas/details',
  },
  {
    questionId: 'q011',
    text: 'چطور می‌توانم لاگ‌های برنامه‌ام را مشاهده کنم؟',
    expectedAnswerTraits: ['liara logs', 'لاگ'],
    category: 'paas/details',
  },
  {
    questionId: 'q012',
    text: 'چطور برنامه‌ام را روی لیارا اسکیل کنم؟',
    expectedAnswerTraits: ['scale', 'منابع', 'پلن'],
    category: 'paas/details',
  },
  {
    questionId: 'q013',
    text: 'چطور یک دیسک برای ذخیره‌سازی دائمی به برنامه اضافه کنم؟',
    expectedAnswerTraits: ['disk', 'دیسک', 'liara.json'],
    category: 'paas/disks',
  },
  {
    questionId: 'q014',
    text: 'چطور می‌توانم دامنه سفارشی به پروژه خودم وصل کنم؟',
    expectedAnswerTraits: ['domain', 'دامنه', 'DNS'],
    category: 'paas/domains',
  },
  {
    questionId: 'q015',
    text: 'آیا لیارا از SSL/HTTPS رایگان پشتیبانی می‌کند؟',
    expectedAnswerTraits: ['SSL', 'HTTPS', 'گواهی'],
    category: 'paas/domains',
  },
  {
    questionId: 'q016',
    text: 'آیا می‌توانم از GitHub Actions برای استقرار خودکار استفاده کنم؟',
    expectedAnswerTraits: ['GitHub Actions', 'cicd', 'LIARA_API_TOKEN'],
    category: 'paas/cicd',
  },
  {
    questionId: 'q017',
    text: 'چطور GitLab CI را برای دیپلوی خودکار روی لیارا تنظیم کنم؟',
    expectedAnswerTraits: ['gitlab', 'cicd', 'liara deploy'],
    category: 'paas/cicd',
  },
  {
    questionId: 'q018',
    text: 'چطور برنامه‌ام را از یک اکانت به اکانت دیگر منتقل کنم؟',
    expectedAnswerTraits: ['انتقال', 'move'],
    category: 'paas/move',
  },
  {
    questionId: 'q019',
    text: 'اگر Deploy خطا داد چه کار کنم؟',
    expectedAnswerTraits: ['خطا', 'لاگ', 'build'],
    category: 'paas/details',
  },
  {
    questionId: 'q020',
    text: 'چطور دستور اجرای برنامه (start command) را تغییر دهم؟',
    expectedAnswerTraits: ['start', 'liara.json', 'دستور'],
    category: 'paas/details',
  },
  {
    questionId: 'q021',
    text: 'پورت برنامه من چند باید باشد تا لیارا آن را ببیند؟',
    expectedAnswerTraits: ['port', 'پورت', 'liara.json'],
    category: 'paas/details',
  },
  {
    questionId: 'q022',
    text: 'چطور کرون‌جاب یا زمان‌بندی وظایف را روی لیارا راه‌اندازی کنم؟',
    expectedAnswerTraits: ['cron', 'زمان‌بندی'],
    category: 'paas/details',
  },
  {
    questionId: 'q023',
    text: 'چطور برنامه Go را روی لیارا دیپلوی کنم؟',
    expectedAnswerTraits: ['go', 'build', 'platform'],
    category: 'paas/go',
  },
  {
    questionId: 'q024',
    text: 'برای دیپلوی اپلیکیشن Flask چه فایل‌هایی نیاز است؟',
    expectedAnswerTraits: ['flask', 'requirements.txt', 'wsgi'],
    category: 'paas/flask',
  },
  {
    questionId: 'q025',
    text: 'چطور پروژه React خود را روی لیارا بالا بیاورم؟',
    expectedAnswerTraits: ['react', 'build', 'static'],
    category: 'paas/react',
  },
  {
    questionId: 'q026',
    text: 'برای اپلیکیشن NET. لیارا چه پشتیبانی‌ای دارد؟',
    expectedAnswerTraits: ['dotnet', 'platform'],
    category: 'paas/dotnet',
  },

  // --------------------------------------------------------------------- DBaaS
  {
    questionId: 'q027',
    text: 'چگونه می‌توانم دیتابیس PostgreSQL روی لیارا ایجاد کنم؟',
    expectedAnswerTraits: ['postgresql', 'دیتابیس', 'اتصال'],
    suggestedFollowUps: ['چطور از دیتابیس بکاپ بگیرم؟'],
    category: 'dbaas/postgresql',
  },
  {
    questionId: 'q028',
    text: 'چطور به دیتابیس MySQL لیارا از برنامه‌ام وصل شوم؟',
    expectedAnswerTraits: ['mysql', 'host', 'port'],
    category: 'dbaas/mysql',
  },
  {
    questionId: 'q029',
    text: 'چطور MongoDB روی لیارا راه‌اندازی و به آن متصل شوم؟',
    expectedAnswerTraits: ['mongodb', 'connection string'],
    category: 'dbaas/mongodb',
  },
  {
    questionId: 'q030',
    text: 'Redis لیارا برای کش کردن چطور استفاده می‌شود؟',
    expectedAnswerTraits: ['redis', 'کش'],
    category: 'dbaas/redis',
  },
  {
    questionId: 'q031',
    text: 'چطور از دیتابیس خود بکاپ بگیرم و آن را بازیابی کنم؟',
    expectedAnswerTraits: ['بکاپ', 'restore', 'backup'],
    category: 'dbaas/details',
  },
  {
    questionId: 'q032',
    text: 'چطور دیتابیس MariaDB بسازم؟',
    expectedAnswerTraits: ['mariadb', 'دیتابیس'],
    category: 'dbaas/mariadb',
  },
  {
    questionId: 'q033',
    text: 'لیارا از Elasticsearch پشتیبانی می‌کند؟ چطور راه‌اندازی می‌شود؟',
    expectedAnswerTraits: ['elastic', 'search'],
    category: 'dbaas/elastic-search',
  },
  {
    questionId: 'q034',
    text: 'RabbitMQ روی لیارا چطور ساخته و استفاده می‌شود؟',
    expectedAnswerTraits: ['rabbitmq', 'queue'],
    category: 'dbaas/rabbitmq',
  },
  {
    questionId: 'q035',
    text: 'چطور SQL Server یا MSSQL روی لیارا ایجاد کنم؟',
    expectedAnswerTraits: ['mssql', 'sql server'],
    category: 'dbaas/mssql',
  },
  {
    questionId: 'q036',
    text: 'چطور دیتابیس خود را به یک پلن بزرگ‌تر ارتقا دهم؟',
    expectedAnswerTraits: ['پلن', 'ارتقا', 'منابع'],
    category: 'dbaas/details',
  },
  {
    questionId: 'q037',
    text: 'چطور از بیرون لیارا (مثلاً DBeaver) به دیتابیسم وصل شوم؟',
    expectedAnswerTraits: ['اتصال', 'host', 'public'],
    category: 'dbaas/details',
  },
  {
    questionId: 'q038',
    text: 'آیا می‌توانم دیتابیس موجود خودم را به لیارا منتقل کنم؟',
    expectedAnswerTraits: ['انتقال', 'move', 'dump'],
    category: 'dbaas/move',
  },

  // ------------------------------------------------------------- Object Storage
  {
    questionId: 'q039',
    text: 'چطور از فضای ذخیره‌سازی ابری (Object Storage) لیارا استفاده کنم؟',
    expectedAnswerTraits: ['object storage', 'bucket', 'باکت'],
    category: 'object-storage',
  },
  {
    questionId: 'q040',
    text: 'چطور با S3 SDK به باکت لیارا وصل شوم؟',
    expectedAnswerTraits: ['s3', 'endpoint', 'access key'],
    category: 'object-storage/details',
  },
  {
    questionId: 'q041',
    text: 'چطور فایل‌های آپلود شده را به صورت عمومی قابل دسترسی کنم؟',
    expectedAnswerTraits: ['public', 'دسترسی', 'bucket'],
    category: 'object-storage/details',
  },
  {
    questionId: 'q042',
    text: 'هزینه فضای ذخیره‌سازی ابری لیارا چطور محاسبه می‌شود؟',
    expectedAnswerTraits: ['هزینه', 'حجم', 'ترافیک'],
    category: 'object-storage',
  },

  // ------------------------------------------------------------------------ AI
  {
    questionId: 'q043',
    text: 'سرویس هوش مصنوعی لیارا چیست و چه مدل‌هایی دارد؟',
    expectedAnswerTraits: ['AI', 'مدل', 'API'],
    category: 'ai',
  },
  {
    questionId: 'q044',
    text: 'چطور به API هوش مصنوعی لیارا وصل شوم؟',
    expectedAnswerTraits: ['baseUrl', 'ai.liara.ir', 'API'],
    category: 'ai/quick-start',
  },
  {
    questionId: 'q045',
    text: 'چطور با AI SDK لیارا متن تولید کنم؟',
    expectedAnswerTraits: ['generateText', 'ai-sdk', 'model'],
    category: 'ai/ai-sdk-core',
  },
  {
    questionId: 'q046',
    text: 'برای ساخت embedding با سرویس AI لیارا چه کدی بنویسم؟',
    expectedAnswerTraits: ['embed', 'embedding', 'text-embedding'],
    category: 'ai/ai-sdk-core/embeddings',
  },
  {
    questionId: 'q047',
    text: 'چطور یک چت‌بات RAG با سرویس AI لیارا بسازم؟',
    expectedAnswerTraits: ['rag', 'embedding', 'chatbot'],
    category: 'ai/cookbook',
  },
  {
    questionId: 'q048',
    text: 'آیا سرویس AI لیارا از مدل‌های Claude پشتیبانی می‌کند؟',
    expectedAnswerTraits: ['anthropic', 'claude'],
    category: 'ai/anthropic-claude',
  },
  {
    questionId: 'q049',
    text: 'هزینه استفاده از سرویس هوش مصنوعی لیارا چطور حساب می‌شود؟',
    expectedAnswerTraits: ['هزینه', 'توکن'],
    category: 'ai/faq',
  },
  {
    questionId: 'q050',
    text: 'چطور پاسخ استریم (streaming) از مدل AI بگیرم؟',
    expectedAnswerTraits: ['stream', 'streamText'],
    category: 'ai/ai-sdk-core',
  },

  // ---------------------------------------------------------------------- IaaS
  {
    questionId: 'q051',
    text: 'سرویس ابری IaaS لیارا چه امکاناتی دارد؟',
    expectedAnswerTraits: ['iaas', 'سرور', 'ماشین'],
    category: 'iaas',
  },
  {
    questionId: 'q052',
    text: 'چطور یک سرور ابری در لیارا بسازم و به آن SSH بزنم؟',
    expectedAnswerTraits: ['ssh', 'سرور', 'کلید'],
    category: 'iaas/details',
  },
  {
    questionId: 'q053',
    text: 'چطور به سرور ابری خود IP ثابت اضافه کنم؟',
    expectedAnswerTraits: ['IP', 'شبکه'],
    category: 'iaas/details',
  },
  {
    questionId: 'q054',
    text: 'اسنپ‌شات سرور ابری چطور گرفته می‌شود؟',
    expectedAnswerTraits: ['snapshot', 'بکاپ'],
    category: 'iaas/details',
  },

  // ----------------------------------------------------------- Email + DNS + OCA
  {
    questionId: 'q055',
    text: 'چطور سرویس ایمیل لیارا را راه‌اندازی کنم؟',
    expectedAnswerTraits: ['email', 'ایمیل', 'SMTP'],
    category: 'email-server',
  },
  {
    questionId: 'q056',
    text: 'برای ارسال ایمیل از برنامه‌ام با SMTP لیارا چه تنظیماتی لازم است؟',
    expectedAnswerTraits: ['SMTP', 'port', 'ارسال'],
    category: 'email-server/details',
  },
  {
    questionId: 'q057',
    text: 'رکورد SPF و DKIM را برای دامنه ایمیل چطور تنظیم کنم؟',
    expectedAnswerTraits: ['SPF', 'DKIM', 'DNS'],
    category: 'email-server/details',
  },
  {
    questionId: 'q058',
    text: 'چطور DNS دامنه‌ام را به لیارا بسپارم؟',
    expectedAnswerTraits: ['DNS', 'nameserver', 'رکورد'],
    category: 'dns-management-system',
  },
  {
    questionId: 'q059',
    text: 'رکورد CNAME را در سیستم DNS لیارا چطور اضافه کنم؟',
    expectedAnswerTraits: ['CNAME', 'رکورد', 'DNS'],
    category: 'dns-management-system',
  },
  {
    questionId: 'q060',
    text: 'وردپرس را چطور با یک کلیک روی لیارا نصب کنم؟',
    expectedAnswerTraits: ['wordpress', 'one-click', 'نصب'],
    category: 'one-click-apps',
  },
  {
    questionId: 'q061',
    text: 'آیا می‌توانم n8n را روی لیارا اجرا کنم؟',
    expectedAnswerTraits: ['n8n', 'one-click'],
    category: 'one-click-apps',
  },
  {
    questionId: 'q062',
    text: 'آیا می‌توانم از لیارا برای هاست ربات تلگرام هم استفاده کنم؟',
    expectedAnswerTraits: ['ربات', 'telegram', 'webhook'],
    category: 'paas',
  },

  // ------------------------------------------------------- CLI / billing / misc
  {
    questionId: 'q063',
    text: 'چطور CLI لیارا را نصب کنم و لاگین کنم؟',
    expectedAnswerTraits: ['npm install', 'liara login', 'CLI'],
    category: 'references/cli',
  },
  {
    questionId: 'q064',
    text: 'دستورات مهم CLI لیارا کدام‌ها هستند؟',
    expectedAnswerTraits: ['liara deploy', 'liara logs', 'CLI'],
    category: 'references/cli',
  },
  {
    questionId: 'q065',
    text: 'هزینه استفاده از لیارا برای ۱ ماه چقدره؟',
    expectedAnswerTraits: ['هزینه', 'پلن', 'تعرفه'],
    category: 'references',
  },
  {
    questionId: 'q066',
    text: 'محدودیت منابع پلان رایگان لیارا چیست؟',
    expectedAnswerTraits: ['پلن', 'رایگان', 'محدودیت'],
    category: 'references',
  },
  {
    questionId: 'q067',
    text: 'از میرورهای لیارا برای npm و docker چطور استفاده کنم؟',
    expectedAnswerTraits: ['mirror', 'npm', 'docker'],
    category: 'mirrors',
  },
  {
    questionId: 'q068',
    text: 'میرور pip لیارا چه آدرسی دارد؟',
    expectedAnswerTraits: ['pip', 'mirror', 'index-url'],
    category: 'mirrors',
  },
  {
    questionId: 'q069',
    text: 'چطور توکن API لیارا را بسازم و امن نگه دارم؟',
    expectedAnswerTraits: ['API token', 'توکن'],
    category: 'references',
  },
  {
    questionId: 'q070',
    text: 'برای پروژه‌ام به هر دو دیتابیس و فضای ذخیره‌سازی نیاز دارم، از کجا شروع کنم؟',
    expectedAnswerTraits: ['دیتابیس', 'storage', 'اتصال'],
    category: 'overview',
  },
];

/** N distinct random questions (chat starter chips, FR-048). */
export function randomQuestions(n = 4, pool: EvaluationQuestion[] = EVALUATION_QUESTIONS): EvaluationQuestion[] {
  const count = Math.max(1, Math.min(n, pool.length));
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, count);
}
