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
   if(typeof sayAnswer==='function')sayAnswer(answer);
   else statusEl.textContent='Kawan answered in text.';
 }catch(err){
   loading.remove();
   history.pop();
   const answer=offlineAnswer(q);
   addBubble(answer);
   lastAnswer=answer;
   statusEl.textContent=err?.name==='AbortError'?'AI reply timed out. You can retry or contact Budi.':/Too many messages|429/i.test(String(err?.message))?'Too many messages just now — try again shortly.':'Live AI temporarily unavailable. Limited answers only.';
   if(typeof sayAnswer==='function')sayAnswer(answer);
 }finally{
   setBusy(false);
   updateLinks();
 }
}
ask=submitQuestion;
form.onsubmit=e=>{e.preventDefault();const q=input.value;input.value='';submitQuestion(q)};
const quickButtons=document.querySelectorAll('[data-q]');
quickButtons.forEach(el=>{el.onclick=()=>submitQuestion(el.dataset.q)});
toolbar.querySelector('#kawan-stop').onclick=()=>{if(typeof stopReply==='function')stopReply();if(typeof audio!=='undefined')audio.pause();if(typeof figure!=='undefined')figure.classList.remove('speaking');statusEl.textContent='Speech stopped.'};
toolbar.querySelector('#kawan-reset').onclick=()=>{
 if(pending)pending.abort();
 if(typeof stopReply==='function')stopReply();
 history.length=0;log.replaceChildren();addBubble("Hi, I'm Kawan, TBT's AI Bali travel buddy. What would you like to explore?");
 lastAnswer='';setBusy(false);updateLinks();statusEl.textContent='New conversation started.';
};
if(mic&&!('SpeechRecognition' in window)&&!('webkitSpeechRecognition' in window))mic.dataset.unavailable='true';
updateLinks();
})();
