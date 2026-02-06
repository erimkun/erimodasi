import { ModelConfig } from '../types/scene';

export const STATIC_MODELS: ModelConfig[] = [
    {
        id: "room",
        name: "Room",
        path: "/room_opt.glb",
        visible: true,
        position: [
            0.2,
            0.6,
            0
        ],
        rotation: [
            0,
            0,
            0
        ],
        scale: [
            2.2,
            2.2,
            2.2
        ]
    },
    {
        id: "desk",
        name: "Desk",
        path: "/desk_opt.glb",
        visible: true,
        position: [
            -0.4262338391111051,
            0.004,
            0
        ],
        rotation: [
            0,
            -1.5707963267948966,
            0
        ],
        scale: [
            1,
            1,
            1
        ]
    },
    {
        id: "cabinet",
        name: "Cabinet",
        path: "/cabinet_opt.glb",
        visible: true,
        position: [
            -0.5472904242306201,
            0,
            0.6674180899125743
        ],
        rotation: [
            0,
            0,
            0
        ],
        scale: [
            0.6,
            0.6,
            0.6
        ]
    },
    {
        id: "char",
        name: "Character",
        path: "/char_opt.glb",
        visible: true,
        position: [
            0.16479696103908625,
            0.403,
            0
        ],
        rotation: [
            -3.141592653589793,
            0,
            -3.141592653589793
        ],
        scale: [
            0.8,
            0.8,
            0.8
        ]
    },
    {
        id: "kutu",
        name: "Kutu (Box)",
        path: "/kutu_opt.glb",
        visible: true,
        position: [
            1.01,
            0.36,
            -0.5
        ],
        rotation: [
            0,
            0,
            0
        ],
        scale: [
            0.7,
            0.7,
            0.7
        ]
    },
    {
        id: "writing",
        name: "Writing",
        path: "/writing_opt.glb",
        visible: true,
        position: [
            0.3,
            0.7,
            -0.9
        ],
        rotation: [
            0,
            -1.5707963267948966,
            0
        ],
        scale: [
            1.5,
            1.5,
            1.5
        ]
    }
];
