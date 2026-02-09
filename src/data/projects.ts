import type { ProjectData } from '../components/ProjectPopup';

/**
 * 6 proje — kutu renkleriyle eşleşen, CV'den alınmış veriler.
 * box_1..box_6 ID'leri staticScene.ts'teki BoxLightConfig ID'leriyle eşleşir.
 */
export const PROJECTS: ProjectData[] = [
    {
        id: 'xr-showroom',
        boxId: 'box_1',
        title: 'Digital Showroom XR Ecosystem',
        description:
            'Unreal Engine + C++ ile masaüstü/VR simülasyonu, Three.js + Next.js ile web tabanlı 3D editör, WebXR ile AR/VR deneyimi ve bakışla etkileşimli panoramik tur motoru. Dört farklı platformda çalışan senkronize bir sistem.',
        technologies: ['Unreal Engine', 'C++', 'Three.js', 'Next.js', 'WebXR'],
        color: '#22ff22',
    },
    {
        id: 'sayistay-ai',
        boxId: 'box_2',
        title: 'Sayıştay Denetim Analiz & Karar Destek',
        description:
            'Sayıştay raporları üzerinde çalışan çok katmanlı AI sistemi. OCR entegrasyonu, vektör tabanlı indeksleme ve MCP (Model Context Protocol) ile modelin dış veri kaynaklarına güvenli erişimi.',
        technologies: ['OCR', 'RAG', 'MCP', 'Vektör DB', 'LLM'],
        color: '#ffae00',
    },
    {
        id: 'talep-ai',
        boxId: 'box_3',
        title: 'Talep AI: Mahalle Odaklı Karar Destek',
        description:
            'Vatandaş taleplerini analiz ederek yerel yönetimlere stratejik aksiyon önerileri üreten platform. Farklı LLM modelleri API üzerinden entegre, MapLibre/GIS tabanlı hibrit mimari.',
        technologies: ['LLM API', 'MapLibre', 'GIS', 'AI', 'PostGIS'],
        color: '#ff24ed',
    },
    {
        id: 'gezelim',
        boxId: 'box_4',
        title: 'Gezelim App: Akıllı Seyahat',
        description:
            'Google POI verilerinin AI süzgecinden geçirilmesi, dinamik rota oluşturma ve oyunlaştırma elementleri içeren akıllı seyahat uygulaması. Lokasyon bazlı, veri mühendisliği ağırlıklı bir mobil rehber.',
        technologies: ['Data Cleaning', 'AI', 'Gamification', 'Routing'],
        color: '#24abff',
    },
    {
        id: 'mosfet-cnn',
        boxId: 'box_5',
        title: 'AI Destekli MOSFET Yükselteç Tasarımı',
        description:
            'Analog devre tasarım parametrelerini optimize eden bir CNN modeli. Yapay zeka ile devre simülasyonu otomatize edilmiş — donanım ve yazılımı birleştiren nadir projelerden.',
        technologies: ['CNN', 'LTspice', 'Circuit Simulation', 'Python'],
        color: '#fff824',
    },
    {
        id: 'rl-game',
        boxId: 'box_6',
        title: 'AI Stratejik Masa Oyunu',
        description:
            'Pekiştirmeli öğrenme ile stratejik kararlar alan bir AI ajanı. Q-Learning algoritması, React tabanlı web arayüzüyle entegre. "Öğrenmeyi öğrenen" sistemlere olan ilginin ürünü.',
        technologies: ['Q-Learning', 'Reinforcement Learning', 'React'],
        color: '#a600ff',
    },
];

/** boxId'ye göre hızlı erişim */
export function getProjectByBoxId(boxId: string): ProjectData | null {
    return PROJECTS.find((p) => p.boxId === boxId) ?? null;
}
