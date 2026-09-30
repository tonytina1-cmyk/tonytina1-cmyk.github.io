(function () {
  'use strict';

  function sendAnalyticsEvent(eventName, parameters) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, Object.assign({ page_path: window.location.pathname, transport_type: 'beacon' }, parameters || {}));
  }

  function getClickLocation(link) {
    if (link.dataset && link.dataset.leadSource) return link.dataset.leadSource;
    if (link.closest('header')) return 'header';
    if (link.classList.contains('floating-wa')) return 'floating_button';
    if (link.closest('#tours')) return 'tour_section';
    if (link.closest('#transfers')) return 'transfer_section';
    if (link.closest('#contact')) return 'contact_section';
    return 'page_content';
  }

  function getSafeWhatsAppUrl(url) {
    try {
      var original = new URL(url, window.location.href);
      if (original.hostname !== 'wa.me') return url;
      var phone = original.pathname.replace(/\D/g, '');
      var safeUrl = new URL('https://api.whatsapp.com/send');
      safeUrl.searchParams.set('phone', phone);
      var message = original.searchParams.get('text');
      if (message) safeUrl.searchParams.set('text', message);
      return safeUrl.toString();
    } catch (error) { return url; }
  }

  function compactHomepageHero() {
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index.html') return;
    var headings = document.querySelectorAll('h1');
    var hero = null;
    for (var i = 0; i < headings.length; i += 1) {
      var text = (headings[i].textContent || '').toLowerCase();
      if (text.indexOf('bali private driver') !== -1 && text.indexOf('custom tours') !== -1) {
        hero = headings[i].closest('section, .hero, [class*="hero"]');
        break;
      }
    }
    if (!hero) return;
    hero.classList.add('tbt-compact-hero');
    if (!document.getElementById('tbt-compact-hero-style')) {
      var style = document.createElement('style');
      style.id = 'tbt-compact-hero-style';
      style.textContent = '.tbt-compact-hero{min-height:auto!important;padding-bottom:42px!important}.tbt-compact-hero h1{margin-bottom:16px!important}@media(max-width:700px){.tbt-compact-hero{padding-top:54px!important;padding-bottom:30px!important}.tbt-compact-hero h1{font-size:clamp(42px,12vw,64px)!important;line-height:1.02!important}}';
      document.head.appendChild(style);
    }
  }

  function insertNuanuTourCard() {
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index.html') return;
    if (document.getElementById('nuanu-tour-home-card')) return;
    var tours = document.getElementById('tours');
    if (!tours) return;
    var card = document.createElement('div');
    card.id = 'nuanu-tour-home-card';
    card.style.cssText = 'max-width:1080px;margin:34px auto 8px;padding:0 20px;';
    card.innerHTML = '<div style="background:#f8f4ec;border:1px solid #e7e5df;border-radius:24px;padding:28px;box-shadow:0 14px 38px rgba(7,27,45,.09);display:grid;gap:14px;"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#1d6f4a;">NEW TBT TOUR</div><h3 style="margin:0;font-family:Playfair Display,serif;font-size:clamp(26px,4vw,38px);line-height:1.1;color:#071b2d;">Nuanu Creative City &amp; Tanah Lot</h3><p style="margin:0;color:#4f5d68;max-width:760px;">Discover Bali\'s iconic Tanah Lot coastline, then experience the art, architecture, nature and creative spaces of Nuanu Creative City on a flexible private day with Budi.</p><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;"><a href="/nuanu-creative-city-tanah-lot-tour/" style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 20px;font-weight:700;background:#071b2d;color:#fff;text-decoration:none;">View Nuanu Tour</a><a data-lead-source="nuanu_home_card" href="https://wa.me/6285738148276?text=Hi%20Budi%2C%20I%27d%20like%20a%20price%20for%20the%20Nuanu%20Creative%20City%20and%20Tanah%20Lot%20tour." target="_blank" rel="noopener" style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 20px;font-weight:700;background:#1faa59;color:#fff;text-decoration:none;">WhatsApp Budi for price</a></div><small style="color:#66717f;">Private transport • Flexible itinerary • Price on request</small></div>';
    tours.appendChild(card);
  }

  function enhanceWhatsAppBookingForm() {
    var form = document.getElementById('waForm');
    if (!form || document.getElementById('waForm-send-note')) return;
    var submit = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submit) { if (submit.tagName === 'INPUT') submit.value = 'Continue to WhatsApp'; else submit.textContent = 'Continue to WhatsApp'; }
    var note = document.createElement('p');
    note.id = 'waForm-send-note';
    note.style.cssText = 'margin:10px 0 0;font-size:13px;line-height:1.45;color:#66717f;text-align:center;';
    note.textContent = 'WhatsApp will open with your trip details ready. Please press Send in WhatsApp to complete your enquiry with Budi.';
    if (submit && submit.parentNode) submit.parentNode.insertBefore(note, submit.nextSibling); else form.appendChild(note);
  }

  function findBudiIntroSection() {
    var direct = document.querySelector('#meet-budi, #about-budi, #budi, #about');
    if (direct && !direct.closest('header')) return direct;
    var headings = document.querySelectorAll('main h2, main h3, section h2, section h3');
    for (var i = 0; i < headings.length; i += 1) {
      var text = (headings[i].textContent || '').trim().toLowerCase();
      if (text.indexOf('meet budi') !== -1 || text.indexOf('about budi') !== -1 || text.indexOf('budi bali driver') !== -1 || text.indexOf('your bali driver') !== -1) {
        var section = headings[i].closest('section');
        if (section && section.id !== 'tours' && section.id !== 'transfers' && section.id !== 'contact') return section;
      }
    }
    return null;
  }

  function improveHomepageFlow() {
    var path = window.location.pathname;
    if (path !== '/' && path !== '/index.html') return;
    var tours = document.getElementById('tours');
    if (!tours || !tours.parentNode) return;
    var budiIntro = findBudiIntroSection();
    if (budiIntro && budiIntro !== tours && budiIntro.parentNode === tours.parentNode) tours.parentNode.insertBefore(budiIntro, tours);
    if (document.getElementById('tbt-quick-choices')) return;
    var quick = document.createElement('section');
    quick.id = 'tbt-quick-choices';
    quick.setAttribute('aria-label', 'Choose your Bali service');
    quick.style.cssText = 'max-width:1080px;margin:22px auto 34px;padding:0 20px;';
    quick.innerHTML = '<div style="text-align:center;margin-bottom:16px;"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#1d6f4a;">HOW CAN BUDI HELP?</div><h2 style="margin:7px 0 0;font-family:Playfair Display,serif;font-size:clamp(25px,4vw,34px);line-height:1.15;color:#071b2d;">Choose what you need</h2></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;"><a data-lead-source="quick_private_driver" href="https://wa.me/6285738148276?text=Hi%20Budi%2C%20I%27d%20like%20to%20ask%20about%20a%20private%20driver%20in%20Bali." target="_blank" rel="noopener" style="display:block;padding:18px;border-radius:18px;background:#071b2d;color:#fff;text-decoration:none;text-align:center;font-weight:800;box-shadow:0 10px 28px rgba(7,27,45,.12);">Private Driver<br><span style="font-size:13px;font-weight:500;opacity:.82;">Chat with Budi</span></a><a href="#transfers" style="display:block;padding:18px;border-radius:18px;background:#f8f4ec;color:#071b2d;text-decoration:none;text-align:center;font-weight:800;border:1px solid #e7e5df;">Airport Transfers<br><span style="font-size:13px;font-weight:500;color:#66717f;">Pickup &amp; drop-off</span></a><a href="#tours" style="display:block;padding:18px;border-radius:18px;background:#f8f4ec;color:#071b2d;text-decoration:none;text-align:center;font-weight:800;border:1px solid #e7e5df;">Bali Tours<br><span style="font-size:13px;font-weight:500;color:#66717f;">Explore with Budi</span></a></div>';
    tours.parentNode.insertBefore(quick, tours);
  }

  function initialisePageEnhancements() {
    compactHomepageHero();
    improveHomepageFlow();
    insertNuanuTourCard();
    enhanceWhatsAppBookingForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialisePageEnhancements); else initialisePageEnhancements();

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href*="api.whatsapp.com/send"], a[href*="wa.me/"]');
    if (!link) return;
    var source = getClickLocation(link);
    var label = (link.textContent || '').trim().slice(0, 100);
    sendAnalyticsEvent('whatsapp_click', { click_source: source, link_text: label });
    sendAnalyticsEvent('generate_lead', { click_source: source, lead_source: 'whatsapp_' + source, contact_method: 'whatsapp', link_text: label });
    if (link.href.indexOf('wa.me/') !== -1) link.href = getSafeWhatsAppUrl(link.href);
  }, true);

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-booking-app]');
    if (!link) return;
    sendAnalyticsEvent('booking_app_click', { click_source: getClickLocation(link), link_text: (link.textContent || '').trim().slice(0, 100) });
  }, true);

  document.addEventListener('submit', function (event) {
    if (!event.target.matches('#waForm')) return;
    var service = document.getElementById('service');
    var serviceValue = service ? service.value : 'unknown';
    sendAnalyticsEvent('whatsapp_form_open', { form_id: 'waForm', form_name: 'quick_whatsapp_booking', click_source: 'booking_form', handoff_status: 'whatsapp_opened', service: serviceValue });
    sendAnalyticsEvent('whatsapp_click', { click_source: 'booking_form', link_text: 'Continue to WhatsApp' });
    sendAnalyticsEvent('generate_lead', { click_source: 'booking_form', lead_source: 'quick_whatsapp_booking_form', contact_method: 'whatsapp', link_text: 'Continue to WhatsApp', service: serviceValue });
    event.preventDefault();
    event.stopImmediatePropagation();
    var date = document.getElementById('date');
    var guests = document.getElementById('guests');
    var pickup = document.getElementById('pickup');
    var notes = document.getElementById('notes');
    var message = "Hi Budi, I'd like to enquire about a " + serviceValue + '.\n\n' + 'Date: ' + (date && date.value ? date.value : 'Not sure yet') + '\n' + 'Guests: ' + (guests && guests.value ? guests.value : 'Not sure yet') + '\n' + 'Pickup: ' + (pickup && pickup.value ? pickup.value : 'Not sure yet') + '\n' + 'Places / notes: ' + (notes && notes.value ? notes.value : 'No extra notes') + '\n\n' + 'Please let me know availability and price. Thank you.';
    window.open('https://api.whatsapp.com/send?phone=6285738148276&text=' + encodeURIComponent(message), '_blank', 'noopener');
  }, true);
}());