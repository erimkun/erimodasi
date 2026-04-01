import{j as i,C as x,d,a as f}from"./r3f-Dn8p6Bku.js";import{b as e}from"./react-vendor-DnDWJTjw.js";import{u as p}from"./index-CP54Wi7R.js";import{h as m}from"./three-core-86AQBBY2.js";const h=typeof window<"u"&&(window.innerWidth<=768||"ontouchstart"in window||navigator.maxTouchPoints>0),g={uniforms:{uTime:{value:0},uResolution:{value:new m}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    precision mediump float;
    uniform float uTime;
    varying vec2 vUv;

    // Optimized simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.12;

      // Domain warp: 2 layers for fluid motion
      float n1 = snoise(uv * 2.5 + vec2(t * 0.4, t * 0.15));
      float n2 = snoise(uv * 5.0 + vec2(t * 0.8, t * 0.6) + n1 * 0.8);

      // Rich color palette matching the CSS blobs
      vec3 deepBlack = vec3(0.0, 0.0, 0.02);
      vec3 indigo    = vec3(0.08, 0.05, 0.35);
      vec3 violet    = vec3(0.35, 0.0, 0.45);
      vec3 cyan      = vec3(0.0, 0.55, 0.6);
      vec3 electric  = vec3(0.0, 0.25, 0.7);

      float m1 = smoothstep(-1.0, 1.0, n1);
      float m2 = smoothstep(-0.8, 0.8, n2);

      vec3 col = mix(deepBlack, indigo, m1);
      col = mix(col, violet, m2 * 0.7);
      col = mix(col, cyan, m2 * m1 * 0.4);
      col = mix(col, electric, (1.0 - m1) * m2 * 0.3);

      // Subtle vignette
      float vig = 1.0 - smoothstep(0.3, 0.85, length(uv - 0.5));
      col *= 0.7 + 0.3 * vig;

      gl_FragColor = vec4(col, 1.0);
    }
  `};function y({onWarmedUp:o}){const t=e.useRef(null),{viewport:a}=d(),c=e.useRef(0),s=e.useRef(!1),l=e.useRef(0),v=p(n=>n.isFluidPaused),u=e.useMemo(()=>({uTime:{value:0},uResolution:{value:new m}}),[]);return f(n=>{if(t.current&&!v){const r=n.clock.getElapsedTime();if(r-l.current<.05)return;l.current=r,t.current.material.uniforms.uTime.value=r,s.current||(c.current++,c.current>=15&&(s.current=!0,o()))}}),i.jsxs("mesh",{ref:t,scale:[a.width,a.height,1],children:[i.jsx("planeGeometry",{args:[1,1]}),i.jsx("shaderMaterial",{attach:"material",args:[g],uniforms:u})]})}const S=({onReady:o})=>{const[t,a]=e.useState(!1),c=e.useCallback(()=>{requestAnimationFrame(()=>{requestAnimationFrame(()=>{a(!0),o?.()})})},[o]);return i.jsx("div",{className:"fluid-webgl",style:{position:"absolute",inset:0,zIndex:1,opacity:t?1:0,transition:"opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1)",willChange:"opacity",pointerEvents:"none"},children:i.jsx(x,{camera:{position:[0,0,1]},dpr:h?1:Math.min(window.devicePixelRatio,1.5),gl:{antialias:!1,powerPreference:"high-performance",alpha:!1,stencil:!1,depth:!1},frameloop:"always",children:i.jsx(y,{onWarmedUp:c})})})};export{S as FluidBackground};
