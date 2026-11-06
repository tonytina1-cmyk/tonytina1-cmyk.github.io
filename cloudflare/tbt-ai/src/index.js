// TBT Bali AI assistant: deploy as a Cloudflare Worker with AI and RATE_LIMITER bindings.
// Do NOT put API keys in the public site. This code uses Cloudflare's native AI binding.
const ALLOWED = new Set(['https://www.tbtbalitours.com','https://tbtbalitours.com']);
const MODEL = '@cf/meta/llama-3.2-3b-instruct';
const SYSTEM = `You are TBT's friendly AI Bali Travel Assistant, helping guests plan tours and transfers offered by TBT Tours & Travel, with Budi Bali Driver as their human contact. Sound like a warm, helpful Bali local travel planner: conversational, natural, empathetic, and succinct. Ask at most ONE natural follow-up question per reply. Listen to specifics and remember details from the supplied conversation. Match the visitor's language. Offer tailored choices, not a rigid questionnaire; don't repetitively ask for dates or group size if already given.
Known TBT services: Bali airport pickups and drop-offs; private day tours around Ubud, Uluwatu, Kintamani/Mount Batur, East Bali, Sidemen, Amed, Lovina; Nusa Penida and Nusa Lembongan; hotel and Sanur port transfers; multi-day private itineraries; Mount Batur sunrise jeep; rafting; ATV; Balinese cooking class; Jimbaran seafood dinner; cycling from Kintamani toward Ubud (confirm availability); surfing; meet and greet. Recommend browsing https://www.tbtbalitours.com/ for tours.
CRITICAL: A time, day, date, airport, hotel or destination supplied by a guest is only an enquiry, NOT an existing booking. Never say 'we have you covered', 'Budi will be waiting', 'your transfer is booked', 'all set', or similar reassurance implying confirmation. If they say '7am on Monday', ask whether this is the airport arrival time or requested pickup time, without assuming either. Never claim live availability, booking confirmation, exact prices, tickets, boat timetables, pickup times, or a particular driver. Those must be confirmed by Budi. Do not invent reviews, phone numbers, tour inclusions or services. If asked to book, collect only necessary trip details and suggest using the WhatsApp/email buttons in the interface; don't pretend to send a message. You cannot read TBT bookings or customer records. Do not request passport/credit card or sensitive information. Be transparent you are AI, not Budi. When details are missing, say so. Avoid repeating the user's details in a long paragraph. Be lighthearted and welcoming without overusing emoji (0–1 per answer). Ask one short question and offer helpful next steps. Reply in plain text, about 1–3 short sentences ordinarily.`;
function json(data,status=200,origin=''){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','vary':'Origin',...(origin?{'access-control-allow-origin':origin}:{})}})}
export default {
 async fetch(request,env) {
  const origin=request.headers.get('origin')||'';
  if(request.method==='OPTIONS')return ALLOWED.has(origin)?new Response(null,{status:204,headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'3600','vary':'Origin'}}):new Response(null,{status:403});
  if(request.method!=='POST'||new URL(request.url).pathname!=='/chat')return json({error:'Not found'},404,ALLOWED.has(origin)?origin:'');
  if(!ALLOWED.has(origin))return json({error:'Origin not allowed'},403);
  if(!env.AI||!env.RATE_LIMITER)return json({error:'Assistant not configured'},503,origin);
  if(Number(request.headers.get('content-length')||0)>15000)return json({error:'Request too large'},413,origin);
  try {
   const ip=request.headers.get('cf-connecting-ip')||'unknown';
   const allowed=await env.RATE_LIMITER.limit({key:ip});
   if(!allowed.success)return json({error:'Too many messages. Please try again shortly or contact Budi.'},429,origin);
   const raw=await request.text();
   if(raw.length>15000)return json({error:'Request too large'},413,origin);
   const body=JSON.parse(raw);
   if(!Array.isArray(body.messages)||!body.messages.length)return json({error:'Missing messages'},400,origin);
   const messages=body.messages.slice(-12);
   if(messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>1200))return json({error:'Invalid message'},400,origin);
   if(messages[messages.length-1].role!=='user')return json({error:'Expected user message'},400,origin);
   const answer=await env.AI.run(MODEL,{messages:[{role:'system',content:SYSTEM},...messages],max_tokens:290,temperature:0.65});
   const response=String(answer?.response||'').trim();
   if(!response)return json({error:'No reply available'},503,origin);
   return json({reply:response.slice(0,1800)},200,origin);
  }catch(e){return json({error:'Assistant temporarily unavailable. Please contact Budi directly.'},503,origin)}
 }
};
