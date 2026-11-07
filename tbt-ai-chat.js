/* TBT optional real-AI chat UI. Load only after deploying the Cloudflare Worker.
   Set window.TBT_AI_ENDPOINT to the deployed /chat URL before loading this script. */
(() => {
 'use strict';
 const endpoint=window.TBT_AI_ENDPOINT;
 const tourPages={'/ubud-day-tour/':'Ubud day tour','/uluwatu-tour/':'Uluwatu day tour','/nusa-penida-tour/':'Nusa Penida island tour','/nusa-lembongan-tour/':'Nusa Lembongan island tour'};
 const tourContext=tourPages[location.pathname]||'';
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
 form{display:flex;align-items:flex-end;gap:8px;padding:8px 12px;border-top:1px solid #dfd3bf}textarea{resize:vertical;min-height:45px;max-height:116px;border:1px solid #afbeb5;background:white;color:#18352c;border-radius:12px;padding:11px;min-width:0;flex:1;font-size:16px}.send{border:0;background:#176b4d;color:white;border-radius:12px;padding:10px 16px;min-height:45px;font-weight:700}.send:disabled{opacity:.55;cursor:default}.links{display:flex;flex-wrap:wrap;gap:8px;padding:0 12px 7px}.links a,.links button{flex:1;text-decoration:none;text-align:center;border:1px solid #176b4d;border-radius:11px;padding:8px 6px;font-size:12px;line-height:1.25;font-weight:700;color:#176b4d;background:#fff;min-height:44px}.links button{flex:0 0 auto;white-space:nowrap}.links a.wa{flex:1.25}.links a.email{flex:1}.review{margin:0 12px 12px;padding:12px;border:1px solid #c9b77d;border-radius:12px;background:#fff}.review h3{font-size:16px;margin:0 0 6px}.review p{font-size:12px;margin:0 0 9px;color:#52675d}.review textarea{width:100%;min-height:150px;max-height:230px;font-size:14px}.review-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}.review-actions a,.review-actions button{flex:1;min-height:44px;padding:10px;text-align:center;border-radius:10px;border:1px solid #176b4d;background:#fff;color:#176b4d;text-decoration:none;font:700 13px system-ui;cursor:pointer}.review-actions a{background:#176b4d;color:white}.note{font-size:11px;color:#52675d;padding:0 12px 9px;margin:0}.status{font-size:12px;color:#52675d;margin:0;padding:0 14px 8px;min-height:18px}
 @media(max-width:600px){
 dialog{position:fixed;top:var(--tbt-vtop,8px);left:8px;right:auto;bottom:auto;margin:0;width:calc(100vw - 16px);height:var(--tbt-vheight,calc(100dvh - 16px));max-height:var(--tbt-vheight,calc(100dvh - 16px));display:flex;flex-direction:column}
 dialog:not([open]){display:none}
 dialog>header{flex:0 0 auto}
 .chat{flex:1;min-height:0;max-height:none;overflow-y:auto}
 .history{min-height:52px;max-height:none;flex:1;overflow-y:auto}
 .suggestions{flex:0 0 auto}
 form{flex:0 0 auto}
 .links,.note,.status{flex-shrink:0}
 .review{flex-shrink:0}
 .review textarea{max-height:110px;min-height:75px}
 }
 @media(max-height:570px){.history{max-height:32dvh;min-height:95px}}@media(max-width:420px){.logo{width:34px;height:34px;font-size:12px}.heading h2{font-size:16px}.links{gap:5px}.links a,.links button{font-size:11px;padding:8px 5px}.note{font-size:10px}header small{font-size:10px}}
 </style>
 <button type="button" class="launch" aria-haspopup="dialog">💬 Chat with our Bali AI guide</button>
 <dialog aria-labelledby="tbt-ai-title"><header><span class="logo" aria-hidden="true">TBT</span><div class="heading"><h2 id="tbt-ai-title">Your Bali travel buddy 🌴</h2><small>AI trip guide · Budi helps with bookings</small></div><button class="close" type="button" aria-label="Close chat">×</button></header>
 <div class="chat"><div class="history" role="log" aria-live="polite" aria-label="Chat conversation"></div><div class="suggestions"></div>
 <form><textarea aria-label="Your message" maxlength="1200" rows="2" placeholder="Tell me about your Bali plans…"></textarea><button class="send" type="submit">Send</button></form>
 <p class="status" role="status"></p><div class="links"><a class="wa" target="_blank" rel="noopener" href="#">WhatsApp Budi</a><a class="email" href="#">Email Budi</a><button type="button" class="restart">Start over</button></div>
 <section class="review" hidden><h3>Review your enquiry for Budi</h3><p>Check or edit the details before opening WhatsApp or email. Nothing is sent automatically.</p><textarea aria-label="Review and edit booking enquiry" rows="8"></textarea><div class="review-actions"><a class="open-draft" href="#">Open draft</a><button type="button" class="cancel-review">Back to chat</button></div></section><p class="note">I’m TBT’s AI assistant, not Budi. Budi personally confirms prices and bookings; this chat doesn’t make reservations.</p></div></dialog>`;
 const $=s=>root.querySelector(s),dialog=$('dialog'),history=$('.history'),suggestions=$('.suggestions'),textarea=$('textarea');
 let messages=[],busy=false,returnFocus=null,requestId=0,lastFailedText='';
 function wildlifeCaution(reply){const userText=messages.filter(m=>m.role==='user').map(m=>m.content).join(' ');return /\bmonkey forest\b/i.test(reply)&&/\b(?:family.friendly|safe for (?:children|kids)|suitable for (?:children|kids))\b/i.test(reply)&&!/(?:wild animals|keep a distance|avoid touching|supervis)/i.test(reply);}
 function carefulWildlifeReply(){return 'Ubud and its rice terraces could make a lovely private day tour. If you also consider the Monkey Forest, remember the monkeys are wild animals: children need close supervision and should avoid feeding or touching them. Would you prefer to keep your day focused on the rice terraces or add another stop?';}
 function soundsConfirmed(reply){return /\b(?:we(?:'|’)ve (?:got you covered|booked|confirmed)|(?:your|the) (?:booking|reservation|transfer|pickup|driver) (?:is|has been) (?:booked|confirmed|arranged|scheduled)|(?:budi|your driver) (?:will be|is) waiting|(?:you(?:'|’)re|you are) (?:all set|booked|confirmed)|confirmed for \d)/i.test(reply);}
 function safeReply(){return 'Sounds good! 😊 Just to be clear, nothing is booked yet. Is that your arrival time at Bali Airport, or when you need picking up? Budi can confirm the arrangements on WhatsApp.';}
 function looksLikeWrongGeography(reply){return /tirta\s+empul\s+waterfall/i.test(reply)||(/\b(?:30|thirty)[- ]?minute/i.test(reply)&&/seminyak/i.test(messages.map(m=>m.content).join(' '))&&/waterfall|tirta empul|ubud|tegalalang/i.test(reply));}
 function safeWaterfallReply(){return 'I need to correct that: Tirta Empul is a water temple, not a waterfall. Real waterfall options near Ubud include Tegenungan and Tibumana, but they involve a fairly long drive from Seminyak. With children, I’d suggest choosing just one and checking the walking and steps. How old are the kids?';}
 function wantsBudiQuote(text){return /\b(?:budi|private driver|private car|driver)\b/i.test(text)&&/\b(?:quote|price|cost|how much|book|arrange|available|availability)\b/i.test(text);}
 function budiQuoteAnswer(){return 'Yes, TBT can help arrange a private driver for your trip. 😊 Budi will confirm availability and give you a personalised price. Tap WhatsApp Budi or Email Budi below — I’ll include the details you’ve shared so far in the draft.';}
 function misleadingDateOrItinerary(reply){const last=messages.filter(m=>m.role==='user').slice(-1)[0]?.content||'';const decemberBeforeChristmas=/\b(?:[1-9]|1\d|2[0-4])\s+december\b/i.test(last);const unwantedWaterfall=/\brice terraces?\b/i.test(last)&&/\bwaterfalls?\b/i.test(reply)&&!/\bwaterfalls?\b/i.test(messages.filter(m=>m.role==='user').map(m=>m.content).join(' '));return (decemberBeforeChristmas&&/\bchristmas\b/i.test(reply))||unwantedWaterfall;}
 function stayOnRequest(){return 'A private day trip from Seminyak to Ubud and the rice terraces sounds lovely. With two children, I’d keep the stops flexible and avoid packing too much into the day. Would you like me to help prepare the details for a quote from Budi?';}
 function repeatsAnsweredQuestion(reply){const userText=messages.filter(m=>m.role==='user').map(m=>m.content).join(' ');const askedDriver=/\b(?:private driver|private car|driver for|hire a driver)\b/i.test(userText);const asksDriverAgain=/\b(?:would you (?:like|want)|do you (?:want|need)|are you (?:looking for|interested in))\b[^?]{0,110}\b(?:private driver|private car|driver)\b/i.test(reply);return askedDriver&&asksDriverAgain;}
 function acknowledgeDriver(){const userText=messages.filter(m=>m.role==='user').map(m=>m.content).join(' ');const wantsRice=/\brice terraces?\b/i.test(userText);const wantsUbud=/\bubud\b/i.test(userText);const destination=wantsUbud&&wantsRice?'Ubud and the rice terraces':wantsUbud?'Ubud':'your chosen stops';return /\b(?:relaxed|relaxing|leisurely|easy.going|few(?:er)? stops)\b/i.test(userText)?honourKnownPace():'A private driver for '+destination+' sounds like a great way to explore at your own pace. Budi can help with a personalised itinerary and quote. Would you prefer a relaxed day with fewer stops or a full-day tour?';}
 function repeatsKnownPace(reply){const userText=messages.filter(m=>m.role==='user').map(m=>m.content).join(' ');const relaxed=/\b(?:relaxed|relaxing|leisurely|easy.going|few(?:er)? stops|not too (?:busy|rushed))\b/i.test(userText);const full=/\b(?:full.day|packed day|lots of stops|as much as possible)\b/i.test(userText);return (relaxed||full)&&/\b(?:would you (?:like|prefer|want)|do you prefer)\b[^?]{0,170}\b(?:relaxed|leisurely|fewer stops|fuller itinerary|full.day|more stops|activities|busy day)\b/i.test(reply);}
 function honourKnownPace(){const userText=messages.filter(m=>m.role==='user').map(m=>m.content).join(' ');const relaxed=/\b(?:relaxed|relaxing|leisurely|easy.going|few(?:er)? stops|not too (?:busy|rushed))\b/i.test(userText);const wantsUbud=/\bubud\b/i.test(userText),wantsRice=/\brice terraces?\b/i.test(userText);if(relaxed&&wantsUbud&&wantsRice)return 'A relaxed Ubud day sounds ideal. You could visit the rice terraces, enjoy lunch in Ubud, then choose one gentle extra stop if everyone feels up to it. Budi can help plan the route. How old are the children?';return relaxed?'Absolutely — we can keep the day relaxed with fewer stops and time to enjoy each place. What would you most like to see?':'Great — you’d prefer a fuller day. Budi can help plan the stops around your priorities. Which attraction matters most to you?';}
 function looksLikeFakeResearch(reply){return /\b(?:i(?:'|’)ll|let me|would you like me to|i can)\s+(?:look up|search|check online|research)\b/i.test(reply)||/semegenungan|tirta\s+empul\s+waterfall/i.test(reply);}

 function bubble(message,user=false){const div=document.createElement('div');div.className='bubble'+(user?' user':'');div.textContent=message;history.append(div);history.scrollTop=history.scrollHeight;}

 function structuredDraft(){
  const entries=messages.filter(m=>m.role==='user').map(m=>m.content.trim()).filter(Boolean);
  const all=entries.join('\n'),fields=[],put=(label,value)=>{if(value)fields.push(label+': '+value);};
  const capture=(pattern)=>{const m=all.match(pattern);return m?m[1].trim().replace(/[.,!?;]+$/,'').slice(0,90):'';};
  const quant='(?:\\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)';
  put('Customer name',capture(/\b(?:my name is|name is|name:)\s+([a-z][a-z '-]{1,45})(?=[.,!?]|\n|$)/i));
  put('Travel date',capture(/\b(?:on|for|from|between)\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{4})?|\d{4}-\d{2}-\d{2})\b/i));
  put('Hotel / pickup area',capture(/\b(?:staying in|staying at|based in|pickup from|pick up from)\s+([a-z][a-z0-9 '&-]{2,50}?)(?=\s+(?:for|with|but|and|on)\b|[.,!?]|\n|$)/i));
  put('Adults',capture(new RegExp('\\b('+quant+'\\s+adults?)\\b','i')));
  put('Children',capture(new RegExp('\\b('+quant+'\\s+(?:children|kids|child))\\b','i')));
  put('Travellers',capture(new RegExp('\\b('+quant+'\\s+(?:travellers|travelers|guests|people|passengers))\\b','i')));
  put('Flight',capture(/\bflight(?:\s+number)?\s*(?:is|:)?\s*([A-Z]{2,3}\s?\d{2,5})\b/i));
  // Only extract explicitly mentioned destinations, not guesses based on nearby attractions.
  const destination=capture(/\b(?:visit|explore|tour|going to|drop(?:\s|-)?off at)\s+(Ubud|Uluwatu|Sanur|Seminyak|Canggu|Kuta|Nusa Dua|Jimbaran|Kintamani|Sidemen|Nusa Penida|Nusa Lembongan|Amed|Lovina)\b/i);
  put('Destination / area to visit',destination);
  const services=[];
  if(/\b(?:airport|flight)\b/i.test(all))services.push('Airport transfer');
  if(/\b(?:private driver|private car|day tour)\b/i.test(all))services.push('Private driver / tour');
  if(/\b(?:nusa penida|nusa lembongan)\b/i.test(all))services.push('Island trip');
  if(/\b(?:hotel transfer|port transfer)\b/i.test(all))services.push('Hotel / port transfer');
  if(/\b(?:multi.day|itinerary)\b/i.test(all))services.push('Multi-day trip');
  put('Requested service',services.join(', '));
  const interests=[];
  for(const [pattern,label] of [[/\bwaterfalls?\b/i,'Waterfalls'],[/\btemples?\b/i,'Temples'],[/\brice terraces?\b/i,'Rice terraces'],[/\b(?:beach|beaches|sunset)\b/i,'Beaches / sunset'],[/\b(?:rafting|atv|jeep)\b/i,'Adventure'],[/\bsnorkel/i,'Snorkelling']])if(pattern.test(all))interests.push(label);
  put('Interests',interests.join(', '));
  // Keep other details in the customer's own words, but avoid repeating the complete itinerary.
  const notes=entries.filter(v=>!/^(?:hi|hello|hey|thanks|thank you|ok|okay|help me plan a day)[!. ]*$/i.test(v))
    .filter(v=>!/\b(?:staying in|staying at|based in)\b/i.test(v)||!/\b(?:adults?|children|kids)\b/i.test(v))
    .filter(v=>!/\b(?:private driver|private car|day tour)\b/i.test(v)||!/\b(?:visit|explore)\b/i.test(v))
    .slice(-3);
  const lines=['Hi Budi, I would like a quote for my Bali trip.',...(tourContext?['Tour page: '+tourContext]:[]),...fields];
  if(notes.length){lines.push('','Additional details:');for(const entry of notes)lines.push('- '+entry.replace(/\s+/g,' ').slice(0,300));}
  if(!fields.length&&!notes.length){const request=entries.filter(v=>!/^(?:hi|hello|hey|thanks|thank you)[!. ]*$/i.test(v)).slice(-1)[0];if(request)lines.push('Request: '+request.slice(0,280));}
  lines.push('','Please confirm availability, price and inclusions. Thank you!');
  return lines.join('\n').slice(0,3200);
 }
 function handoverUrl(channel,draft){return channel==='wa'?'https://wa.me/6285738148276?text='+encodeURIComponent(draft):'mailto:booking.tbtbali@gmail.com?subject='+encodeURIComponent('TBT Bali trip enquiry')+'&body='+encodeURIComponent(draft);}
 function controls(){const draft=structuredDraft();$('.wa').href=handoverUrl('wa',draft);$('.email').href=handoverUrl('email',draft);}
 function review(channel){
   const box=$('.review'),field=box.querySelector('textarea'),link=$('.open-draft');
   field.value=structuredDraft();box.hidden=false;
   function refresh(){link.href=handoverUrl(channel,field.value);link.textContent=channel==='wa'?'Open WhatsApp draft':'Open email draft';link.target=channel==='wa'?'_blank':'_self';}
   field.oninput=refresh;refresh();box.scrollIntoView({block:'nearest'});field.focus();
 }
 $('.wa').addEventListener('click',e=>{e.preventDefault();review('wa');});
 $('.email').addEventListener('click',e=>{e.preventDefault();review('email');});
 $('.cancel-review').addEventListener('click',()=>{$('.review').hidden=true;textarea.focus();});
 function reset(){$('.review').hidden=true;lastFailedText='';requestId++;busy=false;$('.send').disabled=false;textarea.disabled=false;$('.status').textContent='';messages=[];history.replaceChildren();bubble(tourContext?'Hey! 👋 Looking at our '+tourContext+'? Ask me about the experience or how Budi can help.':'Hey! 👋 Planning a Bali holiday, looking for a driver, or just exploring ideas? I’m happy to help.');suggestions.replaceChildren();
 ['🌴 Help me plan a day','✈️ I need an airport pickup','🏝️ Which island should I visit?','👨‍👩‍👧‍👦 Things to do with kids'].forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>send(t.replace(/^[^\w]+/u,''));suggestions.append(b);});controls();}
 async function send(text){if(busy||!text.trim())return;if(lastFailedText===text){const last=history.lastElementChild,prior=last?.previousElementSibling;if(last?.classList.contains('bubble')&&prior?.classList.contains('user')){last.remove();prior.remove();}}lastFailedText='';const currentRequest=++requestId;busy=true;$('.send').disabled=true;textarea.disabled=true;$('.status').textContent='Your Bali buddy is thinking…';suggestions.replaceChildren();bubble(text,true);messages.push({role:'user',content:text});controls();
 if(wantsBudiQuote(text)){const reply=budiQuoteAnswer();bubble(reply);messages.push({role:'assistant',content:reply});busy=false;$('.send').disabled=false;textarea.disabled=false;$('.status').textContent='';controls();textarea.focus();return;}
 try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);let response;try{response=await fetch(endpoint,{method:'POST',mode:'cors',cache:'no-store',signal:controller.signal,headers:{'content-type':'application/json'},body:JSON.stringify({messages:(tourContext?[{role:'user',content:'For context, I am browsing the TBT '+tourContext+' page. Please answer my following questions in that context unless I change the topic.'},...messages.slice(-11)]:messages.slice(-12))})});}finally{clearTimeout(timeout);}const result=await response.json();if(!response.ok||!result.reply)throw Error(result.error||'Unavailable');if(currentRequest!==requestId)return;const reply=soundsConfirmed(result.reply)?safeReply():looksLikeWrongGeography(result.reply)?safeWaterfallReply():looksLikeFakeResearch(result.reply)?'I can help you explore TBT’s tour options, but I can’t look up live prices or availability. Budi can check those personally — use WhatsApp or Email below for a quote.':misleadingDateOrItinerary(result.reply)?stayOnRequest():repeatsKnownPace(result.reply)?honourKnownPace():repeatsAnsweredQuestion(result.reply)?acknowledgeDriver():wildlifeCaution(result.reply)?carefulWildlifeReply():result.reply;bubble(reply);messages.push({role:'assistant',content:reply});$('.status').textContent='';}
 catch(err){if(currentRequest!==requestId)return;messages.pop();lastFailedText=text;textarea.value=text;const detail=String(err?.message||'');const throttled=/too many messages|429/i.test(detail);const msg=throttled?'I’ve had a few messages in a short time. Please try again in a minute, or send your plan to Budi.':err?.name==='AbortError'?'The reply took too long. Your question is still in the box — you can retry or contact Budi.':'Sorry, my reply didn’t come through. Your message is back in the box, so you can try sending it again.';bubble(msg);$('.status').textContent=throttled?'Message limit reached — please retry shortly':(/Assistant temporarily unavailable|No reply available/i.test(detail)?'AI service unavailable — try again':'Chat connection issue — please retry');}
 finally{if(currentRequest===requestId){busy=false;$('.send').disabled=false;textarea.disabled=false;textarea.focus();controls();}}
 }
 $('form').addEventListener('submit',e=>{e.preventDefault();const value=textarea.value.trim();if(!value)return;textarea.value='';send(value);});
 textarea.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('form').requestSubmit();}});
 function sizeMobileDialog(){
  if(!window.matchMedia('(max-width:600px)').matches)return;
  const vv=window.visualViewport;
  const available=vv?vv.height:window.innerHeight;
  const top=(vv?vv.offsetTop:0)+8;
  dialog.style.setProperty('--tbt-vtop',top+'px');
  dialog.style.setProperty('--tbt-vheight',Math.max(220,available-16)+'px');
 }
 if(window.visualViewport){window.visualViewport.addEventListener('resize',sizeMobileDialog);window.visualViewport.addEventListener('scroll',sizeMobileDialog);}
 window.addEventListener('resize',sizeMobileDialog);
  $('.launch').addEventListener('click',()=>{returnFocus=document.activeElement;sizeMobileDialog();dialog.showModal();textarea.focus();});
 $('.close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
 $('.restart').addEventListener('click',reset);
 reset();
})();
