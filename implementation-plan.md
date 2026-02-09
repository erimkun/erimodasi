# 🏗️ Implementation Plan — Erim'in Odası Interaktif Portfolyo

> **Proje:** Erim'in Odası — 3D İnteraktif Portfolyo Web Sitesi
> **Tarih:** 10 Şubat 2026
> **Amaç:** Ziyaretçilerin 3D oda içindeki objelere tıklayarak Erim hakkında bilgi edindiği, dallanabilen konuşma ağacı ile yönlendirilen eğlenceli bir portfolyo deneyimi oluşturmak.

---

## 📋 Mevcut Durum Özeti

| Bileşen | Durum | Açıklama |
|---------|-------|----------|
| 3D Sahne (Scene.tsx) | ✅ Mevcut | Room, Desk, Cabinet, Character, Kutu, Writing modelleri yüklü |
| Karakter Tıklama | ✅ Kısmen | `char` modeline tıklanınca kamera yaklaşıyor, basit SpeechBubble açılıyor |
| SpeechBubble | ✅ Temel | Typewriter efekti, 2 seçenekli basit popup ("İyiyim/Kötüyüm") |
| Interactive Boxes | ✅ Kısmen | Hover'da ışık yoğunluğu artıyor, tıklama işlevi yok |
| Bilgisayar (Desk) | ❌ Yok | Tıklama işlevi yok |
| Erim Yazısı (Writing) | ❌ Yok | Tıklama işlevi yok |
| Proje Popup | ❌ Yok | Tasarlanmadı |
| Terminal Popup | ❌ Yok | Tasarlanmadı |
| Profil Popup | ❌ Yok | Tasarlanmadı |
| Konuşma Ağacı | ❌ Yok | Sadece tek seviye mevcut |

---

## 🎯 Hedef Mimari

### Etkileşim Haritası

```
┌─────────────────────────────────────────────────────────────────┐
│                        3D ODA SAHNESİ                          │
│                                                                 │
│   📝 "Erim" Yazısı ──→ ProfilPopup (fotoğraf + iletişim)      │
│   🧑 Karakter ──→ SpeechBubble (konuşma ağacı + yönlendirme)  │
│   📦 Kutular ──→ ProjectPopup (öne çıkan projeler)             │
│   💻 Masa/Bilgisayar ──→ TerminalPopup (ASCII teknik beceriler)│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Popup Tipleri

| Popup | Tetikleyici | Stil | İçerik |
|-------|-----------|------|--------|
| **SpeechBubble** | Karakter tıklama | Glassmorphism baloncuk | 24 düğümlü dallanabilen konuşma ağacı, CV bilgileri doğal akışla |
| **ProjectPopup** | Kutu tıklama | Kart tasarımı, neon glow | 6 gerçek proje: XR Showroom, Sayıştay AI, Talep AI, Gezelim, MOSFET CNN, RL Oyun |
| **TerminalPopup** | Masa/Bilgisayar tıklama | Retro terminal (siyah/yeşil) | 5 kategori beceri: AI/ML, Hardware/IoT, XR, Full-Stack, DevOps |
| **ProfilePopup** | "Erim" yazısı tıklama | Glassmorphism overlay | Fotoğraf + "AI & XR Solutions Architect" unvanı + iletişim bilgileri |

---

## 🔧 Faz 1: Konuşma Altyapısı (Dialogue System)

### 1.1 Konuşma Ağacı Veri Yapısı
**Dosya:** `src/data/dialogueTree.ts`

```typescript
interface DialogueNode {
  id: string;
  message: string;
  options?: DialogueOption[];
  autoAdvance?: { nextId: string; delay: number }; // Seçeneksiz otomatik ilerleme
  onEnter?: string; // Tetiklenen aksiyon (örn: "openProjects", "openSkills")
}

interface DialogueOption {
  label: string;
  nextId: string;      // Sonraki düğüm
  icon?: string;        // Emoji/ikon
  highlight?: boolean;  // Öne çıkan seçenek
}

interface DialogueTree {
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}
```

### 1.2 Konuşma Geçmişi ve Navigasyon
**Dosya:** `src/stores/dialogueStore.ts`

- `currentNodeId` — Aktif konuşma düğümü
- `history: string[]` — Geçmiş düğüm ID'leri (geri dönüş için)
- `visitedNodes: Set<string>` — Ziyaret edilmiş düğümler (tekrar gelince farklı mesaj)
- `goBack()` — Bir önceki düğüme dön
- `goToNode(id)` — Belirli düğüme git
- `reset()` — Konuşmayı başa sar

### 1.3 SpeechBubble Genişletmesi
**Dosya:** `src/components/SpeechBubble.tsx` (güncelleme)

- Geri butonu eklenmesi (← ikonu)
- Dinamik seçenek sayısı (1-3 arası)
- Konuşma ağacına bağlanma
- Karakter tepkilerine göre farklı animasyonlar
- Özel aksiyonlar (popup tetikleme vb.)

---

## 🔧 Faz 2: Tıklanabilir Objeler

### 2.1 Modelleri Tıklanabilir Yapma
**Dosya:** `src/components/Scene.tsx` (güncelleme)

Şu anda sadece `char` modeli tıklanabilir. Aşağıdaki modelleri de tıklanabilir yapacağız:

| Model ID | Obje | Tıklanınca |
|----------|------|------------|
| `char` | Karakter | Konuşma ağacı başlatılır (SpeechBubble) |
| `kutu` | Kutular | ProjectPopup açılır |
| `desk` | Masa/Bilgisayar | TerminalPopup açılır |
| `writing` | "Erim" yazısı | ProfilePopup açılır |

**Yapılacaklar:**
1. `ClickableModel` bileşeni `char` dışındaki modellere de genişletilecek
2. Her model için farklı kamera açısı/pozisyonu tanımlanacak
3. `Viewer.tsx`'te tıklama handler'ları eklenecek
4. `Bvh` (Bounding Volume Hierarchy) içine tüm tıklanabilir modeller dahil edilecek

### 2.2 Kutu Tıklama İşlevi
**Dosya:** `src/components/InteractiveBoxes.tsx` (güncelleme)

- Her kutuya `onClick` handler eklenmesi
- Tıklanınca ilgili proje bilgisi ile ProjectPopup açılması
- Kutunun renk → proje eşleştirmesi:
  - 🟢 Box 1 (Green) → Proje 1
  - 🟠 Box 2 (Orange) → Proje 2
  - 🩷 Box 3 (Pink) → Proje 3
  - 🔵 Box 4 (Blue) → Proje 4
  - 🟡 Box 5 (Yellow) → Proje 5
  - 🟣 Box 6 (Purple) → Proje 6

---

## 🔧 Faz 3: Yeni Popup Bileşenleri

### 3.1 ProjectPopup
**Dosya:** `src/components/ProjectPopup.tsx` + `src/components/ProjectPopup.css`

**Tasarım:**
- Glassmorphism kart (sahne temasıyla uyumlu)
- Neon glow border (kutunun rengiyle eşleşen)
- Proje görseli (opsiyonel screenshot/gif)
- Proje başlığı + kısa açıklama
- Teknolojiler (tag'ler halinde)
- GitHub linki + demo linki
- Kapatma butonu (X)
- Giriş/çıkış animasyonu (scale + fade)

**Veri:**
```typescript
interface ProjectData {
  id: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  color: string; // Kutu rengiyle eşleşen
}
```

**Projeler (CV'den):**
| # | Proje | Teknolojiler |
|---|-------|-------------|
| 1 | Digital Showroom XR Ecosystem | Unreal Engine, C++, Three.js, Next.js, WebXR |
| 2 | Sayıştay Denetim Analiz & Karar Destek | OCR, RAG, MCP, Vektör DB, LLM |
| 3 | Talep AI: Mahalle Odaklı Karar Destek | LLM API, MapLibre, GIS |
| 4 | Gezelim App | Data Cleaning, AI, Gamification |
| 5 | AI Destekli MOSFET Yükselteç Tasarımı | CNN, LTspice, Circuit Sim |
| 6 | AI Stratejik Masa Oyunu | Q-Learning, RL, React |

**Dosya:** `src/data/projects.ts`

### 3.2 TerminalPopup
**Dosya:** `src/components/TerminalPopup.tsx` + `src/components/TerminalPopup.css`

**Tasarım:**
- Siyah terminal ekranı (retro bilgisayar monitörü tarzı)
- Yeşil/mavi parlayan yazı (monospace font)
- CRT scanline efekti (CSS pseudo-element)
- Terminal başlık çubuğu: `erim@skills:~$`
- Typewriter efekti ile satır satır beceri listesi
- ASCII art başlık animasyonu
- Kategorize teknik beceriler
- Kapatma butonu (terminal X)

**ASCII Art Örnekleri:**
```
╔══════════════════════════════════╗
║   _____ _   _ _ _               ║
║  / ____| | (_) | |              ║
║ | (___ | | _| | |___            ║
║  \___ \| |/ / | / __|           ║
║  ____) |   <| | \__ \           ║
║ |_____/|_|\_\_|_|___/           ║
║                                  ║
╚══════════════════════════════════╝
```

**Veri:**
```typescript
interface SkillCategory {
  category: string;
  icon: string; // ASCII ikon
  skills: { name: string; level: number }[]; // level 1-5, progress bar olarak gösterilir
}
```

**Kategoriler (CV'den):**
- **AI & Machine Learning:** RAG, LLM (MCP, LangChain), CNN, ANN, RL, PyTorch, Computer Vision
- **Engineering & Hardware:** Gömülü Sistemler (STM32, C/C++), IoT (MQTT, Sensör Ağları), Devre Analizi (LTspice), PCB
- **XR & Spatial Computing:** Unreal Engine (C++), Unity, WebXR, CesiumJS, Three.js, Fotogrametri
- **Full-Stack Web:** React, Next.js, Node.js, FastAPI, PostgreSQL/PostGIS, Tailwind CSS
- **Systems & DevOps:** Docker, Kubernetes, CI/CD, Linux, Nginx, Git

**Dosya:** `src/data/skills.ts`

**ASCII Animasyonlar:**
1. Matrix rain efekti (arka plan)
2. Typing cursor blink
3. Progress bar animasyonu (beceri seviyesi)
4. Boot sequence (popup açılırken)

### 3.3 ProfilePopup
**Dosya:** `src/components/ProfilePopup.tsx` + `src/components/ProfilePopup.css`

**Tasarım:**
- Yarı saydam overlay (tam ekranı kapsamayan, sağ tarafa yerleşen)
- Gerçek fotoğraf (circular crop, border glow)
- İsim: Erden Erim Aydoğdu
- Unvan: AI & XR Solutions Architect | IoT, Embedded Systems & Full-Stack Developer
- Bio: "Elektrik-Elektronik Mühendisliği altyapısını; AI, XR ve endüstriyel IoT ile birleştiren multidisipliner çözüm mimarı."
- İletişim bilgileri ikon listesi:
  - 📧 erdennilsu1965@gmail.com
  - 💼 linkedin.com/in/erden-erim-aydoğdu
  - 🐙 github.com/erimkun
  - 📍 İstanbul, Türkiye
  - 🌍 İngilizce (C1) · Almanca (A2) · İspanyolca (A1)
- CV indirme butonu
- Glassmorphism + neon tema

---

## 🔧 Faz 4: CV Verileri Entegrasyonu

### 4.1 CV Veri Dosyası
**Dosya:** `src/data/cvData.ts`

CV'den çıkarılan bilgiler (TAMAMLANDI):
- **Kişisel:** Erden Erim Aydoğdu, AI & XR Solutions Architect, İstanbul
- **İletişim:** erdennilsu1965@gmail.com, LinkedIn, GitHub (erimkun)
- **Eğitim:** Yeditepe Üni. EE Müh. (2021-25), İstanbul Üni. Web Tasarım (2023-25), Atatürk Üni. İşletme (2025-devam)
- **Deneyim:** KENTAŞ Ar-Ge Müh. (2025-günümüz), Kafein Yazılım DevOps Staj (2024), CONSULTA PLM Danışman (2023)
- **Beceriler:** 5 ana kategori (AI/ML, Hardware, XR, Full-Stack, DevOps)
- **Projeler:** 6+ öne çıkan (XR Showroom, Sayıştay AI, Talep AI, Gezelim, MOSFET CNN, RL Oyun)
- **Sertifikalar:** Epic Games XR, Michigan WebXR, Colorado C++, PyTorch DL, DeepLearning.AI, PM
- **Diller:** İngilizce C1, Almanca A2, İspanyolca A1

### 4.2 Konuşma Ağacında CV Kullanımı (TAMAMLANDI)
Karakter konuşmalarında CV bilgileri doğal ve gerçek bir şekilde aktarılıyor:
- 3. şahıs anlatım: "Erim, Yeditepe Üniversitesi EE Mühendisliği çıkışlı bir çözüm mimarı"
- Karakter kendini Erim olarak tanıtMIYOR — rehber/maskot rolünde
- "Dijital ikiz" ifadesi KALDIRILDI — banality ve conflict yaratıyordu
- Her proje gerçek teknoloji detaylarıyla: "Unreal Engine + C++ ile masaüstü/VR simülasyonu"
- Multidisipliner kimlik vurgusu: "donanımdan buluta uçtan uca sistem kuran biri"

---

## 🔧 Faz 5: Kamera Sistemi Genişletme

### 5.1 Çoklu Odak Noktaları
**Dosya:** `src/components/Scene.tsx` → `ViewerInteraction` güncelleme

Her tıklanabilir obje için optimal kamera pozisyonu:

| Obje | Kamera Pozisyonu | Bakış Hedefi |
|------|-----------------|--------------|
| Karakter | `[0.6, 1.0, 1.2]` | `[0.16, 0.65, 0]` |
| Kutular | `[1.5, 0.8, 0.5]` | `[1.0, 0.4, -0.5]` |
| Masa/Bilgisayar | `[-0.2, 0.8, 1.0]` | `[-0.4, 0.4, 0]` |
| Erim Yazısı | `[0.3, 1.2, 0.5]` | `[0.3, 0.9, -0.9]` |

### 5.2 Geçiş Animasyonları
- Smooth lerp ile kamera hareketi (mevcut sistem genişletilecek)
- Her obje için farklı geçiş süresi
- Obje arası geçişlerde önce varsayılan pozisyona dönmeden direkt geçiş

---

## 🔧 Faz 6: Görsel İyileştirmeler

### 6.1 Hover İpuçları
- Tıklanabilir objelerin üzerine gelince cursor değişimi ✅ (char için mevcut)
- Diğer objeler için de `pointer` cursor
- Opsiyonel: obje etrafında hafif glow efekti (hover'da)

### 6.2 Popup Geçişleri
- Her popup tipi için farklı giriş/çıkış animasyonu
- SpeechBubble: mevcut bounce efekti
- ProjectPopup: slide-up + fade
- TerminalPopup: CRT açılma efekti (merkezden genişleyen çizgi)
- ProfilePopup: blur-in + slide

### 6.3 Mobil Uyum
- Tüm popup'lar mobilde responsive
- Touch event'ler için hitbox boyutları ayarlanacak
- Popup'lar ekrana sığacak şekilde boyutlandırılacak

---

## 📁 Yeni Dosya Yapısı

```
src/
├── components/
│   ├── SpeechBubble.tsx        ← Güncelleme: konuşma ağacı entegrasyonu
│   ├── SpeechBubble.css        ← Güncelleme: geri butonu + yeni stiller
│   ├── InteractiveBoxes.tsx    ← Güncelleme: onClick handler
│   ├── ProjectPopup.tsx        ← YENİ: proje detay popup'ı
│   ├── ProjectPopup.css        ← YENİ
│   ├── TerminalPopup.tsx       ← YENİ: ASCII terminal popup'ı
│   ├── TerminalPopup.css       ← YENİ
│   ├── ProfilePopup.tsx        ← YENİ: profil/iletişim popup'ı
│   ├── ProfilePopup.css        ← YENİ
│   ├── Scene.tsx               ← Güncelleme: çoklu tıklanabilir model
│   └── Model.tsx               ← Minimal güncelleme
├── data/
│   ├── dialogueTree.ts         ← YENİ: konuşma ağacı verileri
│   ├── projects.ts             ← YENİ: proje verileri
│   ├── skills.ts               ← YENİ: teknik beceriler
│   ├── cvData.ts               ← YENİ: CV verileri
│   └── staticScene.ts          ← Mevcut
├── stores/
│   ├── dialogueStore.ts        ← YENİ: konuşma durumu yönetimi
│   └── sceneStore.ts           ← Mevcut
├── pages/
│   ├── Viewer.tsx              ← Güncelleme: yeni popup entegrasyonları
│   └── Viewer.css              ← Güncelleme: yeni stiller
└── types/
    ├── dialogue.ts             ← YENİ: konuşma tip tanımları
    └── scene.ts                ← Mevcut
```

---

## ⚡ Uygulama Sırası

```
Faz 1 → Konuşma Altyapısı (dialogue system + store)
  ↓
Faz 2 → Tıklanabilir Objeler (Scene.tsx + InteractiveBoxes)
  ↓
Faz 3 → Yeni Popup'lar (Project, Terminal, Profile)
  ↓
Faz 4 → CV Verileri Entegrasyonu
  ↓
Faz 5 → Kamera Sistemi Genişletme
  ↓
Faz 6 → Görsel İyileştirmeler + Mobil Uyum
```

---

## 🎨 Tasarım Prensipleri

1. **Tutarlılık:** Tüm popup'lar sahnenin neon/glassmorphism temasıyla uyumlu
2. **Keşfedilebilirlik:** Karakter konuşması ile kullanıcı doğal olarak yönlendirilir
3. **Eğlence:** ASCII art, typewriter efekti, CRT animasyonları ile etkileşim eğlenceli
4. **Derinlik:** Konuşma ağacı sayesinde her ziyarette farklı bilgiler keşfedilebilir
5. **Performans:** Lazy loading, memoization, demand frameloop korunacak
6. **Erişilebilirlik:** Keyboard navigation, ARIA label'lar, yeterli kontrast

---

## 🔗 Bağımlılıklar

- **Zustand** — Mevcut (sceneStore için kullanılıyor), dialogueStore için de kullanılacak
- **@react-three/fiber** — Mevcut
- **@react-three/drei** — Mevcut
- Yeni npm paketi gerekmez, tüm popup'lar saf React + CSS ile yapılacak
