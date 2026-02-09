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
- [ ] `char` dışındaki modellere tıklama özelliği ekle
  - [ ] `kutu` (Kutular) → ProjectPopup tetikleme
  - [ ] `desk` (Masa/Bilgisayar) → TerminalPopup tetikleme
  - [ ] `writing` (Erim yazısı) → ProfilePopup tetikleme
- [ ] Her model için `ClickableModel` kullanımı genişlet
- [ ] Her model için farklı kamera odak noktası tanımla
- [ ] `Bvh` içine tüm tıklanabilir modelleri dahil et

### 2.2 InteractiveBoxes Güncelleme
- [ ] `InteractiveBoxes.tsx` — onClick handler ekle
  - [ ] Her kutuya proje ID'si bağla
  - [ ] Tıklanınca ilgili ProjectPopup aç callback
  - [ ] Tıklanan kutunun ışığını vurgula (highlight efekti)

### 2.3 Viewer.tsx Güncelleme
- [ ] Tüm model tıklama handler'larını ekle
- [ ] Popup state yönetimi (hangi popup açık)
- [ ] Popup'lar arası geçiş mantığı

---

## 📋 Faz 3: Yeni Popup Bileşenleri

### 3.1 ProjectPopup
- [ ] `src/components/ProjectPopup.tsx` oluştur
  - [ ] Proje kartı tasarımı (glassmorphism)
  - [ ] Proje görseli alanı
  - [ ] Proje başlığı + açıklama
  - [ ] Teknoloji tag'leri
  - [ ] GitHub + Demo linkleri
  - [ ] Kapatma butonu
  - [ ] Giriş animasyonu (slide-up + fade)
  - [ ] Çıkış animasyonu
- [ ] `src/components/ProjectPopup.css` oluştur
  - [ ] Neon glow border (kutunun rengine göre dinamik)
  - [ ] Responsive tasarım
  - [ ] Mobil uyumluluk

### 3.2 TerminalPopup
- [ ] `src/components/TerminalPopup.tsx` oluştur
  - [ ] Terminal penceresi tasarımı (siyah arka plan)
  - [ ] Başlık çubuğu: `erim@skills:~$`
  - [ ] Typewriter efekti ile satır satır yazdırma
  - [ ] ASCII art başlık (büyük "SKILLS" yazısı)
  - [ ] Kategorize beceri listesi
  - [ ] Progress bar (█████░░░ gibi)
  - [ ] Kapatma butonu (terminal [x])
  - [ ] Boot sequence animasyonu
- [ ] `src/components/TerminalPopup.css` oluştur
  - [ ] CRT scanline efekti
  - [ ] Terminal yeşil/mavi parlak yazı
  - [ ] Monospace font
  - [ ] CRT açılma animasyonu
  - [ ] Responsive tasarım

### 3.3 ProfilePopup
- [ ] `src/components/ProfilePopup.tsx` oluştur
  - [ ] Gerçek fotoğraf (circular crop)
  - [ ] İsim + unvan
  - [ ] İletişim ikonları listesi (email, LinkedIn, GitHub)
  - [ ] Kısa bio/slogan
  - [ ] CV indirme butonu
  - [ ] Kapatma butonu
  - [ ] Sosyal medya linkleri
- [ ] `src/components/ProfilePopup.css` oluştur
  - [ ] Fotoğraf glow efekti
  - [ ] Glassmorphism + neon tema
  - [ ] Hover animasyonları
  - [ ] Responsive tasarım

---

## 📋 Faz 4: CV Verileri Entegrasyonu

### 4.1 Veri Dosyaları
- [ ] `src/data/cvData.ts` — CV verileri
  - [ ] Kişisel bilgiler (isim, unvan, konum, bio)
  - [ ] İletişim bilgileri (email, LinkedIn, GitHub, web)
  - [ ] Eğitim geçmişi
  - [ ] İş deneyimleri
  - [ ] Sertifikalar
  - [ ] İlgi alanları/hobiler

- [ ] `src/data/projects.ts` — Proje verileri (6 adet)
  - [ ] Proje 1 (Green box) — ad, açıklama, teknolojiler, linkler
  - [ ] Proje 2 (Orange box) — ad, açıklama, teknolojiler, linkler
  - [ ] Proje 3 (Pink box) — ad, açıklama, teknolojiler, linkler
  - [ ] Proje 4 (Blue box) — ad, açıklama, teknolojiler, linkler
  - [ ] Proje 5 (Yellow box) — ad, açıklama, teknolojiler, linkler
  - [ ] Proje 6 (Purple box) — ad, açıklama, teknolojiler, linkler

- [ ] `src/data/skills.ts` — Teknik beceriler
  - [ ] Programlama Dilleri kategorisi
  - [ ] Frontend kategorisi
  - [ ] Backend kategorisi
  - [ ] Veritabanları kategorisi
  - [ ] DevOps/Araçlar kategorisi
  - [ ] Diğer Beceriler kategorisi

### 4.2 Konuşma Metinleri Güncelleme
- [ ] `dialogueTree.ts` — CV verilerini konuşma metinlerine işle
  - [ ] Eğitim bilgilerini about_education'a ekle
  - [ ] İş deneyimlerini about_experience'a ekle
  - [ ] Sertifikaları about_certificates'a ekle
  - [ ] İlgi alanlarını about_interests'e ekle
  - [ ] Proje özetlerini project_detail_1..6'ya ekle
  - [ ] İletişim bilgilerini contact_quick'e ekle

---

## 📋 Faz 5: Kamera Sistemi Genişletme

- [ ] `ViewerInteraction` bileşeni güncelle
  - [ ] Her tıklanabilir obje için kamera pozisyonu tanımla
  - [ ] Kutular için kamera pozisyonu
  - [ ] Masa/Bilgisayar için kamera pozisyonu
  - [ ] Erim yazısı için kamera pozisyonu
- [ ] Obje arası direkt geçiş (varsayılana dönmeden)
- [ ] Smooth transition süreleri ayarla

---

## 📋 Faz 6: Görsel İyileştirmeler

### 6.1 Hover İpuçları
- [ ] Tüm tıklanabilir objelerde cursor: pointer
- [ ] Opsiyonel: hover glow efekti
- [ ] Mobilde touch feedback

### 6.2 ASCII Animasyonlar (TerminalPopup)
- [ ] Matrix rain arka plan efekti
- [ ] Boot sequence (açılış animasyonu)
- [ ] Typing cursor blink
- [ ] Progress bar dolma animasyonu
- [ ] ASCII art reveal animasyonu

### 6.3 Mobil Uyumluluk
- [ ] Tüm popup'lar responsive
- [ ] Touch event hitbox boyutları
- [ ] Safe area paddingler
- [ ] Popup boyut ayarları (max-width, max-height)

### 6.4 Son Kontroller
- [ ] Tüm popup'ların açılış/kapanış testleri
- [ ] Konuşma ağacının tüm dallarını test et
- [ ] Mobil test (farklı ekran boyutları)
- [ ] Performans testi (frameloop: demand korunuyor mu)
- [ ] Cross-browser test
- [ ] Build kontrolü (`npm run build` hatasız mı)

---

## 📊 İlerleme Özeti

| Faz | Durum | İlerleme |
|-----|-------|----------|
| Faz 0: Planlama | ✅ Tamamlandı | ████████████ 100% |
| Faz 1: Konuşma Altyapısı | ⬜ Bekliyor | ░░░░░░░░░░░░ 0% |
| Faz 2: Tıklanabilir Objeler | ⬜ Bekliyor | ░░░░░░░░░░░░ 0% |
| Faz 3: Yeni Popup'lar | ⬜ Bekliyor | ░░░░░░░░░░░░ 0% |
| Faz 4: CV Verileri | ⬜ Bekliyor | ░░░░░░░░░░░░ 0% |
| Faz 5: Kamera Sistemi | ⬜ Bekliyor | ░░░░░░░░░░░░ 0% |
| Faz 6: Görsel İyileştirme | ⬜ Bekliyor | ░░░░░░░░░░░░ 0% |

**Toplam İlerleme: █░░░░░░░░░░░ ~10%**
