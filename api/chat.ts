const SCOPE_REJECTION =
    "Bu soru portfolyo kapsamının dışında görünüyor. Erden Erim'in projeleri, deneyimi, eğitimi ve teknik yetkinlikleri hakkında yardımcı olabilirim.";
const LOW_INFO_REDIRECT =
    'Mesajını aldım. Daha net yardımcı olmam için şu başlıklardan birini sorabilirsin: projeler, eğitim, deneyim, teknik yetkinlikler veya iletişim.';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const MAX_HISTORY = 12;
const DEFAULT_ALLOWED_ORIGIN = 'https://erimkun.github.io';
const ALLOWED_ORIGINS = new Set([
    'https://erimkun.github.io',
    'https://erdenerim.vercel.app',
    'https://erimodasi.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]);
const IN_SCOPE_IDENTITY_FALLBACK =
    'Erim, elektronik eğitimi altyapısına sahip çok yönlü bir çözüm mühendisi; LLM otomasyonları, yapay zeka sistem tasarımı, veri analizi platformları, Digital Showroom, VR/AR deneyimleri ve Unreal tabanlı oyun geliştirme üzerinde çalışır. Görüntü işleme ve modelleme tarafında CNN, GNN, KNN, ANN yaklaşımlarını kullanır; PLC ve EV gibi alanlara da ilgi duyar.';
const IN_SCOPE_PROFILE_AGE_FALLBACK =
    'Mevcut veride Erim\'in doğum tarihi veya net yaşı yer almıyor. Eğitim ve kariyer detaylarını paylaşabilirim.';
const PROFILE_FACTS = {
    education:
        'Erden Erim Aydoğdu, Yeditepe Üniversitesi Elektrik-Elektronik Mühendisliği (İngilizce, burslu) mezunu (2021-2025). İstanbul Üniversitesi Web Tasarımı ve Kodlama ön lisans derecesi bulunuyor; Atatürk Üniversitesi İşletme lisansına da devam ediyor.',
    currentRole:
        'Şu an Üsküdar Belediyesi KENTAŞ\'ta Elektrik-Elektronik Mühendisi olarak Ar-Ge ve yazılım geliştirme yapıyor.',
    previousExperience:
        'Önceki deneyimler: Kafein Yazılım (DevOps stajı) ve CONSULTA (PLM danışmanlığı).',
    certifications:
        'Öne çıkan sertifikalar: Epic Games Unreal Engine XR Development, Michigan Üniversitesi WebXR, Colorado Üniversitesi C++ for Unreal, Deep Learning with PyTorch, DeepLearning.AI Neural Networks ve Project Management Foundations.',
    skills:
        'Teknik odak: AI/ML, XR, IoT, full-stack web, CesiumJS, Unreal Engine, Three.js, LLM/RAG sistemleri.',
    languages: 'İngilizce C1, Almanca A2, İspanyolca A1.',
    contact:
        'İletişim: erdennilsu1965@gmail.com | linkedin.com/in/erden-erim-aydoğdu | github.com/erimkun | İstanbul, Türkiye.',
};

type Role = 'system' | 'user' | 'assistant';

interface ChatMessage {
    role: Role;
    content: string;
}

interface ChatRequestBody {
    message?: string;
    history?: ChatMessage[];
}

interface PortfolioProject {
    name: string;
    aliases: string[];
    summary: string;
    tech: string;
    milestones: string;
    links: string[];
    keywords: string[];
}

function resolveAllowedOrigin(req: any): string {
    const origin = typeof req?.headers?.origin === 'string' ? req.headers.origin : '';

    if (!origin) return DEFAULT_ALLOWED_ORIGIN;
    if (ALLOWED_ORIGINS.has(origin)) return origin;

    // Allow Vercel preview URLs for testing from temporary frontend deployments.
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return origin;

    return DEFAULT_ALLOWED_ORIGIN;
}

function applyCors(req: any, res: any) {
    const allowedOrigin = resolveAllowedOrigin(req);

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
}

function simplifyText(text: string): string {
    return text
        .toLocaleLowerCase('tr-TR')
        .replaceAll('ı', 'i')
        .replaceAll('ğ', 'g')
        .replaceAll('ü', 'u')
        .replaceAll('ş', 's')
        .replaceAll('ö', 'o')
        .replaceAll('ç', 'c')
        .replace(/[^a-z0-9\s./-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const PORTFOLIO_PROJECTS: PortfolioProject[] = [
    {
        name: 'Talep AI',
        aliases: ['talepai', 'talep ai', 'mahalle bulusmalari', 'local llm dashboard'],
        summary:
            'Mahalle buluşmalarından çıkan notları Local LLM ile sınıflandıran, birimlere yönlendiren ve harita üstünde raporlayan yönetim paneli.',
        tech: 'Local LLM, harita görselleştirme, admin panel, raporlama',
        milestones: '7 Mart 2026 son güncelleme ve sunum hazırlığı.',
        links: ['https://github.com/erimkun/talepai'],
        keywords: ['talep', 'mahalle', 'llm', 'yonlendirme', 'aksiyon'],
    },
    {
        name: 'PanoTour 360',
        aliases: ['panotour', 'panotour 360', 'sanal tur', '360 tur'],
        summary:
            'Web tabanlı 360° panoramik tur platformu. Tarayıcı üzerinden sunulan VR deneyimlerinde bellek (memory) problemlerini çözen özel performans optimizasyonları ve bellek yönetimi (garbage collection) stratejileri içerir.',
        tech: 'Next.js, WebXR, VR, bellek yönetimi, performans optimizasyonu',
        milestones: '21 Kas 2025 ilk yayın; 8 Ocak sunuma hazır; 16 Mart güncel sürüm.',
        links: ['https://panotour.vercel.app/', 'https://github.com/erimkun/panotour'],
        keywords: ['panoramik', 'vr', 'webxr', 'hotspot', 'zip', 'bellek', 'performans', 'optimizasyon'],
    },
    {
        name: 'Immersive AR',
        aliases: ['immersive ar', 'immersivear', 'ar', 'artirilmis gerceklik'],
        summary:
            'Özellikle iPhone üzerinde USDZ formatıyla AR deneyimi sunan mobil odaklı platform. Model kalitesini kaybetmeden boyutları 40 MB altında tutan model sıkıştırma ve AR performans çözümleri içerir.',
        tech: 'WebXR, AR, USDZ, model sıkıştırma (compression), mobil web',
        milestones: '7 Ocak sunuma hazır; 29 Ocak v2; 6 Mart 2026 görsel/ambient revize.',
        links: ['https://immersivear.vercel.app/', 'https://github.com/erimkun/AR'],
        keywords: ['ar', 'kamera', 'panoramik', 'gayrimenkul', 'webxr', 'usdz', 'sikistirma', '40mb', 'mobil'],
    },
    {
        name: 'ThermoZoning AI',
        aliases: ['thermozoningai', 'thermozoning ai', 'isi adasi', 'tubitak'],
        summary:
            'TÜBİTAK başvuru sürecinde kentsel ısı adası etkisini görselleştiren ve metodolojiyi anlatan teknik sunum platformu.',
        tech: 'Web sunum arayüzü, görselleştirme, veri odaklı analiz',
        milestones: '12 Mart 2026 başvuru ve yayın.',
        links: ['https://thermozoningai.vercel.app/'],
        keywords: ['kentsel', 'isi', 'adasi', 'tubitak', 'sunum'],
    },
    {
        name: 'Ganged Reality',
        aliases: ['gangedreality', 'ganged reality', 'digital showroom', '3d editor'],
        summary:
            'Three.js tabanlı web 3D içerik yönetim ve runtime görselleştirme platformu; renk/malzeme varyasyonu ve etkileşimli bilgi noktaları içerir.',
        tech: 'Three.js, React, Vite, web tabanlı 3D runtime/editor',
        milestones: '7 Ocak 2026 ilk yayın; 19 Şubat 2026 stabil sürüm.',
        links: ['https://gangedreality.vercel.app/', 'https://github.com/erimkun/gangedreality'],
        keywords: ['threejs', '3d', 'runtime', 'showroom', 'malzeme'],
    },
    {
        name: 'Kentaş Feedback',
        aliases: ['feedback', 'kentas feedback', 'anket', 'sms'],
        summary:
            'Toplu SMS, anket yönetimi ve istatistik raporlama odaklı kurumsal geri bildirim platformu; yetkili görüntüleme seviyeleri içerir.',
        tech: 'Admin panel, anket yönetimi, istatistik, SMS entegrasyonu',
        milestones: '28 Ocak ilk yayın; 17 Şubat 2026 canlı ve güvenlik iyileştirmeleri.',
        links: ['https://anket.uskudarkentas.com.tr/', 'https://github.com/erimkun/feedback'],
        keywords: ['anket', 'sms', 'istatistik', 'geri bildirim', 'admin'],
    },
    {
        name: 'MuteahhitHub (mPortal)',
        aliases: ['mportal', 'muteahhithub', 'muteahhit hub', 'cesium'],
        summary:
            'İnşaat projelerinin 3D dijital ikiz, drone fotoğrafı ve kat planlarını bir arada yöneten gelişmiş web portalı.',
        tech: 'Cesium.js, 3D model görüntüleme, ölçüm araçları, admin panel',
        milestones: '12 Eylül 2025 production; sürekli iyileştirme.',
        links: ['https://mportal.uskudarkentas.com.tr/'],
        keywords: ['insaat', 'dijital ikiz', 'cesium', 'drone', 'kat plani'],
    },
    {
        name: 'Sizinle Üsküdar V2',
        aliases: ['sizinleuskudar', 'sizinle uskudar', 'ppgis', 'multi tenant'],
        summary:
            'Vatandaş-kurum etkileşimi için çok kiracılı (multi-tenant) katılımcı planlama platformu; moderasyon ve güvenlik odaklıdır.',
        tech: 'PPGIS, multi-tenant mimari, moderasyon paneli, rate limit',
        milestones: 'V2 ile multi-tenant altyapı yayında.',
        links: ['https://github.com/uskudarkentas/sizinleuskudar_v2'],
        keywords: ['ppgis', 'multi tenant', 'vatandas', 'moderasyon', 'rate limit'],
    },
    {
        name: 'MBS & App Factory',
        aliases: ['mbs', 'app factory', 'mbs-arcgisfree', 'app launcher'],
        summary:
            'React+Vite frontend ve Express API ile dinamik CBS uygulamaları üreten modüler platform; LDAP/JWT ve RBAC içerir.',
        tech: 'React, TypeScript, Vite, Node.js, Express, PostgreSQL, LDAP, JWT, RBAC',
        milestones: 'Dinamik uygulama altyapısı ve app editor/logs yapısı yayında.',
        links: ['https://github.com/uskudarkentas/mbs-arcgisfree'],
        keywords: ['cbs', 'maplibre', 'rbac', 'ldap', 'jwt', 'widget'],
    },
    {
        name: 'Şantiye Yönetim V2',
        aliases: ['santiye yonetim', 'santiyeyonetim', 'v2 santiye'],
        summary:
            'Şantiye operasyonlarında maliyet, iştirak ve işçi kontrolü için genişletilmiş yönetim modülleri içeren saha yönetim uygulaması.',
        tech: 'Operasyon paneli, maliyet/iş gücü takibi, raporlama',
        milestones: '24 Şubat 2026 v2 özellikleri tamamlandı.',
        links: ['https://github.com/uskudarkentas/santiyeyonetim'],
        keywords: ['santiye', 'maliyet', 'isci', 'isgucu', 'rapor'],
    },
    {
        name: 'GezelimS',
        aliases: ['gezelims', 'poi', 'rota uygulamasi', 'uskudar harita'],
        summary:
            'Üsküdar POI verileri, rota oluşturma, paylaşım/oylama ve mini oyun özellikleriyle çok dilli şehir keşif uygulaması.',
        tech: 'Harita tabanlı POI, rota yönetimi, çoklu dil, oyunlaştırma',
        milestones: '2025 son çeyrekte veri toplama ve yayın.',
        links: ['https://gezelims.vercel.app/'],
        keywords: ['poi', 'rota', 'uskudar', 'multilingual', 'minigame'],
    },
    {
        name: 'The Game',
        aliases: ['the-game', 'the game', 'unreal game', 'unreal showroom'],
        summary:
            'Unreal Engine tabanlı mimari showroom deneyimi; WASD ve VR modları, interaktif widget/UI öğeleriyle desteklenir.',
        tech: 'Unreal Engine, VR, gerçek zamanlı etkileşim, oyunlaştırılmış showroom',
        milestones: 'Unreal Engine geliştirme süreci aktif.',
        links: ['https://github.com/erimkun/the-game'],
        keywords: ['unreal', 'vr', 'wasd', 'showroom', 'oyun'],
    },
    {
        name: 'AI PDF Analyzer',
        aliases: ['pdf analyzer', 'pdf_analyzer', 'ai pdf analyzer'],
        summary:
            'Belediye dokümanları üzerinde Türkçe odaklı soru-cevap ve karşılaştırma yapan yapay zeka analiz sistemi (şu an askıda).',
        tech: 'Python, belge analizi, OCR, LLM tabanlı soru-cevap',
        milestones: '27 Ağustos 2025 başlangıç; Kasım 2025 sonrası askıda.',
        links: ['https://github.com/erimkun/pdf_analyzer'],
        keywords: ['pdf', 'dokuman', 'ocr', 'soru cevap', 'analiz'],
    },
];

const STATIC_SCOPE_SIGNALS = [
    'erden',
    'erim',
    'aydogdu',
    'aydoğdu',
    'uskudar',
    'üsküdar',
    'kentas',
    'kentaş',
    'kentgis',
    'portfolyo',
    'portfolio',
    'proje',
    'projeleri',
    'cv',
    'ozgecmis',
    'özgeçmiş',
    'kariyer',
    'deneyim',
    'sertifika',
    'iletisim',
    'iletişim',
    'okudu',
    'mezun',
    'yasinda',
    'yaşında',
    'egitim',
    'eğitim',
    'okul',
    'universite',
    'üniversite',
    'yas',
    'yaş',
    'llm',
    'rag',
    'three.js',
    'webxr',
    'unreal',
    'cesium',
    'cbs',
    'ppgis',
    'plc',
    'ev',
    'cnb',
    'gnn',
    'knn',
    'ann',
    'cnn',
    'digital showroom',
];

function buildInScopeSignals(): string[] {
    const set = new Set<string>();

    for (const signal of STATIC_SCOPE_SIGNALS) {
        const normalized = simplifyText(signal);
        if (normalized) set.add(normalized);
    }

    for (const project of PORTFOLIO_PROJECTS) {
        const names = [project.name, ...project.aliases, ...project.keywords];
        for (const n of names) {
            const normalized = simplifyText(n);
            if (normalized) set.add(normalized);
        }
    }

    return Array.from(set);
}

const IN_SCOPE_SIGNALS = buildInScopeSignals();

function normalizeHistory(history: unknown): ChatMessage[] {
    if (!Array.isArray(history)) return [];

    return history
        .filter((item): item is ChatMessage => {
            if (!item || typeof item !== 'object') return false;
            const candidate = item as ChatMessage;
            return (
                (candidate.role === 'user' || candidate.role === 'assistant') &&
                typeof candidate.content === 'string' &&
                candidate.content.trim().length > 0
            );
        })
        .slice(-MAX_HISTORY)
        .map((entry) => ({
            role: entry.role,
            content: entry.content.trim().slice(0, 1400),
        }));
}

function containsAnySignal(text: string, signals: string[]): boolean {
    return signals.some((signal) => signal.length >= 2 && text.includes(signal));
}

function hasEditDistanceAtMostOne(a: string, b: string): boolean {
    if (a === b) return true;
    const lenA = a.length;
    const lenB = b.length;
    if (Math.abs(lenA - lenB) > 1) return false;

    let i = 0;
    let j = 0;
    let mismatch = 0;

    while (i < lenA && j < lenB) {
        if (a[i] === b[j]) {
            i += 1;
            j += 1;
            continue;
        }

        mismatch += 1;
        if (mismatch > 1) return false;

        if (lenA > lenB) {
            i += 1;
        } else if (lenB > lenA) {
            j += 1;
        } else {
            i += 1;
            j += 1;
        }
    }

    if (i < lenA || j < lenB) mismatch += 1;
    return mismatch <= 1;
}

function containsAnySignalFuzzy(text: string, signals: string[]): boolean {
    if (containsAnySignal(text, signals)) return true;

    const tokens = text.split(' ').filter((token) => token.length >= 4);
    const normalizedSignals = signals
        .map((signal) => simplifyText(signal))
        .filter((signal) => signal.length >= 4 && !signal.includes(' '));

    for (const token of tokens) {
        for (const signal of normalizedSignals) {
            if (hasEditDistanceAtMostOne(token, signal)) {
                return true;
            }
        }
    }

    return false;
}

function hasIdentityIntent(message: string): boolean {
    const normalized = simplifyText(message);
    const identitySignals = [
        'kimdir',
        'kimsin',
        'kim',
        'hakkinda',
        'ozgecmis',
        'cv',
        'biyografi',
        'kariyer',
        'egitim',
        'okul',
        'universite',
        'mezun',
        'yas',
        'dogum',
        'nerede okudu',
        'hangi okul',
    ];
    return containsAnySignalFuzzy(normalized, identitySignals);
}

function hasProfileIntent(message: string): boolean {
    const normalized = simplifyText(message);
    const profileSignals = [
        'kim',
        'hakkinda',
        'ozgecmis',
        'cv',
        'biyografi',
        'kariyer',
        'egitim',
        'okul',
        'universite',
        'mezun',
        'yas',
        'dogum',
        'deneyim',
        'staj',
        'sertifika',
        'dil',
        'iletisim',
    ];
    return containsAnySignalFuzzy(normalized, profileSignals);
}

function hasProjectIntent(message: string): boolean {
    const normalized = simplifyText(message);
    const projectSignals = [
        'proje',
        'repo',
        'github',
        'stack',
        'teknoloji',
        'mimari',
        'demo',
        'link',
        'talep ai',
        'panotour',
        'immersive ar',
        'ganged reality',
        'thermozoning',
    ];
    return containsAnySignalFuzzy(normalized, projectSignals);
}

type ChatIntent = 'profile' | 'projects' | 'mixed';

type QuestionArchetype =
    | 'profile_basic'
    | 'education'
    | 'experience'
    | 'skills'
    | 'contact'
    | 'age'
    | 'project_overview'
    | 'project_compare'
    | 'project_recommendation'
    | 'project_timeline';

function detectIntent(message: string): ChatIntent {
    const profileIntent = hasProfileIntent(message);
    const projectIntent = hasProjectIntent(message);

    if (profileIntent && projectIntent) return 'mixed';
    if (profileIntent) return 'profile';
    return 'projects';
}

function detectQuestionArchetype(message: string, intent: ChatIntent): QuestionArchetype {
    const normalized = simplifyText(message);

    if (containsAnySignalFuzzy(normalized, ['kac yas', 'yasinda', 'dogum'])) return 'age';
    if (containsAnySignalFuzzy(normalized, ['nerede okudu', 'hangi okul', 'egitim', 'mezun', 'universite'])) return 'education';
    if (containsAnySignalFuzzy(normalized, ['deneyim', 'staj', 'is gecmisi', 'nerede calisiyor', 'ne is yapiyor', 'calisiyor'])) {
        return 'experience';
    }
    if (containsAnySignalFuzzy(normalized, ['sertifika', 'teknik beceri', 'skill set', 'hangi teknolojiler', 'uzmanlik'])) {
        return 'skills';
    }
    if (containsAnySignalFuzzy(normalized, ['iletisim', 'mail', 'e posta', 'eposta', 'linkedin', 'github', 'ulas'])) {
        return 'contact';
    }
    if (containsAnySignalFuzzy(normalized, ['karsilastir', 'karsilastirma', 'farki', 'hangisi daha'])) return 'project_compare';
    if (containsAnySignalFuzzy(normalized, ['hangi proje', 'oner', 'oneri', 'uygun proje', 'nereden baslayayim'])) {
        return 'project_recommendation';
    }
    if (containsAnySignalFuzzy(normalized, ['ne zaman', 'tarih', 'timeline', 'zaman cizelgesi', 'kilometre'])) {
        return 'project_timeline';
    }

    if (intent === 'profile') return 'profile_basic';
    return 'project_overview';
}

function buildArchetypeGuidance(archetype: QuestionArchetype): string {
    switch (archetype) {
        case 'age':
            return 'Soru yaş/doğum tarihi odaklı. Kaynakta veri yoksa açıkça belirt ve uydurma yapma.';
        case 'education':
            return 'Soru eğitim geçmişi odaklı. Okul, bölüm, dönem ve devam eden eğitimi net sırayla ver.';
        case 'experience':
            return 'Soru deneyim odaklı. Mevcut rol ve önceki deneyimleri kısa maddelerle özetle.';
        case 'skills':
            return 'Soru yetkinlik odaklı. Teknik alanları gruplandırarak (AI/XR/IoT/Web) anlat.';
        case 'contact':
            return 'Soru iletişim odaklı. E-posta, LinkedIn, GitHub ve lokasyonu net formatta ver.';
        case 'project_compare':
            return 'Soru karşılaştırma odaklı. En az iki projeyi amaç, teknoloji ve çıktı açısından kıyasla.';
        case 'project_recommendation':
            return 'Soru öneri odaklı. Kullanıcı hedefine göre 2-3 proje öner ve nedenlerini belirt.';
        case 'project_timeline':
            return 'Soru zaman/teslim odaklı. Projeleri kilometre taşlarına göre kronolojik sırala.';
        case 'profile_basic':
            return 'Soru genel profil odaklı. Kim olduğu, odak alanları ve mevcut rolü kısa özetle ver.';
        default:
            return 'Soru genel proje odaklı. İlgili projeleri teknik netlikle özetle.';
    }
}

function buildDirectProfileAnswer(message: string): string | null {
    const normalized = simplifyText(message);

    if (containsAnySignalFuzzy(normalized, ['kac yas', 'yasinda', 'dogum'])) {
        return IN_SCOPE_PROFILE_AGE_FALLBACK;
    }

    if (containsAnySignalFuzzy(normalized, ['nerede okudu', 'hangi okul', 'egitim', 'mezun', 'universite'])) {
        return PROFILE_FACTS.education;
    }

    if (containsAnySignalFuzzy(normalized, ['nerede calisiyor', 'ne is yapiyor', 'calisiyor', 'gorevi', 'kentas'])) {
        return `${PROFILE_FACTS.currentRole}\n${PROFILE_FACTS.previousExperience}`;
    }

    if (containsAnySignalFuzzy(normalized, ['deneyim', 'staj', 'is gecmisi', 'onceki'])) {
        return `${PROFILE_FACTS.currentRole}\n${PROFILE_FACTS.previousExperience}`;
    }

    if (containsAnySignalFuzzy(normalized, ['sertifika', 'belge'])) {
        return PROFILE_FACTS.certifications;
    }

    if (containsAnySignalFuzzy(normalized, ['hangi dilleri', 'dil biliyor', 'ingilizce', 'almanca', 'ispanyolca'])) {
        return PROFILE_FACTS.languages;
    }

    if (containsAnySignalFuzzy(normalized, ['iletisim', 'mail', 'email', 'linkedin', 'github', 'ulas'])) {
        return PROFILE_FACTS.contact;
    }

    if (containsAnySignalFuzzy(normalized, ['kim', 'kimdir', 'hakkinda', 'ozgecmis', 'cv', 'biyografi'])) {
        return [PROFILE_FACTS.education, PROFILE_FACTS.currentRole, PROFILE_FACTS.skills].join('\n');
    }

    return null;
}

function isClearlyOutOfScope(message: string, history: ChatMessage[]): boolean {
    const messageContext = simplifyText(message);
    const historyContext = simplifyText(
        history
            .filter((h) => h.role === 'user')
            .slice(-4)
            .map((h) => h.content)
            .join(' '),
    );

    if (hasIdentityIntent(message)) return false;
    if (containsAnySignal(messageContext, IN_SCOPE_SIGNALS)) return false;
    if (containsAnySignal(messageContext, ['proje', 'teknoloji', 'stack', 'link', 'repo']) &&
        containsAnySignal(historyContext, IN_SCOPE_SIGNALS)) {
        return false;
    }

    return true;
}

function findRelevantProjects(message: string, history: ChatMessage[]): PortfolioProject[] {
    const combinedQuery = simplifyText(
        [
            message,
            ...history
                .filter((h) => h.role === 'user')
                .slice(-3)
                .map((h) => h.content),
        ].join(' '),
    );

    const scored = PORTFOLIO_PROJECTS.map((project) => {
        let score = 0;

        for (const alias of [project.name, ...project.aliases]) {
            const normalizedAlias = simplifyText(alias);
            if (normalizedAlias && combinedQuery.includes(normalizedAlias)) {
                score += 6;
            }
        }

        for (const keyword of project.keywords) {
            const normalizedKeyword = simplifyText(keyword);
            if (normalizedKeyword && combinedQuery.includes(normalizedKeyword)) {
                score += 3;
            }
        }

        const stackTokens = simplifyText(project.tech)
            .split(' ')
            .filter((token) => token.length > 4);
        for (const token of stackTokens) {
            if (combinedQuery.includes(token)) {
                score += 1;
            }
        }

        return { project, score };
    })
        .sort((a, b) => b.score - a.score)
        .filter((item) => item.score > 0)
        .map((item) => item.project);

    if (scored.length > 0) {
        return scored.slice(0, 6);
    }

    return PORTFOLIO_PROJECTS.slice(0, 6);
}

function buildProjectContext(projects: PortfolioProject[]): string {
    return projects
        .map(
            (project, index) =>
                `${index + 1}. ${project.name}\n` +
                `- Özet: ${project.summary}\n` +
                `- Teknolojiler: ${project.tech}\n` +
                `- Kilometre Taşları: ${project.milestones}\n` +
                `- Linkler: ${project.links.join(' | ')}`,
        )
        .join('\n');
}

function buildProfileContext(): string {
    return [
        'Profil bilgi tabanı:',
        `- ${PROFILE_FACTS.education}`,
        `- ${PROFILE_FACTS.currentRole}`,
        `- ${PROFILE_FACTS.previousExperience}`,
        `- ${PROFILE_FACTS.skills}`,
        `- ${PROFILE_FACTS.languages}`,
        `- ${PROFILE_FACTS.certifications}`,
        `- ${PROFILE_FACTS.contact}`,
        '- Doğum tarihi/yaş bilgisi kaynakta yer almıyor; kullanıcı yaş sorarsa bu detayı bilmediğini açıkça belirt.',
    ].join('\n');
}

function buildSystemInstruction(relevantProjects: PortfolioProject[]) {
    return [
        "Sen ERIM-AI'sın, Erden Erim Aydoğdu'nun kişisel yapay zeka asistanı ve portfolyo temsilcisisin.",
        "Amacın, kullanıcıların her türlü sorusunu (teknik, genel sohbet, yazılım, tavsiye) en iyi şekilde cevaplarken, doğal ve akıcı bir diyalog kurmaktır.",
        "ÖNEMLİ: Soruları reddetme ('Bu konu kapsam dışı' vb. DEME). Kullanıcı genel veya farklı bir konudan bahsetse bile cevap ver, fakat konuyu zekice ve doğal bir şekilde Erden Erim'in yetkinliklerine, vizyonuna veya projelerine bağlamaya çalış.",
        "Sohbet Kuralları:",
        "- Kullanıcıyla doğal, zeki ve samimi bir dille konuş.",
        "- Erden'in uzmanlık alanları (AI/ML, Local LLM, WebXR, Unreal Engine, Three.js, React, CesiumJS vs.) ile ilgili fırsatları değerlendirip projelerinden örnekler ver.",
        "- Erden'in projelerini överken veya anlatırken abartıya kaçmadan, teknik detaylarıyla (hangi aracı neden kullandığıyla) bahset.",
        "- Erden adına yanlış veya uydurma bir bilgi verme. Profilinde yazmayan özelliklerini uydurma.",
        buildProfileContext(),
        "Bağlam ile ilgili bazı Projeler:",
        buildProjectContext(relevantProjects),
    ].join('\\n');
}

export default async function handler(req: any, res: any) {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: 'Server misconfigured: GROQ_API_KEY missing.' });
    }

    const body = (req.body ?? {}) as ChatRequestBody;
    const message = (body.message || '').trim();

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    const history = normalizeHistory(body.history);
    const relevantProjects = findRelevantProjects(message, history);

    const messages: ChatMessage[] = [
        { role: 'system', content: buildSystemInstruction(relevantProjects) },
        ...history,
        { role: 'user', content: message.slice(0, 1600) },
    ];

    try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                temperature: 0.6, // Biraz daha yaratici ve dogal olmasi icin hafif artirildi
                max_tokens: 800,
                messages,
            }),
        });

        if (!groqResponse.ok) {
            const errText = await groqResponse.text();
            return res.status(groqResponse.status).json({ error: `Groq API error: ${errText}` });
        }

        const data = await groqResponse.json();
        const modelReply = data?.choices?.[0]?.message?.content?.trim();

        if (!modelReply) {
            return res.status(200).json({ message: "Şu an kısa bir kesinti yaşıyorum, lütfen tekrar sorar mısın?" });
        }

        return res.status(200).json({
            message: modelReply,
            usage: data?.usage ?? null,
        });
    } catch (error) {
        const messageText = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: `Upstream request failed: ${messageText}` });
    }
}
