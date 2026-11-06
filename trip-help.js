/* Free, local preset help. No AI service, storage, or automatic submissions. */
(() => {
  'use strict';
  if (document.getElementById('tbt-trip-help')) return;
  const host = document.createElement('div');
  host.id = 'tbt-trip-help';
  document.body.append(host);
  const root = host.attachShadow({mode: 'open'});
  root.innerHTML = `
    <style>
      :host{font:16px/1.5 system-ui,sans-serif;color:#18352c}
      *{box-sizing:border-box}button,input,select,textarea{font:inherit}button,a,summary{touch-action:manipulation}
      button{cursor:pointer}button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #b78024;outline-offset:3px}
      .launcher{position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:65;border:1px solid #e3d3ae;border-radius:28px;padding:12px 18px;background:#18352c;color:#fffaf0;box-shadow:0 5px 22px #0003;font-weight:700}
      dialog{padding:0;border:1px solid #dfd3bf;border-radius:20px;width:min(420px,calc(100vw - 24px));max-width:none;max-height:calc(100dvh - 32px);color:#18352c;background:#fffaf0;box-shadow:0 20px 70px #0004;overflow:auto}
      dialog::backdrop{background:#10241d77}
      header{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#18352c;color:#fffaf0;padding:16px 18px;position:sticky;top:0;z-index:1}
      h2{font-size:20px;margin:0}header p{font-size:12px;margin:3px 0 0;color:#e0e8de}.close{background:transparent;color:white;border:1px solid #789187;border-radius:9px;min-width:44px;min-height:44px;font-size:23px}
      main{padding:18px}p{margin:0 0 14px}.intro{font-size:14px}details{background:#fff;border:1px solid #dfd3bf;border-radius:10px;margin:8px 0}summary{cursor:pointer;font-weight:650;padding:12px;font-size:14px}details p{padding:0 12px;font-size:14px}a{color:#176b4d;font-weight:650}
      h3{font-size:18px;margin:23px 0 6px}.hint{font-size:12px;color:#52675d}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.wide{grid-column:1/-1}label{font-size:13px;font-weight:650;display:block}input,select,textarea{display:block;margin-top:5px;width:100%;min-width:0;border:1px solid #afbeb5;border-radius:8px;background:white;color:#18352c;padding:10px;font-size:16px}textarea{resize:vertical;min-height:75px}
      .actions{display:grid;gap:8px;margin:16px 0 10px}.actions button{border-radius:10px;min-height:46px;border:1px solid #176b4d;background:#176b4d;color:white;font-weight:700}.actions .email{background:white;color:#1767ad;border-color:#1767ad}.status{font-size:13px;margin-top:10px}.direct{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;margin-top:16px}
      @media(max-width:360px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}}
    </style>
    <button class="launcher" type="button" aria-haspopup="dialog" aria-expanded="false">Trip help</button>
    <dialog aria-labelledby="help-title">
      <header><div><h2 id="help-title">TBT Trip Helper</h2><p>Quick answers · Enquire with Budi</p></div><button class="close" type="button" aria-label="Close trip helper">×</button></header>
      <main>
        <p class="intro">Planning your Bali trip? Choose a question below or prepare an enquiry for Budi. These are preset answers, not a live chat.</p>
        <details><summary>Airport transfers</summary><p>We arrange private pickups and drop-offs at Bali’s Ngurah Rai Airport. Include your flight number, arrival or departure time, hotel, passengers and luggage so Budi can quote. <a href="/bali-airport-transfers/">View airport transfers</a>.</p></details>
        <details><summary>Which tours can I book?</summary><p>Explore Ubud, Uluwatu, Kintamani and Mount Batur, or ask about Nusa Penida and Nusa Lembongan. Budi can help plan a route around your interests. <a href="/tours.html">Browse all tours</a>.</p></details>
        <details><summary>Prices and what’s included</summary><p>Your quote depends on the route, date, group size and activities. Tickets, meals and boat fares vary by service. Ask Budi to confirm the final price and inclusions before booking.</p></details>
        <details><summary>Custom trips and multiple days</summary><p>Yes! Share your dates, accommodation and places you want to visit. Budi can discuss a custom itinerary and driver availability. <a href="/plan-trip.html">Plan your trip</a>.</p></details>
        <details><summary>Children, luggage or special requirements</summary><p>Please tell Budi the children’s ages, any child-seat needs, luggage amounts and accessibility requirements. He will confirm suitable arrangements and availability.</p></details>
        <details><summary>Booking, payment or cancellation</summary><p>An enquiry does not confirm a booking. Budi will agree the details, price, payment and any cancellation conditions with you. If an existing booking changes, contact him directly. <a href="/booking-terms.html">Booking terms</a>.</p></details>
        <h3>Prepare your enquiry</h3><p class="hint">Fill in what you know. All fields are optional.</p>
        <form>
          <div class="grid">
            <label class="wide">Tour or service<select name="service"><option>Help planning my Bali trip</option><option>Airport transfer</option><option>Private driver / day tour</option><option>Ubud tour</option><option>Uluwatu tour</option><option>Kintamani / Mount Batur</option><option>Nusa Penida</option><option>Nusa Lembongan</option><option>Hotel / port transfer</option><option>Multi-day itinerary</option><option>Existing booking / other question</option></select></label>
            <label>Your name<input name="guest" autocomplete="given-name" maxlength="80"></label>
            <label>Travel date<input name="date" type="date"></label>
            <label>Passengers<input name="pax" type="number" min="1" max="100" inputmode="numeric"></label>
            <label>Pickup / hotel<input name="pickup" maxlength="160" autocomplete="off"></label>
            <label class="wide">Your question or trip details<textarea name="notes" maxlength="1500" placeholder="Dates, stops, flight details, luggage or anything else…"></textarea></label>
          </div>
          <div class="actions"><button type="submit" value="whatsapp">Continue to WhatsApp</button><button class="email" type="submit" value="email">Email Budi for a quote</button></div>
          <p class="hint">Opens a draft in WhatsApp or your email app. Review it and tap Send there. Details are not saved by this helper. Budi confirms prices and availability.</p>
          <p class="status" role="status"></p>
        </form>
        <div class="direct"><a href="https://wa.me/6285738148276" target="_blank" rel="noopener">WhatsApp Budi directly</a><a href="/privacy.html">Privacy</a></div>
      </main>
    </dialog>`;
  const dialog = root.querySelector('dialog');
  const launcher = root.querySelector('.launcher');
  launcher.addEventListener('click', () => {dialog.showModal(); launcher.setAttribute('aria-expanded', 'true');});
  root.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {launcher.setAttribute('aria-expanded', 'false'); launcher.focus();});
  const form = root.querySelector('form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const lines = ['Hi Budi, I would like to enquire about ' + data.get('service') + '.'];
    for (const [key, label] of [['guest','Name'],['date','Travel date'],['pax','Passengers'],['pickup','Pickup / hotel'],['notes','Details']]) {
      const value = String(data.get(key) || '').trim();
      if (value) lines.push(label + ': ' + value);
    }
    lines.push('Please confirm availability, price and inclusions. Thank you!');
    const message = lines.join('\n');
    const email = event.submitter && event.submitter.value === 'email';
    const url = email ? 'mailto:booking.tbtbali@gmail.com?subject=' + encodeURIComponent('TBT trip enquiry: ' + data.get('service')) + '&body=' + encodeURIComponent(message) : 'https://wa.me/6285738148276?text=' + encodeURIComponent(message);
    if (email) window.location.href = url;
    else window.open(url, '_blank', 'noopener');
    root.querySelector('.status').textContent = 'Your enquiry has not been sent yet. Review the draft and tap Send in ' + (email ? 'your email app.' : 'WhatsApp.');
  });
})();
