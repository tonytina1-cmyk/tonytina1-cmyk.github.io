/* Kawan interactive private test. Existing TBT Workers AI backend; no client API keys. */
(() => {
'use strict';
const endpoint='https://flat-dawntbt-bali-ai-026d.tbt-tours-travel.workers.dev/chat';
const input=document.getElementById('question');
const form=document.getElementById('form');
const log=document.getElementById('messages');
const mic=document.getElementById('mic');
const statusEl=document.getElementById('status');
const formButton=form?.querySelector('button[type=submit]');
if(!input||!form||!log||!statusEl)return;
const history=[];
const character=document.getElementById('character');
const characterImage=document.getElementById('kawan');
const questionField=document.getElementById('question');
const poseStyle=document.createElement('style');
poseStyle.textContent=`
/* Conversation poses use the already-approved Kawan artwork: no shaking or bouncing. */
.character.conversation.speaking img.talk{
  mask-image:radial-gradient(ellipse 7.5% 2.7% at 54.3% 37.5%,black 62%,transparent 100%);
  -webkit-mask-image:radial-gradient(ellipse 7.5% 2.7% at 54.3% 37.5%,black 62%,transparent 100%);
  transform:translate(-4.12%,.48%);
}
`;
document.head.append(poseStyle);
let poseTick=0;
function pose(mode){
 if(!character)return;
 character.classList.remove('kawan-listening','kawan-thinking','kawan-answering','kawan-nodding');
 if(mode)character.classList.add('kawan-'+mode);
 if(typeof frames!=='undefined'){
   // Resting pose is frame 4 (both hands down). During thinking the approved half-gesture is frame 5.
   characterImage.src=frames[mode==='thinking'?5:4];
 }
 // No full-body shakes or bobbing: pose changes only between approved drawings.
 poseTick++;
}
questionField.addEventListener('focus',()=>{if(!busy)pose('listening')});
questionField.addEventListener('blur',()=>{if(!busy&&character?.classList.contains('kawan-listening'))pose(null)});

let busy=false;
let pending=null;
let lastAnswer='';
const help=document.querySelector('.chat');
const toolbar=document.createElement('div');
toolbar.className='controls';
toolbar.style.cssText='justify-content:flex-start;flex-wrap:wrap;margin:11px 0';
toolbar.innerHTML='<a id="kawan-wa" target="_blank" rel="noopener noreferrer" href="#" class="secondary" style="text-decoration:none;font-weight:700;border-radius:11px;padding:11px 14px;display:inline-flex;align-items:center">💬 Ask Budi on WhatsApp</a><a id="kawan-email" href="#" class="secondary" style="text-decoration:none;font-weight:700;border-radius:11px;padding:11px 14px;display:inline-flex;align-items:center">✉️ Email Budi</a><button type="button" class="secondary" id="kawan-stop">■ Stop speaking</button><button type="button" class="secondary" id="kawan-reset">↺ New chat</button>';
form.nextElementSibling?.after(toolbar);
const note=document.createElement('p');
note.style.cssText='font-size:12px;line-height:1.45;color:#647469;margin:7px 0';
note.textContent='Kawan is an AI assistant. Replies may be mistaken. Tour prices, animal experiences and availability must be confirmed by Budi. Messages are sent to TBT’s AI service for a reply; no booking is placed here.';
toolbar.after(note);
const wa=toolbar.querySelector('#kawan-wa'),mail=toolbar.querySelector('#kawan-email');
function draft(){
 const lines=['Hi Budi, I was chatting with Kawan on the TBT website and would like your help with a Bali enquiry.'];
 for(const m of history.filter(x=>x.role==='user').slice(-8))lines.push('- '+m.content.slice(0,250));
 lines.push('','Could you please confirm availability, price and details? Thanks!');
 return lines.join('\n').slice(0,2000);
}
function updateLinks(){
 const d=draft();
 wa.href='https://wa.me/6285738148276?text='+encodeURIComponent(d);
 mail.href='mailto:booking.tbtbali@gmail.com?subject='+encodeURIComponent('TBT Bali enquiry from Kawan')+'&body='+encodeURIComponent(d);
}
function addBubble(message,isUser=false){
 const el=document.createElement('div');el.className='bubble'+(isUser?' mine':'');el.textContent=message;log.append(el);log.scrollTop=log.scrollHeight;return el;
}
function setBusy(value){
 busy=value;
 formButton.disabled=value;
 input.disabled=value;
 if(mic)mic.disabled=value||mic.dataset.unavailable==='true';
}
function safetyReply(question,answer){
 const text=String(answer||'').trim();
 if(/\b(?:send|message|contact|text|whatsapp|email|write to|reach|talk to)\b/i.test(question)&&/\bbudi|buddy\b/i.test(question)){
   return "I can prepare a message for Budi. Tap 'Ask Budi on WhatsApp' or 'Email Budi' below to open your enquiry draft. Review it and press Send yourself — I can't send it automatically.";
 }
 if(/\b(?:send|message|contact|text|whatsapp|email)\b/i.test(question)&&/\b(?:him|her|driver)\b/i.test(question)&&history.some(m=>/\bbudi\b/i.test(m.content))){
   return "I can prepare a message for Budi. Use the WhatsApp or Email button below to open a draft, check the details and send it yourself.";
 }

 if(/\b(?:booked|booking confirmed|confirmed your|your driver will|budi will be waiting)\b/i.test(text))
 return 'I can help prepare your enquiry, but I cannot confirm a booking or a driver. Please use the WhatsApp or Email Budi buttons for confirmation.';
 if(/\b(?:elephant|gajah)\b/i.test(question)&&/\b(?:ride|riding|mount|safari)\b/i.test(question)){
   return 'I can help you ask Budi about elephant experiences in Bali. For animal welfare, I recommend observing elephants rather than riding them. Would you like to ask Budi what options are currently available?';
 }
 if(/\b(?:elephant|gajah)\b/i.test(question)&&!/\b(?:elephant|gajah)\b/i.test(text)){
   return 'Yes, TBT can help you enquire about elephant experiences. Budi will need to confirm what is available, pricing and the animal-welfare arrangements. Would you like to ask him?';
 }
 return text;
}
function offlineAnswer(q){
 if(/\b(?:elephant|gajah)\b/i.test(q))return 'TBT can help enquire about elephant experiences. I recommend observation rather than riding for animal welfare. Budi can check current options and prices.';
 if(/\b(?:airport|flight|transfer|pickup|pick up|hotel)\b/i.test(q))return 'TBT can help arrange Bali airport, hotel and port transfers. Budi can confirm the pickup details and price.';
 if(/\b(?:atv|quad|rafting|cycling|surf|jeep|cooking|tattoo|snorkel)\b/i.test(q))return 'TBT offers several Bali activities, including ATV, rafting, cycling, surfing, cooking experiences and Mount Batur jeep trips. Budi can check the activity you want.';
 return 'The live AI connection is unavailable right now. You can still ask Budi through the WhatsApp or Email buttons below.';
}
async function liveAnswer(q){
 const controller=new AbortController();
 pending=controller;
 const timeout=setTimeout(()=>controller.abort(),18000);
 try{
   const prior=history.slice(-11);
   const response=await fetch(endpoint,{
     method:'POST',mode:'cors',cache:'no-store',
     headers:{'content-type':'application/json'},
     signal:controller.signal,
     body:JSON.stringify({messages:prior})
   });
   const data=await response.json();
   if(!response.ok||typeof data.reply!=='string'||!data.reply.trim())throw new Error(data.error||'No reply');
   return safetyReply(q,data.reply.slice(0,1600));
 }finally{clearTimeout(timeout);pending=null;}
}
async function submitQuestion(text){
 const q=String(text||'').trim().slice(0,600);
 if(!q||busy)return;
 pose('thinking');
 if(typeof stopReply==='function')stopReply();
 if(typeof audio!=='undefined'){audio.pause();try{audio.currentTime=0}catch(e){}}
 setBusy(true);
 addBubble(q,true);
 history.push({role:'user',content:q});
 updateLinks();
 statusEl.textContent='Kawan is thinking…';
 const loading=addBubble('Kawan is thinking…');
 try{
   const answer=await liveAnswer(q);
   loading.remove();
   addBubble(answer);
   history.push({role:'assistant',content:answer});
   lastAnswer=answer;
   pose('answering');
   if(typeof sayAnswer==='function')sayAnswer(answer);
   else statusEl.textContent='Kawan answered in text.';
 }catch(err){
   loading.remove();
   history.pop();
   const answer=offlineAnswer(q);
   addBubble(answer);
   lastAnswer=answer;
   pose('answering');
   statusEl.textContent=err?.name==='AbortError'?'AI reply timed out. You can retry or contact Budi.':/Too many messages|429/i.test(String(err?.message))?'Too many messages just now — try again shortly.':'Live AI temporarily unavailable. Limited answers only.';
   if(typeof sayAnswer==='function')sayAnswer(answer);
 }finally{
   setBusy(false);
   updateLinks();
   // After the spoken reply finishes, the existing speech handler leaves the character steady.
   // A brief nod offers acknowledgment without replacing any approved artwork.
   if(!spokenReplies||muted||!window.speechSynthesis)pose('nodding');
 }
}
ask=submitQuestion;
form.onsubmit=e=>{e.preventDefault();const q=input.value;input.value='';submitQuestion(q)};
const quickButtons=document.querySelectorAll('[data-q]');
quickButtons.forEach(el=>{el.onclick=()=>submitQuestion(el.dataset.q)});
toolbar.querySelector('#kawan-stop').onclick=()=>{pose('listening');if(typeof stopReply==='function')stopReply();if(typeof audio!=='undefined')audio.pause();if(typeof figure!=='undefined')figure.classList.remove('speaking');statusEl.textContent='Speech stopped.'};
toolbar.querySelector('#kawan-reset').onclick=()=>{
 if(pending)pending.abort();
 if(typeof stopReply==='function')stopReply();
 history.length=0;pose('listening');log.replaceChildren();addBubble("Hi, I'm Kawan, TBT's AI Bali travel buddy. What would you like to explore?");
 lastAnswer='';setBusy(false);updateLinks();statusEl.textContent='New conversation started.';
};
if(mic&&!('SpeechRecognition' in window)&&!('webkitSpeechRecognition' in window))mic.dataset.unavailable='true';
if(mic){mic.addEventListener('click',()=>{if(!mic.disabled)pose('listening')},true)}
const poseStatusObserver=new MutationObserver(()=>{
 const state=statusEl.textContent||'';
 if(/ready for another question/i.test(state)&&character?.classList.contains('kawan-answering'))pose('nodding');
 else if(/ready to help/i.test(state)&&!character?.classList.contains('kawan-thinking'))pose('listening');
});
poseStatusObserver.observe(statusEl,{childList:true,characterData:true,subtree:true});

updateLinks();
})();
