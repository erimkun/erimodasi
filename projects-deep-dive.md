# Proje Teknik Detayları ve Mimari Analizler 

Bu belge, Erden Erim'in portfolyosunda yer alan projelerin yüzeysel tanımlarının ötesine geçerek, karşılaşılan mühendislik zorluklarını, bellek yönetimini ve arka planda çalışan mimari zekayı asistanın kavrayabilmesi için tasarlanmıştır.

## 1. PanoTour 360

PanoTour 360, standart boyutları oldukça yüksek olan (4K-8K) panoramik görsellerin, özellikle mobil tarayıcılarda donanım sınırlarına çarpmadan VR (Sanal Gerçeklik) ortamında akıcı şekilde gösterilebilmesi için optimize edilmiş web tabanlı bir Sanal Tur platformudur.

### 1.1. İkili Motor Yaklaşımı ve Mimari (Dual-Engine Architecture)
Platform, donanım kaynaklarını en verimli şekilde kullanmak amacıyla ortam farkındalığına sahip iki farklı render mekanizması kullanır:
*   **2D (Web/PC/Standart Mobil):** Performans ve uyumluluk açısından standart bir araç olan **Pannellum** motoru kullanılır.
*   **WebXR / VR Modu (Three.js):** VR gözlükleri ve Cardboard deneyimi için sıfırdan inşa edilmiş özel bir **Three.js (`XRSceneManager`, `XRPanoramaViewer`)** altyapısı devreye girer. Ayrıca kullanıcının baş hareketleriyle etkileşime girebilmesi için özel olarak kodlanmış bir `GazeController` (bakış odaklı etkileşim) çalışır.

### 1.2. Bellek Yönetimi (Garbage Collection & OOM Önleme)
Mobile Safari ve Chrome gibi bellek limitleri katı olan tarayıcılarda Out of Memory (OOM) kaynaklı çökmeleri önlemek için kritik çözümler uygulanmıştır:
*   Büyük WebP ve PNG texture'ların referansları, mekân geçişlerinde aktif olarak temizlenir.
*   Pannellum instance'ları değiştirildiğinde `destroy()`, Three.js VR instance'ları kapatıldığında `manager.dispose()` ve `renderer.dispose()` methodları manuel olarak tetiklenerek GPU belleğinin (VRAM) şişmesi engellenir.

### 1.3. Veri ve Kod İzolasyonu (Infrastructure Isolation)
*   **Dinamik ZIP İşleme:** İçerik yüklemeleri sırasında ZIP dosyaları doğrudan `JSZip` ile arka planda parse edilerek `config.json`, görseller ve ses dosyaları otomatik olarak projeye entegre edilir.
*   **Storage İzolasyonu:** Eskiden doğrudan proje dizinine (`public/projects`) yapılan yüklemeler, sunucu deploy işlemlerindeki (CI/CD) veri kayıplarını önlemek adına tamamen izole edilmiştir. Ortam değişkenleri (`PROJECTS_STORAGE_PATH`) aracılığıyla self-hosted sunucularda ayrı bir veri dizinine veya **Vercel Blob Storage** üzerine yazdırılarak asıl uygulama kodu ile kullanıcı verisi birbirinden ayrılmıştır.

### 1.4. VR Konfigürasyon ve Fallback Sistemi
VR cihazlarının sınırlı işlem kapasitesini korumak için `VRConfig` mekanizması yazılmıştır. Bir sahnede yer alan ve performansı yorabilecek tüm hotspot'ların VR'da render edilmesi mantıksız olacağından; sistem PC/Mobil konfigürasyonundan ayrı olarak "yalnızca VR'da görünecekler" (`visibleScenes`, `hotspotOverrides`) haritası çıkararak gereksiz poligon harcamasının önüne geçer.

## 2. Immersive AR (WebXR Gayrimenkul Görüntüleme Platformu)

Immersive AR, emlak ve mimari sektörleri için geliştirilmiş, iOS ve Android platformlarında web üzerinden uygulama kurmadan yüksek kaliteli 3 boyutlu ve AR deneyimler sunan yenilikçi bir webapp'tir. Bu projede, çok büyük dosya boyutlarına ulaşabilen binaların ve mimari modellerin mobil cihazlarda donmadan gerçek zamanlı çalıştırılabilmesi için derin donanım ve yazılım optimizasyonları kullanılmıştır.

### 2.1. Hibrit Modüllü Gösterim: Dış Mekan ve İç Mekan 
Proje, tek bir çatı altında iki ayrı deneyim motorunu barındırmaktadır:
*   **Dış Mekan (Exterior AR):** `Google <model-viewer>` kullanılarak, kullanıcıların yüksek kaliteli dış mekan maketlerini zemin algılamayla masanın üzerine (Tabletop AR) yansıtmasına olanak tanır.
*   **İç Mekan (Interior 360):** Saf Three.js kullanılarak sıfırdan yazılmış 360 Derece Panoramik Tur modülüdür. 

### 2.2. Agresif Sıkıştırma ve USDZ 40MB Kotası Stratejisi
Saf mimari üretim araçlarından çıkan aşırı yüksek poligonlu (high-poly) yapıların donanımsız mobil Safari'de çalıştırılabilmesi için çok katı bir sıkıştırma pipeline'ı uygulanmıştır:
*   **Blender ve gltf-transform:** Objeler öncelikle Blender'da manuel poligon düşürme işlemlerinden geçirilmiş, daha sonrasında CLI üzerinden `gltf-transform` yardımıyla draw-call düşürme, WebP texture kompresyonu ve Draco Mesh sıkıştırması kullanılarak objeler web için minimum boyuta çekilmiştir.
*   **Apple USDZ Engeli ve Docker Pipeline:** iOS tarafında WebXR tam standart desteklemediği için Native "Quick Look" yapısı hedeflenmiştir. Quick Look'ta Draco desteklenmediği ve 40MB sınırları bulunduğu için; optimize edilen dosyalar Draco'dan çıkartılıp (texture'lar da çözülerek) Docker üzerinden çalışan `leon/usd-from-gltf` repolarıyla uyumlu bir formata çevrilerek iOS stabilizasyonu yakalanmıştır.

### 2.3. Ayrıştırılmış Yükleme (iOS vs Android) ve Preload Sistemi
Kod bazında gereksiz internet trafiğinin ve VRAM şişmesinin önüne geçmek için Platform spesifik davranılmıştır. `isIOS()` tespitiyle; `ios-src=` kullanılarak Apple cihazlara `.usdz`, Android cihazlara ise `.glb` dosyası feed edilmiştir. Geçişler sırasındaki donmaları önlemek adına bu Asset'ler arka planda Fetch ile cache'e çekilmiş (`preloadARAssets(url)`) ve deneyim kayıpsız hale getirilmiştir.

### 2.4. Jiroskop (DeviceOrientation) ve CSS ViewCone Senkronizasyonu
Kullanıcının odanın içindeymişçesine hissetmesi için mobil ivmeölçer ve pusula entegrasyonu yazılmıştır:
*   **Pusula-Sensor Çakışması Engelleme:** iOS cihazlarda `webkitCompassHeading` (Saat yönü), Android cihazlarda ise ivmeölçeri zıt okuyan `alpha` verisi baz alınarak, yumuşatılmış interpolasyonlar (lerp) ile kusursuz bir kamera rotasyon aktarımı oluşturulmuştur. iOS 13+ sonrası için eklenen güvenlik sınırlamalarına karşı kullanıcıya özel bir İzin İsteme ekranı oluşturulmuştur.
*   **Gerçek Zamanlı Harita ve HUD:** Kullanıcının hangi yöne baktığını anlaması için haritada yer alan nokta (`user-marker`) ve bakış açısı ibresi (`view-cone`); `Three.js` içindeki kamera Longitude değeri ile matematiksel olarak hesaplanmış, `CSS rotate()` özelliğiyle performansı düşürmeyecek şekilde saniyede 60 frame tetiklenerek kusursuz HUD entegrasyonu tamamlanmıştır.

## 3. Ganged Reality (3D İnteraktif İçerik Yönetim Sistemi - CMS)

Ganged Reality, web üzerinde 3 boyutlu ortamların kod yazmadan oluşturulmasını, yönetilmesini ve yayınlanmasını sağlayan tam kapsamlı bir 3D İçerik Yönetim Sistemi'dir (CMS). React ve Three.js tabanlı, hem runtime (izleyici/oyuncu) hem de yüksek yetenekli bir "Editor" sunan büyük ölçekli bir mimari projesidir.

### 3.1. Modüler Veri Mimarisi ve Ayrıştırılmış JSON Yapısı
Büyük 3D sahnelerin state yönetimini ve yükleme sürelerini optimize etmek için geleneksel "tek bir devasa JSON dosyası" yaklaşımı yerine **ayrıştırılmış dosya sistemi** kullanılmıştır:
*   **`project.json`**: Uygulama meta verilerini ve `glb` dosyalarının yollarını tutar.
*   **`scene.json`**: Sahnedeki dinamik ışıklandırmaları (Hemisphere, Directional) ve Environment (HDRi) ayarlarını barındırır.
*   **`hotspots.json` & `interactions.json`**: Bilgi noktaları ve kullanıcı modele yaklaştığında (First Person kamerasında) tetiklenen pop-up (proximity-trigger) bölgelerini içerir.
*   **`variants.json`**: E-Ticaret / Showroom deneyimleri için kullanıcıların bir tıklamayla duvar/zemin kaplamalarını ve materyal renklerini değiştirdiği varyasyon eşlemelerini tutar.

### 3.2. Teknolojik Stack ve State Senkronizasyonu (Zustand & R3F)
*   **Vite + React (TypeScript):** SSR odaklı Next.js yerine, sistemin %90'ı Client-Side çalışan bir WebGL projesi olduğu için ultra hızlı build alan Vite tercih edilmiştir.
*   **Zustand:** Editör modundaki ağır veri değişiklikleri ve Undo/Redo (Geri Al/İleri Al) işlemleri `zundo` middleware kullanılarak Zustand üzerinden sağlanır. Three.js Render loop'unu yavaşlatan Context API'nin engelleri Zustand'in lightweight yapısıyla aşılmıştır.
*   **React Three Fiber (R3F) & Drei:** Komplike 3D canvas olayları (Transform Gizmo'ları, kameralar, loader'lar) R3F yapısı kullanılarak React'ın declarative component ağacına bağlanarak kontrol edilmiştir.

### 3.3. Runtime (Oynatıcı) Modları
Projede yetkilendirme ve izleme üzerine 3 ana mekanizma vardır:
*   **Viewer Modu (Orbit):** Standart model incelemesi. Serbest dönüş kamerası ve ekranın sağından açılan Materyal/Varyasyon menüsü bulundurur.
*   **Player Modu (First Person):** Etkileşimli bir simülasyon. WASD ve mouse look yardımıyla kullanıcının modeli birinci şahıs açısından gezemesine ve belirli objelere yaklaşarak (Interaction Zones) teknik detay popup'ları tetiklemesine imkan tanır.
*   **Editor Modu (CMS):** Işıkların yönünün değiştirildiği, modelin güncellendiği, varyantların atandığı şifre korumalı admin paneli.

### 3.4. Dinamik İhracat (Client-Side ZIP Export Sistemi)
Projenin en yenilikçi yanlarından biri de tarayıcı içinde çalışan dışa aktarım (Export) sistemidir. `zipExporter.ts` servisi; 
Kullanıcı "Projeyi Dışa Aktar" dediği anda, *live* sistem State'ini (`Zustand`) bozmamak adına state'i derinlemesine klonlar (`JSON.parse(JSON.stringify)`). Sonrasında `JSZip` kullanarak statik bir web sitesi veya klasörü yapısını (klasörler, texture'lar, model dosyaları, ayrılmış JSON configleri) dinamik şekilde RAM'de inşaa ederek kullanıcıya tek bir `.zip` arşivi olarak indirtir. Ayrıca Backend (Node.js/Express) entegrasyonuyla sunucu diskinde saklanan veri aynı mantıkla `POST /publish` üzerinden Zip ile de güncellenebilmektedir.
