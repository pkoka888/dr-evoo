import{c as r,j as t,m as a}from"./createLucideIcon.DZXaZ2pR.js";import{c as i}from"./clsx.B-dksMZM.js";import"./index.DiEladB3.js";/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]],x=r("network",u);/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"M12 22v-5",key:"1ega77"}],["path",{d:"M15 8V2",key:"18g5xt"}],["path",{d:"M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z",key:"1xoxul"}],["path",{d:"M9 8V2",key:"14iosj"}]],y=r("plug",g);/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],n=r("sparkles",k);/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2",key:"125lnx"}],["path",{d:"M8.5 2h7",key:"csnxdl"}],["path",{d:"M14.5 16h-5",key:"1ox875"}]],v=r("test-tube",m);/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",key:"ul74o6"}],["path",{d:"m14 7 3 3",key:"1r5n42"}],["path",{d:"M5 6v4",key:"ilb8ba"}],["path",{d:"M19 14v4",key:"blhpug"}],["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M7 8H3",key:"zfb6yr"}],["path",{d:"M21 16h-4",key:"1cnmox"}],["path",{d:"M11 3H9",key:"1obp7u"}]],M=r("wand-sparkles",b),j={Sparkles:n,Wand2:M,Network:x,TestTube:v,Plug:y};function _({features:s,className:c}){const d=[...s].sort((e,o)=>e.data.order-o.data.order),l={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},h={hidden:{opacity:0,y:40},visible:{opacity:1,y:0,transition:{duration:.6,ease:[.16,1,.3,1]}}};return t.jsx(a.div,{variants:l,initial:"hidden",whileInView:"visible",viewport:{once:!0,margin:"-100px"},className:i("grid gap-6","grid-cols-1 md:grid-cols-2 lg:grid-cols-3",c),children:d.map((e,o)=>{const p=j[e.data.icon]||n;return t.jsxs(a.div,{variants:h,whileHover:{y:-8,transition:{duration:.3}},className:i("group relative p-8","bg-muted/20 border border-muted","hover:border-foreground/30 hover:bg-muted/30","transition-colors duration-300","cursor-pointer"),children:[t.jsx("div",{className:"absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"}),t.jsx(a.div,{initial:{scale:1,rotate:0},whileHover:{scale:1.1,rotate:5},transition:{duration:.3},className:"mb-6 w-14 h-14 flex items-center justify-center bg-accent/10 border border-accent/30 group-hover:bg-accent group-hover:border-accent transition-colors duration-300",children:t.jsx(p,{className:"w-7 h-7 text-accent group-hover:text-background transition-colors duration-300"})}),t.jsx("h3",{className:"text-xl font-black uppercase tracking-tight mb-3 text-foreground group-hover:text-accent transition-colors duration-300",children:e.data.title}),t.jsx("p",{className:"text-foreground/60 text-sm leading-relaxed",children:e.data.description}),t.jsxs("div",{className:"mt-6 flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300",children:[t.jsx("span",{className:"text-xs font-bold uppercase tracking-wider",children:"Learn more"}),t.jsx("svg",{className:"w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 8l4 4m0 0l-4 4m4-4H3"})})]})]},e.slug)})})}export{_ as FeaturesList};
