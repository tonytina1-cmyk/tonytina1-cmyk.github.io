/* Kawan's interactive home-page 3D character.
   A lightweight original geometry-based mascot, not a 2D image.
   Ready to swap for a rigged GLB later without changing the chat/booking flow. */
(async()=>{
 const target=document.getElementById('kawan-3d-canvas');
 if(!target)return;
 const fallback=document.querySelector('.kawan-3d-fallback');
 if(!('WebGLRenderingContext' in window)){if(fallback)fallback.hidden=false;return;}
 let THREE;
 try{THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');}
 catch(e){if(fallback)fallback.hidden=false;return;}
 let renderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}
 catch(e){if(fallback)fallback.hidden=false;return;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.setClearColor(0xffffff,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 target.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(32,1,.1,40);
 camera.position.set(0,1.45,7.9);
 camera.lookAt(0,.72,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0xb7ba9c,2.3));
 const key=new THREE.DirectionalLight(0xffe4b6,2.3);key.position.set(-3,6,6);scene.add(key);
 const fill=new THREE.DirectionalLight(0xc7e8dc,1.1);fill.position.set(4,3,-1);scene.add(fill);
 const mat=(c,rough=.8)=>new THREE.MeshStandardMaterial({color:c,roughness:rough});
 const skin=mat('#c98459'),skinLight=mat('#dd9e74'),hair=mat('#241b1b'),shirt=mat('#f7eddb'),green=mat('#18533e'),gold=mat('#d7a44d'),white=mat('#fffdf5'),dark=mat('#281d1b'),mouth=mat('#78463c'),pink=mat('#e7a8a0');
 const root=new THREE.Group();root.position.y=-.14;scene.add(root);
 function ball(parent,color,x,y,z,sx,sy,sz){const obj=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),color);obj.position.set(x,y,z);obj.scale.set(sx,sy,sz);parent.add(obj);return obj;}
 function tube(parent,color,coords,r=.045){const curve=new THREE.CatmullRomCurve3(coords.map(p=>new THREE.Vector3(...p)));const ob=new THREE.Mesh(new THREE.TubeGeometry(curve,32,r,7,false),color);parent.add(ob);return ob;}
 const body=new THREE.Group();root.add(body);
 ball(body,shirt,0,-.73,0,.92,1.06,.44);
 ball(body,skin,0,.22,.06,.29,.31,.27);
 ball(body,shirt,-.76,-.65,0,.35,.69,.39);
 ball(body,shirt,.76,-.65,0,.35,.69,.39);
 // Palm patterns on the shirt
 for(const [x,y,z,rot] of [[-.42,-.42,.39,-.35],[.39,-.83,.38,.38],[-.18,-1.24,.45,.5]]){
  const leaf=ball(body,green,x,y,z,.09,.23,.02);leaf.rotation.z=rot;
 }
 const head=new THREE.Group();head.position.set(0,.78,.02);body.add(head);
 ball(head,skin,0,.22,0,.72,.85,.63);
 ball(head,hair,0,.78,-.14,.74,.36,.62);
 for(let i=0;i<8;i++){const a=(i/7)*Math.PI;ball(head,hair,-.6+i*.17,.76+Math.sin(a)*.15,.29, .17,.24,.25);}
 ball(head,skin,-.71,.2,0,.18,.27,.2);ball(head,skin,.71,.2,0,.18,.27,.2);
 // Balinese patterned headband and folded knot
 const band=ball(head,green,0,.75,.2,.77,.20,.64);
 band.rotation.z=.04;
 tube(head,gold,[[-.7,.8,.54],[-.34,.72,.68],[0,.77,.77],[.35,.72,.7],[.72,.79,.52]],.045);
 const knot=ball(head,gold,.37,.83,.65,.15,.12,.09);knot.rotation.z=.7;
 const eyes=[];
 for(const x of [-.28,.28]){
  ball(head,white,x,.29,.564,.205,.25,.102);
  ball(head,dark,x,.27,.663,.108,.15,.061);
  ball(head,white,x-.035,.32,.719,.033,.044,.016);
  eyes.push(ball(head,skinLight,x,.29,.687,.22,.005,.012));
  tube(head,hair,[[x-.17,.60,.57],[x,.64,.64],[x+.17,.59,.57]],.042);
 }
 ball(head,skinLight,0,.07,.642,.125,.19,.17);
 tube(head,mouth,[[-.22,-.1,.575],[-.12,-.19,.629],[0,-.22,.638],[.13,-.19,.622],[.24,-.1,.573]],.036);
 ball(head,pink,-.36,-.04,.52,.12,.046,.02);ball(head,pink,.36,-.04,.52,.12,.046,.02);
 // Frangipani flower
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const petal=ball(head,white,-.76+Math.cos(a)*.12,.57+Math.sin(a)*.12,.38,.09,.18,.055);petal.rotation.z=a-Math.PI/2;}
 ball(head,gold,-.76,.57,.45,.065,.065,.04);
 // Waving arm, joint hierarchy so it's genuinely articulated geometry
 const wavingArm=new THREE.Group();wavingArm.position.set(1,-.40,.02);body.add(wavingArm);
 ball(wavingArm,shirt,.12,-.32,.0,.28,.45,.32);
 const elbow=new THREE.Group();elbow.position.set(.19,-.55,.12);wavingArm.add(elbow);
 ball(elbow,skin,.18,-.22,.06,.20,.36,.19);
 ball(elbow,skinLight,.25,-.52,.08,.24,.27,.12);
 for(let i=0;i<4;i++)ball(elbow,skinLight,.11+i*.1,-.73,.08,.043,.18,.052);
 // Strap makes Kawan look like a travel buddy
 tube(body,green,[[.5,.0,.17],[.38,-.45,.48],[.21,-.95,.49]],.085);
 const clock=new THREE.Clock(),reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 let mood='idle',waveEnd=0,visible=false,raf=0,blinkAt=3,blinkEnd=0;
 const resize=()=>{const w=Math.max(240,target.clientWidth),h=Math.max(260,target.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
 const ro=new ResizeObserver(resize);ro.observe(target);resize();
 const observe=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else if(raf){cancelAnimationFrame(raf);raf=0;}},{threshold:.05});observe.observe(target);
 function animate(){
  raf=requestAnimationFrame(animate);
  const t=clock.getElapsedTime(),active=!reduce.matches;
  body.position.y=active?Math.sin(t*1.5)*.045:0;
  head.rotation.z=active?Math.sin(t*.65)*.045:0;
  head.rotation.y=active?Math.sin(t*.5)*.09:0;
  if(t>blinkAt){blinkEnd=t+.17;blinkAt=t+3.0+Math.random()*3.1;}
  for(const e of eyes)e.scale.y=t<blinkEnd?12:1;
  const waving=t<waveEnd;
  wavingArm.rotation.z=waving?-.65+Math.sin(t*13)*.28:-.12+(active?Math.sin(t*1.2)*.06:0);
  wavingArm.rotation.x=waving?-.3:0;
  renderer.render(scene,camera);
 }
 function start(){if(visible&&!raf)animate();}
 function wave(){waveEnd=clock.getElapsedTime()+2.0;mood='wave';}
 const waveButton=document.getElementById('kawan-3d-wave');
 const chatButton=document.getElementById('kawan-3d-chat');
 waveButton?.addEventListener('click',wave);
 target.addEventListener('click',wave);
 chatButton?.addEventListener('click',()=>{
  const launch=document.querySelector('#tbt-ai-chat .launch');
  if(launch){const shadow=document.getElementById('tbt-ai-chat')?.shadowRoot;shadow?.querySelector('.launch')?.click();}
  else document.getElementById('tbt-ai-chat')?.scrollIntoView({behavior:'smooth',block:'center'});
 });
 // Note: the chat lives in a Shadow DOM, so resolve its launch button there.
 if(chatButton)chatButton.addEventListener('click',()=>document.getElementById('tbt-ai-chat')?.shadowRoot?.querySelector('.launch')?.click(),{once:false});
 wave();
})();
