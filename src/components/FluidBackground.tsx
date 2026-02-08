import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const FluidShader = {
    uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uColor: { value: new THREE.Color(0.2, 0.4, 0.8) }, // Fallback color
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      float time = uTime * 0.15; // Slowed down slightly

      // Simplified Domain warping (2 layers instead of 3)
      float n1 = snoise(uv * 3.0 + vec2(time * 0.5, time * 0.2));
      float n2 = snoise(uv * 6.0 + vec2(time, time * 0.8) + n1);
      // Removed 3rd noise layer for performance

      // Mix colors based on noise
      vec3 color1 = vec3(0.0, 0.0, 0.0); // Black background
      vec3 color2 = vec3(0.1, 0.1, 0.6); // Deep Blue
      vec3 color3 = vec3(0.5, 0.0, 0.5); // Purple neon
      vec3 color4 = vec3(0.0, 0.8, 0.8); // Cyan

      float mix1 = smoothstep(-1.0, 1.0, n1);
      float mix2 = smoothstep(-1.0, 1.0, n2);

      vec3 finalColor = mix(color1, color2, mix1);
      finalColor = mix(finalColor, color3, mix2 * 0.8);
      // Simplified mixing
      finalColor = mix(finalColor, color4, mix2 * 0.3); // Reuse mix2 for slight cyan tint

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

function FullScreenQuad() {
    const mesh = useRef<THREE.Mesh>(null);
    const { size, viewport } = useThree();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }),
        []
    );

    useFrame((state) => {
        if (mesh.current) {
            // @ts-ignore
            mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                attach="material"
                args={[FluidShader]}
                uniforms={uniforms}
                transparent={true}
            />
        </mesh>
    );
}

export const FluidBackground = () => {
    return (
        <div className="fluid-bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            {/* Using gl prop for performance - antialias off saved GPU work */}
            <Canvas
                camera={{ position: [0, 0, 1] }}
                gl={{ antialias: false, powerPreference: 'high-performance' }}
            >
                <FullScreenQuad />
            </Canvas>
        </div>
    );
};
