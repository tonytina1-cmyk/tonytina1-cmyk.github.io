/* TBT's free automated trip helper. No AI calls, automatic messages or stored personal details. */
(() => {
  'use strict';
  const services = ['Airport transfer', 'Day tour', 'Island trip', 'Hotel / port transfer', 'Multi-day trip', 'Help me choose'];
  const interests = ['Temples & culture', 'Beaches & sunset', 'Waterfalls & nature', 'Adventure', 'Food & local life', 'Family time'];
  const tours = {
    ubud: {name:'Ubud day tour',path:'/ubud-day-tour/',tags:['Temples & culture','Waterfalls & nature','Family time'],description:'Rice terraces, temples and village stops. A starting point for a day shaped around you.'},
    uluwatu: {name:'Uluwatu tour',path:'/uluwatu-tour/',tags:['Beaches & sunset','Temples & culture'],description:'Clifftop temple views and southern Bali scenery, with sunset options to discuss with Budi.'},
    waterfalls: {name:'Bali waterfall discovery',path:'/bali-waterfall-discovery/',tags:['Waterfalls & nature','Adventure'],description:'A day focused on waterfalls. Ask Budi about walking, steps and suitable stops for your group.'},
    batur: {name:'Mount Batur sunrise jeep',path:'/mount-batur-sunrise-jeep/',tags:['Adventure','Waterfalls & nature'],description:'An early-start sunrise adventure. Budi can confirm pickup timing and package details.'},
    cooking: {name:'Balinese cooking class',path:'/bali-cooking-class-market-tour/',tags:['Food & local life','Family time','Temples & culture'],description:'Explore Balinese food and hands-on cooking. Check session options and ages with Budi.'},
    penida: {name:'Nusa Penida',path:'/nusa-penida-tour/',tags:['Island trip'],description:'Dramatic coastal viewpoints and beaches. Ask Budi about routes, boat travel and transfers.'},
    lembongan: {name:'Nusa Lembongan',path:'/nusa-lembongan-tour/',tags:['Island trip'],description:'Island scenery, Dream Beach and snorkelling options. Budi can explain the available packages.'}
  };
  function recommendations(selected) {
    const raw=(Array.isArray(selected)?selected:[selected]).filter(Boolean).join(' ').toLowerCase();
    const values=[];
    if(/temple|culture|rice/.test(raw))values.push('Temples & culture');
    if(/beach|sunset/.test(raw))values.push('Beaches & sunset');
    if(/waterfall|nature/.test(raw))values.push('Waterfalls & nature');
    if(/adventure|jeep|sunrise|rafting|atv/.test(raw))values.push('Adventure');
    if(/food|cooking|local life/.test(raw))values.push('Food & local life');
    if(/family|kid|child/.test(raw))values.push('Family time');
    return Object.entries(tours).filter(([,t])=>!t.tags.includes('Island trip')).map(([id,t])=>({id,...t,score:t.tags.filter(tag=>values.includes(tag)).length})).sort((a,b)=>b.score-a.score).slice(0,2);
  }
  function detectService(text) {
    const t=text.toLowerCase();
    if(/airport|flight/.test(t))return 'Airport transfer';
    if(/multi.?day|itinerary|several days/.test(t))return 'Multi-day trip';
    if(/penida|lembongan|island/.test(t))return 'Island trip';
    if(/hotel|\bport\b|transfer/.test(t))return 'Hotel / port transfer';
    if(/tour|ubud|uluwatu|batur|driver|cooking|waterfall/.test(t))return 'Day tour';
    if(/choose|help|unsure|not sure/.test(t))return 'Help me choose';
    return null;
  }
  function faq(text) {
    const t=text.toLowerCase();
    const rules=[
      [/\b(price|prices|cost|costs|much|cheap|expensive|included|inclusions)\b/, 'Let’s get you the right quote rather than guess. Your route, dates, group and activities all matter. Budi will confirm the total and whether tickets, meals or boat fares are included.'],
      [/\b(cancel|cancellation|refund|deposit|payment|pay|booked|confirmation|available|availability)\b/, 'Budi can help with that personally. He confirms availability, payment and cancellation terms for your booking. I can prepare your question, but I can’t check or change a booking here.'],
      [/\b(child|children|baby|seat|wheelchair|accessible|accessibility|luggage|suitcase)\b/, 'We can include those needs in your enquiry. Tell Budi the children’s ages, any child-seat or accessibility needs, and how much luggage you have. He’ll confirm suitable arrangements before you book.'],
      [/\b(budi|driver)\b.*\b(himself|personally|drive|driving)\b|\b(who|which)\b.*\b(driver|drives)\b/, 'Budi is your main contact. Depending on availability, your trip may be with Budi or one of the TBT drivers. Ask him to confirm your driver when you arrange the booking.'],
      [/\b(airport|flight|flights)\b/, 'Yes, TBT arranges private Bali airport pickups and drop-offs. Share your flight number, date, time, hotel and luggage details, and Budi can work out the transfer with you.'],
      [/\b(penida|lembongan|island|islands|boat|ferry|snorkel|snorkelling)\b/, 'Two ideas to explore are Nusa Penida for dramatic coastal viewpoints and Nusa Lembongan for island scenery and snorkelling options. Budi can explain the boat travel, transfers and packages for your dates.'],
      [/\b(ubud|temple|temples|culture|rice)\b/, 'If rice terraces, temples and village life sound good, Ubud is a lovely place to start exploring. Tell Budi your must-see stops and he can help shape a practical route.'],
      [/\b(uluwatu|beach|beaches|sunset)\b/, 'For southern Bali scenery and sunset ideas, take a look at Uluwatu. Budi can help you choose stops and timing around your hotel and interests.'],
      [/\b(batur|kintamani|jeep|sunrise|adventure|rafting|atv)\b/, 'Fancy something adventurous? TBT lists Mount Batur sunrise jeep, rafting and ATV options. Ask Budi about the start time, suitability and inclusions before choosing.'],
      [/\b(cooking|food|eat|dinner)\b/, 'You could explore a Balinese cooking class or a Jimbaran seafood dinner. Budi can help with the arrangements and confirm what’s included.'],
      [/\b(multi.day|itinerary|custom|several days)\b/, 'Absolutely—you don’t need to have every day worked out. Share your dates, where you’re staying and a few interests, and Budi can discuss a multi-day plan with you.'],
      [/\b(rain|weather|traffic|duration|hours|long)\b/, 'Timing depends on your pickup area, route and local conditions. Traffic or weather can affect the day, so Budi will help you agree a practical plan rather than promise an exact journey time here.'],
      [/\b(hello|hi|hey)\b/, 'Hi there! 👋 Happy to help you put a Bali plan together. Pick an option below, or tell me what you have in mind.'],
      [/\b(thanks|thank you)\b/, 'You’re very welcome! We can keep planning, or put your ideas into a message for Budi.']
    ];
    return rules.find(([pattern])=>pattern.test(t))?.[1]||null;
  }
  function steps(data) {
    const explore=['Day tour','Multi-day trip','Help me choose'].includes(data.service);
    return ['service',...(explore?['interest','suggestion']:data.service==='Island trip'?['suggestion']:[]),'date','pax','pickup',...(data.service==='Airport transfer'?['flight']:data.service==='Hotel / port transfer'?['destination']:[]),'notes'];
  }
  const labels={service:'Trip type',interest:'Interests',suggestion:'Tour idea',date:'Travel date(s)',pax:'Travellers',pickup:'Pickup / hotel',flight:'Flight & luggage',destination:'Drop-off',notes:'Your name & other details',questions:'Questions for Budi'};
  function entries(data) {return Object.entries(labels).filter(([k])=>(steps(data).includes(k)||k==='questions')&&data[k]&&(!Array.isArray(data[k])||data[k].length)).map(([k,label])=>[k,label,Array.isArray(data[k])?data[k].join(', '):data[k]]);}
  function message(data){return ['Hi Budi, I’m planning a Bali trip and would love your help.',...entries(data).map(([,label,value])=>label+': '+value),'Could you please confirm availability, price and inclusions? Thank you!'].join('\n');}
  function isQuestion(text){return /\?|^(how|what|can|could|is|are|do|does|will|where|why|who)\b/i.test(text);}
  if(typeof module!=='undefined'&&module.exports)module.exports={services,tours,recommendations,detectService,faq,steps,entries,message,isQuestion};
  if(typeof document==='undefined'||document.getElementById('tbt-trip-help'))return;
  const host=document.createElement('div');host.id='tbt-trip-help';
  const actions=document.querySelector('.hero-actions'),heading=document.querySelector('main h1')||document.querySelector('h1');
  if(actions)actions.append(host);else if(heading)heading.insertAdjacentElement('afterend',host);else return;
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
  :host{display:block;font:16px/1.5 system-ui,sans-serif;color:#18352c}*{box-sizing:border-box}button,input{font:inherit}button,a{touch-action:manipulation}button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #b78024;outline-offset:3px}[hidden]{display:none!important}
  .launch{position:static;border:1px solid #c9b77d;background:#fffaf0;color:#18352c;padding:12px 18px;border-radius:28px;font-weight:700;margin:0 0 12px;min-height:46px}
  dialog{padding:0;border:1px solid #dfd3bf;border-radius:22px;width:min(480px,calc(100vw - 20px));max-width:none;max-height:calc(100dvh - 20px);background:#fffaf0;color:#18352c;box-shadow:0 20px 70px #0004;overflow:auto}dialog::backdrop{background:#10241d77}header{background:#18352c;color:#fffaf0;padding:16px 18px;display:flex;align-items:center;gap:12px}.mark{background:#e8dcb5;color:#18352c;border-radius:50%;width:42px;height:42px;display:grid;place-items:center;font-size:13px;font-weight:800;flex-shrink:0}.heading{flex:1}h2{font-size:20px;line-height:1.2;margin:0}header p{font-size:11px;margin:4px 0 0;color:#e2e9e4}.close{background:transparent;border:1px solid #789187;color:white;border-radius:10px;min-width:44px;height:44px;font-size:24px}
  .welcome{padding:26px 22px}.welcome h3{font-size:26px;line-height:1.2;margin:0 0 14px}.welcome p{margin:0 0 20px}.welcome .buttons{display:flex;gap:10px;flex-wrap:wrap}.primary,.secondary{border-radius:12px;padding:11px 15px;min-height:44px;font-weight:650}.primary{background:#176b4d;color:white;border:1px solid #176b4d}.secondary{background:white;color:#18352c;border:1px solid #afbeb5}
  .chat{display:flex;flex-direction:column;max-height:calc(100dvh - 106px)}.progress{font-size:12px;padding:10px 16px 6px;display:flex;align-items:center;gap:10px}.progress progress{width:65px;height:6px;accent-color:#176b4d}.scroll{overflow:auto;min-height:100px;padding:12px 16px;overscroll-behavior:contain}.bubble{padding:12px 14px;border-radius:16px 16px 16px 4px;background:white;border:1px solid #e4dcc9;font-size:14px;margin:0 26px 12px 0;white-space:pre-wrap;overflow-wrap:anywhere}.user{background:#e6efe7;margin:0 0 12px 26px;border-radius:16px 16px 4px 16px;border-color:#c7d7c9}.choices{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px}.choices button{font-size:14px;border-radius:20px;min-height:44px;padding:9px 13px;background:white;color:#18352c;border:1px solid #91a99a}.choices button[aria-pressed=true]{background:#18352c;color:#fffaf0}.choices button:hover{border-color:#176b4d}.controls{margin:8px 0 12px}.controls p{font-size:13px;margin:0 0 10px}.controls .primary{width:100%;margin-top:10px}input{font-size:16px;min-width:0;padding:10px;border:1px solid #afbeb5;border-radius:10px;background:white;color:#18352c}label{font-size:13px;font-weight:650;display:block;margin-bottom:5px}.date{width:100%}.counter{display:flex;align-items:center;gap:8px;margin:10px 0}.counter label{flex:1;margin:0}.counter input{width:54px;text-align:center;appearance:textfield}.counter button{width:42px;height:42px;background:white;border:1px solid #afbeb5;border-radius:10px;color:#18352c;font-size:22px}.counter button:disabled{opacity:.4;cursor:default}.counter input::-webkit-inner-spin-button{appearance:none}
  .tour{background:white;border:1px solid #dfd3bf;border-radius:15px;padding:15px;margin-bottom:10px}.tour h3{margin:0 0 5px;font-size:17px}.tour p{font-size:13px;margin:0 0 12px}.tour .row{display:flex;align-items:center;flex-wrap:wrap;gap:12px}.tour a{font-size:13px;color:#176b4d;font-weight:650}.review{background:white;border:1px solid #dfd3bf;border-radius:14px;padding:6px 14px;margin-bottom:12px}.review-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #eee5d6;font-size:14px;overflow-wrap:anywhere}.review-row:last-child{border:0}.review-row small{display:block;color:#52675d;font-size:11px}.review-row button{flex-shrink:0;background:none;border:0;color:#176b4d;text-decoration:underline;min-height:44px}.send{display:grid;gap:8px;margin-top:12px}.send a{text-align:center;text-decoration:none;display:block}.send a.email{color:#1767ad;background:white;border-color:#1767ad}
  form{padding:10px 16px;border-top:1px solid #dfd3bf;flex-shrink:0;background:#fffaf0}form label{font-size:11px}.input-row{display:flex;gap:8px}.input-row input{width:100%}.input-row button{padding:10px 12px}.tools{display:flex;gap:14px;flex-wrap:wrap;padding:0 16px 8px;flex-shrink:0}.tools button{border:0;background:none;padding:5px 0;color:#176b4d;font-size:12px;text-decoration:underline;min-height:32px}.small{font-size:11px;color:#52675d;margin:0;padding:0 16px 12px}.status{font-size:12px;color:#52675d;margin:0;padding:0 16px}.bubble{animation:arrive .18s ease-out}@keyframes arrive{from{opacity:.3;transform:translateY(4px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.bubble{animation:none}}@media(max-height:600px){header{padding:10px 14px}.chat{max-height:calc(100dvh - 90px)}.scroll{min-height:70px}.small{display:none}}@media(max-width:360px){header{gap:8px;padding:12px}h2{font-size:18px}.mark{display:none}.tools{gap:10px}}
  </style>
  <button class="launch" type="button" aria-haspopup="dialog" aria-expanded="false">Help plan my trip</button>
  <dialog aria-labelledby="trip-title"><header><span class="mark" aria-hidden="true">TBT</span><div class="heading"><h2 id="trip-title">Let’s plan a little Bali magic</h2><p>Automated trip helper · Budi replies personally</p></div><button class="close" type="button" aria-label="Close trip helper">×</button></header>
  <div class="welcome"><h3>A Bali trip on your mind? 👋</h3><p>You don’t need to have it all figured out. Let’s find a few ideas you’ll love—or sort out that airport transfer.</p><div class="buttons"><button class="primary yes" type="button">Let’s plan my trip</button><button class="secondary no" type="button">Just browsing, thanks</button></div></div>
  <div class="chat" hidden><div class="progress"><progress max="1" value="0" aria-label="Trip planning progress"></progress><span></span></div><div class="scroll"><div class="log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Trip conversation"></div><div class="choices"></div><div class="controls"></div></div><form><label for="trip-answer">Your answer or question</label><div class="input-row"><input id="trip-answer" autocomplete="off" maxlength="500" placeholder="Tell me what you have in mind…"><button class="primary" type="submit">Send</button></div></form><p class="status" role="status"></p><div class="tools"><button class="back" type="button">Back</button><button class="ask" type="button">Ask a question</button><button class="summary" type="button">My trip so far</button><button class="restart" type="button">Start again</button></div><p class="small">Your details stay on this page. You choose when to send them to Budi, who confirms prices and availability.</p></div></dialog>`;
  const $=s=>root.querySelector(s),dialog=$('dialog'),log=$('.log'),choices=$('.choices'),controls=$('.controls'),input=$('#trip-answer'),scroll=$('.scroll');
  let data={},step='service',started=false,questionMode=false,editing=false,returnFocus=null,draftInterests=[];
  const prompts={service:'Hi there! 👋 I’m TBT’s trip helper. Let’s make planning easy. What have you got in mind?',interest:'What would make a great Bali day for you? Pick a few favourites, then tap “Show me some ideas”.',suggestion:'Here are two ideas to explore. Choose one, or leave it open for Budi to help you decide.',date:'When are you thinking of going? Pick a date, type a date range below, or leave it flexible.',pax:'Who’s coming along? Set your group size below, or type it in your own words.',pickup:'Where shall we start? Your hotel or the area you’re staying in is enough for now.',flight:'Let’s get the airport details together. What’s your flight number, arrival or departure time, and how much luggage will you have?',destination:'And where would you like to be dropped off?',notes:'Nearly there! What name should Budi use, and is there anything else you’d like him to know? Children’s ages, must-see places or special requirements can go here.'};
  function el(tag,text,cls){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x;}
  function bottom(){requestAnimationFrame(()=>{scroll.scrollTop=scroll.scrollHeight;});}
  function bubble(text,user=false){log.append(el('div',text,'bubble'+(user?' user':'')));bottom();}
  function button(label,action,parent=choices,cls=''){const b=el('button',label,cls);b.type='button';b.addEventListener('click',action);parent.append(b);return b;}
  function clear(){choices.replaceChildren();controls.replaceChildren();$('.status').textContent='';}
  function updateProgress(){const path=steps(data),index=path.indexOf(step);$('.progress span').textContent=step==='summary'?'Your plan, ready for Budi':questionMode?'A quick question—then back to your plan':`Step ${Math.max(1,index+1)} of ${path.length} · ${labels[step]||'Explore ideas'}`;$('.progress progress').value=step==='summary'?1:Math.max(0,index)/path.length;$('.back').hidden=step==='service'||questionMode;}
  function next(){if(editing){editing=false;summary();return;}const path=steps(data),index=path.indexOf(step);if(index===path.length-1)summary();else{step=path[index+1];showPrompt();}}
  function accept(value){const oldStep=step;bubble(Array.isArray(value)?value.join(', '):value,true);data[step]=value==='Skip for now'?'':value;
    if(oldStep==='service'){delete data.interest;delete data.suggestion;if(editing){editing=false;bubble('Of course—let’s adjust the plan for your new trip idea.');}}
    if(oldStep==='interest'&&editing){editing=false;step='suggestion';showPrompt();return;}
    next();
  }
  function showPrompt(){questionMode=false;clear();updateProgress();input.value=editing&&typeof data[step]==='string'?data[step]:'';input.placeholder=step==='date'?'e.g. 24–28 July 2027':'Type an answer or ask me a question…';bubble(prompts[step]);
    if(step==='service'){services.forEach(s=>button(s,()=>accept(s)));button('I just have a question',askMode);}
    else if(step==='interest'){
      draftInterests=Array.isArray(data.interest)?[...data.interest]:[];
      interests.forEach(interest=>{const b=button(interest,()=>{draftInterests=draftInterests.includes(interest)?draftInterests.filter(x=>x!==interest):[...draftInterests,interest];b.setAttribute('aria-pressed',String(draftInterests.includes(interest)));});b.setAttribute('aria-pressed',String(draftInterests.includes(interest)));});
      button('Show me some ideas',()=>{if(!draftInterests.length){$('.status').textContent='Pick one or more interests—or choose “Surprise me”.';return;}accept(draftInterests);},controls,'primary');button('Surprise me',()=>accept(['Open to ideas']));
    }else if(step==='suggestion'){
      const recs=data.service==='Island trip'?[{id:'penida',...tours.penida},{id:'lembongan',...tours.lembongan}]:recommendations(data.interest);
      recs.forEach(t=>{const card=el('article',undefined,'tour');card.append(el('h3',t.name),el('p',t.description));const row=el('div',undefined,'row');button('I like this idea',()=>{bubble('Lovely—let’s add '+t.name+' to your enquiry. Budi can confirm the details with you.');accept(t.name);},row,'secondary');const link=el('a','View tour ↗');link.href=t.path;link.target='_blank';link.rel='noopener';row.append(link);card.append(row);controls.append(card);});
      button('Ask Budi to help me choose',()=>accept('Please help me choose'));button('A different idea',()=>{bubble('Tell me a tour or place you have in mind. I’ll add it as a request for Budi.');input.focus();});
    }else if(step==='date'){
      const label=el('label','Choose a date');label.htmlFor='trip-date';const date=el('input');date.type='date';date.id='trip-date';date.className='date';if(/^\d{4}-\d{2}-\d{2}$/.test(data.date||''))date.value=data.date;controls.append(label,date);
      button('Use this date',()=>{if(!date.value||!date.checkValidity()){date.reportValidity();$('.status').textContent='Choose a date, or keep your dates flexible.';return;}accept(date.value);},controls,'primary');button('My dates are flexible',()=>accept('Dates are flexible'));button('I’ll confirm later',()=>accept('To be confirmed'));
    }else if(step==='pax'){
      const counts={adults:data.adults??2,children:data.children??0};
      for(const [key,label] of [['adults','Adults'],['children','Children']]){const row=el('div',undefined,'counter'),lab=el('label',label);lab.htmlFor='trip-'+key;const n=el('input');n.id='trip-'+key;n.type='number';n.min=key==='adults'?'1':'0';n.max='50';n.inputMode='numeric';n.value=counts[key];row.append(lab);const minus=button('−',()=>{n.value=String(Math.max(Number(n.min),Number(n.value)-1));update();},row);minus.setAttribute('aria-label','Fewer '+label.toLowerCase());row.append(n);const plus=button('+',()=>{n.value=String(Math.min(50,Number(n.value)+1));update();},row);plus.setAttribute('aria-label','More '+label.toLowerCase());function update(){counts[key]=Number(n.value);minus.disabled=counts[key]<=Number(n.min);plus.disabled=counts[key]>=50;}n.addEventListener('input',update);update();controls.append(row);}
      button('That’s our group',()=>{const fields=[...controls.querySelectorAll('input')];if(fields.some(f=>!f.value||!f.checkValidity())){fields.forEach(f=>f.reportValidity());$('.status').textContent='Please enter a whole number for each group.';return;}data.adults=counts.adults;data.children=counts.children;accept(`${counts.adults} adult${counts.adults===1?'':'s'}, ${counts.children} child${counts.children===1?'':'ren'}`);},controls,'primary');button('Still working that out',()=>accept('Group size to be confirmed'));
    }else if(step==='pickup'){['Ubud','Sanur','Kuta / Legian','Seminyak','Nusa Dua','Canggu','Not booked yet'].forEach(x=>button(x,()=>accept(x)));}
    else if(step==='flight'||step==='destination')button('I’ll confirm later',()=>accept('To be confirmed'));
    else if(step==='notes')button('Skip for now',()=>accept('Skip for now'));
    bottom();
  }
  function summary(){step='summary';questionMode=false;editing=false;clear();updateProgress();bubble('Here’s what we’ve put together. You can change any detail below, or send the enquiry to Budi when you’re ready.');
    const review=el('div',undefined,'review');const rows=entries(data);if(!rows.length){review.append(el('p','No problem if you’re just getting started. You can ask Budi for help with your plans.'));}
    rows.forEach(([key,label,value])=>{const row=el('div',undefined,'review-row'),copy=el('div');copy.append(el('small',label),el('span',value));row.append(copy);button('Edit',()=>{if(key==='questions'){bubble('Type the questions you’d like to include. This will replace your current questions for Budi.');questionMode=false;step='questions';editing=true;clear();updateProgress();return;}editing=true;step=key;showPrompt();},row).setAttribute('aria-label','Edit '+label.toLowerCase());review.append(row);});controls.append(review);
    button('Add a note for Budi',()=>{editing=true;step='notes';showPrompt();});button('Ask a question',askMode);
    const send=el('div',undefined,'send'),encoded=encodeURIComponent(message(data));for(const [text,url,cls] of [['Continue to WhatsApp','https://wa.me/6285738148276?text='+encoded,'primary'],['Email Budi for a quote','mailto:booking.tbtbali@gmail.com?subject=TBT%20Bali%20trip%20enquiry&body='+encoded,'primary email']]){const a=el('a',text,cls);a.href=url;if(!url.startsWith('mailto:')){a.target='_blank';a.rel='noopener';}a.addEventListener('click',()=>{$('.status').textContent='One last step: review the draft and tap Send in your app. Nothing has been sent automatically.';});send.append(a);}controls.append(send,el('p','This is an enquiry. Budi will confirm availability, prices and your booking.'));bottom();
  }
  function askMode(){questionMode=true;clear();updateProgress();bubble('Of course! What would you like to know? Choose a topic or type your question. Your trip details are still here.');['Prices & inclusions','Children & luggage','Which island?','Payment & cancellation','Will Budi drive personally?'].forEach(q=>button(q,()=>{bubble(q,true);question(q);}));button('Back to my plan',resume);input.placeholder='Ask about tours, transfers or booking…';}
  function resume(){questionMode=false;if(step==='summary')summary();else showPrompt();}
  function question(value){clear();const answer=faq(value);bubble(answer||'That’s one for Budi—I don’t want to guess. Shall we add your question to the enquiry so he can help you personally?');button(answer?'Include this question for Budi':'Yes, add it for Budi',()=>{data.questions=[data.questions,value].filter(Boolean).join('\n').slice(0,2000);bubble('Added to your enquiry for Budi.');resume();});button('Back to my plan',resume);button('Another question',askMode);bottom();}
  function back(){questionMode=false;editing=false;const path=steps(data);step=step==='summary'?path[path.length-1]:path[Math.max(0,path.indexOf(step)-1)];showPrompt();}
  function start(){started=true;$('.welcome').hidden=true;$('.chat').hidden=false;if(!log.childElementCount)showPrompt();}
  function remember(){try{sessionStorage.setItem('tbt-help-seen','1');}catch{}}
  function open(invite=false){remember();returnFocus=document.activeElement;dialog.showModal();$('.launch').setAttribute('aria-expanded','true');if(!invite||started)start();}
  $('.launch').addEventListener('click',()=>open());$('.yes').addEventListener('click',start);$('.no').addEventListener('click',()=>dialog.close());$('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{$('.launch').setAttribute('aria-expanded','false');if(returnFocus?.isConnected)returnFocus.focus();});$('.back').addEventListener('click',back);$('.ask').addEventListener('click',askMode);$('.summary').addEventListener('click',summary);
  $('.restart').addEventListener('click',()=>{clear();bubble('Start a fresh plan? This will clear the trip details above.');button('Yes, start fresh',()=>{data={};step='service';editing=false;questionMode=false;log.replaceChildren();showPrompt();});button('Keep my plan',resume);});
  $('form').addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value)return;input.value='';
    if(step==='questions'&&editing){data.questions=value;bubble(value,true);editing=false;summary();return;}
    if(questionMode||step==='summary'||isQuestion(value)){bubble(value,true);question(value);return;}
    if(step==='service'){const service=detectService(value);if(service){accept(service);}else{bubble(value,true);question(value);}return;}
    if(step==='date'&&faq(value)){bubble(value,true);question(value);return;}
    if(step==='interest'){accept(value.split(/,|\band\b|&/i).map(v=>v.trim()).filter(Boolean));return;}
    if(step==='pax'){if(!/\d|one|two|three|four|five|six|seven|eight|nine|ten|not sure|confirm/i.test(value)||/^\s*0\s*$/.test(value)){bubble(value,true);bubble('How many travellers should I include? Use the group controls, or type something like “2 adults and 1 child”.');return;}delete data.adults;delete data.children;}
    accept(value);
  });
  let seen=true;try{seen=sessionStorage.getItem('tbt-help-seen')==='1';}catch{}
  if(!seen&&!/enquiry|plan-trip|privacy|booking-terms/.test(location.pathname))setTimeout(()=>{const active=document.activeElement;if(document.hidden||dialog.open||document.querySelector('dialog[open]')||active?.matches('input,textarea,select,[contenteditable="true"]'))return;open(true);},15000);
})();
