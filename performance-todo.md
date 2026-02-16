# 📋 Performans Optimizasyonu — TODO Listesi

**Tarih:** 16 Şubat 2026  
**Durum:** ✅ = Tamamlandı | 🔲 = Bekliyor | 🔄 = Devam ediyor

---

## Faz 1: Kritik Bug Düzeltmeleri

- [x] **P0** — Loading screen `isLoaded={true}` hardcoded bug'ı düzelt
  - `useProgress` hook'u ile gerçek model yükleme izleme
  - Scene component'ini loading sırasında da mount et (gizli)
  - Buton ancak `progress >= 100` olduğunda görünsün
  - 📄 `src/pages/Viewer.tsx`

- [x] **P0** — Popup kapatınca kamera zoomlu kalma bug'ı düzelt
  - Tüm popup onClose handler'larına `setFocusedModelId(null)` ekle
  - ESC handler'ını güncelle — popup + focus aynı anda sıfırlansın
  - handleCloseBubble'a da focus reset ekle
  - 📄 `src/pages/Viewer.tsx`

- [x] **P1** — Mobil terminalde otomatik klavye açılması engelle
  - Mobil cihaz tespiti (ontouchstart / maxTouchPoints)
  - Focus çağrısını mobilde atla
  - 📄 `src/components/TerminalPopup.tsx`

---

## Faz 2: Three.js Render Pipeline Optimizasyonu

- [x] **P0** — Shadow map autoUpdate devre dışı bırak (statik sahne)
  - `ShadowFreeze` component'i — ilk frame sonrası dondur
  - `gl.shadowMap.autoUpdate = false` + `needsUpdate = true`
  - 📄 `src/components/Scene.tsx`

- [x] **P1** — Mobilde antialias'ı kapat
  - `IS_MOBILE` kontrolü ile `antialias: !IS_MOBILE`
  - 0.75 DPR'de antialias farkı minimal
  - 📄 `src/components/Scene.tsx`

- [x] **P1** — Emissive glow mesh'leri devre dışı bırak
  - 6 halo sphere + 6 core sphere yorum satırına alındı
  - EmissiveGlowPlane component ve render yorum satırına alındı
  - 13 draw call + AdditiveBlending hesaplaması kaldırıldı
  - 📄 `src/components/InteractiveBoxes.tsx`, `src/components/Scene.tsx`

---

## Faz 3: React Render Optimizasyonu

- [x] **P0** — Zustand store selectors (Scene.tsx)
  - Tüm store destructure → bireysel selectors
  - `useSceneStore(s => s.selectedModelId)` pattern'i
  - 📄 `src/components/Scene.tsx`

- [x] **P0** — Zustand store selectors (Viewer.tsx)
  - `useDialogueStore()` → bireysel selectors
  - Action'lar stable ref olduğu için ayrı selector'da
  - 📄 `src/pages/Viewer.tsx`

- [x] **P1** — InteractiveBoxes useState → useRef
  - `hovered` / `tapped` state → ref dönüşümü
  - Pointer event'lerde React re-render sıfıra indi
  - Tap auto-dismiss timer ref ile yönetiliyor
  - 📄 `src/components/InteractiveBoxes.tsx`

---

## Faz 4: CSS & GPU Compositing

- [x] **P1** — Mobil backdrop-filter blur azaltma
  - SpeechBubble: 16px → 6px (mobil media query)
  - CloseBtn: 12px → 6px
  - 📄 `src/components/SpeechBubble.css`, `src/pages/Viewer.css`

---

## Faz 5: Gelecek Optimizasyonlar (Henüz Uygulanmadı)

- [x] **P0** — Draco/Meshopt model sıkıştırma (13MB → ~3MB)
  - `_opt.glb` dosyaları zaten Draco ile sıkıştırılmış (20MB → 2-3MB, %85-90 azalma)
  - `useGLTF.setDecoderPath` ile Google CDN decoder erken yükleniyor
  - drei’nin DRACOLoader WebWorker’lar kullanarak paralel decode yapıyor
  - 📄 `src/components/Model.tsx`

- [ ] **P1** — LOD sistemi (mobil için düşük poly modeller)
  - Blender'da simplified versiyon export et
  - `IS_MOBILE` kontrolü ile farklı model path

- [ ] **P1** — Texture Atlas birleştirmesi
  - Birden fazla materyali tek texture'a birleştir
  - Draw call sayısı azalır

- [x] **P2** — Mobilde shadow map 512x512'ye düşür
  - `shadow-mapSize` → `IS_MOBILE ? [512, 512] : [1024, 1024]`
  - Shadow kalitesi az düşer, performans artar
  - 📄 `src/components/Lighting.tsx`

- [ ] **P2** — Skybox yüksek çözünürlük
  - `sky.webp` (~20KB) → daha iyi çözünürlükte versiyon
  - Bulanık arka plan düzelir

- [ ] **P2** — Emissive box ışıkları için sprite-based glow
  - Billboard sprite + glow texture
  - AdditiveBlending sphere'lerden çok daha hafif

- [x] **P3** — WebWorker model parsing (Draco decode)
  - `useGLTF.setDecoderPath()` modül seviyesinde çağrılıyor
  - DRACOLoader WASM decoderı WebWorker’larda çalışıyor
  - Ana thread’de Draco decode yapılmıyor
  - 📄 `src/components/Model.tsx`

---

## Doğrulama & Test Kontrol Listesi

- [ ] Mobil cihazda (veya Chrome DevTools emulation) FPS kontrolü
- [ ] Loading screen'de buton, modeller yüklenmeden görünmüyor mu?
- [ ] Popup (Terminal/Profile/Project) kapatınca kamera default'a dönüyor mu?
- [ ] Mobilde bilgisayara tıklayınca klavye açılmıyor mu?
- [ ] Kutuların etrafında emissive glow yok mu?
- [ ] ESC tuşu ile tüm popup'lar düzgün kapanıyor mu?
- [ ] SpeechBubble kapatınca kamera düzeliyor mu?
- [ ] React DevTools Profiler ile re-render kontrolü
- [ ] Chrome Performance tab ile frame time karşılaştırma
