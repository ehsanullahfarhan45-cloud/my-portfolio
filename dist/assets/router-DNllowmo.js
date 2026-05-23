import{r as t,l as T,c as w,R as p}from"./react-CN38HXjl.js";import{n as F}from"./vendor-Czj61bjO.js";/**
 * React Router DOM v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const U="6";try{window.__reactRouterVersion=U}catch{}const E="startTransition",u=p[E];function y(e){let{basename:m,children:R,future:s,window:h}=e,n=t.useRef();n.current==null&&(n.current=F({window:h,v5Compat:!0}));let r=n.current,[o,i]=t.useState({action:r.action,location:r.location}),{v7_startTransition:a}=s||{},c=t.useCallback(l=>{a&&u?u(()=>i(l)):i(l)},[i,a]);return t.useLayoutEffect(()=>r.listen(c),[r,c]),t.useEffect(()=>T(s),[s]),t.createElement(w,{basename:m,children:R,location:o.location,navigationType:o.action,navigator:r,future:s})}var S;(function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmit="useSubmit",e.UseSubmitFetcher="useSubmitFetcher",e.UseFetcher="useFetcher",e.useViewTransitionState="useViewTransitionState"})(S||(S={}));var f;(function(e){e.UseFetcher="useFetcher",e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"})(f||(f={}));export{y as B};
