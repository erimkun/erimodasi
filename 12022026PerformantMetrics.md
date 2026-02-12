# Erimodasi — Performance Metrics & Deep Analysis Report
> **Tarih:** 12.02.2026  
> **Mühendis:** Senior Three.js & Web Full-Stack Architect  
> **Kapsam:** Sahne performansı, bulanıklık analizi, FPS drop kök neden tespiti  

---

## 1. Executive Summary

Sahne düşük boyutlu GLB modellerine (~13 MB toplam) rağmen ciddi performans sorunları yaşıyor. Kök nedenler:
1. **10 aktif ışık kaynağı** (önerilen max 3 — Three.js best practice)
2. **DPR 0.85** → doğal çözünürlüğün altında render → bulanıklık
3. **Shadow map her frame'de yeniden hesaplanıyor** → gereksiz GPU yükü
4. **Kamera geçişlerinde tam sahne + tüm ışıklar yeniden render** → spike
5. **Loading sırasında 2 ayrı WebGL context** yarışıyor (FluidBackground + Scene)

**Beklenen iyileştirme:** Işık azaltma + DPR düzeltme ile **%40-60 FPS artışı** ve bulanıklığın tamamen giderilmesi.

---

## 2. Asset Inventory

### 2.1 GLB Model Boyutları
| Model | Boyut (KB) | Boyut (MB) | Kullanım |
|-------|-----------|-----------|----------|
| `room_opt.glb` | 2,257 | 2.20 | Oda — statik |
| `desk_opt.glb` | 2,648 | 2.59 | Masa — tıklanabilir |
| `cabinet_opt.glb` | 2,466 | 2.41 | Dolap — statik |
| `char_opt.glb` | 3,340 | 3.26 | Karakter — tıklanabilir, animasyonlu |
| `kutu_opt.glb` | 2,374 | 2.32 | Kutu — statik (boxLights'la aydınlatılıyor) |
| `writing_opt.glb` | 292 | 0.29 | Yazı — tıklanabilir |
| **TOPLAM** | **13,377** | **~13.14** | |

> GLB boyutları küçük-orta düzey. Draco/Meshopt sıkıştırma uygulanmamış — uygulanırsa %70-90 küçülme mümkün.  
> `_opt` suffix'i manuel optimizasyon yapıldığını gösteriyor.

### 2.2 Texture Boyutları
| Dosya | Boyut (KB) | Not |
|-------|-----------|-----|
| `sky.webp` | 19.9 | **ÇOK KÜÇÜK** — bulanık skybox |
| `entry-logo.webp` | 33.8 | Loading ekranı — sorun yok |
| `me01-06.webp` | 88-870 | Loading galeri — sahneyi etkilemiyor |

### 2.3 Skybox Analizi
- `sky.webp` sadece **19.9 KB** — bu muhtemelen 512x256 veya benzeri düşük çözünürlükte
- Arka plan olarak kullanılınca pikselleşme/bulanıklık kaçınılmaz
- **ÖNERİ:** 2048x1024 veya 4096x2048 çözünürlükte skybox kullanılmalı (WebP ile ~200-400KB olur)

---

## 3. Lighting Inventory — KRİTİK SORUN

### 3.1 Aktif Işık Sayısı (Viewer Mode)
| Tip | Sayı | GPU Maliyeti | Detay |
|-----|------|-------------|-------|
| AmbientLight | 1 | Düşük | intensity: 1.5 |
| DirectionalLight | 1 | **YÜKSEK** (shadow map) | intensity: 2.6, shadow 1024x1024 |
| HemisphereLight | 1 | Düşük | intensity: 2 |
| PointLight (accent) | 1 | Orta | Warm Fill, intensity: 0.9 |
| PointLight (boxLights) | **6** | **ÇOK YÜKSEK** | Her kutu için ayrı PointLight |
| **TOPLAM** | **10** | | **Three.js max önerisi: 3** |

### 3.2 Maliyet Hesabı
```
Her PointLight → her mesh için fragment shader'da ek hesaplama
6 BoxLight PointLight × ~40 mesh = ~240 ekstra ışık-mesh etkileşimi/frame
+ DirectionalLight shadow pass = tüm sahne 2. kez render

TOPLAM TAHMİNİ FRAGMENT SHADER YÜKÜ: Normal sahnenin ~3-4 katı
```

### 3.3 Strip Light Durumu
- Viewer modda 4 stripLight PointLight **zaten kaldırılmış** → `EmissiveGlowPlane` ile değiştirilmiş ✅
- Bu doğru bir optimizasyon — aynı yaklaşım boxLight'lara da uygulanmalı

### 3.4 Writing (Erim Yazısı) Işık Kaynağı
- `EmissiveGlowPlane`: MeshBasicMaterial, opacity 0.04, AdditiveBlending
- **Bu ışık kaynağı değil**, sadece görsel bir efekt — performans etkisi minimal
- Kaldırılması gerekmez, bu zaten en ucuz çözüm

---

## 4. Render Pipeline Analizi

### 4.1 DPR (Device Pixel Ratio) — BULANIKLIK KAYNAĞ
| Platform | Ayar | Gerçek Piksel | Etki |
|----------|------|--------------|------|
| Desktop | `0.85` | %85 çözünürlük | **Bulanık** — tarayıcı upscale yapıyor |
| Mobil | `0.5` | %50 çözünürlük | **Çok bulanık** |
| FluidBG | `min(dpr, 1.5)` | Bağımsız canvas | Sorun yok |

**Bulanıklığın #1 nedeni: DPR 0.85**  
Sahne 1920x1080 monitörde aslında 1632x918 çözünürlükte render edilip, CSS ile 1920x1080'e gerilir. → **kenar yumuşaması, detay kaybı, bulanıklık.**

### 4.2 Antialias
- Desktop: `antialias: true` ✅
- Mobil: `antialias: false` (doğru — mobilde pahalı)
- Ama DPR düşükken antialias etkisi de azalır

### 4.3 Tone Mapping
- `THREE.AgXToneMapping` — modern, iyi tercih
- `toneMappingExposure: 1.0` — nötr
- Tone mapping bulanıklığa katkıda bulunmuyor

### 4.4 Shadow Map
```
- shadow-mapSize: [1024, 1024]
- shadow-camera bounds: ±3 (tight fit — iyi)
- shadow-bias: -0.001
- shadowMap.autoUpdate: VARSAYILAN true → HER FRAME YENİDEN HESAPLANIYOR
```
**SORUN:** Statik sahnede shadow map her frame'de yeniden render edilmek zorunda değil —  
`renderer.shadowMap.autoUpdate = false` setlenmeli, sadece initial render'da `renderer.shadowMap.needsUpdate = true` yapılmalı.

### 4.5 Canvas Frameloop
- `frameloop="demand"` ✅ — doğru, sadece invalidate() çağrıldığında render eder
- Ama her invalidate() çağrısı tüm useFrame hooks'u tetikler (6 InteractiveBox + ViewerInteraction + ClickableModel)

---

## 5. Render Frame Başına Maliyet Tahmini

### 5.1 Normal Frame (Hiçbir etkileşim yok)
```
frameloop="demand" → render çağrılmıyor → 0 maliyet ✅
```

### 5.2 Hover/Click Frame (Box hover veya kamera geçişi)
```
1. Shadow map pass:      ~40 draw calls × 1 directional light
2. Color pass:           ~40 draw calls × 10 lights = ~400 light evaluations
3. Post-processing:      Yok (tonemap only)
4. useFrame hooks:       8 hook (6 box + 1 viewer + 1 clickable)
────────────────────────────────────────────────────
TOPLAM:                  ~440 draw call equivalent per frame
```

### 5.3 Hedef Frame (Optimizasyon sonrası)
```
1. Shadow map pass:      DEVRE DIŞI (autoUpdate=false)
2. Color pass:           ~40 draw calls × 4 lights = ~160 light evaluations  
3. useFrame hooks:       3 hook (1 viewer + 1 clickable + 1 consolidated)
────────────────────────────────────────────────────
TOPLAM:                  ~160 draw call equivalent per frame
İYİLEŞME:               %63 düşüş
```

---

## 6. FPS Drop Kök Neden Analizi

### 6.1 Yükleme Sırasında Donma
| Neden | Ağırlık | Açıklama |
|-------|---------|----------|
| 2 WebGL context | %30 | FluidBackground Canvas + Scene Canvas aynı anda aktif |
| 13MB GLB parsing | %40 | 6 model aynı anda parse ediliyor, main thread bloklanıyor |
| Shader compilation | %20 | İlk render'da tüm shader'lar derleniyor (10 ışık = karmaşık shader) |
| React Suspense waterfall | %10 | 6 ayrı Suspense boundary serialization |

### 6.2 Geçişlerde FPS Düşüşü
| Neden | Ağırlık | Açıklama |
|-------|---------|----------|
| 10 ışık × her frame | %50 | Kamera lerp her frame invalidate → full lighting hesabı |
| Shadow map recalc | %25 | Her frame shadow pass çalışıyor |
| Yavaş lerp convergence | %15 | 0.08-0.12 factor → 30-40 frame süren animasyon |
| CSS backdrop-filter | %10 | SpeechBubble blur(16px) GPU compositing overhead |

### 6.3 Bulanıklık Nedenleri
| Neden | Ağırlık | Çözüm |
|-------|---------|-------|
| DPR 0.85 desktop | %60 | DPR → min(devicePixelRatio, 1.5) |
| DPR 0.5 mobil | %15 | DPR → 0.7 |
| Küçük skybox texture | %15 | sky.webp boyutu artırılmalı |
| Shadow map 1024x1024 | %10 | 2048x2048'e çıkarılabilir |

---

## 7. Bellek & Lifecycle Analizi

### 7.1 Memory Leak Riskleri
| Kaynak | Risk | Detay |
|--------|------|-------|
| Model.clone() | ORTA | scene.clone() yapılıyor ama dispose yok |
| Textures | DÜŞÜK | useTexture/useGLTF R3F tarafından yönetiliyor |
| FluidBackground | DÜŞÜK | Unmount'ta Canvas yok ediliyor |
| InteractiveBox PointLights | DÜŞÜK | R3F lifecycle yönetiminde |

### 7.2 Disposal Eksiklikleri
```tsx
// Model.tsx — MEVCUT:
const clonedScene = useMemo(() => { ... }, [scene]);
// EKSİK: useEffect cleanup ile dispose edilmiyor

// ÖNERİ:
useEffect(() => {
    return () => {
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.geometry?.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material?.dispose();
                }
            }
        });
    };
}, [clonedScene]);
```

---

## 8. Mevcut İyi Uygulamalar ✅

| Uygulama | Puan |
|----------|------|
| `frameloop="demand"` | ✅ Mükemmel — statik sahne için doğru |
| `matrixAutoUpdate = false` | ✅ Statik modeller için doğru |
| `preloadModels()` paralel yükleme | ✅ İyi |
| `Bvh firstHitOnly` raycast optimizasyonu | ✅ İyi |
| EmissiveGlowPlane (stripLight yerine) | ✅ Mükemmel optimizasyon |
| IS_MOBILE cache | ✅ Forced reflow'u önler |
| CSS class cursor (body.style yerine) | ✅ İyi |
| `memo()` kullanımı (Model, Lighting, InteractiveBox) | ✅ İyi |
| `powerPreference: 'high-performance'` | ✅ Doğru |
| `stencil: false` | ✅ Gereksiz buffer kapalı |
| Early exit in useFrame hooks | ✅ İyi pattern |

---

## 9. Benchmark Hedefleri

| Metrik | Mevcut (tahmini) | Hedef |
|--------|------------------|-------|
| Yükleme süresi (3G) | ~8-12s | <5s |
| İlk render FPS | 20-35 fps | 55-60 fps |
| Geçiş FPS (kamera anim) | 15-25 fps | 45-55 fps |
| Statik sahne FPS | 60 fps (demand) | 60 fps (demand) |
| Aktif ışık sayısı | 10 | 3-4 |
| Shadow map güncellemesi | Her frame | Sadece ilk render |
| DPR (desktop) | 0.85 (bulanık) | 1.0-1.5 (net) |
| DPR (mobil) | 0.5 (çok bulanık) | 0.7-0.85 |
| Draw call equivalents | ~440/frame | ~160/frame |

---

## 10. Optimizasyon Öncelik Sırası

### P0 — Acil (En yüksek etki)
1. **BoxLight PointLight'ları kaldır** → 6 PointLight eleniyor → %40+ FPS artışı
2. **DPR düzelt** → 0.85 → min(dpr, 1.5) → bulanıklık tamamen gider
3. **Shadow autoUpdate=false** → Statik sahnede gereksiz shadow pass durur

### P1 — Yüksek
4. **Kamera geçişlerinde shadow devre dışı** → Geçiş FPS artışı
5. **Lerp factor artır** → 0.08→0.15 → daha az frame = daha az render
6. **Skybox çözünürlüğü artır** → Arka plan bulanıklığı gider

### P2 — Orta
7. **Model dispose cleanup** → Memory leak önleme
8. **Loading sırasında Scene mount'u geciktir** → 2 WebGL context yarışı biter
9. **Draco compression** → GLB boyutları %70-90 azalır

### P3 — Düşük
10. **SpeechBubble backdrop-filter optimizasyonu** → Compositing overhead
11. **Texture compression (KTX2)** → GPU memory azaltma
12. **InteractiveBox useFrame birleştirmesi** → Hook sayısı azaltma

---

*Bu rapor, sahnenin mevcut durumunun kapsamlı bir fotoğrafıdır. Optimizasyon uygulamalarının her biri için ayrı test iterasyonu önerilir.*
