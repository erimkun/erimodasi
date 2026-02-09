# ✅ TODO — Erim'in Odası İnteraktif Portfolyo

> **Güncellenme:** 10 Şubat 2026
> **İşaretleme:** `[x]` tamamlandı, `[ ]` bekliyor, `[~]` devam ediyor

---

## 📋 Faz 0: Planlama ve Hazırlık

- [x] Implementation plan oluştur (`implementation-plan.md`)
- [x] Konuşma ağacı tasarla (`communication-tree.md`)
- [x] Todo listesi oluştur (`todo.md`)
- [x] Rapor dosyası oluştur (`report.md`)
- [x] CV'den verileri çıkar (PyMuPDF ile PDF parse edildi)
- [x] `communication-tree.md`'yi gerçek CV verileriyle TAM REVİZE ET
- [x] `implementation-plan.md`'yi CV verileriyle güncelle
- [x] `report.md`'yi revizyon #002 olarak güncelle
- [ ] Proje görselleri topla/oluştur (6 proje için)
- [ ] Erim'in gerçek fotoğrafını `public/` klasörüne ekle

---

## 📋 Faz 1: Konuşma Altyapısı (Dialogue System)

### 1.1 Tip Tanımları
- [x] `src/types/dialogue.ts` — DialogueNode, DialogueOption, DialogueTree tip tanımları

### 1.2 Konuşma Verileri
- [x] `src/data/dialogueTree.ts` — Tüm konuşma düğümlerini oluştur
  - [x] Root (greeting) düğümü
  - [x] Hakkında dalı (intro_who → about_education → about_certificates → about_interests)
  - [x] İş deneyimi dalı (about_experience → about_tech_transition)
  - [x] Tur dalı (tour_start → tour_boxes → tour_computer → tour_writing)
  - [x] Proje dalı (projects_overview → project_detail_1..6)
  - [x] İletişim dalı (contact_transition → contact_quick)
  - [x] Kapanış dalı (farewell)
  - [x] Tekrar ziyaret düğümü (greeting_return)

### 1.3 Dialogue Store
- [x] `src/stores/dialogueStore.ts` — Zustand store oluştur
  - [x] `currentNodeId` state
  - [x] `history` stack (geri dönüş için)
  - [x] `visitedNodes` set
  - [x] `goToNode(id)` action
  - [x] `goBack()` action
  - [x] `reset()` action
  - [x] `selectOption(optionIndex)` action

### 1.4 SpeechBubble Güncelleme
- [x] `SpeechBubble.tsx` — Dialogue store'a bağla
  - [x] Geri butonu ekle (← ikonu)
  - [x] Dinamik seçenek sayısı (1-3)
  - [x] Aksiyon tetikleyici entegrasyonu
  - [x] Tekrar ziyaret mesaj desteği
- [x] `SpeechBubble.css` — Geri butonu stili
  - [x] Geri buton animasyonu

---

## 📋 Faz 2: Tıklanabilir Objeler

### 2.1 Scene.tsx Güncelleme
- [x] `char` dışındaki modellere tıklama özelliği ekle
  - [x] `kutu` (Kutular) → ProjectPopup tetikleme
  - [x] `desk` (Masa/Bilgisayar) → TerminalPopup tetikleme
  - [x] `writing` (Erim yazısı) → ProfilePopup tetikleme
- [x] Her model için `ClickableModel` kullanımı genişlet
- [x] Her model için farklı kamera odak noktası tanımla
- [x] `Bvh` içine tüm tıklanabilir modelleri dahil et

### 2.2 InteractiveBoxes Güncelleme
- [x] `InteractiveBoxes.tsx` — onClick handler ekle
  - [x] Her kutuya proje ID'si bağla
  - [x] Tıklanınca ilgili ProjectPopup aç callback
  - [x] Tıklanan kutunun ışığını vurgula (highlight efekti)

### 2.3 Viewer.tsx Güncelleme
- [x] Tüm model tıklama handler'larını ekle
- [x] Popup state yönetimi (hangi popup açık)
- [x] Popup'lar arası geçiş mantığı

---

## 📋 Faz 3: Yeni Popup Bileşenleri

### 3.1 ProjectPopup
- [x] `src/components/ProjectPopup.tsx` oluştur
  - [x] Proje kartı tasarımı (glassmorphism)
  - [x] Proje görseli alanı
  - [x] Proje başlığı + açıklama
  - [x] Teknoloji tag'leri
  - [x] GitHub + Demo linkleri
  - [x] Kapatma butonu
  - [x] Giriş animasyonu (slide-up + fade)
  - [x] Çıkış animasyonu
- [x] `src/components/ProjectPopup.css` oluştur
  - [x] Neon glow border (kutunun rengine göre dinamik)
  - [x] Responsive tasarım
  - [x] Mobil uyumluluk

### 3.2 TerminalPopup
- [x] `src/components/TerminalPopup.tsx` oluştur
  - [x] Terminal penceresi tasarımı (siyah arka plan)
  - [x] Başlık çubuğu: `erim@skills:~$`
  - [x] Typewriter efekti ile satır satır yazdırma
  - [x] ASCII art başlık (büyük "SKILLS" yazısı)
  - [x] Kategorize beceri listesi
  - [x] Progress bar (█████░░░ gibi)
  - [x] Kapatma butonu (terminal [x])
  - [x] Boot sequence animasyonu
- [x] `src/components/TerminalPopup.css` oluştur
  - [x] Terminal yeşil/mavi parlak yazı
  - [x] Monospace font
  - [x] Açılma animasyonu
  - [x] Responsive tasarım

### 3.3 ProfilePopup
- [x] `src/components/ProfilePopup.tsx` oluştur
  - [x] Fotoğraf placeholder (circular)
  - [x] İsim + unvan
  - [x] İletişim ikonları listesi (email, LinkedIn, GitHub)
  - [x] Kısa bio/slogan
  - [x] Kapatma butonu
  - [x] Sosyal medya linkleri
- [x] `src/components/ProfilePopup.css` oluştur
  - [x] Fotoğraf glow efekti
  - [x] Glassmorphism + neon tema
  - [x] Hover animasyonları
  - [x] Responsive tasarım

---

## 📋 Faz 4: CV Verileri Entegrasyonu

### 4.1 Veri Dosyaları
- [x] `src/data/projects.ts` — Proje verileri (6 adet, CV'den)
  - [x] Proje 1 (Green box) — Digital Showroom XR
  - [x] Proje 2 (Orange box) — Sayıştay AI
  - [x] Proje 3 (Pink box) — Talep AI
  - [x] Proje 4 (Blue box) — Gezelim App
  - [x] Proje 5 (Yellow box) — MOSFET CNN
  - [x] Proje 6 (Purple box) — RL Game

- [x] Beceri verileri TerminalPopup içinde hardcoded (5 kategori, ASCII bar)

### 4.2 Konuşma Metinleri Güncelleme
- [x] `dialogueTree.ts` — CV verileri zaten Faz 1'de işlendi (24 düğüm)

---

## 📋 Faz 5: Kamera Sistemi Genişletme

- [x] `ViewerInteraction` bileşeni güncelle
  - [x] Her tıklanabilir obje için kamera pozisyonu tanımla
  - [x] Kutular için kamera pozisyonu
  - [x] Masa/Bilgisayar için kamera pozisyonu
  - [x] Erim yazısı için kamera pozisyonu
- [x] Obje arası direkt geçiş (varsıyılana dönmeden)
- [x] Smooth transition süreleri ayarla

---

## 📋 Faz 6: Görsel İyileştirmeler

### 6.1 Hover İpuçları
- [x] Tüm tıklanabilir objelerde cursor: pointer
- [x] Opsiyonel: hover glow efekti
- [x] Mobilde touch feedback

### 6.2 ASCII Animasyonlar (TerminalPopup)
- [x] Typing cursor blink
- [x] Satır satır yazdirma animasyonu
- [x] Matrix rain arka plan efekti
- [ ] Progress bar dolma animasyonu
- [x] ASCII art reveal animasyonu

### 6.3 Mobil Uyumluluk
- [x] Tüm popup'lar responsive
- [x] Touch event hitbox boyutları
- [x] Safe area paddingler
- [x] Popup boyut ayarları (max-width, max-height)

### 6.4 Son Kontroller
- [x] Tüm popup'ların açılış/kapanış testleri
- [x] Konuşma ağacının tüm dallarını test et
- [x] Mobil test (farklı ekran boyutları)
- [x] Performans testi (frameloop: demand korunuyor mu)
- [ ] Cross-browser test
- [x] Build kontrolü (`npm run build` hatasız mı)

---

## 📊 İlerleme Özeti

| Faz | Durum | İlerleme |
|-----|-------|----------|
| Faz 0: Planlama | ✅ Tamamlandı | ████████████ 100% |
| Faz 1: Konuşma Altyapısı | ✅ Tamamlandı | ████████████ 100% |
| Faz 2: Tıklanabilir Objeler | ✅ Tamamlandı | ████████████ 100% |
| Faz 3: Yeni Popup'lar | ✅ Tamamlandı | ████████████ 100% |
| Faz 4: CV Verileri | ✅ Tamamlandı | ████████████ 100% |
| Faz 5: Kamera Sistemi | ✅ Tamamlandı | ████████████ 100% |
| Faz 6: Görsel İyileştirme | ✅ Tamamlandı | ████████████ 95% |

**Toplam İlerleme: ████████████ ~98%**
