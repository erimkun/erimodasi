import { DialogueTree } from '../types/dialogue';

/**
 * 24 düğümlü konuşma ağacı — communication-tree.md'den birebir.
 * Tüm bilgiler CV'den alınmıştır. Karakter 3. şahıs anlatır, kendini Erim olarak tanıtmaz.
 */
export const DIALOGUE_TREE: DialogueTree = {
    // ═══════════════════════════════════════════
    // ROOT — Karşılama
    // ═══════════════════════════════════════════
    greeting: {
        id: 'greeting',
        message: "Eee, hoş geldin! Erim'in odasına buyur. Etrafta dokunabileceğin bir sürü şey var ama önce ben sana kısa bir yol göstereyim mi?",
        options: [
            { label: 'Kim bu Erim? 🤔', nextNodeId: 'intro_who' },
            { label: 'Buraları anlatsana 🏠', nextNodeId: 'tour_start' },
            { label: 'Gerek yok, göster projeleri! 🚀', nextNodeId: 'projects_overview' },
        ],
    },

    greeting_return: {
        id: 'greeting_return',
        message: "Tekrar mı geldin? Güzel, daha anlatacak çok şey var. Ne merak ediyorsun?",
        options: [
            { label: "Biraz daha anlat Erim'i 🗣️", nextNodeId: 'intro_who' },
            { label: 'Projelere bir bakayım 📦', nextNodeId: 'projects_overview' },
            { label: 'İletişim bilgileri lazım 📬', nextNodeId: 'contact_transition' },
        ],
    },

    // ═══════════════════════════════════════════
    // HAKKINDA DALI
    // ═══════════════════════════════════════════
    intro_who: {
        id: 'intro_who',
        message: "Erim, Yeditepe Üniversitesi Elektrik-Elektronik Mühendisliği çıkışlı bir çözüm mimarı. Ama sadece donanım değil — yapay zeka, XR, IoT ve full-stack web'i bir arada kullanıyor. Kısacası, donanımdan buluta uçtan uca sistem kuran biri.",
        options: [
            { label: 'Eğitim geçmişi nasıl? 🎓', nextNodeId: 'about_education' },
            { label: 'Şu an ne yapıyor? 💼', nextNodeId: 'about_experience' },
            { label: '← Geri dön', nextNodeId: 'greeting' },
        ],
    },

    about_education: {
        id: 'about_education',
        message: "Yeditepe Üniversitesi'nde İngilizce burslu Elektrik-Elektronik Mühendisliği okudu (2021-2025). Aynı zamanda İstanbul Üniversitesi'nden Web Tasarımı ve Kodlama ön lisans derecesi var. Şu an da Atatürk Üniversitesi'nde İşletme lisansına devam ediyor. Üç farklı disiplini birleştiren nadir insanlardan.",
        options: [
            { label: 'Sertifikaları var mı? 📜', nextNodeId: 'about_certificates' },
            { label: 'İş deneyimi? 💼', nextNodeId: 'about_experience' },
            { label: '← Geri dön', nextNodeId: 'intro_who' },
        ],
    },

    about_experience: {
        id: 'about_experience',
        message: "Erim şu an Üsküdar Belediyesi KENTAŞ'ta Elektrik-Elektronik Mühendisi olarak Ar-Ge ve yazılım geliştirme yapıyor. CesiumJS ile Dijital İkiz platformu, Unreal Engine ile XR showroom ekosistemi, PostGIS ile karar destek sistemi gibi ciddi projeler yürütüyor. Daha önce Kafein Yazılım'da DevOps stajı ve CONSULTA'da PLM danışmanlığı yaptı.",
        options: [
            { label: 'Teknik becerileri neler? 💻', nextNodeId: 'about_tech_transition' },
            { label: 'Projeleri görmek istiyorum 📦', nextNodeId: 'projects_overview' },
            { label: '← Geri dön', nextNodeId: 'intro_who' },
        ],
    },

    about_certificates: {
        id: 'about_certificates',
        message: "XR tarafında Epic Games'ten Unreal Engine XR Development, Michigan Üniversitesi'nden WebXR, Colorado Üniversitesi'nden C++ for Unreal sertifikaları var. AI tarafında ise Deep Learning with PyTorch ve DeepLearning.AI Neural Networks sertifikaları. Bir de Project Management Foundations var — sadece kod yazmıyor, yönetiyor da.",
        options: [
            { label: 'Başka dil biliyor mu? 🌍', nextNodeId: 'about_languages' },
            { label: '← Geri dön', nextNodeId: 'about_education' },
        ],
    },

    about_languages: {
        id: 'about_languages',
        message: "İngilizce C1 seviye — akademik ve teknik literatürde çok rahat. Almanca A2, İspanyolca da A1 seviyesinde. Her şeye merak duyan biri, dillere de...",
        options: [
            { label: 'İletişime geçmek istiyorum 📬', nextNodeId: 'contact_transition' },
            { label: '← Ana menüye dön', nextNodeId: 'greeting' },
        ],
    },

    about_tech_transition: {
        id: 'about_tech_transition',
        message: "Erim'in teknik yetkinlik haritası epey geniş — AI/ML, XR, IoT, Full-Stack, DevOps... Hepsini bir terminal ekranında görmek istersen şu masadaki bilgisayara tıkla. ASCII art ile güzel bir deneyim seni bekliyor. 💻",
        options: [
            { label: 'Terminali aç! 🖥️', nextNodeId: 'greeting', action: { type: 'openTerminal' } },
            { label: '← Geri dön', nextNodeId: 'about_experience' },
        ],
    },

    // ═══════════════════════════════════════════
    // TUR DALI
    // ═══════════════════════════════════════════
    tour_start: {
        id: 'tour_start',
        message: "Bu oda Erim'in dijital çalışma alanının bir temsili. Her köşesinde farklı bir şey var. Nereden başlayalım?",
        options: [
            { label: 'Şu renkli kutular ne? 📦', nextNodeId: 'tour_boxes' },
            { label: 'Masadaki bilgisayar ne? 💻', nextNodeId: 'tour_computer' },
            { label: 'Duvardaki neon yazı ne? ✨', nextNodeId: 'tour_writing' },
        ],
    },

    tour_boxes: {
        id: 'tour_boxes',
        message: "O kutular Erim'in öne çıkan projelerini temsil ediyor. Digital Showroom XR'dan, Sayıştay AI sistemine kadar... Her kutunun rengi farklı bir projeye ait. Tıklayınca detayları görürsün.",
        options: [
            { label: 'En dikkat çekici projeyi göster! 🟢', nextNodeId: 'project_detail_1', action: { type: 'highlightBox', boxId: 'box_1' } },
            { label: 'Kendim keşfedeyim 🔍', nextNodeId: 'tour_boxes_explore' },
            { label: 'Başka ne var? 👀', nextNodeId: 'tour_start' },
        ],
    },

    tour_boxes_explore: {
        id: 'tour_boxes_explore',
        message: "Tamam, kutulara tıklayarak projeleri keşfet. Merak ettiğin bir şey olursa bana tekrar gel. 😉",
        options: [
            { label: 'Keşfe çıkıyorum! ✅', nextNodeId: null, action: { type: 'closeBubble' } },
        ],
    },

    tour_computer: {
        id: 'tour_computer',
        message: "O bilgisayarda Erim'in teknik beceri haritası var. 5 farklı alan: AI & Machine Learning, Hardware & IoT, XR & Spatial Computing, Full-Stack Web, Systems & DevOps. Terminal ekranında ASCII art ile görebilirsin — epey havali duruyor. 😎",
        options: [
            { label: 'Açalım terminali! 🖥️', nextNodeId: 'greeting', action: { type: 'openTerminal' } },
            { label: 'Sonra bakarım ⏩', nextNodeId: 'tour_start' },
        ],
    },

    tour_writing: {
        id: 'tour_writing',
        message: "O neon 'Erim' yazısı bir nevi kartvizit. Tıklarsan Erim'in gerçek fotoğrafını, iletişim bilgilerini ve sosyal medya linklerini görebilirsin. 📸",
        options: [
            { label: "Erim'i görmek istiyorum! 📸", nextNodeId: 'greeting', action: { type: 'openProfile' } },
            { label: 'Projelere de bakmak istiyorum 📦', nextNodeId: 'tour_boxes' },
            { label: '← Geri dön', nextNodeId: 'tour_start' },
        ],
    },

    // ═══════════════════════════════════════════
    // PROJE DALI
    // ═══════════════════════════════════════════
    projects_overview: {
        id: 'projects_overview',
        message: "Erim'in projeleri ciddi çeşitlilik gösteriyor — XR ekosistemi, AI karar destek, IoT ve daha fazlası. Kutuların her biri bir projeye ait. Hangisi ilgini çekti?",
        options: [
            { label: '🟢 XR Showroom', nextNodeId: 'project_detail_1', action: { type: 'highlightBox', boxId: 'box_1' } },
            { label: '🟠 Sayıştay AI', nextNodeId: 'project_detail_2', action: { type: 'highlightBox', boxId: 'box_2' } },
            { label: 'Tüm projeleri göster', nextNodeId: 'projects_all' },
        ],
    },

    project_detail_1: {
        id: 'project_detail_1',
        message: "Digital Showroom, Erim'in en kapsamlı projesi. Unreal Engine + C++ ile masaüstü/VR simülasyonu, Three.js + Next.js ile web tabanlı 3D editör, WebXR ile AR/VR deneyimi, hatta VR gözlükler için bakışla etkileşimli panoramik tur motoru bile var. Dört farklı platformda çalışan senkronize bir sistem.",
        options: [
            { label: 'Detayları gör 🔍', nextNodeId: 'greeting', action: { type: 'openProject', boxId: 'box_1' } },
            { label: 'Diğer projeye bak ⏩', nextNodeId: 'project_detail_2' },
            { label: '← Geri dön', nextNodeId: 'projects_overview' },
        ],
    },

    project_detail_2: {
        id: 'project_detail_2',
        message: "Sayıştay projesi, Erim'in AI mimarisindeki derinliğini gösteriyor. Sayıştay raporları üzerinde çalışan çok katmanlı bir AI sistemi: OCR entegrasyonu, vektör tabanlı indeksleme ve MCP ile modelin dış veri kaynaklarına güvenli erişimi. Hâlâ geliştirilmeye devam ediyor.",
        options: [
            { label: 'Detayları gör 🔍', nextNodeId: 'greeting', action: { type: 'openProject', boxId: 'box_2' } },
            { label: 'Diğer projeye bak ⏩', nextNodeId: 'project_detail_3' },
            { label: '← Geri dön', nextNodeId: 'projects_overview' },
        ],
    },

    project_detail_3: {
        id: 'project_detail_3',
        message: "Talep AI, vatandaş taleplerini analiz ederek yerel yönetimlere stratejik aksiyon önerileri üreten bir platform. Farklı LLM modelleri API üzerinden entegre, MapLibre/GIS tabanlı hibrit mimari. AI + şehircilik bir arada.",
        options: [
            { label: 'Detayları gör 🔍', nextNodeId: 'greeting', action: { type: 'openProject', boxId: 'box_3' } },
            { label: 'Diğer projeye bak ⏩', nextNodeId: 'project_detail_4' },
            { label: '← Geri dön', nextNodeId: 'projects_overview' },
        ],
    },

    project_detail_4: {
        id: 'project_detail_4',
        message: "Gezelim, akıllı bir seyahat uygulaması. Google POI verilerinin AI süzgecinden geçirilmesi, dinamik rota oluşturma ve oyunlaştırma elementleri var. Lokasyon bazlı, veri mühendisliği ağırlıklı bir mobil rehber.",
        options: [
            { label: 'Detayları gör 🔍', nextNodeId: 'greeting', action: { type: 'openProject', boxId: 'box_4' } },
            { label: 'Diğer projeye bak ⏩', nextNodeId: 'project_detail_5' },
            { label: '← Geri dön', nextNodeId: 'projects_overview' },
        ],
    },

    project_detail_5: {
        id: 'project_detail_5',
        message: "Bu proje Erim'in mühendislik kökenini en iyi yansıtan çalışma. Analog devre tasarım parametrelerini optimize eden bir CNN modeli — yapay zeka ile devre simülasyonu otomatize ediliyor. Donanım ve yazılımı birleştiren nadir projelerden.",
        options: [
            { label: 'Detayları gör 🔍', nextNodeId: 'greeting', action: { type: 'openProject', boxId: 'box_5' } },
            { label: 'Son proje ⏩', nextNodeId: 'project_detail_6' },
            { label: '← Geri dön', nextNodeId: 'projects_overview' },
        ],
    },

    project_detail_6: {
        id: 'project_detail_6',
        message: "Pekiştirmeli öğrenme ile stratejik kararlar alan bir AI ajanı. Q-Learning algoritması, React tabanlı web arayüzüyle entegre. Erim'in 'öğrenmeyi öğrenen' sistemlere olan ilgisini gösteriyor.",
        options: [
            { label: 'Detayları gör 🔍', nextNodeId: 'greeting', action: { type: 'openProject', boxId: 'box_6' } },
            { label: '← Ana menüye dön', nextNodeId: 'greeting' },
        ],
    },

    projects_all: {
        id: 'projects_all',
        message: "Erim'in öne çıkan 6 projesi kutuların arkasında. XR'dan AI'a, IoT'den veri mühendisliğine... Kutulara tıklayarak detayları incele.",
        options: [
            { label: 'Kutulara kendim tıklayacağım ✅', nextNodeId: null, action: { type: 'closeBubble' } },
            { label: '← Geri dön', nextNodeId: 'projects_overview' },
        ],
    },

    // ═══════════════════════════════════════════
    // İLETİŞİM DALI
    // ═══════════════════════════════════════════
    contact_transition: {
        id: 'contact_transition',
        message: "Erim ile iletişime geçmek istersen duvardaki neon yazıya tıkla — orada tüm iletişim bilgileri ve fotoğrafı var. Ya da hızlıca burada söyleyeyim.",
        options: [
            { label: 'Profili aç! 📋', nextNodeId: 'greeting', action: { type: 'openProfile' } },
            { label: 'Hızlı özet ver ⚡', nextNodeId: 'contact_quick' },
            { label: '← Geri dön', nextNodeId: 'greeting' },
        ],
    },

    contact_quick: {
        id: 'contact_quick',
        message: "📧 erdennilsu1965@gmail.com\n💼 linkedin.com/in/erden-erim-aydoğdu\n🐙 github.com/erimkun\n📍 İstanbul, Türkiye\n\nHerhangi bir kanaldan ulaşabilirsin!",
        options: [
            { label: 'Teşekkürler! 👋', nextNodeId: 'farewell' },
            { label: '← Ana menüye dön', nextNodeId: 'greeting' },
        ],
    },

    // ═══════════════════════════════════════════
    // KAPANIŞ DALI
    // ═══════════════════════════════════════════
    farewell: {
        id: 'farewell',
        message: "İyi gezdinler! Odayı keşfetmeye devam edebilirsin, istediğin zaman bana tekrar tıkla. 👋",
        options: [
            { label: 'Hoşça kal! 👋', nextNodeId: null, action: { type: 'closeBubble' } },
        ],
    },
};
