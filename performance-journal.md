# Performance Journal

Bu dosya, FPS loglarından çıkan metrikleri, denenen optimizasyonları ve sonuçlarını tek yerde tutar.

## Ortam

- Tarayıcı: Chrome Incognito
- Cihaz: RX 590 Nitro+ / Ryzen 5 2500 / 16 GB RAM
- Ölçüm aracı: `FpsLogger` (`F` başlat/durdur, `L` JSON indir)

## Log Karşılaştırması

| Log | Started At | Avg FPS | 1% Low | Min FPS | Freeze Count | Worst Freeze (ms) | Worst Bucket Avg |
|---|---|---:|---:|---:|---:|---:|---:|
| `fps-log-session-2026-02-16T20-01-01-396Z.json` | 2026-02-16T19:59:39.986Z | 73.21 | 14.99 | 0.36 | 8 | 2801.0 | 37.17 |
| `fps-log-session-2026-02-16T20-27-11-119Z.json` | 2026-02-16T20:26:25.584Z | 73.05 | 10.72 | 0.59 | 17 | 1707.5 | 30.14 |
| `2339.json` | 2026-02-16T20:37:00.298Z | 72.82 | 3.95 | 1.56 | 79 | 640.3 | 2.92 |
| `2345.json` | 2026-02-16T20:44:16.434Z | 70.02 | 6.25 | 0.08 | 38 | 12670.6 | 4.68 |

## Denenenler ve Durum

### ✅ Kalıcı tutulanlar

- FPS logger eklendi (`F` + `L`) ve JSON dışa aktarım açık.
- Viewer loading sırasında canvas `1px` hack kaldırıldı (yeniden derleme/resize etkisini azaltmak için).
- Loading ekranında mobilde WebGL fluid kapatıldı.
- Model tarafında clone/dispose akışı daha güvenli hale getirildi.

### ❌ Geri alınanlar (regression)

- Agresif `gl.compile(scene, camera)` warmup: bazı oturumlarda uzun tek-frame blokları artırdı.
- Adaptif BVH denemesi: testlerde donma artışı görüldüğü için kapatıldı.
- Etkileşim anında geçici kalite düşürme (`DPR` düşür + shadow kapat): görüntüyü bozdu, donmayı çözmedi; kaldırıldı.

## Commit Geçmişi (performans odaklı)

- `2ef7abf` `perf: add FPS logger and optimize scene/mobile rendering`
- `72f0de1` `perf: reduce interaction hitches with warmup, adaptive BVH, idle UI`
- `159a6f5` `fix: rollback aggressive warmup and disable BVH to avoid freezes`

## Kök Neden Hipotezleri

1. Interaction anında ana thread long-task (kamera + popup/state + render state değişimleri çakışıyor).
2. Shader/material varyant geçişleri ve texture upload patlamaları.
3. Kısa aralıklarla GC veya layout/paint tetiklenmesi.

## Sol-Click Rotate Sırasında Çalışan İşler (Mevcut Kod Akışı)

Bu liste, Viewer modunda sol-click ile kamerayı döndürürken devreye giren işlerin teknik sırasıdır:

1. `OrbitControls` pointer/mouse event alır ve kamera açısını günceller (`enableDamping=true`, `dampingFactor=0.1`).
2. Kontrol değiştiği için `@react-three/fiber` tarafında `invalidate()` tetiklenir (`Canvas frameloop="demand"` olduğu için her hareket frame üretir).
3. Üretilen her frame’de Three.js render pipeline tekrar çalışır:
  - kamera matrisi güncellenir,
  - görünür objeler için draw call hazırlanır,
  - ışık/shadow durumuna göre pass çalışır,
  - arka plan `sky.webp` sample edilir.
4. `useFrame` callback’leri çalışır:
  - `ShadowFreeze` her frame çağrılır ama ilk frame sonrası hızlıca `done` ile çıkar,
  - `ClickableModel` yalnızca `isFocused` animasyon aktifse döndürme lerp’i yapar,
  - `ViewerInteraction` yalnızca model focus geçişinde aktif animasyon yapar; normal rotate’ta çoğunlukla erken çıkar.
5. Raycast/event tarafı: pointer hareketlerinde hover alanları olan mesh’lerde event kontrolü yapılır (char/desk/writing grupları, box hitboxları).
6. React tarafında normal rotate sırasında store/state güncellemesi beklenmez; CPU yükünün ana kısmı render + kontrol güncellemesinden gelir.

Not: Mevcut loglara göre donma, sadece GPU doldurma değil; aralıklı uzun ana-thread blokları da var (özellikle `2345.json` içinde `dtMs=12670.6`).

## Sonraki Teknik Adımlar

1. `PerformanceObserver('longtask')` ile FPS drop anına marker bağlamak.
2. Interaction sırasında yalnızca zorunlu state güncellemek, ikincil UI güncellemelerini idle’a almak.
3. Asset pipeline iyileştirmesi (KTX2 + meshopt/draco + texture budget).
4. `OrbitControls` damping’i cihaz bazlı düşürmek/kapatmak ve karşılaştırmalı ölçüm yapmak.
5. Her değişiklikten sonra aynı senaryoda tekrar log alıp tabloyu güncellemek.

## Çalışma Kuralı

- Kod değişikliği sonrası doğrulama (`npm run build`) geçince doğrudan push yapılır.
- Performans etkisi olan her turda yeni JSON log alınır ve bu dosyaya işlenir.
