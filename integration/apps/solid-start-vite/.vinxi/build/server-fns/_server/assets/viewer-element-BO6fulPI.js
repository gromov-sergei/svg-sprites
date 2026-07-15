var Rt=Object.defineProperty,Lt=Object.getOwnPropertyNames,m=(e,t,r)=>function(){if(r)throw r[0];try{return e&&(t=(0,e[Lt(e)[0]])(e=0)),t}catch(o){throw r=[o],o}},it=(e,t)=>{for(var r in t)Rt(e,r,{get:t[r],enumerable:!0})},E,u,te=m({"node_modules/vanilla-colorful/lib/utils/math.js"(){E=(e,t=0,r=1)=>e>r?r:e<t?t:e,u=(e,t=0,r=Math.pow(10,t))=>Math.round(r*e)/r}}),ot,Y,st,Pe,Z,He,S,Ue,Ne,re=m({"node_modules/vanilla-colorful/lib/utils/convert.js"(){te(),ot=e=>Ne(Y(e)),Y=e=>(e[0]==="#"&&(e=e.substring(1)),e.length<6?{r:parseInt(e[0]+e[0],16),g:parseInt(e[1]+e[1],16),b:parseInt(e[2]+e[2],16),a:e.length===4?u(parseInt(e[3]+e[3],16)/255,2):1}:{r:parseInt(e.substring(0,2),16),g:parseInt(e.substring(2,4),16),b:parseInt(e.substring(4,6),16),a:e.length===8?u(parseInt(e.substring(6,8),16)/255,2):1}),st=e=>Ue(He(e)),Pe=({h:e,s:t,v:r,a:i})=>{const o=(200-t)*r/100;return{h:u(e),s:u(o>0&&o<200?t*r/100/(o<=100?o:200-o)*100:0),l:u(o/2),a:u(i,2)}},Z=e=>{const{h:t,s:r,l:i}=Pe(e);return`hsl(${t}, ${r}%, ${i}%)`},He=({h:e,s:t,v:r,a:i})=>{e=e/360*6,t=t/100,r=r/100;const o=Math.floor(e),s=r*(1-t),a=r*(1-(e-o)*t),n=r*(1-(1-e+o)*t),l=o%6;return{r:u([r,a,s,s,n,r][l]*255),g:u([n,r,r,a,s,s][l]*255),b:u([s,s,n,r,r,a][l]*255),a:u(i,2)}},S=e=>{const t=e.toString(16);return t.length<2?"0"+t:t},Ue=({r:e,g:t,b:r,a:i})=>{const o=i<1?S(u(i*255)):"";return"#"+S(e)+S(t)+S(r)+o},Ne=({r:e,g:t,b:r,a:i})=>{const o=Math.max(e,t,r),s=o-Math.min(e,t,r),a=s?o===e?(t-r)/s:o===t?2+(r-e)/s:4+(e-t)/s:0;return{h:u(60*(a<0?a+6:a)),s:u(o?s/o*100:0),v:u(o/255*100),a:i}}}}),$e,at,nt=m({"node_modules/vanilla-colorful/lib/utils/compare.js"(){re(),$e=(e,t)=>{if(e===t)return!0;for(const r in e)if(e[r]!==t[r])return!1;return!0},at=(e,t)=>e.toLowerCase()===t.toLowerCase()?!0:$e(Y(e),Y(t))}}),ae,ie,X,Ae=m({"node_modules/vanilla-colorful/lib/utils/dom.js"(){ae={},ie=e=>{let t=ae[e];return t||(t=document.createElement("template"),t.innerHTML=e,ae[e]=t),t},X=(e,t,r)=>{e.dispatchEvent(new CustomEvent(t,{bubbles:!0,detail:r}))}}}),w,z,De,ne,Re,Ee,lt=m({"node_modules/vanilla-colorful/lib/components/slider.js"(){Ae(),te(),w=!1,z=e=>"touches"in e,De=e=>w&&!z(e)?!1:(w||(w=z(e)),!0),ne=(e,t)=>{const r=z(t)?t.touches[0]:t,i=e.el.getBoundingClientRect();X(e.el,"move",e.getMove({x:E((r.pageX-(i.left+window.pageXOffset))/i.width),y:E((r.pageY-(i.top+window.pageYOffset))/i.height)}))},Re=(e,t)=>{const r=t.keyCode;r>40||e.xy&&r<37||r<33||(t.preventDefault(),X(e.el,"move",e.getMove({x:r===39?.01:r===37?-.01:r===34?.05:r===33?-.05:r===35?1:r===36?-1:0,y:r===40?.01:r===38?-.01:0},!0)))},Ee=class{constructor(e,t,r,i){const o=ie(`<div role="slider" tabindex="0" part="${t}" ${r}><div part="${t}-pointer"></div></div>`);e.appendChild(o.content.cloneNode(!0));const s=e.querySelector(`[part=${t}]`);s.addEventListener("mousedown",this),s.addEventListener("touchstart",this),s.addEventListener("keydown",this),this.el=s,this.xy=i,this.nodes=[s.firstChild,s]}set dragging(e){const t=e?document.addEventListener:document.removeEventListener;t(w?"touchmove":"mousemove",this),t(w?"touchend":"mouseup",this)}handleEvent(e){switch(e.type){case"mousedown":case"touchstart":if(e.preventDefault(),!De(e)||!w&&e.button!=0)return;this.el.focus(),ne(this,e),this.dragging=!0;break;case"mousemove":case"touchmove":e.preventDefault(),ne(this,e);break;case"mouseup":case"touchend":this.dragging=!1;break;case"keydown":Re(this,e);break}}style(e){e.forEach((t,r)=>{for(const i in t)this.nodes[r].style.setProperty(i,t[i])})}}}}),ct,jt=m({"node_modules/vanilla-colorful/lib/components/hue.js"(){lt(),re(),te(),ct=class extends Ee{constructor(e){super(e,"hue",'aria-label="Hue" aria-valuemin="0" aria-valuemax="360"',!1)}update({h:e}){this.h=e,this.style([{left:`${e/360*100}%`,color:Z({h:e,s:100,v:100,a:1})}]),this.el.setAttribute("aria-valuenow",`${u(e)}`)}getMove(e,t){return{h:t?E(this.h+e.x*360,0,360):360*e.x}}}}}),dt,zt=m({"node_modules/vanilla-colorful/lib/components/saturation.js"(){lt(),re(),te(),dt=class extends Ee{constructor(e){super(e,"saturation",'aria-label="Color"',!0)}update(e){this.hsva=e,this.style([{top:`${100-e.v}%`,left:`${e.s}%`,color:Z(e)},{"background-color":Z({h:e.h,s:100,v:100,a:1})}]),this.el.setAttribute("aria-valuetext",`Saturation ${u(e.s)}%, Brightness ${u(e.v)}%`)}getMove(e,t){return{s:t?E(this.hsva.s+e.x*100,0,100):e.x*100,v:t?E(this.hsva.v-e.y*100,0,100):Math.round(100-e.y*100)}}}}}),ht,Bt=m({"node_modules/vanilla-colorful/lib/styles/color-picker.js"(){ht=':host{display:flex;flex-direction:column;position:relative;width:200px;height:200px;user-select:none;-webkit-user-select:none;cursor:default}:host([hidden]){display:none!important}[role=slider]{position:relative;touch-action:none;user-select:none;-webkit-user-select:none;outline:0}[role=slider]:last-child{border-radius:0 0 8px 8px}[part$=pointer]{position:absolute;z-index:1;box-sizing:border-box;width:28px;height:28px;display:flex;place-content:center center;transform:translate(-50%,-50%);background-color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2)}[part$=pointer]::after{content:"";width:100%;height:100%;border-radius:inherit;background-color:currentColor}[role=slider]:focus [part$=pointer]{transform:translate(-50%,-50%) scale(1.1)}'}}),pt,It=m({"node_modules/vanilla-colorful/lib/styles/hue.js"(){pt="[part=hue]{flex:0 0 24px;background:linear-gradient(to right,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red 100%)}[part=hue-pointer]{top:50%;z-index:2}"}}),ut,Vt=m({"node_modules/vanilla-colorful/lib/styles/saturation.js"(){ut="[part=saturation]{flex-grow:1;border-color:transparent;border-bottom:12px solid #000;border-radius:8px 8px 0 0;background-image:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,rgba(255,255,255,0));box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}[part=saturation-pointer]{z-index:3}"}}),T,B,le,I,ce,de,he,gt,qt=m({"node_modules/vanilla-colorful/lib/components/color-picker.js"(){nt(),Ae(),jt(),zt(),Bt(),It(),Vt(),T=Symbol("same"),B=Symbol("color"),le=Symbol("hsva"),I=Symbol("update"),ce=Symbol("parts"),de=Symbol("css"),he=Symbol("sliders"),gt=class extends HTMLElement{static get observedAttributes(){return["color"]}get[de](){return[ht,pt,ut]}get[he](){return[dt,ct]}get color(){return this[B]}set color(e){if(!this[T](e)){const t=this.colorModel.toHsva(e);this[I](t),this[B]=e}}constructor(){super();const e=ie(`<style>${this[de].join("")}</style>`),t=this.attachShadow({mode:"open"});t.appendChild(e.content.cloneNode(!0)),t.addEventListener("move",this),this[ce]=this[he].map(r=>new r(t))}connectedCallback(){if(this.hasOwnProperty("color")){const e=this.color;delete this.color,this.color=e}else this.color||(this.color=this.colorModel.defaultColor)}attributeChangedCallback(e,t,r){const i=this.colorModel.fromAttr(r);this[T](i)||(this.color=i)}handleEvent(e){const t=this[le],r={...t,...e.detail};this[I](r);let i;!$e(r,t)&&!this[T](i=this.colorModel.fromHsva(r))&&(this[B]=i,X(this,"color-changed",{value:i}))}[T](e){return this.color&&this.colorModel.equal(e,this.color)}[I](e){this[le]=e,this[ce].forEach(t=>t.update(e))}}}}),mt={};it(mt,{HexBase:()=>vt});var Le,vt,Ft=m({"node_modules/vanilla-colorful/lib/entrypoints/hex.js"(){qt(),re(),nt(),Le={defaultColor:"#000",toHsva:ot,fromHsva:({h:e,s:t,v:r})=>st({h:e,s:t,v:r,a:1}),equal:at,fromAttr:e=>e},vt=class extends gt{get colorModel(){return Le}}}}),je,G,Jt=m({"node_modules/vanilla-colorful/lib/utils/validate.js"(){je=/^#?([0-9A-F]{3,8})$/i,G=(e,t)=>{const r=je.exec(e),i=r?r[1].length:0;return i===3||i===6||!!t&&i===4||!!t&&i===8}}}),_t={};it(_t,{HexInputBase:()=>ft});var ze,pe,ue,M,ge,V,q,me,C,ft,Wt=m({"node_modules/vanilla-colorful/lib/entrypoints/hex-input.js"(){Jt(),Ae(),ze=ie('<slot><input part="input" spellcheck="false"></slot>'),pe=(e,t)=>e.replace(/([^0-9A-F]+)/gi,"").substring(0,t?8:6),ue=Symbol("alpha"),M=Symbol("color"),ge=Symbol("saved"),V=Symbol("input"),q=Symbol("init"),me=Symbol("prefix"),C=Symbol("update"),ft=class extends HTMLElement{static get observedAttributes(){return["alpha","color","prefixed"]}get color(){return this[M]}set color(e){this[M]=e,this[C](e)}get alpha(){return this[ue]}set alpha(e){this[ue]=e,this.toggleAttribute("alpha",e);const t=this.color;t&&!G(t,e)&&(this.color=t.startsWith("#")?t.substring(0,t.length===5?4:7):t.substring(0,t.length===4?3:6))}get prefixed(){return this[me]}set prefixed(e){this[me]=e,this.toggleAttribute("prefixed",e),this[C](this.color)}constructor(){super();const e=this.attachShadow({mode:"open"});e.appendChild(ze.content.cloneNode(!0)),e.firstElementChild.addEventListener("slotchange",()=>this[q](e))}connectedCallback(){if(this[q](this.shadowRoot),this.hasOwnProperty("alpha")){const e=this.alpha;delete this.alpha,this.alpha=e}else this.alpha=this.hasAttribute("alpha");if(this.hasOwnProperty("prefixed")){const e=this.prefixed;delete this.prefixed,this.prefixed=e}else this.prefixed=this.hasAttribute("prefixed");if(this.hasOwnProperty("color")){const e=this.color;delete this.color,this.color=e}else this.color==null?this.color=this.getAttribute("color")||"":this[M]&&this[C](this[M])}handleEvent(e){const t=e.target,{value:r}=t;switch(e.type){case"input":const i=pe(r,this.alpha);this[ge]=this.color,(G(i,this.alpha)||r==="")&&(this.color=i,this.dispatchEvent(new CustomEvent("color-changed",{bubbles:!0,detail:{value:i?"#"+i:""}})));break;case"blur":r&&!G(r,this.alpha)&&(this.color=this[ge])}}attributeChangedCallback(e,t,r){e==="color"&&this.color!==r&&(this.color=r);const i=r!=null;e==="alpha"&&this.alpha!==i&&(this.alpha=i),e==="prefixed"&&this.prefixed!==i&&(this.prefixed=i)}[q](e){let t=this.querySelector("input");if(!t){let r;for(;r=this.firstChild;)r.remove();t=e.querySelector("input")}t.addEventListener("input",this),t.addEventListener("blur",this),this[V]=t,this[C](this.color)}[C](e){this[V]&&(this[V].value=e==null||e==""?"":(this.prefixed?"#":"")+pe(e,this.alpha))}}}}),K=globalThis,ke=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,bt=Symbol(),Be=new WeakMap,Gt=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==bt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(ke&&e===void 0){const r=t!==void 0&&t.length===1;r&&(e=Be.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&Be.set(t,e))}return e}toString(){return this.cssText}},wt=e=>new Gt(typeof e=="string"?e:e+"",void 0,bt),Kt=(e,t)=>{if(ke)e.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(const r of t){const i=document.createElement("style"),o=K.litNonce;o!==void 0&&i.setAttribute("nonce",o),i.textContent=r.cssText,e.appendChild(i)}},Ie=ke?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let r="";for(const i of t.cssRules)r+=i.cssText;return wt(r)})(e):e,{is:Yt,defineProperty:Zt,getOwnPropertyDescriptor:Xt,getOwnPropertyNames:Qt,getOwnPropertySymbols:er,getPrototypeOf:tr}=Object,oe=globalThis,Ve=oe.trustedTypes,rr=Ve?Ve.emptyScript:"",ir=oe.reactiveElementPolyfillSupport,H=(e,t)=>e,xe={toAttribute(e,t){switch(t){case Boolean:e=e?rr:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch{r=null}}return r}},$t=(e,t)=>!Yt(e,t),qe={attribute:!0,type:String,converter:xe,reflect:!1,useDefault:!1,hasChanged:$t};Symbol.metadata??=Symbol("metadata"),oe.litPropertyMetadata??=new WeakMap;var A=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=qe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const r=Symbol(),i=this.getPropertyDescriptor(e,r,t);i!==void 0&&Zt(this.prototype,e,i)}}static getPropertyDescriptor(e,t,r){const{get:i,set:o}=Xt(this.prototype,e)??{get(){return this[t]},set(s){this[t]=s}};return{get:i,set(s){const a=i?.call(this);o?.call(this,s),this.requestUpdate(e,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??qe}static _$Ei(){if(this.hasOwnProperty(H("elementProperties")))return;const e=tr(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(H("properties"))){const t=this.properties,r=[...Qt(t),...er(t)];for(const i of r)this.createProperty(i,t[i])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[r,i]of t)this.elementProperties.set(r,i)}this._$Eh=new Map;for(const[t,r]of this.elementProperties){const i=this._$Eu(t,r);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const i of r)t.unshift(Ie(i))}else e!==void 0&&t.push(Ie(e));return t}static _$Eu(e,t){const r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Kt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){const r=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,r);if(i!==void 0&&r.reflect===!0){const o=(r.converter?.toAttribute!==void 0?r.converter:xe).toAttribute(t,r.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,t){const r=this.constructor,i=r._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const o=r.getPropertyOptions(i),s=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:xe;this._$Em=i;const a=s.fromAttribute(t,o.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(e,t,r,i=!1,o){if(e!==void 0){const s=this.constructor;if(i===!1&&(o=this[e]),r??=s.getPropertyOptions(e),!((r.hasChanged??$t)(o,t)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:i,wrapped:o},s){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),o!==!0||s!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[i,o]of r){const{wrapped:s}=o,a=this[i];s!==!0||this._$AL.has(i)||a===void 0||this.C(i,void 0,o,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[H("elementProperties")]=new Map,A[H("finalized")]=new Map,ir?.({ReactiveElement:A}),(oe.reactiveElementVersions??=[]).push("2.1.2");var Se=globalThis,Fe=e=>e,Q=Se.trustedTypes,Je=Q?Q.createPolicy("lit-html",{createHTML:e=>e}):void 0,xt="$lit$",f=`lit$${Math.random().toFixed(9).slice(2)}$`,yt="?"+f,or=`<${yt}>`,y=document,N=()=>y.createComment(""),D=e=>e===null||typeof e!="object"&&typeof e!="function",Te=Array.isArray,sr=e=>Te(e)||typeof e?.[Symbol.iterator]=="function",ve=`[ 	
\f\r]`,O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,We=/-->/g,Ge=/>/g,$=RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ke=/'/g,Ye=/"/g,Ct=/^(?:script|style|textarea|title)$/i,ar=e=>(t,...r)=>({_$litType$:e,strings:t,values:r}),p=ar(1),b=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),Ze=new WeakMap,x=y.createTreeWalker(y,129);function At(e,t){if(!Te(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Je!==void 0?Je.createHTML(t):t}var nr=(e,t)=>{const r=e.length-1,i=[];let o,s=t===2?"<svg>":t===3?"<math>":"",a=O;for(let n=0;n<r;n++){const l=e[n];let g,d,h=-1,v=0;for(;v<l.length&&(a.lastIndex=v,d=a.exec(l),d!==null);)v=a.lastIndex,a===O?d[1]==="!--"?a=We:d[1]!==void 0?a=Ge:d[2]!==void 0?(Ct.test(d[2])&&(o=RegExp("</"+d[2],"g")),a=$):d[3]!==void 0&&(a=$):a===$?d[0]===">"?(a=o??O,h=-1):d[1]===void 0?h=-2:(h=a.lastIndex-d[2].length,g=d[1],a=d[3]===void 0?$:d[3]==='"'?Ye:Ke):a===Ye||a===Ke?a=$:a===We||a===Ge?a=O:(a=$,o=void 0);const _=a===$&&e[n+1].startsWith("/>")?" ":"";s+=a===O?l+or:h>=0?(i.push(g),l.slice(0,h)+xt+l.slice(h)+f+_):l+f+(h===-2?n:_)}return[At(e,s+(e[r]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},ye=class Et{constructor({strings:t,_$litType$:r},i){let o;this.parts=[];let s=0,a=0;const n=t.length-1,l=this.parts,[g,d]=nr(t,r);if(this.el=Et.createElement(g,i),x.currentNode=this.el.content,r===2||r===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(o=x.nextNode())!==null&&l.length<n;){if(o.nodeType===1){if(o.hasAttributes())for(const h of o.getAttributeNames())if(h.endsWith(xt)){const v=d[a++],_=o.getAttribute(h).split(f),j=/([.?@])?(.*)/.exec(v);l.push({type:1,index:s,name:j[2],strings:_,ctor:j[1]==="."?cr:j[1]==="?"?dr:j[1]==="@"?hr:se}),o.removeAttribute(h)}else h.startsWith(f)&&(l.push({type:6,index:s}),o.removeAttribute(h));if(Ct.test(o.tagName)){const h=o.textContent.split(f),v=h.length-1;if(v>0){o.textContent=Q?Q.emptyScript:"";for(let _=0;_<v;_++)o.append(h[_],N()),x.nextNode(),l.push({type:2,index:++s});o.append(h[v],N())}}}else if(o.nodeType===8)if(o.data===yt)l.push({type:2,index:s});else{let h=-1;for(;(h=o.data.indexOf(f,h+1))!==-1;)l.push({type:7,index:s}),h+=f.length-1}s++}}static createElement(t,r){const i=y.createElement("template");return i.innerHTML=t,i}};function k(e,t,r=e,i){if(t===b)return t;let o=i!==void 0?r._$Co?.[i]:r._$Cl;const s=D(t)?void 0:t._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),s===void 0?o=void 0:(o=new s(e),o._$AT(e,r,i)),i!==void 0?(r._$Co??=[])[i]=o:r._$Cl=o),o!==void 0&&(t=k(e,o._$AS(e,t.values),o,i)),t}var lr=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:r}=this._$AD,i=(e?.creationScope??y).importNode(t,!0);x.currentNode=i;let o=x.nextNode(),s=0,a=0,n=r[0];for(;n!==void 0;){if(s===n.index){let l;n.type===2?l=new Me(o,o.nextSibling,this,e):n.type===1?l=new n.ctor(o,n.name,n.strings,this,e):n.type===6&&(l=new pr(o,this,e)),this._$AV.push(l),n=r[++a]}s!==n?.index&&(o=x.nextNode(),s++)}return x.currentNode=y,i}p(e){let t=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}},Me=class kt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,r,i,o){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const r=this._$AM;return r!==void 0&&t?.nodeType===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=k(this,t,r),D(t)?t===c||t==null||t===""?(this._$AH!==c&&this._$AR(),this._$AH=c):t!==this._$AH&&t!==b&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):sr(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==c&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(y.createTextNode(t)),this._$AH=t}$(t){const{values:r,_$litType$:i}=t,o=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=ye.createElement(At(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(r);else{const s=new lr(o,this),a=s.u(this.options);s.p(r),this.T(a),this._$AH=s}}_$AC(t){let r=Ze.get(t.strings);return r===void 0&&Ze.set(t.strings,r=new ye(t)),r}k(t){Te(this._$AH)||(this._$AH=[],this._$AR());const r=this._$AH;let i,o=0;for(const s of t)o===r.length?r.push(i=new kt(this.O(N()),this.O(N()),this,this.options)):i=r[o],i._$AI(s),o++;o<r.length&&(this._$AR(i&&i._$AB.nextSibling,o),r.length=o)}_$AR(t=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);t!==this._$AB;){const i=Fe(t).nextSibling;Fe(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},se=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,i,o){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=c}_$AI(e,t=this,r,i){const o=this.strings;let s=!1;if(o===void 0)e=k(this,e,t,0),s=!D(e)||e!==this._$AH&&e!==b,s&&(this._$AH=e);else{const a=e;let n,l;for(e=o[0],n=0;n<o.length-1;n++)l=k(this,a[r+n],t,n),l===b&&(l=this._$AH[n]),s||=!D(l)||l!==this._$AH[n],l===c?e=c:e!==c&&(e+=(l??"")+o[n+1]),this._$AH[n]=l}s&&!i&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},cr=class extends se{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}},dr=class extends se{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}},hr=class extends se{constructor(e,t,r,i,o){super(e,t,r,i,o),this.type=5}_$AI(e,t=this){if((e=k(this,e,t,0)??c)===b)return;const r=this._$AH,i=e===c&&r!==c||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==c&&(r===c||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},pr=class{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){k(this,e)}},ur=Se.litHtmlPolyfillSupport;ur?.(ye,Me),(Se.litHtmlVersions??=[]).push("3.3.3");var gr=(e,t,r)=>{const i=r?.renderBefore??t;let o=i._$litPart$;if(o===void 0){const s=r?.renderBefore??null;i._$litPart$=o=new Me(t.insertBefore(N(),s),s,void 0,r??{})}return o._$AI(e),o},Oe=globalThis,U=class extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=gr(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return b}};U._$litElement$=!0,U.finalized=!0,Oe.litElementHydrateSupport?.({LitElement:U});var mr=Oe.litElementPolyfillSupport;mr?.({LitElement:U});(Oe.litElementVersions??=[]).push("4.2.2");var F=e=>e??c,St={ATTRIBUTE:1,CHILD:2},Tt=e=>(...t)=>({_$litDirective$:e,values:t}),Mt=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,r){this._$Ct=e,this._$AM=t,this._$Ci=r}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},Ot="important",vr=" !"+Ot,_e=Tt(class extends Mt{constructor(e){if(super(e),e.type!==St.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,r)=>{const i=e[r];return i==null?t:t+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(e,[t]){const{style:r}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(const i of this.ft)t[i]==null&&(this.ft.delete(i),i.includes("-")?r.removeProperty(i):r[i]=null);for(const i in t){const o=t[i];if(o!=null){this.ft.add(i);const s=typeof o=="string"&&o.endsWith(vr);i.includes("-")||s?r.setProperty(i,s?o.slice(0,-11):o,s?Ot:""):r[i]=o}}return b}}),Ce=class extends Mt{constructor(e){if(super(e),this.it=c,e.type!==St.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===c||e==null)return this._t=void 0,this.it=e;if(e===b)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};Ce.directiveName="unsafeHTML",Ce.resultType=1;var _r=Tt(Ce),fr=[{id:"svg",label:"SVG"},{id:"img",label:"IMG"},{id:"css",label:"CSS"}],br={react:"React",vue:"Vue",svelte:"Svelte",angular:"Angular",astro:"Astro",solid:"Solid","solid-start":"SolidStart",preact:"Preact",qwik:"Qwik",lit:"Lit",alpine:"Alpine"};function Pt(e){return e.usage?e.usage:e.componentName?{framework:"react",componentName:e.componentName}:null}function fe(e){const t=Pt(e),i=[...t?[{id:t.framework,label:br[t.framework]}]:[],...fr];return e.format==="stack"?i:i.filter(o=>o.id!=="img"&&o.id!=="css")}function wr(e){if(!e)return null;const t=e.trim().split(/[\s,]+/).map(Number);return t.length===4&&t.every(Number.isFinite)?`${t[2]} × ${t[3]}`:null}function R(e,t="#1a1a1a"){const r=e.trim().toLowerCase();if(r==="currentcolor")return R(t);const i=r.match(/^#([\da-f])([\da-f])([\da-f])(?:[\da-f])?$/i);if(i)return`#${i[1]}${i[1]}${i[2]}${i[2]}${i[3]}${i[3]}`;const o=r.match(/^#([\da-f]{6})(?:[\da-f]{2})?$/i);if(o)return`#${o[1]}`;const s=r.match(/^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/);return s?`#${s.slice(1,4).map(n=>Math.min(255,Number(n)).toString(16).padStart(2,"0")).join("")}`:{black:"#000000",blue:"#0000ff",cyan:"#00ffff",gray:"#808080",green:"#008000",grey:"#808080",magenta:"#ff00ff",orange:"#ffa500",pink:"#ffc0cb",purple:"#800080",red:"#ff0000",white:"#ffffff",yellow:"#ffff00"}[r]??R(t===e?"#1a1a1a":t)}function $r(e){return Object.entries(e).map(([t,r])=>`    ${JSON.stringify(t)}: ${JSON.stringify(r)},`)}function P(e){const t={"&":"&amp;",'"':"&quot;","<":"&lt;",">":"&gt;"};return e.replace(/[&"<>]/g,r=>t[r])}function xr(e){return e.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}function yr(e){const{manifest:t,icon:r,tab:i,colorOverrides:o,cssColor:s}=e,a=`${t.spriteUrl}#${r.id}`,n=$r(o);if(!["svg","img","css"].includes(i)){const d=Pt(t);if(!d)throw new Error(`The ${i} code tab requires component metadata.`);if(d.framework==="alpine")return{code:`<svg ${d.directive}=${JSON.stringify(JSON.stringify(r.name))}></svg>`,language:"html"};if(d.framework==="lit")return{code:`<${d.tagName} icon=${JSON.stringify(r.name)}></${d.tagName}>`,language:"html"};if(d.framework==="angular")return{code:`<${d.selector} icon=${JSON.stringify(r.name)}></${d.selector}>`,language:"html"};if(d.framework==="vue"){const h=Object.entries(o).map(([v,_])=>`${JSON.stringify(v)}: ${JSON.stringify(_)}`).join(", ");return{code:`<${d.componentName} icon=${JSON.stringify(r.name)}${h?` :style="{ ${P(h)} }"`:""} />`,language:"html"}}return n.length===0?{code:`<${d.componentName} icon=${JSON.stringify(r.name)} />`,language:"tsx"}:{code:[`<${d.componentName}`,`  icon=${JSON.stringify(r.name)}`,"  style={{",...n,"  }}","/>"].join(`
`),language:"tsx"}}if(i==="svg"){const d=Object.entries(o).map(([h,v])=>`${h}: ${v}`).join("; ");return{code:`<svg width="24" height="24"${d?` style="${P(d)}"`:""}>
  <use href="${P(a)}" />
</svg>`,language:"html"}}if(i==="img")return{code:`<img src="${P(a)}" width="24" height="24" alt="${P(r.name)}">`,language:"html"};const l=`icon-${r.name.replace(/[^a-zA-Z0-9_-]+/g,"-")||"sprite"}`,g=xr(a);return{code:[`.${l} {`,"  width: 24px;","  height: 24px;",`  mask: url('${g}') no-repeat center / contain;`,`  -webkit-mask: url('${g}') no-repeat center / contain;`,`  background-color: ${s};`,"}"].join(`
`),language:"css"}}var Cr=/[&<>"]/g,Ar={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"},Er=[[/<!--[\s\S]*?-->/g,"comment"],[/<\/?[\w.-]+/g,"tag"],[/[\w-]+(?=\s*=)/g,"attr"],[/"[^"]*"|'[^']*'/g,"string"]],kr=[[/\/\*[\s\S]*?\*\//g,"comment"],[/\.[\w-]+/g,"selector"],[/[\w-]+(?=\s*:)/g,"property"],[/'[^']*'|"[^"]*"/g,"string"],[/#[\da-fA-F]{3,8}\b/g,"color"],[/\d+(?:\.\d+)?(?:px|em|rem|%)?/g,"number"]];function Sr(e,t){const r=t==="css"?kr:Er,i=[];let o=0;for(;o<e.length;){let s=null,a="";for(const[n,l]of r){n.lastIndex=o;const g=n.exec(e);if(g?.index===o){s=g,a=l;break}}if(s)i.push({kind:a,value:s[0]}),o+=s[0].length;else{const n=i.at(-1);n?.kind===""?n.value+=e[o]:i.push({kind:"",value:e[o]}),o++}}return i.map(({kind:s,value:a})=>{const n=a.replace(Cr,l=>Ar[l]);return s?`<span class="hl-${s}">${n}</span>`:n}).join("")}var J=new WeakMap;function L(e){return e!==null&&typeof e=="object"}function Ht(e){return L(e)?typeof e.name=="string"&&typeof e.id=="string"&&(e.viewBox===null||typeof e.viewBox=="string")&&Array.isArray(e.colors):!1}function Ut(e){return L(e)?e.schemaVersion===1&&e.generator==="@gromlab/svg-sprites"&&typeof e.name=="string"&&typeof e.target=="string"&&(e.format==="stack"||e.format==="symbol")&&typeof e.iconCount=="number"&&typeof e.spriteUrl=="string"&&Array.isArray(e.icons)&&e.icons.every(Ht):!1}function Nt(e){return L(e)&&e.schemaVersion===1&&e.generator==="@gromlab/svg-sprites"&&typeof e.name=="string"&&typeof e.target=="string"&&(e.format==="stack"||e.format==="symbol")&&typeof e.iconCount=="number"&&Array.isArray(e.icons)&&e.icons.every(Ht)}function Tr(e){return!L(e)||Ut(e)||Nt(e)?e:e.default??e.spriteManifest??e}function ee(e,t){const r=Tr(e);if(Ut(r))return r;if(t&&Nt(r))return{...r,spriteUrl:t};throw new Error("The loaded source does not contain a valid SVG sprite manifest.")}function Xe(e){return Array.isArray(e)?e:Object.values(e)}function Dt(e){if(!L(e))return!1;const t=e;return typeof t.manifestUrl=="string"&&typeof t.spriteUrl=="string"}function Qe(e,t){return e.name<t.name?-1:e.name>t.name?1:0}async function Mr(e){const t=await fetch(e.manifestUrl);if(!t.ok)throw new Error(`Cannot load SVG sprite manifest: ${t.status} ${t.statusText}`);return ee(await t.json(),e.spriteUrl)}async function Or(e){if(Dt(e))return Mr(e);if(typeof e!="function")return ee(e);const t=J.get(e);if(t)return t;const r=Promise.resolve().then(e).then(i=>ee(i));return J.set(e,r),r.catch(()=>{J.get(e)===r&&J.delete(e)}),r}var Pr=`
:host { display: block; }
.gromlab-sprite-viewer {
  --sv-bg: #f0f0f3;
  --sv-text: #1a1a1a;
  --sv-card: #ffffff;
  --sv-card-hover: #eaeaed;
  --sv-border: #d8d8d8;
  --sv-accent: #3b82f6;
  --sv-muted: #777777;
  --sv-code: #f5f5f5;
  --sv-checker-a: #e9e9e9;
  --sv-checker-b: #ffffff;
  --sv-danger: #b42332;
  box-sizing: border-box;
  min-height: 320px;
  padding: 24px;
  color: var(--sv-text);
  color-scheme: light;
  background: var(--sv-bg);
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.gromlab-sprite-viewer[data-theme="dark"] {
  --sv-bg: #1a1a1a;
  --sv-text: #e5e5e5;
  --sv-card: #2a2a2a;
  --sv-card-hover: #333333;
  --sv-border: #404040;
  --sv-muted: #a3a3a3;
  --sv-code: #242424;
  --sv-checker-a: #333333;
  --sv-checker-b: #2a2a2a;
  --sv-danger: #ff9ba6;
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
  .gromlab-sprite-viewer:not([data-theme]) {
    --sv-bg: #1a1a1a;
    --sv-text: #e5e5e5;
    --sv-card: #2a2a2a;
    --sv-card-hover: #333333;
    --sv-border: #404040;
    --sv-muted: #a3a3a3;
    --sv-code: #242424;
    --sv-checker-a: #333333;
    --sv-checker-b: #2a2a2a;
    --sv-danger: #ff9ba6;
    color-scheme: dark;
  }
}
.gromlab-sprite-viewer *,
.gromlab-sprite-viewer *::before,
.gromlab-sprite-viewer *::after { box-sizing: border-box; }
.gromlab-sprite-viewer button,
.gromlab-sprite-viewer input { font: inherit; }
.gromlab-sprite-viewer__header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.gromlab-sprite-viewer__title { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 700; }
.gromlab-sprite-viewer__summary { color: var(--sv-muted); font-size: 13px; }
.gromlab-sprite-viewer__toolbar { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.gromlab-sprite-viewer__search {
  width: 220px;
  height: 38px;
  padding: 0 12px;
  color: var(--sv-text);
  background: var(--sv-card);
  border: 1px solid var(--sv-border);
  border-radius: 8px;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.gromlab-sprite-viewer__search:focus { border-color: var(--sv-accent); box-shadow: 0 0 0 3px rgba(59, 130, 246, .18); }
.gromlab-sprite-viewer__search::placeholder { color: var(--sv-muted); }
.gromlab-sprite-viewer__theme {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  color: var(--sv-text);
  background: var(--sv-card);
  border: 1px solid var(--sv-border);
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.gromlab-sprite-viewer__theme:hover { background: var(--sv-card-hover); }
.gromlab-sprite-viewer__theme:focus-visible,
.gromlab-sprite-viewer__card:focus-visible,
.gromlab-sprite-viewer__close:focus-visible,
.gromlab-sprite-viewer__tab:focus-visible,
.gromlab-sprite-viewer__copy:focus-visible,
.gromlab-sprite-viewer__swatch:focus-visible {
  outline: 2px solid var(--sv-accent);
  outline-offset: 2px;
}
.gromlab-sprite-viewer__errors {
  margin: 0 0 24px;
  padding: 12px 14px;
  color: var(--sv-danger);
  background: rgba(180, 35, 50, .08);
  border: 1px solid rgba(180, 35, 50, .28);
  border-radius: 8px;
  font-size: 12px;
}
.gromlab-sprite-viewer__group { margin-bottom: 40px; }
.gromlab-sprite-viewer__group-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.gromlab-sprite-viewer__group-title { margin: 0; font-size: 18px; line-height: 1.3; font-weight: 600; }
.gromlab-sprite-viewer__badge {
  padding: 2px 8px;
  color: #ffffff;
  background: var(--sv-accent);
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.gromlab-sprite-viewer__group-count,
.gromlab-sprite-viewer__description { color: var(--sv-muted); font-size: 13px; font-weight: 400; }
.gromlab-sprite-viewer__description { flex-basis: 100%; margin: -2px 0 0; }
.gromlab-sprite-viewer__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.gromlab-sprite-viewer__card {
  display: flex;
  min-width: 0;
  padding: 16px 8px;
  color: inherit;
  text-align: center;
  background: var(--sv-card);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: background .15s, transform .15s;
}
.gromlab-sprite-viewer__card:hover { background: var(--sv-card-hover); transform: translateY(-1px); }
.gromlab-sprite-viewer__icon-wrap,
.gromlab-sprite-viewer__dialog-preview-canvas {
  display: grid;
  place-items: center;
  background: conic-gradient(
    var(--sv-checker-a) 25%, var(--sv-checker-b) 0 50%,
    var(--sv-checker-a) 0 75%, var(--sv-checker-b) 0
  );
  background-size: 8px 8px;
  border-radius: 4px;
}
.gromlab-sprite-viewer__icon-wrap { width: 128px; height: 128px; }
.gromlab-sprite-viewer__icon { display: block; width: 128px; height: 128px; color: var(--sv-text); overflow: visible; }
.gromlab-sprite-viewer__icon-name {
  max-width: 100%;
  overflow: hidden;
  color: var(--sv-muted);
  font-size: 13px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gromlab-sprite-viewer__status {
  padding: 40px 20px;
  color: var(--sv-muted);
  text-align: center;
  background: var(--sv-card);
  border: 1px dashed var(--sv-border);
  border-radius: 8px;
}
.gromlab-sprite-viewer__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
  padding-top: 16px;
  color: var(--sv-muted);
  border-top: 1px solid var(--sv-border);
  font-size: 13px;
}
.gromlab-sprite-viewer__footer a { color: var(--sv-accent); text-decoration: none; }
.gromlab-sprite-viewer__footer a:hover { text-decoration: underline; }
.gromlab-sprite-viewer__dialog {
  width: min(560px, calc(100vw - 32px));
  max-width: none;
  max-height: calc(100dvh - 48px);
  padding: 0;
  color: var(--sv-text);
  background: transparent;
  border: 0;
  overflow: visible;
}
.gromlab-sprite-viewer__dialog::backdrop { background: rgba(0, 0, 0, .55); backdrop-filter: blur(2px); }
.gromlab-sprite-viewer__dialog-shell {
  position: relative;
  max-height: calc(100dvh - 48px);
  padding: 24px;
  overflow-y: auto;
  color: var(--sv-text);
  background: var(--sv-bg);
  border: 1px solid var(--sv-border);
  border-radius: 12px;
  box-shadow: 0 24px 72px rgba(0, 0, 0, .28);
}
.gromlab-sprite-viewer__close {
  position: absolute;
  z-index: 2;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  color: var(--sv-text);
  background: var(--sv-bg);
  border: 1px solid var(--sv-border);
  border-radius: 8px;
  cursor: pointer;
}
.gromlab-sprite-viewer__close:hover { background: var(--sv-card-hover); }
.gromlab-sprite-viewer__dialog-preview { display: flex; align-items: center; justify-content: center; padding: 24px; margin-bottom: 16px; background: var(--sv-card); border-radius: 8px; }
.gromlab-sprite-viewer__dialog-preview-canvas { width: 256px; height: 256px; }
.gromlab-sprite-viewer__dialog-icon,
.gromlab-sprite-viewer__dialog-img,
.gromlab-sprite-viewer__dialog-mask { display: block; width: 256px; height: 256px; }
.gromlab-sprite-viewer__dialog-icon { color: var(--sv-text); overflow: visible; }
.gromlab-sprite-viewer__dialog-img { object-fit: contain; }
.gromlab-sprite-viewer__dialog-heading { display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.gromlab-sprite-viewer__dialog-title { margin: 0; font: 600 16px/1.3 ui-monospace, "SFMono-Regular", Consolas, monospace; }
.gromlab-sprite-viewer__viewbox {
  padding: 2px 8px;
  color: var(--sv-muted);
  background: var(--sv-card);
  border: 1px solid var(--sv-border);
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}
.gromlab-sprite-viewer__dialog-meta { margin: 0 0 20px; color: var(--sv-muted); text-align: center; font-size: 12px; }
.gromlab-sprite-viewer__colors { margin-bottom: 20px; }
.gromlab-sprite-viewer__hint {
  margin: 0 0 12px;
  padding: 8px 12px;
  color: var(--sv-muted);
  background: var(--sv-card);
  border-left: 3px solid var(--sv-accent);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}
.gromlab-sprite-viewer__colors-title { margin: 0 0 8px; color: var(--sv-muted); font-size: 12px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
.gromlab-sprite-viewer__color-row { position: relative; display: flex; align-items: center; gap: 8px; min-height: 32px; margin-bottom: 6px; }
.gromlab-sprite-viewer__swatch { width: 26px; height: 26px; flex: 0 0 auto; padding: 0; border: 1px solid var(--sv-border); border-radius: 4px; cursor: pointer; }
.gromlab-sprite-viewer__color-label { min-width: 0; overflow-wrap: anywhere; color: var(--sv-muted); font: 12px/1.4 ui-monospace, "SFMono-Regular", Consolas, monospace; }
.gromlab-sprite-viewer__color-popover {
  position: absolute;
  z-index: 5;
  bottom: calc(100% + 6px);
  left: 0;
  width: 224px;
  max-width: calc(100vw - 64px);
  padding: 12px;
  background: var(--sv-bg);
  border: 1px solid var(--sv-border);
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, .22);
}
.gromlab-sprite-viewer__color-picker { display: flex; flex-direction: column; width: 198px; max-width: 100%; height: 160px; }
.gromlab-sprite-viewer__hex-input { display: block; width: 100%; margin-top: 8px; }
.gromlab-sprite-viewer__hex-input::part(input) { box-sizing: border-box; display: block; width: 100%; height: 32px; padding: 0 8px; color: var(--sv-text); text-align: center; background: var(--sv-card); border: 1px solid var(--sv-border); border-radius: 4px; outline: none; font: 12px/1 ui-monospace, "SFMono-Regular", Consolas, monospace; }
.gromlab-sprite-viewer__hex-input::part(input):focus { border-color: var(--sv-accent); }
.gromlab-sprite-viewer__tabs { display: flex; overflow-x: auto; margin-bottom: 12px; border-bottom: 1px solid var(--sv-border); }
.gromlab-sprite-viewer__tab { flex: 0 0 auto; padding: 8px 16px; color: var(--sv-muted); background: none; border: 0; border-bottom: 2px solid transparent; cursor: pointer; font-size: 12px; font-weight: 600; }
.gromlab-sprite-viewer__tab[aria-selected="true"] { color: var(--sv-accent); border-bottom-color: var(--sv-accent); }
.gromlab-sprite-viewer__code { position: relative; overflow: hidden; background: var(--sv-code); border-radius: 8px; }
.gromlab-sprite-viewer__code pre { min-height: 72px; margin: 0; padding: 16px 70px 16px 16px; overflow-x: auto; font: 12px/1.6 ui-monospace, "SFMono-Regular", Consolas, monospace; }
.gromlab-sprite-viewer__copy { position: absolute; top: 8px; right: 8px; padding: 4px 8px; color: var(--sv-muted); background: var(--sv-bg); border: 1px solid var(--sv-border); border-radius: 4px; cursor: pointer; font-size: 11px; }
.gromlab-sprite-viewer__copy:hover { color: var(--sv-text); }
.gromlab-sprite-viewer__code .hl-tag { color: #116329; }
.gromlab-sprite-viewer__code .hl-attr,
.gromlab-sprite-viewer__code .hl-number,
.gromlab-sprite-viewer__code .hl-property { color: #0550ae; }
.gromlab-sprite-viewer__code .hl-string,
.gromlab-sprite-viewer__code .hl-color { color: #0a3069; }
.gromlab-sprite-viewer__code .hl-comment { color: #8b949e; }
.gromlab-sprite-viewer__code .hl-punctuation,
.gromlab-sprite-viewer__code .hl-selector { color: #6639ba; }
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-tag { color: #7ee787; }
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-attr,
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-number,
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-property { color: #79c0ff; }
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-string,
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-color { color: #a5d6ff; }
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-punctuation,
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-selector { color: #d2a8ff; }
@media (prefers-color-scheme: dark) {
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-tag { color: #7ee787; }
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-attr,
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-number,
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-property { color: #79c0ff; }
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-string,
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-color { color: #a5d6ff; }
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-punctuation,
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-selector { color: #d2a8ff; }
}
@media (max-width: 640px) {
  .gromlab-sprite-viewer { padding: 16px; border-radius: 8px; }
  .gromlab-sprite-viewer__header { align-items: stretch; }
  .gromlab-sprite-viewer__toolbar { width: 100%; margin-left: 0; }
  .gromlab-sprite-viewer__search { width: auto; flex: 1; min-width: 0; }
  .gromlab-sprite-viewer__grid { grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 8px; }
  .gromlab-sprite-viewer__icon-wrap,
  .gromlab-sprite-viewer__icon { width: 104px; height: 104px; }
  .gromlab-sprite-viewer__dialog { width: calc(100vw - 20px); max-height: calc(100dvh - 20px); }
  .gromlab-sprite-viewer__dialog-shell { max-height: calc(100dvh - 20px); padding: 16px; }
  .gromlab-sprite-viewer__dialog-preview { padding: 16px; }
  .gromlab-sprite-viewer__dialog-preview-canvas,
  .gromlab-sprite-viewer__dialog-icon,
  .gromlab-sprite-viewer__dialog-img,
  .gromlab-sprite-viewer__dialog-mask { width: min(256px, calc(100vw - 86px)); height: min(256px, calc(100vw - 86px)); }
}
@media (prefers-reduced-motion: reduce) {
  .gromlab-sprite-viewer *,
  .gromlab-sprite-viewer *::before,
  .gromlab-sprite-viewer *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
`,et="gromlab-sprite-viewer",be="gromlab-hex-color-picker",we="gromlab-hex-input",W;function Hr(){return customElements.get(be)&&customElements.get(we)?Promise.resolve():W||(W=Promise.all([Promise.resolve().then(()=>(Ft(),mt)),Promise.resolve().then(()=>(Wt(),_t))]).then(([{HexBase:e},{HexInputBase:t}])=>{customElements.get(be)||customElements.define(be,class extends e{}),customElements.get(we)||customElements.define(we,class extends t{})}),W)}function tt(e,t){const r=e%100,i=e%10,o=r>=11&&r<=19?t[2]:i===1?t[0]:i>=2&&i<=4?t[1]:t[2];return`${e} ${o}`}function Ur(){return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches?"dark":"light"}function rt(e,t){return Object.fromEntries(e.colors.map(({variable:r,fallback:i})=>[r,R(i,t)]))}var Nr=class extends U{static properties={sources:{attribute:!1},viewerTitle:{attribute:"viewer-title"},colorTheme:{attribute:"color-theme"},themeControlled:{attribute:!1},showThemeToggle:{attribute:!1},manifestUrl:{attribute:"manifest-url"},spriteUrl:{attribute:"sprite-url"},_manifests:{state:!0},_errors:{state:!0},_loading:{state:!0},_query:{state:!0},_systemTheme:{state:!0},_selected:{state:!0},_activeTab:{state:!0},_colors:{state:!0},_colorOverrides:{state:!0},_cssColor:{state:!0},_cssColorOverridden:{state:!0},_openColorControl:{state:!0},_copied:{state:!0}};static styles=wt(Pr);_loadVersion=0;_copyTimeout;_media;constructor(){super(),this.sources=[],this.viewerTitle="SVG Sprites",this.colorTheme="auto",this.themeControlled=!1,this.showThemeToggle=!0,this._manifests=[],this._errors=[],this._loading=!1,this._query="",this._systemTheme=Ur(),this._selected=null,this._activeTab="svg",this._colors={},this._colorOverrides={},this._cssColor="#1a1a1a",this._cssColorOverridden=!1,this._openColorControl=null,this._copied=!1}_handleMediaChange=()=>{this._systemTheme=this._media?.matches?"dark":"light",this._syncThemeColors()};_handleDocumentPointerDown=e=>{if(!this._openColorControl)return;e.composedPath().some(r=>r instanceof HTMLElement&&(r.dataset.colorTrigger===this._openColorControl||r.dataset.colorPopover===this._openColorControl))||(this._openColorControl=null)};connectedCallback(){super.connectedCallback(),Hr(),this._media=globalThis.matchMedia?.("(prefers-color-scheme: dark)"),this._systemTheme=this._media?.matches?"dark":"light",this._media?.addEventListener("change",this._handleMediaChange),globalThis.document?.addEventListener("pointerdown",this._handleDocumentPointerDown,!0)}disconnectedCallback(){this._media?.removeEventListener("change",this._handleMediaChange),globalThis.document?.removeEventListener("pointerdown",this._handleDocumentPointerDown,!0),this._copyTimeout&&clearTimeout(this._copyTimeout),super.disconnectedCallback()}updated(e){(e.has("sources")||e.has("manifestUrl")||e.has("spriteUrl"))&&this._loadSources(),e.has("colorTheme")&&this._syncThemeColors()}get _resolvedColorTheme(){return this.colorTheme==="auto"?this._systemTheme:this.colorTheme}get _themeColor(){return this._resolvedColorTheme==="dark"?"#e5e5e5":"#1a1a1a"}_effectiveSources(){const e=Xe(this.sources);return e.length>0?e:this.manifestUrl&&this.spriteUrl?[{manifestUrl:this.manifestUrl,spriteUrl:this.spriteUrl}]:[]}async _loadSources(){const e=++this._loadVersion,t=this._effectiveSources(),r=[],i=[],o=[];this.manifestUrl&&!this.spriteUrl&&Xe(this.sources).length===0&&o.push("The sprite-url attribute is required with manifest-url.");for(const n of t){if(typeof n=="function"||Dt(n)){i.push(n);continue}try{r.push(ee(n))}catch(l){o.push(l instanceof Error?l.message:String(l))}}if(this._manifests=r.sort(Qe),this._errors=o,this._loading=i.length>0,this._selected=null,i.length===0)return;const s=await Promise.allSettled(i.map(Or));if(e!==this._loadVersion)return;const a=[];for(const n of s)n.status==="fulfilled"?a.push(n.value):o.push(n.reason instanceof Error?n.reason.message:String(n.reason));this._manifests=[...r,...a].sort(Qe),this._errors=[...o],this._loading=!1}_syncThemeColors(){this._selected&&(this._colors={...rt(this._selected.icon,this._themeColor),...this._colorOverrides},this._cssColorOverridden||(this._cssColor=this._themeColor))}_toggleTheme(){const e=this._resolvedColorTheme==="dark"?"light":"dark";this.themeControlled||(this.colorTheme=e),this.dispatchEvent(new CustomEvent("color-theme-change",{bubbles:!0,composed:!0,detail:{theme:e}}))}async _selectIcon(e,t){const r=`${e.name}:${e.spriteUrl}:${t.id}`;this._selected={key:r,manifest:e,icon:t},this._activeTab=fe(e)[0]?.id??"svg",this._colorOverrides={},this._colors=rt(t,this._themeColor),this._cssColor=this._themeColor,this._cssColorOverridden=!1,this._openColorControl=null,this._copied=!1,await this.updateComplete;const i=this.renderRoot.querySelector("dialog");i&&!i.open&&i.showModal()}_closeDialog(){const e=this.renderRoot.querySelector("dialog");e?.open&&e.close(),this._selected=null,this._openColorControl=null}_handleBackdropClick(e){if(!(e.currentTarget instanceof HTMLDialogElement)||e.target!==e.currentTarget)return;const t=e.currentTarget.getBoundingClientRect();(e.clientX<t.left||e.clientX>t.right||e.clientY<t.top||e.clientY>t.bottom)&&this._closeDialog()}_handleTabKeyDown(e,t){if(!this._selected)return;const r=fe(this._selected.manifest);let i=null;if(e.key==="ArrowRight"&&(i=(t+1)%r.length),e.key==="ArrowLeft"&&(i=(t-1+r.length)%r.length),e.key==="Home"&&(i=0),e.key==="End"&&(i=r.length-1),i===null)return;e.preventDefault(),this._activeTab=r[i].id;const o=this.renderRoot.querySelectorAll('[role="tab"]');this.updateComplete.then(()=>o[i]?.focus())}_handleColorChange(e,t){const r=R(t);this._colors={...this._colors,[e]:r},this._colorOverrides={...this._colorOverrides,[e]:r}}_handleCssColorChange(e){this._cssColor=R(e),this._cssColorOverridden=!0}async _copyCode(e){if(globalThis.navigator?.clipboard)try{await globalThis.navigator.clipboard.writeText(e),this._copied=!0,this._copyTimeout&&clearTimeout(this._copyTimeout),this._copyTimeout=setTimeout(()=>{this._copied=!1},1500)}catch{this._copied=!1}}_renderColorControl(e,t,r,i){const o=this._openColorControl===r,s=`color-${r.replace(/[^a-zA-Z0-9_-]/g,"-")}`;return p`
      <div class="gromlab-sprite-viewer__color-row">
        <button
          class="gromlab-sprite-viewer__swatch"
          type="button"
          data-color-trigger=${r}
          style=${_e({backgroundColor:t})}
          aria-label=${`Изменить цвет ${e}`}
          aria-expanded=${String(o)}
          aria-controls=${F(o?s:void 0)}
          title=${`Изменить цвет ${e}`}
          @click=${()=>{this._openColorControl=o?null:r}}
        ></button>
        <code class="gromlab-sprite-viewer__color-label">${e}</code>
        ${o?p`
          <div
            id=${s}
            class="gromlab-sprite-viewer__color-popover"
            data-color-popover=${r}
            role="dialog"
            aria-label=${`Выбор цвета ${e}`}
            @keydown=${a=>{a.key==="Escape"&&(a.preventDefault(),a.stopPropagation(),this._openColorControl=null)}}
          >
            <gromlab-hex-color-picker
              class="gromlab-sprite-viewer__color-picker"
              .color=${t}
              @color-changed=${a=>i(a.detail.value)}
            ></gromlab-hex-color-picker>
            <gromlab-hex-input
              class="gromlab-sprite-viewer__hex-input"
              .color=${t}
              .prefixed=${!0}
              aria-label=${`HEX-значение ${e}`}
              @color-changed=${a=>i(a.detail.value)}
            ></gromlab-hex-input>
          </div>
        `:c}
      </div>
    `}_renderDialogPreview(e,t){const r=`${e.spriteUrl}#${t.id}`;return this._activeTab==="img"?p`<img class="gromlab-sprite-viewer__dialog-img" src=${r} alt=${t.name}>`:this._activeTab==="css"?p`
        <div
          class="gromlab-sprite-viewer__dialog-mask"
          role="img"
          aria-label=${t.name}
          style=${_e({backgroundColor:this._cssColor,mask:`url('${r}') no-repeat center / contain`,"-webkit-mask":`url('${r}') no-repeat center / contain`})}
        ></div>
      `:p`
      <svg
        class="gromlab-sprite-viewer__dialog-icon"
        viewBox=${F(t.viewBox??void 0)}
        aria-label=${t.name}
        role="img"
      >
        <use href=${r}></use>
      </svg>
    `}_renderDialog(){if(!this._selected)return c;const{manifest:e,icon:t}=this._selected,r=fe(e),i=r.some(n=>n.id===this._activeTab)?this._activeTab:r[0].id,o=yr({manifest:e,icon:t,tab:i,colorOverrides:this._colorOverrides,cssColor:this._cssColor}),s=wr(t.viewBox),a=i!=="img"&&i!=="css";return p`
      <dialog
        class="gromlab-sprite-viewer__dialog"
        aria-labelledby="viewer-dialog-title"
        @cancel=${n=>{n.preventDefault(),this._closeDialog()}}
        @click=${this._handleBackdropClick}
      >
        <div class="gromlab-sprite-viewer__dialog-shell">
          <button
            class="gromlab-sprite-viewer__close"
            type="button"
            aria-label="Закрыть"
            autofocus
            @click=${this._closeDialog}
          >&#x2715;</button>

          <div class="gromlab-sprite-viewer__dialog-preview" style=${_e(this._colors)}>
            <div class="gromlab-sprite-viewer__dialog-preview-canvas">
              ${this._renderDialogPreview(e,t)}
            </div>
          </div>

          <div class="gromlab-sprite-viewer__dialog-heading">
            <h2 id="viewer-dialog-title" class="gromlab-sprite-viewer__dialog-title">${t.name}</h2>
            ${s?p`<span class="gromlab-sprite-viewer__viewbox">${s}</span>`:c}
          </div>
          <p class="gromlab-sprite-viewer__dialog-meta">${e.name} · ${e.format} · ${e.target}</p>

          <div class="gromlab-sprite-viewer__colors">
            ${a&&t.colors.length>0?p`
              <p class="gromlab-sprite-viewer__hint">
                Цвета применяются к превью через CSS-переменные и попадут в пример кода.
              </p>
              <h3 class="gromlab-sprite-viewer__colors-title">CSS Variables</h3>
              ${t.colors.map(({variable:n,fallback:l})=>this._renderColorControl(`${n}: ${l}`,this._colors[n],n,g=>this._handleColorChange(n,g)))}
            `:c}
            ${a&&t.colors.length===0?p`
              <p class="gromlab-sprite-viewer__hint">У иконки нет настраиваемых цветовых переменных.</p>
            `:c}
            ${i==="img"?p`
              <p class="gromlab-sprite-viewer__hint">
                IMG изолирует SVG: CSS-переменные и currentColor внутрь изображения не передаются.
              </p>
            `:c}
            ${i==="css"?p`
              <p class="gromlab-sprite-viewer__hint">
                CSS mask отображает иконку одним цветом через background-color.
              </p>
              ${this._renderColorControl("background-color",this._cssColor,"background-color",n=>this._handleCssColorChange(n))}
            `:c}
          </div>

          <div class="gromlab-sprite-viewer__tabs" role="tablist" aria-label="Способ подключения">
            ${r.map((n,l)=>p`
              <button
                id=${`viewer-${n.id}-tab`}
                class="gromlab-sprite-viewer__tab"
                type="button"
                role="tab"
                aria-selected=${String(i===n.id)}
                aria-controls="viewer-code-panel"
                tabindex=${i===n.id?0:-1}
                @click=${()=>{this._activeTab=n.id}}
                @keydown=${g=>this._handleTabKeyDown(g,l)}
              >${n.label}</button>
            `)}
          </div>

          <div
            id="viewer-code-panel"
            class="gromlab-sprite-viewer__code"
            role="tabpanel"
            aria-labelledby=${`viewer-${i}-tab`}
          >
            <pre><code>${_r(Sr(o.code,o.language))}</code></pre>
            <button
              class="gromlab-sprite-viewer__copy"
              type="button"
              @click=${()=>{this._copyCode(o.code)}}
            >${this._copied?"Скопировано":"Копировать"}</button>
          </div>
        </div>
      </dialog>
    `}render(){const e=this._query.trim().toLowerCase(),t=this._manifests.map(o=>({manifest:o,icons:o.icons.filter(s=>e===""||s.name.toLowerCase().includes(e)||o.name.toLowerCase().includes(e))})).filter(o=>o.icons.length>0),r=this._manifests.reduce((o,s)=>o+s.iconCount,0),i=t.reduce((o,s)=>o+s.icons.length,0);return p`
      <section
        class="gromlab-sprite-viewer"
        data-sprite-viewer
        data-theme=${F(this.colorTheme==="auto"?void 0:this.colorTheme)}
      >
        <header class="gromlab-sprite-viewer__header">
          <h1 class="gromlab-sprite-viewer__title">${this.viewerTitle}</h1>
          <span class="gromlab-sprite-viewer__summary">
            ${tt(this._manifests.length,["спрайт","спрайта","спрайтов"])}
            · ${tt(r,["иконка","иконки","иконок"])}
            ${e?` · найдено ${i}`:c}
          </span>
          <div class="gromlab-sprite-viewer__toolbar">
            <input
              class="gromlab-sprite-viewer__search"
              type="search"
              .value=${this._query}
              @input=${o=>{this._query=o.currentTarget.value}}
              placeholder="Найти иконку"
              aria-label="Поиск иконок"
            >
            ${this.showThemeToggle?p`
              <button
                class="gromlab-sprite-viewer__theme"
                type="button"
                aria-label="Переключить тему"
                title="Переключить тему"
                @click=${this._toggleTheme}
              >&#x25D1;</button>
            `:c}
          </div>
        </header>

        ${this._errors.length>0?p`
          <div class="gromlab-sprite-viewer__errors" role="alert">
            ${this._errors.map(o=>p`<div>${o}</div>`)}
          </div>
        `:c}

        ${t.map(({manifest:o,icons:s})=>p`
          <section class="gromlab-sprite-viewer__group">
            <div class="gromlab-sprite-viewer__group-header">
              <h2 class="gromlab-sprite-viewer__group-title">${o.name}</h2>
              <span class="gromlab-sprite-viewer__badge">${o.format}</span>
              <span class="gromlab-sprite-viewer__group-count">${s.length}</span>
              ${o.description?p`
                <p class="gromlab-sprite-viewer__description">${o.description}</p>
              `:c}
            </div>
            <div class="gromlab-sprite-viewer__grid">
              ${s.map(a=>p`
                <button
                  class="gromlab-sprite-viewer__card"
                  type="button"
                  data-icon-name=${a.name}
                  title=${`Открыть ${a.name}`}
                  @click=${()=>{this._selectIcon(o,a)}}
                >
                  <span class="gromlab-sprite-viewer__icon-wrap">
                    <svg
                      class="gromlab-sprite-viewer__icon"
                      viewBox=${F(a.viewBox??void 0)}
                      aria-hidden="true"
                    >
                      <use href=${`${o.spriteUrl}#${a.id}`}></use>
                    </svg>
                  </span>
                  <span class="gromlab-sprite-viewer__icon-name">${a.name}</span>
                </button>
              `)}
            </div>
          </section>
        `)}

        ${t.length===0&&(!this._loading||this._manifests.length>0)?p`
          <div class="gromlab-sprite-viewer__status">
            ${this._manifests.length===0?"Спрайты не подключены":"Иконки не найдены"}
          </div>
        `:c}
        ${this._loading&&this._manifests.length===0?p`
          <div class="gromlab-sprite-viewer__status">Загрузка спрайтов...</div>
        `:c}

        <footer class="gromlab-sprite-viewer__footer">
          <span>@gromlab/svg-sprites</span>
          <a href="https://github.com/gromlab-ru/svg-sprites" target="_blank" rel="noreferrer">Repository</a>
        </footer>

        ${this._renderDialog()}
      </section>
    `}};function Dr(){customElements.get(et)||customElements.define(et,Nr)}Dr();/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
lit-html/directive.js:
lit-html/directives/unsafe-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/if-defined.js:
lit-html/directives/style-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/export{Dr as defineSpriteViewerElement};
