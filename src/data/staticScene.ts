import { SceneConfig } from '../types/scene';

/**
 * Tüm sahne ayarları burada hardcoded.
 * Editor'da ayarları yaptıktan sonra scene-config.json'dan buraya kopyala.
 * Viewer bu dosyadan direkt okur — JSON fetch yok, parse yok, sıfır overhead.
 */
export const STATIC_SCENE: SceneConfig = {
    models: [
        {
            id: "room",
            name: "Room",
            path: "/room_opt.glb",
            visible: true,
            position: [0.2, 0.6, 0],
            rotation: [0, 0, 0],
            scale: [2.2, 2.2, 2.2]
        },
        {
            id: "desk",
            name: "Desk",
            path: "/desk_opt.glb",
            visible: true,
            position: [-0.4262338391111051, 0.004, 0],
            rotation: [0, -1.5707963267948966, 0],
            scale: [1, 1, 1]
        },
        {
            id: "cabinet",
            name: "Cabinet",
            path: "/cabinet_opt.glb",
            visible: true,
            position: [-0.5472904242306201, 0, 0.6674180899125743],
            rotation: [0, 0, 0],
            scale: [0.6, 0.6, 0.6]
        },
        {
            id: "char",
            name: "Character",
            path: "/char_opt.glb",
            visible: true,
            position: [0.16479696103908625, 0.403, 0],
            rotation: [-3.141592653589793, 0, -3.141592653589793],
            scale: [0.8, 0.8, 0.8]
        },
        {
            id: "kutu",
            name: "Kutu (Box)",
            path: "/kutu_opt.glb",
            visible: true,
            position: [1.01, 0.36, -0.5],
            rotation: [0, 0, 0],
            scale: [0.7, 0.7, 0.7]
        },
        {
            id: "writing",
            name: "Writing",
            path: "/writing_opt.glb",
            visible: true,
            position: [0.3, 0.7, -0.9],
            rotation: [0, -1.5707963267948966, 0],
            scale: [1.5, 1.5, 1.5]
        }
    ],
    lighting: {
        ambient: {
            intensity: 1.5,
            color: "#e8e0f0"
        },
        directional: {
            intensity: 2.6,
            position: [-1.5, 20, -9],
            color: "#fff5e6"
        },
        hemisphere: {
            enabled: true,
            skyColor: "#b0c4de",
            groundColor: "#d4a574",
            intensity: 2
        },
        pointLights: [
            {
                id: "accent2",
                name: "Warm Fill",
                enabled: true,
                color: "#ffaa77",
                intensity: 0.9,
                position: [-0.4569468569420777, 0.6704884102875677, 0.3393727497417286],
                distance: 5
            }
        ],
        stripLights: [
            {
                id: "strip_1",
                name: "Neon 1",
                enabled: true,
                color: "#00ffff",
                intensity: 0.6,
                position: [0.2997659504773407, 0.7441381399750612, -0.8751250333802144],
                rotation: [0, 1.5707963267948966, 0],
                scale: [0.01, 0.01, 1.4]
            },
            {
                id: "strip_2",
                name: "Neon 2",
                enabled: true,
                color: "#00ffff",
                intensity: 0.7,
                position: [0.3092344676033943, 1.2360658984512962, -0.8753777511291475],
                rotation: [0, 1.5707963267948966, 0],
                scale: [0.01, 0.015, 1.3]
            },
            {
                id: "strip_3",
                name: "Neon 3",
                enabled: true,
                color: "#00ffff",
                intensity: 2,
                position: [0.9924013650989876, 1.0019396729869459, -0.8749764864805666],
                rotation: [0, 0, 0],
                scale: [0.015, 0.46, 0.01]
            },
            {
                id: "strip_4",
                name: "Neon 4",
                enabled: true,
                color: "#00ffff",
                intensity: 2,
                position: [-0.39586154008719493, 1.00609749021288, -0.8766704679289234],
                rotation: [0, 0, 0],
                scale: [0.01, 0.45, 0.01]
            }
        ],
        boxLights: [
            {
                id: "box_1",
                name: "Box 1 - Green",
                enabled: true,
                color: "#22ff22",
                baseIntensity: 0.1,
                hoverIntensity: 3,
                position: [1.00873912582467, 0.6675430351989381, -0.5433142561866472],
                distance: 1.5
            },
            {
                id: "box_2",
                name: "Box 2 - Orange",
                enabled: true,
                color: "#ffae00",
                baseIntensity: 0.1,
                hoverIntensity: 3,
                position: [0.9992730252003981, 0.5651103870448466, -0.5163043942201044],
                distance: 1.5
            },
            {
                id: "box_3",
                name: "Box 3 - Pink",
                enabled: true,
                color: "#ff24ed",
                baseIntensity: 0.1,
                hoverIntensity: 3,
                position: [1.0246094114486688, 0.4168159070494514, -0.5124193173516794],
                distance: 1.5
            },
            {
                id: "box_4",
                name: "Box 4 - Blue",
                enabled: true,
                color: "#24abff",
                baseIntensity: 0.1,
                hoverIntensity: 3,
                position: [1.0507109877019292, 0.32353206221529135, -0.4667323947349835],
                distance: 1.5
            },
            {
                id: "box_5",
                name: "Box 5 - Yellow",
                enabled: true,
                color: "#fff824",
                baseIntensity: 0.1,
                hoverIntensity: 3,
                position: [1.0144043044552118, 0.1992690414879475, -0.42793465287299637],
                distance: 1.5
            },
            {
                id: "box_6",
                name: "Box 6 - Purple",
                enabled: true,
                color: "#a600ff",
                baseIntensity: 0.1,
                hoverIntensity: 3,
                position: [1.0561360957029498, 0.0821728716303946, -0.43535595204178246],
                distance: 1.5
            }
        ]
    },
    camera: {
        position: [2.5, 2.8, 3]
    }
};
