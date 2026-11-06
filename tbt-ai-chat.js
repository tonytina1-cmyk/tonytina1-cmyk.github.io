/* TBT optional real-AI chat UI. Load only after deploying the Cloudflare Worker.
   Set window.TBT_AI_ENDPOINT to the deployed /chat URL before loading this script. */
(() => {
 'use strict';
 const endpoint=window.TBT_AI_ENDPOINT;
 if(typeof endpoint!=='string'||!/^https:\/\//.test(endpoint)||document.getElementById('tbt-ai-chat'))return;
 const old=document.getElementById('tbt-trip-help');
 if(old)old.remove(); // never show competing helpers once real AI is enabled
 const host=document.createElement('div');host.id='tbt-ai-chat';
 const actions=document.querySelector('.hero-actions'),heading=document.querySelector('main h1')||document.querySelector('h1');
 if(actions)actions.append(host);else if(heading)heading.insertAdjacentElement('afterend',host);else return;
 const root=host.attachShadow({mode:'open'});
 root.innerHTML=`<style>
 :host{display:block;font:16px/1.45 system-ui,sans-serif;color:#18352c}*{box-sizing:border-box}button,input,textarea{font:inherit}button{cursor:pointer}button:focus-visible,a:focus-visible,textarea:focus-visible{outline:3px solid #b78024;outline-offset:3px}[hidden]{display:none!important}
 .launch{border:1px solid #c9b77d;background:#fffaf0;color:#18352c;padding:12px 18px;border-radius:28px;font-weight:700;min-height:46px}
 dialog{padding:0;border:1px solid #dfd3bf;border-radius:20px;width:min(510px,calc(100vw - 18px));max-width:none;max-height:calc(100dvh - 18px);background:#fffaf0;color:#18352c;box-shadow:0 22px 65px #0004;overflow:hidden}dialog::backdrop{background:#10241d77}
 header{display:flex;align-items:center;gap:10px;background:#18352c;color:white;padding:10px 12px}.logo{display:grid;place-items:center;background:#e8dcb5;color:#18352c;border-radius:50%;width:42px;height:42px;font-weight:800;flex-shrink:0}.heading{flex:1}h2{font-size:17px;line-height:1.2;margin:0}header small{display:block;color:#dce6de;margin-top:3px;font-size:11px}.close{min-width:44px;min-height:44px;background:transparent;border:1px solid #80998c;border-radius:10px;color:white;font-size:23px}
 .chat{display:flex;flex-direction:column;max-height:calc(100dvh - 90px)}.history{overflow:auto;overscroll-behavior:contain;min-height:180px;max-height:calc(100dvh - 285px);padding:12px}.bubble{margin:0 25px 12px 0;padding:12px 14px;border-radius:16px 16px 16px 3px;border:1px solid #e4dcc9;background:#fff;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:1.45}.bubble.user{margin:0 0 12px 25px;background:#e6efe7;border-color:#c7d7c9;border-radius:16px 16px 3px 16px}.suggestions{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 12px}.suggestions button{border:1px solid #91a99a;border-radius:20px;padding:8px 11px;min-height:40px;background:white;color:#18352c;font-size:13px}
 form{display:flex;align-items:flex-end;gap:8px;padding:8px 12px;border-top:1px solid #dfd3bf}textarea{resize:vertical;min-height:45px;max-height:116px;border:1px solid #afbeb5;background:white;color:#18352c;border-radius:12px;padding:11px;min-width:0;flex:1;font-size:16px}.send{border:0;background:#176b4d;color:white;border-radius:12px;padding:10px 16px;min-height:45px;font-weight:700}.send:disabled{opacity:.55;cursor:default}.links{display:flex;flex-wrap:wrap;gap:8px;padding:0 12px 7px}.links a,.links button{flex:1;text-decoration:none;text-align:center;border:1px solid #176b4d;border-radius:11px;padding:8px 6px;font-size:12px;line-height:1.25;font-weight:700;color:#176b4d;background:#fff;min-height:44px}.links button{flex:0 0 auto;white-space:nowrap}.links a.wa{flex:1.25}.links a.email{flex:1}.note{font-size:11px;color:#52675d;padding:0 12px 9px;margin:0}.status{font-size:12px;color:#52675d;margin:0;padding:0 14px 8px;min-height:18px}
 @media(max-height:570px){.history{max-height:32dvh;min-height:95px}}@media(max-width:420px){.logo{width:34px;height:34px;font-size:12px}.heading h2{font-size:16px}.links{gap:5px}.links a,.links button{font-size:11px;padding:8px 5px}.note{font-size:10px}header small{font-size:10px}}
 </style>
 <button type="button" class="launch" aria-haspopup="dialog">💬 Chat with our Bali AI guide</button>
 <dialog aria-labelledby="tbt-ai-title"><header><span class="logo" aria-hidden="true">TBT</span><div class="heading"><h2 id="tbt-ai-title">Your Bali travel buddy 🌴</h2><small>AI trip guide · Budi helps with bookings</small></div><button class="close" type="button" aria-label="Close chat">×</button></header>
 <div class="chat"><div class="history" role="log" aria-live="polite" aria-label="Chat conversation"></div><div class="suggestions"></div>
 <form><textarea aria-label="Your message" maxlength="1200" rows="2" placeholder="Tell me about your Bali plans…"></textarea><button class="send" type="submit">Send</button></form>
 <p class="status" role="status"></p><div class="links"><a class="wa" target="_blank" rel="noopener" href="#">WhatsApp Budi</a><a class="email" href="#">Email Budi</a><button type="button" class="restart">Start over</button></div>
 <p class="note">I'm an AI guide, not Budi 😊 Budi confirms all prices, availability and bookings. Nothing is booked through this chat.</p></div></dialog>`;
 const $=s=>root.querySelector(s),dialog=$('dialog'),history=$('.history'),suggestions=$('.suggestions'),textarea=$('textarea');
 let messages=[],busy=false,returnFocus=null,requestId=0;
 function soundsConfirmed(reply){return /\b(?:we(?:'|’)ve (?:got you covered|booked|confirmed)|(?:your|the) (?:booking|reservation|transfer|pickup|driver) (?:is|has been) (?:booked|confirmed|arranged|scheduled)|(?:budi|your driver) (?:will be|is) waiting|(?:you(?:'|’)re|you are) (?:all set|booked|confirmed)|confirmed for \d)/i.test(reply);}
 function safeReply(){return 'Sounds good! 😊 Just to be clear, nothing is booked yet. Is that your arrival time at Bali Airport, or when you need picking up? Budi can confirm the arrangements on WhatsApp.';}
 function bubble(message,user=false){const div=document.createElement('div');div.className='bubble'+(user?' user':'');div.textContent=message;history.append(div);history.scrollTop=history.scrollHeight;}
 function controls(){const summary=messages.filter(m=>m.role==='user').map(m=>m.content).join('\n').slice(0,3200);
 const draft='Hi Budi, I have been chatting with the TBT Bali AI trip helper. Here is what I would like to discuss:\n\n'+(summary||'I would love your help planning a Bali trip.')+'\n\nPlease confirm dates, availability, price and inclusions. Thank you!';
 $('.wa').href='https://wa.me/6285738148276?text='+encodeURIComponent(draft);
 $('.email').href='mailto:booking.tbtbali@gmail.com?subject='+encodeURIComponent('TBT Bali trip enquiry')+'&body='+encodeURIComponent(draft);
 }
 function reset(){requestId++;busy=false;$('.send').disabled=false;textarea.disabled=false;$('.status').textContent='';messages=[];history.replaceChildren();bubble('Hey! 👋 Welcome to Bali 🌴 I can help with places to visit, tours and transfers. What are you planning?');suggestions.replaceChildren();
 ['🌴 What should we see in Bali?','✈️ Airport pickup','🏝️ Nusa Penida or Lembongan?','👨‍👩‍👧‍👦 Bali with kids'].forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>send(t.replace(/^[^\w]+/u,''));suggestions.append(b);});controls();}
 async function send(text){if(busy||!text.trim())return;const currentRequest=++requestId;busy=true;$('.send').disabled=true;textarea.disabled=true;$('.status').textContent='Thinking about your Bali plans…';suggestions.replaceChildren();bubble(text,true);messages.push({role:'user',content:text});controls();
 try{const response=await fetch(endpoint,{method:'POST',mode:'cors',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({messages:messages.slice(-12)})});const result=await response.json();if(!response.ok||!result.reply)throw Error(result.error||'Unavailable');if(currentRequest!==requestId)return;const reply=soundsConfirmed(result.reply)?safeReply():result.reply;bubble(reply);messages.push({role:'assistant',content:reply});$('.status').textContent='';}
 catch(err){if(currentRequest!==requestId)return;messages.pop();bubble('Sorry, I can’t reply right now. You can still send your plans to Budi using WhatsApp or email below.');$('.status').textContent='AI temporarily unavailable';}
 finally{if(currentRequest===requestId){busy=false;$('.send').disabled=false;textarea.disabled=false;textarea.focus();controls();}}
 }
 $('form').addEventListener('submit',e=>{e.preventDefault();const value=textarea.value.trim();if(!value)return;textarea.value='';send(value);});
 textarea.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('form').requestSubmit();}});
 $('.launch').addEventListener('click',()=>{returnFocus=document.activeElement;dialog.showModal();textarea.focus();});
 $('.close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
 $('.restart').addEventListener('click',reset);
 reset();
})();
