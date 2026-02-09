# 🌳 Communication Tree — Konuşma Ağacı (Revize — CV Bazlı)

> **Proje:** Erim'in Odası — İnteraktif Konuşma Sistemi
> **Tarih:** 10 Şubat 2026 (Revize)
> **Revizyon Notu:** CV okunarak tüm bilgiler gerçek verilerle dolduruldu. Karakter artık "dijital ikiz" değil, odanın rehberi. Ton: teknik ama samimi, multidisipliner kimliği öne çıkaran.
> **Kural:** Her düğümde 1-3 seçenek, her dalda geri dönüş seçeneği mevcut

---

## 🗺️ Genel Akış Haritası

```
                            ┌──────────────┐
                            │   START      │
                            │  Karakter    │
                            │  Tıklandı    │
                            └──────┬───────┘
                                   │
                            ┌──────▼───────┐
                            │   GREETING   │
                            │  "Eee, hoş   │
                            │   geldin!"   │
                            └──────┬───────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
       ┌──────▼──────┐    ┌───────▼──────┐    ┌───────▼──────┐
       │   INTRO     │    │    TOUR      │    │   DIRECT     │
       │ "Kim bu     │    │ "Buraları    │    │ "Merak etme  │
       │  Erim?"     │    │  anlatsana"  │    │  göster!"    │
       └──────┬──────┘    └───────┬──────┘    └───────┬──────┘
              │                   │                    │
              ▼                   ▼                    ▼
        Hakkında Dalı       Tur Dalı             Proje Dalı
```

---

## 📖 DÜĞÜM DETAYLARI

---

### 🟢 ROOT — Karşılama

#### `greeting` (Başlangıç Düğümü — İlk ziyaret)
> **Mesaj:** "Eee, hoş geldin! Erim'in odasına buyur. Etrafta dokunabileceğin bir sürü şey var ama önce ben sana kısa bir yol göstereyim mi?"

| # | Seçenek | Sonraki Düğüm | Açıklama |
|---|---------|--------------|----------|
| 1 | "Kim bu Erim?" 🤔 | `intro_who` | Hakkında dalına gider |
| 2 | "Buraları anlatsana" 🏠 | `tour_start` | Oda turu dalına gider |
| 3 | "Gerek yok, göster projeleri!" 🚀 | `projects_overview` | Proje dalına atlar |

---

#### `greeting_return` (Tekrar Ziyaret)
> **Mesaj:** "Tekrar mı geldin? Güzel, daha anlatacak çok şey var. Ne merak ediyorsun?"

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Biraz daha anlat Erim'i" 🗣️ | `intro_who` |
| 2 | "Projelere bir bakayım" 📦 | `projects_overview` |
| 3 | "İletişim bilgileri lazım" 📬 | `contact_transition` |

---

### 🔵 HAKKINDA DALI (About Branch)

#### `intro_who`
> **Mesaj:** "Erim, Yeditepe Üniversitesi Elektrik-Elektronik Mühendisliği çıkışlı bir çözüm mimarı. Ama sadece donanım değil — yapay zeka, XR, IoT ve full-stack web'i bir arada kullanıyor. Kısacası, donanımdan buluta uçtan uca sistem kuran biri."

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Eğitim geçmişi nasıl?" 🎓 | `about_education` |
| 2 | "Şu an ne yapıyor?" 💼 | `about_experience` |
| 3 | "← Geri dön" | `greeting` |

---

#### `about_education`
> **Mesaj:** "Yeditepe Üniversitesi'nde İngilizce burslu Elektrik-Elektronik Mühendisliği okudu (2021-2025). Aynı zamanda İstanbul Üniversitesi'nden Web Tasarımı ve Kodlama ön lisans derecesi var. Şu an da Atatürk Üniversitesi'nde İşletme lisansına devam ediyor. Üç farklı disiplini birleştiren nadir insanlardan."

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Sertifikaları var mı?" 📜 | `about_certificates` |
| 2 | "İş deneyimi?" 💼 | `about_experience` |
| 3 | "← Geri dön" | `intro_who` |

---

#### `about_experience`
> **Mesaj:** "Erim şu an Üsküdar Belediyesi KENTAŞ'ta Elektrik-Elektronik Mühendisi olarak Ar-Ge ve yazılım geliştirme yapıyor. CesiumJS ile Dijital İkiz platformu, Unreal Engine ile XR showroom ekosistemi, PostGIS ile karar destek sistemi gibi ciddi projeler yürütüyor. Daha önce Kafein Yazılım'da DevOps stajı ve CONSULTA'da PLM danışmanlığı yaptı."

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Teknik becerileri neler?" 💻 | `about_tech_transition` |
| 2 | "Projeleri görmek istiyorum" 📦 | `projects_overview` |
| 3 | "← Geri dön" | `intro_who` |

---

#### `about_certificates`
> **Mesaj:** "XR tarafında Epic Games'ten Unreal Engine XR Development, Michigan Üniversitesi'nden WebXR, Colorado Üniversitesi'nden C++ for Unreal sertifikaları var. AI tarafında ise Deep Learning with PyTorch ve DeepLearning.AI Neural Networks sertifikaları. Bir de Project Management Foundations var — sadece kod yazmıyor, yönetiyor da."

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Başka dil biliyor mu?" 🌍 | `about_languages` |
| 2 | "← Geri dön" | `about_education` |

---

#### `about_languages`
> **Mesaj:** "İngilizce C1 seviye — akademik ve teknik literatürde çok rahat. Almanca A2, İspanyolca da A1 seviyesinde. Her şeye merak duyan biri, dillere de..."

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "İletişime geçmek istiyorum" 📬 | `contact_transition` |
| 2 | "← Ana menüye dön" | `greeting` |

---

#### `about_tech_transition`
> **Mesaj:** "Erim'in teknik yetkinlik haritası epey geniş — AI/ML, XR, IoT, Full-Stack, DevOps... Hepsini bir terminal ekranında görmek istersen şu masadaki bilgisayara tıkla. ASCII art ile güzel bir deneyim seni bekliyor. 💻"

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Terminali aç!" 🖥️ | `greeting` | **ACTION: openTerminal** |
| 2 | "← Geri dön" | `about_experience` | — |

---

### 🟡 TUR DALI (Tour Branch)

#### `tour_start`
> **Mesaj:** "Bu oda Erim'in dijital çalışma alanının bir temsili. Her köşesinde farklı bir şey var. Nereden başlayalım?"

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Şu renkli kutular ne?" 📦 | `tour_boxes` |
| 2 | "Masadaki bilgisayar ne?" 💻 | `tour_computer` |
| 3 | "Duvardaki neon yazı ne?" ✨ | `tour_writing` |

---

#### `tour_boxes`
> **Mesaj:** "O kutular Erim'in öne çıkan projelerini temsil ediyor. Digital Showroom XR'dan, Sayıştay AI sistemine kadar... Her kutunun rengi farklı bir projeye ait. Tıklayınca detayları görürsün."

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "En dikkat çekici projeyi göster!" 🟢 | `project_detail_1` | **ACTION: highlightBox(box_1)** |
| 2 | "Kendim keşfedeyim" 🔍 | `tour_boxes_explore` | — |
| 3 | "Başka ne var?" 👀 | `tour_start` | — |

---

#### `tour_boxes_explore`
> **Mesaj:** "Tamam, kutulara tıklayarak projeleri keşfet. Merak ettiğin bir şey olursa bana tekrar gel. 😉"

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Keşfe çıkıyorum!" ✅ | — *(konuşma kapanır)* |

---

#### `tour_computer`
> **Mesaj:** "O bilgisayarda Erim'in teknik beceri haritası var. 5 farklı alan: AI & Machine Learning, Hardware & IoT, XR & Spatial Computing, Full-Stack Web, Systems & DevOps. Terminal ekranında ASCII art ile görebilirsin — epey havali duruyor. 😎"

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Açalım terminali!" 🖥️ | `greeting` | **ACTION: openTerminal** |
| 2 | "Sonra bakarım" ⏩ | `tour_start` | — |

---

#### `tour_writing`
> **Mesaj:** "O neon 'Erim' yazısı bir nevi kartvizit. Tıklarsan Erim'in gerçek fotoğrafını, iletişim bilgilerini ve sosyal medya linklerini görebilirsin. 📸"

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Erim'i görmek istiyorum!" 📸 | `greeting` | **ACTION: openProfile** |
| 2 | "Projelere de bakmak istiyorum" 📦 | `tour_boxes` | — |
| 3 | "← Geri dön" | `tour_start` | — |

---

### 🟣 PROJE DALI (Projects Branch)

#### `projects_overview`
> **Mesaj:** "Erim'in projeleri ciddi çeşitlilik gösteriyor — XR ekosistemi, AI karar destek, IoT ve daha fazlası. Kutuların her biri bir projeye ait. Hangisi ilgini çekti?"

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "🟢 XR Showroom" | `project_detail_1` | **ACTION: highlightBox(box_1)** |
| 2 | "🟠 Sayıştay AI" | `project_detail_2` | **ACTION: highlightBox(box_2)** |
| 3 | "Tüm projeleri göster" | `projects_all` | — |

---

#### `project_detail_1` — Digital Showroom XR Ecosystem
> **Mesaj:** "Digital Showroom, Erim'in en kapsamlı projesi. Unreal Engine + C++ ile masaüstü/VR simülasyonu, Three.js + Next.js ile web tabanlı 3D editör, WebXR ile AR/VR deneyimi, hatta VR gözlükler için bakışla etkileşimli (gaze-based) panoramik tur motoru bile var. Dört farklı platformda çalışan senkronize bir sistem."

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Detayları gör" 🔍 | `greeting` | **ACTION: openProject(box_1)** |
| 2 | "Diğer projeye bak" ⏩ | `project_detail_2` | — |
| 3 | "← Geri dön" | `projects_overview` | — |

---

#### `project_detail_2` — Sayıştay Denetim Analiz & Karar Destek Sistemi
> **Mesaj:** "Sayıştay projesi, Erim'in AI mimarisindeki derinliğini gösteriyor. Sayıştay raporları üzerinde çalışan çok katmanlı bir AI sistemi: OCR entegrasyonu, vektör tabanlı indeksleme ve MCP (Model Context Protocol) ile modelin dış veri kaynaklarına güvenli erişimi. Hâlâ geliştirilmeye devam ediyor."

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Detayları gör" 🔍 | `greeting` | **ACTION: openProject(box_2)** |
| 2 | "Diğer projeye bak" ⏩ | `project_detail_3` | — |
| 3 | "← Geri dön" | `projects_overview` | — |

---

#### `project_detail_3` — Talep AI: Mahalle Odaklı Karar Destek Platformu
> **Mesaj:** "Talep AI, vatandaş taleplerini analiz ederek yerel yönetimlere stratejik aksiyon önerileri üreten bir platform. Farklı LLM modelleri API üzerinden entegre, MapLibre/GIS tabanlı hibrit mimari. AI + şehircilik bir arada."

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Detayları gör" 🔍 | `greeting` | **ACTION: openProject(box_3)** |
| 2 | "Diğer projeye bak" ⏩ | `project_detail_4` | — |
| 3 | "← Geri dön" | `projects_overview` | — |

---

#### `project_detail_4` — Gezelim App
> **Mesaj:** "Gezelim, akıllı bir seyahat uygulaması. Google POI verilerinin AI süzgecinden geçirilmesi, dinamik rota oluşturma ve oyunlaştırma elementleri var. Lokasyon bazlı, veri mühendisliği ağırlıklı bir mobil rehber."

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Detayları gör" 🔍 | `greeting` | **ACTION: openProject(box_4)** |
| 2 | "Diğer projeye bak" ⏩ | `project_detail_5` | — |
| 3 | "← Geri dön" | `projects_overview` | — |

---

#### `project_detail_5` — AI Destekli MOSFET Yükselteç Tasarımı
> **Mesaj:** "Bu proje Erim'in mühendislik kökenini en iyi yansıtan çalışma. Analog devre tasarım parametrelerini optimize eden bir CNN modeli — yapay zeka ile devre simülasyonu otomatize ediliyor. Donanım ve yazılımı birleştiren nadir projelerden."

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Detayları gör" 🔍 | `greeting` | **ACTION: openProject(box_5)** |
| 2 | "Son proje" ⏩ | `project_detail_6` | — |
| 3 | "← Geri dön" | `projects_overview` | — |

---

#### `project_detail_6` — AI Stratejik Masa Oyunu
> **Mesaj:** "Pekiştirmeli öğrenme ile stratejik kararlar alan bir AI ajanı. Q-Learning algoritması, React tabanlı web arayüzüyle entegre. Erim'in 'öğrenmeyi öğrenen' sistemlere olan ilgisini gösteriyor."

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Detayları gör" 🔍 | `greeting` | **ACTION: openProject(box_6)** |
| 2 | "← Ana menüye dön" | `greeting` | — |

---

#### `projects_all`
> **Mesaj:** "Erim'in öne çıkan 6 projesi kutuların arkasında. XR'dan AI'a, IoT'den veri mühendisliğine... Kutulara tıklayarak detayları incele."

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Kutulara kendim tıklayacağım" ✅ | — *(konuşma kapanır)* |
| 2 | "← Geri dön" | `projects_overview` |

---

### 🔴 İLETİŞİM DALI (Contact Branch)

#### `contact_transition`
> **Mesaj:** "Erim ile iletişime geçmek istersen duvardaki neon yazıya tıkla — orada tüm iletişim bilgileri ve fotoğrafı var. Ya da hızlıca burada söyleyeyim."

| # | Seçenek | Sonraki Düğüm | Aksiyon |
|---|---------|--------------|---------|
| 1 | "Profili aç!" 📋 | `greeting` | **ACTION: openProfile** |
| 2 | "Hızlı özet ver" ⚡ | `contact_quick` | — |
| 3 | "← Geri dön" | `greeting` | — |

---

#### `contact_quick`
> **Mesaj:** "📧 erdennilsu1965@gmail.com\n💼 linkedin.com/in/erden-erim-aydoğdu\n🐙 github.com/erimkun\n📍 İstanbul, Türkiye\n\nHerhangi bir kanaldan ulaşabilirsin!"

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Teşekkürler! 👋" | `farewell` |
| 2 | "← Ana menüye dön" | `greeting` |

---

### 🟤 KAPANIŞ DALI (Farewell Branch)

#### `farewell`
> **Mesaj:** "İyi gezdinler! Odayı keşfetmeye devam edebilirsin, istediğin zaman bana tekrar tıkla. 👋"

| # | Seçenek | Sonraki Düğüm |
|---|---------|--------------|
| 1 | "Hoşça kal! 👋" | — *(konuşma kapanır)* |

---

## 🔄 AKSİYON TETİKLEYİCİLER

| Aksiyon ID | Tetikleyici | Yapılacak |
|------------|------------|-----------|
| `openProject(boxId)` | Proje detay seçildiğinde | İlgili kutu vurgulanır, ProjectPopup açılır |
| `openTerminal` | Bilgisayara yönlendirmede | TerminalPopup açılır |
| `openProfile` | Profil yönlendirmesinde | ProfilePopup açılır |
| `highlightBox(boxId)` | Proje seçildiğinde | İlgili kutunun ışığı parlar |
| `closeBubble` | Konuşma kapanışında | SpeechBubble kapanır |

---

## 📦 KUTU → PROJE EŞLEŞTİRMESİ

| Kutu | Renk | Proje | Teknolojiler |
|------|------|-------|-------------|
| box_1 | 🟢 Green | Digital Showroom XR Ecosystem | Unreal Engine, C++, Three.js, Next.js, WebXR |
| box_2 | 🟠 Orange | Sayıştay Denetim Analiz & Karar Destek | OCR, RAG, MCP, Vektör DB, LLM |
| box_3 | 🩷 Pink | Talep AI: Mahalle Odaklı Karar Destek | LLM API, MapLibre, GIS, AI |
| box_4 | 🔵 Blue | Gezelim App: Akıllı Seyahat | Data Cleaning, AI, Gamification, Routing |
| box_5 | 🟡 Yellow | AI Destekli MOSFET Yükselteç Tasarımı | CNN, LTspice, Circuit Simulation |
| box_6 | 🟣 Purple | AI Stratejik Masa Oyunu | Q-Learning, Reinforcement Learning, React |

---

## 🖥️ TERMINAL İÇERİĞİ (TerminalPopup — Beceri Listesi)

> ASCII art terminal deneyimi — masadaki bilgisayara tıklanınca açılır

```
erim@skills:~$ cat /etc/skills.conf

╔══════════════════════════════════════════════════╗
║           ____  _  _ _ _  _  ____                ║
║          / ___|| |/ (_) || |/ ___|               ║
║          \___ \|   /| | || |\___ \               ║
║           ___) | . \| |_|| | ___) |              ║
║          |____/|_|\_\___|_||____/                ║
╚══════════════════════════════════════════════════╝

[AI & Machine Learning]
  RAG ████████░░ | LLM (MCP, LangChain) ████████░░
  CNN ███████░░░ | PyTorch ███████░░░
  Computer Vision ██████░░░░
  Reinforcement Learning ██████░░░░

[Engineering & Hardware]
  Gömülü Sistemler (STM32, C/C++) ████████░░
  IoT (MQTT, Sensör Ağları) ███████░░░
  Devre Analizi (LTspice) ██████░░░░
  PCB Tasarım ████░░░░░░

[XR & Spatial Computing]
  Unreal Engine (C++) █████████░
  Unity ██████░░░░ | WebXR ████████░░
  CesiumJS (Digital Twin) ████████░░
  Three.js █████████░
  Fotogrametri ██████░░░░

[Full-Stack Web]
  React █████████░ | Next.js ████████░░
  Node.js ████████░░ | FastAPI ███████░░░
  PostgreSQL/PostGIS ████████░░
  Tailwind CSS ████████░░

[Systems & DevOps]
  Docker █████████░ | Kubernetes ███████░░░
  CI/CD ████████░░ | Linux ████████░░
  Nginx ███████░░░ | Git █████████░

erim@skills:~$ _
```

---

## 👤 PROFİL POPUP İÇERİĞİ (ProfilePopup)

| Alan | Değer |
|------|-------|
| **Ad Soyad** | Erden Erim Aydoğdu |
| **Unvan** | AI & XR Solutions Architect |
| **Alt Unvan** | IoT, Embedded Systems & Full-Stack Developer |
| **Bio** | Elektrik-Elektronik Mühendisliği altyapısını; AI, XR ve endüstriyel IoT ile birleştiren multidisipliner çözüm mimarı. Donanım seviyesinden bulut mimarisine uçtan uca sistemler. |
| **Konum** | 📍 İstanbul, Türkiye |
| **Email** | 📧 erdennilsu1965@gmail.com |
| **LinkedIn** | 💼 linkedin.com/in/erden-erim-aydoğdu |
| **GitHub** | 🐙 github.com/erimkun |
| **Diller** | 🇬🇧 İngilizce (C1) · 🇩🇪 Almanca (A2) · 🇪🇸 İspanyolca (A1) |

---

## 🌲 GÖRSEL KONUŞMA AĞACI

```
greeting ─────────────────────────────────────────────────────┐
  ├── intro_who                                               │
  │     ├── about_education                                   │
  │     │     ├── about_certificates                          │
  │     │     │     ├── about_languages                       │
  │     │     │     │     ├── contact_transition               │
  │     │     │     │     │     ├── openProfile [ACTION]       │
  │     │     │     │     │     ├── contact_quick              │
  │     │     │     │     │     │     ├── farewell             │
  │     │     │     │     │     │     └── ← greeting           │
  │     │     │     │     │     └── ← greeting                 │
  │     │     │     │     └── ← greeting                       │
  │     │     │     └── ← about_education                      │
  │     │     ├── about_experience                             │
  │     │     └── ← intro_who                                  │
  │     ├── about_experience                                   │
  │     │     ├── about_tech_transition                        │
  │     │     │     ├── openTerminal [ACTION]                  │
  │     │     │     └── ← about_experience                     │
  │     │     ├── projects_overview ──► (proje dalı)           │
  │     │     └── ← intro_who                                  │
  │     └── ← greeting                                         │
  ├── tour_start                                               │
  │     ├── tour_boxes                                         │
  │     │     ├── project_detail_1 (XR Showroom)               │
  │     │     ├── tour_boxes_explore ──► (kapanış)             │
  │     │     └── ← tour_start                                │
  │     ├── tour_computer                                      │
  │     │     ├── openTerminal [ACTION]                        │
  │     │     └── ← tour_start                                │
  │     └── tour_writing                                       │
  │           ├── openProfile [ACTION]                         │
  │           ├── tour_boxes                                   │
  │           └── ← tour_start                                 │
  └── projects_overview                                        │
        ├── project_detail_1 (XR) → 2 (Sayıştay) → 3 (Talep  │
        │   AI) → 4 (Gezelim) → 5 (MOSFET) → 6 (RL Oyun)     │
        ├── projects_all ──► (kapanış)                         │
        └── ← greeting ───────────────────────────────────────┘
```

---

## 📊 İSTATİSTİKLER

| Metrik | Değer |
|--------|-------|
| Toplam Düğüm Sayısı | 24 |
| Maksimum Dallanma | 3 seçenek |
| Minimum Dallanma | 1 seçenek (kapanış) |
| Maksimum Derinlik | 6 seviye |
| Geri Dönüş Noktası | Her düğümde mevcut |
| Aksiyon Tetikleyici | 5 farklı aksiyon |
| Tekrar Ziyaret Desteği | ✅ (greeting_return) |
| CV'den referanslanan bilgi | Tüm düğümlerde |

---

## 💡 TASARIM İLKELERİ

1. **Gerçeklik:** Tüm bilgiler CV'den — uydurma veya abartma yok
2. **Karakter tonu:** Samimi ama profesyonel, 3. şahıs anlatım (Erim hakkında konuşuyor, kendini Erim olarak tanıtmıyor)
3. **"Dijital ikiz" yok:** Karakter bir rehber/maskot — "Ben Erim'im" demiyor
4. **Multidisipliner vurgu:** EE mühendisliği + AI + XR + IoT + Full-Stack — bu benzersiz combo her dalda hissettiriliyor
5. **Yönlendirme:** Her konuşma yolu sonunda kullanıcıyı bir objeye (kutu/bilgisayar/yazı) yönlendiriyor
6. **Doğal akış:** Bilgi serpiştirme — kullanıcı farkında olmadan CV'nin tamamını öğreniyor
7. **Her dalda geri:** Kullanıcı asla çıkmaza girmiyor
