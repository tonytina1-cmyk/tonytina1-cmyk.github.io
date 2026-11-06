/* Free guided helper: preset answers only; no AI, network requests or saved trip data. */
(() => {
  'use strict';
  const services = ['Airport transfer', 'Day tour', 'Island trip', 'Hotel / port transfer', 'Help me choose'];
  function faq(text) {
    const t = text.toLowerCase();
    if (/\b(price|prices|cost|costs|much|cheap|expensive|included|inclusions)\b/.test(t)) return 'Prices depend on your route, date, passengers and activities. Tickets, meals and boat fares vary by service. Budi will confirm your quote and what is included.';
    if (/\b(cancel|cancellation|refund|deposit|payment|pay|booked|confirmation|available|availability)\b/.test(t)) return 'Budi needs to confirm availability, final prices and booking details directly. Please agree payment and cancellation terms with him before booking. This helper cannot check or change a booking.';
    if (/\b(child|children|baby|seat|wheelchair|accessible|accessibility|luggage|suitcase)\b/.test(t)) return 'Tell Budi about children’s ages, child-seat needs, luggage and accessibility requirements. He will confirm suitable arrangements before you book.';
    if (/\b(airport|flight|flights)\b/.test(t)) return 'TBT arranges private Bali airport pickups and drop-offs. Budi will need your flight number, date and time, hotel, passengers and luggage to quote.';
    if (/\b(penida|lembongan|island|islands|boat|ferry)\b/.test(t)) return 'Nusa Penida and Nusa Lembongan are island trip options. Ask Budi to confirm boat arrangements, transfers, activities and what is included for your dates.';
    if (/\b(ubud|temple|temples|culture|rice)\b/.test(t)) return 'Ubud is an option for rice terraces, temples, waterfalls and local villages. Your route can be discussed with Budi around your interests and pickup area.';
    if (/\b(uluwatu|beach|beaches|sunset)\b/.test(t)) return 'Uluwatu is an option for clifftop temple views, southern Bali scenery and sunset. Budi can help work out stops and timing for your group.';
    if (/\b(batur|kintamani|jeep|sunrise|adventure|rafting|atv)\b/.test(t)) return 'For adventure, consider Mount Batur sunrise jeep, rafting or ATV activities. Budi can confirm suitability, timing and package details.';
    if (/\b(multi.day|itinerary|custom|several days)\b/.test(t)) return 'Budi can help with a custom multi-day itinerary. Share your dates, accommodation and interests so he can discuss a practical route and driver availability.';
    if (/\b(hello|hi|hey)\b/.test(t)) return 'Hello! I can help you explore TBT trips and prepare an enquiry for Budi.';
    return null;
  }
  function recommend(interest) {
    if (/temple|culture|waterfall|family/i.test(interest)) return ['Ubud day tour', '/ubud-day-tour/'];
    if (/beach|sunset/i.test(interest)) return ['Uluwatu tour', '/uluwatu-tour/'];
    if (/adventure|sunrise/i.test(interest)) return ['Mount Batur sunrise jeep', '/mount-batur-sunrise-jeep/'];
    if (/island|snorkel/i.test(interest)) return ['Nusa Lembongan', '/nusa-lembongan-tour/'];
    return ['Browse Bali tours', '/tours.html'];
  }
  function steps(data) {
    return ['service', ...(['Day tour','Help me choose'].includes(data.service) ? ['interest'] : data.service === 'Island trip' ? ['island'] : []), 'date','pax','pickup', ...(data.service === 'Airport transfer' ? ['flight'] : data.service === 'Hotel / port transfer' ? ['destination'] : []), 'notes'];
  }
  function message(data) {
    const labels = {service:'Service',interest:'Interests',island:'Island',date:'Travel date(s)',pax:'Passengers',pickup:'Pickup / hotel',flight:'Flight details',destination:'Destination',notes:'Other details'};
    return ['Hi Budi, could you please help with my Bali trip?', ...Object.entries(labels).filter(([k])=>data[k] && steps(data).includes(k)).map(([k,v])=>v+': '+data[k]), 'Please confirm availability, price and inclusions. Thank you!'].join('\n');
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {faq,recommend,steps,message};
  if (typeof document === 'undefined' || document.getElementById('tbt-trip-help')) return;
  const host = document.createElement('div'); host.id='tbt-trip-help';
  const heroActions = document.querySelector('.hero-actions');
  const heading = document.querySelector('main h1') || document.querySelector('h1');
  if (heroActions) heroActions.append(host); else if (heading) heading.insertAdjacentElement('afterend',host); else return;
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
    :host{display:block;font:16px/1.5 system-ui,sans-serif;color:#18352c}*{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer;touch-action:manipulation}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #b78024;outline-offset:3px}[hidden]{display:none!important}
    .launch{position:static;border:1px solid #c9b77d;background:#fffaf0;color:#18352c;padding:12px 18px;border-radius:28px;font-weight:700;margin:0 0 12px;min-height:46px}
    dialog{padding:0;border:1px solid #dfd3bf;border-radius:20px;width:min(440px,calc(100vw - 24px));max-width:none;max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);background:#fffaf0;color:#18352c;box-shadow:0 20px 70px #0004;overflow:auto}dialog::backdrop{background:#10241d77}
    header{background:#18352c;color:#fffaf0;padding:16px 18px;display:flex;justify-content:space-between;gap:12px;align-items:center}h2{margin:0;font-size:20px}header p{font-size:12px;margin:3px 0 0}.close{background:transparent;color:white;border:1px solid #789187;border-radius:9px;width:44px;height:44px;flex-shrink:0;font-size:23px}
    .welcome{padding:26px 22px}.welcome h3{font-size:24px;line-height:1.25;margin:0 0 12px}.welcome p{margin:0 0 20px}.primary{background:#176b4d;color:white;border:1px solid #176b4d;border-radius:10px;padding:11px 16px;font-weight:700;min-height:44px}.secondary{background:white;border:1px solid #afbeb5;color:#18352c;border-radius:10px;padding:10px 14px;min-height:44px}.welcome .buttons{display:flex;flex-wrap:wrap;gap:10px}
    .chat{display:flex;flex-direction:column;max-height:calc(100dvh - 110px)}.log{overflow:auto;min-height:100px;padding:16px;scroll-behavior:auto}.bubble{padding:12px 14px;border-radius:14px;background:white;border:1px solid #e4dcc9;font-size:14px;margin:0 28px 12px 0;white-space:pre-wrap;overflow-wrap:anywhere}.user{background:#e6efe7;margin:0 0 12px 28px;border-color:#c7d7c9}.bubble a{color:#176b4d;font-weight:700;display:block;margin-top:8px}
    .choices{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 12px;flex-shrink:0}.choices button{font-size:14px;border-radius:20px;min-height:42px;padding:8px 12px;background:white;color:#18352c;border:1px solid #91a99a}
    form{padding:12px 16px;border-top:1px solid #dfd3bf;flex-shrink:0}label{font-size:12px;font-weight:650;display:block;margin-bottom:6px}.input-row{display:flex;gap:8px}input{width:100%;min-width:0;border:1px solid #afbeb5;border-radius:10px;padding:11px;background:white;font-size:16px;color:#18352c}.input-row button{padding:10px 14px}.tools{display:flex;gap:14px;flex-wrap:wrap;padding:0 16px 12px}.tools button{border:0;background:none;padding:5px 0;color:#176b4d;font-size:13px;text-decoration:underline;min-height:32px}.small{font-size:12px;color:#52675d;margin:0;padding:0 16px 14px}.status{font-size:13px;padding:0 16px;margin:0}.send{display:grid;gap:8px;padding:0 16px 12px}.send a{text-align:center;text-decoration:none;display:block}.send a.email{color:#1767ad;background:white;border-color:#1767ad}
    @media(max-height:600px){.chat{max-height:calc(100dvh - 100px)}header{padding:10px 16px}.log{min-height:60px}}
  </style>
  <button type="button" class="launch" aria-haspopup="dialog" aria-expanded="false">Help plan my trip</button>
  <dialog aria-labelledby="tbt-help-title"><header><div><h2 id="tbt-help-title">Your Bali trip starts here</h2><p>TBT Trip Helper · Guided answers, not live chat</p></div><button class="close" aria-label="Close trip helper" type="button">×</button></header>
  <div class="welcome"><h3>Need a hand planning your Bali trip?</h3><p>Find a tour, plan a transfer or put together an enquiry for Budi in a few easy steps.</p><div class="buttons"><button class="primary yes" type="button">Yes, help me</button><button class="secondary no" type="button">No thanks</button></div></div>
  <div class="chat" hidden><div class="log" role="log" aria-label="Trip conversation" aria-live="polite" aria-relevant="additions"></div><div class="choices"></div><div class="send" hidden></div><form><label for="trip-answer">Your answer or question</label><div class="input-row"><input id="trip-answer" autocomplete="off" maxlength="500" placeholder="Type your answer or ask a question…"><button class="primary" type="submit">Send</button></div></form><p class="status" role="status"></p><div class="tools"><button class="back" type="button">Back</button><button class="summary" type="button">Enquire with Budi now</button><button class="restart" type="button">Start again</button></div><p class="small">Details stay here until you choose WhatsApp or email. Review your draft and tap Send there. Budi confirms prices and availability.</p></div></dialog>`;
  const $=s=>root.querySelector(s), dialog=$('dialog'), log=$('.log'), choices=$('.choices'), input=$('input');
  let data={}, step='service', started=false, questionMode=false, returnFocus=null;
  const prompts={service:'Hi! What can I help you plan?',interest:'What sounds like your kind of day?',island:'Which island would you like to explore?',date:'When would you like to travel? Type a date or date range, or choose “Not sure yet”.',pax:'How many people are travelling? You can include adults and children.',pickup:'Where are you staying or being picked up? A hotel name or area is enough.',flight:'What are your flight number, arrival or departure time, and luggage details? You can confirm these with Budi later.',destination:'Where would you like to be dropped off?',notes:'Anything else for Budi? Add your name, preferred stops, children’s ages or special requirements—or skip.'};
  const options={service:services,interest:['Temples & culture','Beaches & sunset','Adventure & sunrise','Family sightseeing','Islands & snorkelling'],island:['Nusa Penida','Nusa Lembongan','Not sure yet'],date:['Not sure yet'],pax:['1','2','3–4','5 or more'],pickup:['Not sure yet'],flight:['To be confirmed'],destination:['Not sure yet'],notes:['Skip']};
  function bubble(text,user=false,link=null){const el=document.createElement('div');el.className='bubble'+(user?' user':'');el.textContent=text;if(link){const a=document.createElement('a');a.textContent=link[0]+' →';a.href=link[1];a.target='_blank';a.rel='noopener';el.append(a);}log.append(el);log.scrollTop=log.scrollHeight;}
  function buttons(items){choices.replaceChildren();for(const [label,action] of items){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);choices.append(b);}}
  function showPrompt(){questionMode=false;$('.send').hidden=true;$('.back').hidden=step==='service';bubble(prompts[step]);buttons((options[step]||[]).map(x=>[x,()=>accept(x)]));input.placeholder=step==='date'?'e.g. 24 July 2027 or 24–28 July':'Type your answer or ask a question…';}
  function summary(){step='summary';questionMode=false;$('.back').hidden=false;bubble('Here’s your enquiry so far:\n\n'+message(data)+'\n\nThis is an enquiry, not a confirmed booking.');buttons([['Edit my answers',()=>goBack()],['Ask a question',()=>{questionMode=true;bubble('What would you like to know? I can answer common TBT questions, or include your question for Budi.');input.focus();}]]);const send=$('.send');send.replaceChildren();const msg=encodeURIComponent(message(data));for(const [label,href,cls] of [['Continue to WhatsApp','https://wa.me/6285738148276?text='+msg,'primary'],['Email Budi for a quote','mailto:booking.tbtbali@gmail.com?subject=TBT%20Bali%20trip%20enquiry&body='+msg,'primary email']]){const a=document.createElement('a');a.className=cls;a.textContent=label;a.href=href;if(!href.startsWith('mailto:')){a.target='_blank';a.rel='noopener';}a.addEventListener('click',()=>{$('.status').textContent='Not sent yet—review the draft and tap Send in your chosen app.';});send.append(a);}send.hidden=false;}
  function next(){const path=steps(data), i=path.indexOf(step);if(i===path.length-1)summary();else{step=path[i+1];showPrompt();}}
  function accept(value){bubble(value,true);if(step==='summary'){question(value);return;}data[step]=value==='Skip'?'':value;if(step==='interest'){const rec=recommend(value);bubble('One idea to explore: '+rec[0]+'. Budi can tailor the route and confirm suitability for your group.',false,rec);}next();}
  function question(value){const answer=faq(value);if(answer){bubble(answer);if(step!=='summary')buttons([['Continue planning',()=>showPrompt()],['Ask Budi instead',()=>summary()]]);}else{bubble('I don’t have a reliable preset answer for that. Shall I include your question in an enquiry to Budi?');buttons([['Include for Budi',()=>{data.notes=[data.notes,value].filter(Boolean).join('; ').slice(0,1500);summary();}],['Keep planning',()=>{if(step==='summary')summary();else showPrompt();}]]);}}
  function goBack(){const path=steps(data);step=step==='summary'?path[path.length-1]:path[Math.max(0,path.indexOf(step)-1)];showPrompt();}
  function start(){started=true;$('.welcome').hidden=true;$('.chat').hidden=false;if(!log.childElementCount)showPrompt();}
  function remember(){try{sessionStorage.setItem('tbt-help-seen','1');}catch{}}
  function open(invite=false){remember();returnFocus=document.activeElement;dialog.showModal();$('.launch').setAttribute('aria-expanded','true');if(!invite||started)start();}
  $('.launch').addEventListener('click',()=>open());$('.yes').addEventListener('click',start);$('.no').addEventListener('click',()=>dialog.close());$('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{$('.launch').setAttribute('aria-expanded','false');if(returnFocus&&returnFocus.isConnected)returnFocus.focus();});
  $('.back').addEventListener('click',goBack);$('.summary').addEventListener('click',summary);$('.restart').addEventListener('click',()=>{data={};step='service';log.replaceChildren();$('.status').textContent='';showPrompt();});
  $('form').addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value)return;input.value='';if(questionMode||step==='summary'||/\?|^(how|what|can|is|are|do|does|will|where|why)\b/i.test(value)){bubble(value,true);question(value);return;}
    if(step==='service'){const t=value.toLowerCase();let match=/airport|flight/.test(t)?services[0]:/island|penida|lembongan/.test(t)?services[2]:/hotel|port|transfer/.test(t)?services[3]:/tour|ubud|uluwatu|batur|driver/.test(t)?services[1]:/choose|help|unsure/.test(t)?services[4]:null;if(match){bubble(value,true);data.service=match;next();}else{bubble(value,true);question(value);}return;}
    if(step==='pax'&&!/\d|one|two|three|four|five|six|seven|eight|nine|ten|not sure/i.test(value)){bubble(value,true);bubble('Please tell me the number of people, or choose one of the group sizes.');return;}
    if(faq(value)&&!['notes','flight','pickup','destination','interest','island'].includes(step)){bubble(value,true);question(value);return;}accept(value);
  });
  // Invite once per tab session; never interrupt an active form or another dialog.
  let seen=true;try{seen=sessionStorage.getItem('tbt-help-seen')==='1';}catch{}
  if(!seen&&!/enquiry|plan-trip|privacy|booking-terms/.test(location.pathname))setTimeout(()=>{const active=document.activeElement;if(document.hidden||dialog.open||document.querySelector('dialog[open]')||active?.matches('input,textarea,select,[contenteditable="true"]'))return;open(true);},15000);
})();
