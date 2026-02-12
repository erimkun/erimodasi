# Erimodasi — Performans Optimizasyon Todolist
> **Tarih:** 12.02.2026  
> **Supervisor:** Senior Three.js & Web Full-Stack Architect  
> **Durum Renkleri:** 🔴 Yapılmadı | 🟡 Devam ediyor | 🟢 Tamamlandı

---

## PHASE 1: Lighting Overhaul — KRİTİK (%40-60 FPS iyileştirme)
> **Sub-Agent:** Lighting Optimizer  
> **Deadline:** İlk iterasyon  

- [ ] **1.1** InteractiveBoxes.tsx → Her kutudan `<pointLight>` komponentini kaldır
  - Mevcut: 6 adet PointLight (her kutu için 1)
  - Hedef: 0 PointLight — glow efekti emissive material ile sağlanacak
  - Emissive mesh → `MeshBasicMaterial` color/opacity ile hover etkisi
  - `useFrame` içindeki intensity lerp → emissive opacity lerp'e dönüştürülecek

- [ ] **1.2** Scene.tsx → Viewer modda boxLight PointLight render'ını kaldır
  - `{!isEditor && config.lighting.boxLights?.map(...)` → Sadece Editor'da render
  - Viewer'da InteractiveBoxes zaten emissive mesh kullanacak

- [ ] **1.3** Shadow autoUpdate devre dışı bırak
  - Scene.tsx Canvas içine shadow config ekle:
    ```tsx
    function ShadowController() {
        const { gl } = useThree();
        useEffect(() => {
            gl.shadowMap.autoUpdate = false;
            gl.shadowMap.needsUpdate = true;
        }, [gl]);
        return null;
    }
    ```
  - Bu sayede shadow map sadece 1 kez render edilir

- [ ] **1.4** Toplam aktif ışık sayısını doğrula
  - Hedef: Ambient(1) + Directional(1) + Hemisphere(1) + Accent PointLight(1) = **4 ışık**
  - StaticScene.ts'deki boxLights InteractiveBoxes emissive için sadece config olarak kalır

---

## PHASE 2: DPR & Sharpness Fix — BULANIKLIK GİDERME  
> **Sub-Agent:** Render Quality Optimizer  
> **Deadline:** Phase 1 ile paralel  

- [ ] **2.1** Desktop DPR: `0.85` → `Math.min(window.devicePixelRatio, 1.5)`
  - Scene.tsx: `DESKTOP_DPR` sabitini güncelle
  - Işık azaltması sayesinde daha yüksek DPR karşılanabilir

- [ ] **2.2** Mobil DPR: `0.5` → `0.7`
  - Scene.tsx: `MOBILE_DPR` sabitini güncelle

- [ ] **2.3** Skybox çözünürlüğünü kontrol et
  - `sky.webp` = 19.9KB → muhtemelen çok düşük çözünürlük
  - Eğer bulanık görünüyorsa: 2048x1024 veya üstü skybox hazırla
  - WebP formatında ~200-400KB olur — kabul edilebilir

- [ ] **2.4** Shadow map boyutu (opsiyonel)
  - Işık azaldıktan sonra bütçe varsa: 1024→2048 yapılabilir
  - Lighting.tsx: `shadow-mapSize={[2048, 2048]}`

---

## PHASE 3: Transition & Animation Optimization
> **Sub-Agent:** Animation Performance Optimizer  

- [ ] **3.1** Kamera geçişlerinde shadow devre dışı bırak
  - ViewerInteraction.tsx → animasyon başlarken `gl.shadowMap.needsUpdate = false`
  - Animasyon bittiğinde `gl.shadowMap.needsUpdate = true`

- [ ] **3.2** Lerp factor artır
  - ViewerInteraction useFrame: `lerpFactor` 0.12 → 0.18
  - ClickableModel useFrame: lerp 0.08 → 0.15
  - Daha hızlı convergence = daha az render frame

- [ ] **3.3** useFrame early exit'leri optimize et
  - InteractiveBoxes: 6 ayrı useFrame → tek bir parent useFrame + ref array
  - Veya emissive'e geçiş sonrası useFrame ihtiyacı azalacak

---

## PHASE 4: Loading Pipeline
> **Sub-Agent:** Asset Loading Optimizer  

- [ ] **4.1** Scene mount zamanlamasını incele
  - Viewer.tsx'de Scene, isLoading=true iken bile mount oluyor
  - FluidBackground Canvas + Scene Canvas = 2 WebGL context aynı anda
  - ÖNERİ: Scene'i `{!isLoading && <Scene ... />}` ile lazy mount et
  - VEYA: Loading screen bitince Scene mount et

- [ ] **4.2** Draco compression değerlendir (ileriye yönelik)
  - 6 GLB dosyası toplamda ~13MB
  - Draco ile %70-90 küçülme → ~2-4MB
  - `@react-three/drei` zaten DRACOLoader desteği sunuyor
  - Not: GLB'leri yeniden export etmek gerekiyor (Blender/gltf-transform)

- [ ] **4.3** Progressive loading stratejisi
  - Önce `room_opt.glb` + `char_opt.glb` yükle (kullanıcı ilk bunları görüyor)
  - Sonra `desk_opt.glb`, `writing_opt.glb`, `kutu_opt.glb`, `cabinet_opt.glb`
  - `preloadModels()` sırasını düzenle

---

## PHASE 5: Memory & Cleanup
> **Sub-Agent:** Memory Manager  

- [ ] **5.1** Model.tsx → dispose cleanup ekle
  ```tsx
  useEffect(() => {
      return () => {
          clonedScene.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                  (child as THREE.Mesh).geometry?.dispose();
                  const mat = (child as THREE.Mesh).material;
                  if (Array.isArray(mat)) mat.forEach(m => m.dispose());
                  else (mat as THREE.Material)?.dispose();
              }
          });
      };
  }, [clonedScene]);
  ```

- [ ] **5.2** InteractiveBoxes → emissive geçişi sonrası gereksiz mesh'leri temizle

- [ ] **5.3** CSS `backdrop-filter: blur(16px)` performans testi
  - SpeechBubble ve close-btn'de backdrop-filter kullanılıyor
  - GPU compositing overhead — eğer FPS hala düşükse `backdrop-filter` kaldırılabilir
  - Alternatif: Solid semi-transparent background

---

## PHASE 6: Validation & Testing
> **Sub-Agent:** QA & Benchmark  

- [ ] **6.1** Chrome DevTools → Performance tab ile profiling
  - Frame time breakdown: scripting vs rendering vs painting
  - `renderer.info` logla: draw calls, triangles, textures, programs

- [ ] **6.2** FPS testi — her phase sonrası
  - Loading ekranı → Scene geçişi
  - Idle sahne
  - Karakter click → kamera anim
  - Box hover
  - SpeechBubble açık/kapalı

- [ ] **6.3** Mobil test
  - Android Chrome & iOS Safari
  - DPR 0.7 yeterli mi kontrol et
  - Touch etkileşim performansı

---

## Çalışma Sırası (Dependency Graph)

```
PHASE 1 (Lighting)  ──→  PHASE 2 (DPR/Quality)  ──→  PHASE 6 (Test)
         │                         │
         └──→  PHASE 3 (Transitions)  ──→  PHASE 6 (Test)
         
PHASE 4 (Loading)  ──  Bağımsız, paralel yapılabilir
PHASE 5 (Memory)   ──  Bağımsız, paralel yapılabilir
```

> **Not:** Phase 1 önce yapılmalı çünkü DPR artışının performans maliyetini karşılayacak bütçeyi yaratır. Işıkları azaltmadan DPR artırmak FPS'i daha da düşürür.

---

## Özet Hedefler

| Metrik | Şu An | Hedef | Phase |
|--------|-------|-------|-------|
| Aktif ışık | 10 | 3-4 | P1 |
| Desktop DPR | 0.85 | 1.0-1.5 | P2 |
| Mobil DPR | 0.5 | 0.7 | P2 |
| Shadow update | Her frame | 1 kez | P1 |
| Geçiş FPS | 15-25 | 45-55 | P3 |
| İlk render FPS | 20-35 | 55-60 | P1+P2 |
| Bulanıklık | Var | Yok | P2 |
| Bellek sızıntısı | Risk var | Korunmalı | P5 |
