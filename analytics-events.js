(function () {
  'use strict';

  function sendAnalyticsEvent(eventName, parameters) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, Object.assign({
      page_path: window.location.pathname,
      transport_type: 'beacon'
    }, parameters || {}));
  }

  function isHomepage() {
    return window.location.pathname === '/' || window.location.pathname === '/index.html';
  }

  function getClickLocation(link) {
    if (link.dataset && link.dataset.leadSource) return link.dataset.leadSource;
    if (link.closest('header')) return 'header';
    if (link.classList.contains('floating-wa')) return 'floating_button';
    if (link.closest('#meet-budi')) return 'meet_budi';
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
    } catch (error) {
      return url;
    }
  }

  function getHomepageHero() {
    var headings = document.querySelectorAll('h1');
    for (var i = 0; i < headings.length; i += 1) {
      var text = (headings[i].textContent || '').toLowerCase();
      if (text.indexOf('bali private driver') !== -1 && text.indexOf('custom tours') !== -1) {
        return headings[i].closest('section, .hero, [class*="hero"]') || headings[i].parentElement;
      }
    }
    return null;
  }

  function addHomepageStyles() {
    if (document.getElementById('tbt-home-layout-style')) return;
    var style = document.createElement('style');
    style.id = 'tbt-home-layout-style';
    style.textContent =
      '#tbt-hero-image{width:100%;height:clamp(280px,42vw,560px);background-position:center center;background-size:cover;background-repeat:no-repeat;background-color:#071b2d;}' +
      '.tbt-compact-hero{min-height:auto!important;padding-top:54px!important;padding-bottom:44px!important;background-image:none!important;background:#071b2d!important;}' +
      '.tbt-compact-hero h1{margin-bottom:16px!important;}' +
      '#meet-budi{background:#fff!important;color:#071b2d!important;padding:38px 20px 28px!important;position:relative;z-index:2;}' +
      '#meet-budi .tbt-budi-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:minmax(260px,.9fr) minmax(300px,1.1fr);gap:32px;align-items:center;}' +
      '#meet-budi .tbt-budi-photo{border-radius:22px;overflow:hidden;box-shadow:0 14px 34px rgba(7,27,45,.13);background:#f3f3f3;}' +
      '#meet-budi .tbt-budi-photo img{display:block!important;width:100%!important;height:auto!important;max-height:450px!important;object-fit:cover!important;object-position:center center!important;margin:0!important;border-radius:0!important;}' +
      '@media(max-width:760px){#tbt-hero-image{height:58vw;min-height:235px;max-height:360px;background-size:cover;background-position:center center}.tbt-compact-hero{padding-top:36px!important;padding-bottom:32px!important}.tbt-compact-hero h1{font-size:clamp(42px,12vw,64px)!important;line-height:1.02!important}#meet-budi{padding:28px 18px 24px!important}#meet-budi .tbt-budi-inner{grid-template-columns:1fr!important;gap:20px!important}#meet-budi .tbt-budi-photo img{max-height:390px!important;object-fit:cover!important}}';
    document.head.appendChild(style);
  }

  function createTopHeroImage(hero) {
    if (!hero || document.getElementById('tbt-hero-image')) return;
    var computed = window.getComputedStyle(hero);
    var backgroundImage = computed.backgroundImage;
    if (!backgroundImage || backgroundImage === 'none') return;
    var image = document.createElement('div');
    image.id = 'tbt-hero-image';
    image.setAttribute('role', 'img');
    image.setAttribute('aria-label', 'Beautiful Bali scenery');
    image.style.backgroundImage = backgroundImage;
    hero.parentNode.insertBefore(image, hero);
  }

  function findBudiPhoto() {
    var images = document.querySelectorAll('main img, body img');
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < images.length; i += 1) {
      var img = images[i];
      if (img.closest('header') || img.closest('#meet-budi')) continue;
      var clue = ((img.alt || '') + ' ' + (img.src || '')).toLowerCase();
      var rect = img.getBoundingClientRect();
      var area = Math.max(rect.width, img.naturalWidth || img.width || 0) * Math.max(rect.height, img.naturalHeight || img.height || 0);
      var score = area;
      if (clue.indexOf('budi') !== -1) score += 10000000;
      if (clue.indexOf('driver') !== -1) score += 5000000;
      if (clue.indexOf('tanah') !== -1) score += 3000000;
      if (clue.indexOf('van') !== -1) score += 2000000;
      if (rect.width < 180 || rect.height < 180) score = score / 10;
      if (score > bestScore) {
        bestScore = score;
        best = img;
      }
    }
    return best;
  }

  function hideOriginalBudiPhoto(photo) {
    if (!photo) return;
    var node = photo;
    var levels = 0;
    while (node.parentElement && levels < 3) {
      var parent = node.parentElement;
      if (parent === document.body || parent.tagName === 'MAIN' || parent.tagName === 'SECTION') break;
      if (parent.querySelectorAll('img').length === 1 && parent.textContent.trim().length < 120) {
        node = parent;
        levels += 1;
      } else {
        break;
      }
    }
    node.style.setProperty('display', 'none', 'important');
    node.setAttribute('data-tbt-original-budi-photo', 'hidden');
  }

  function createMeetBudiSection() {
    if (!isHomepage() || document.getElementById('meet-budi')) return;
    var hero = getHomepageHero();
    if (!hero || !hero.parentNode) return;
    createTopHeroImage(hero);
    hero.classList.add('tbt-compact-hero');

    var originalPhoto = findBudiPhoto();
    var photoClone = originalPhoto ? originalPhoto.cloneNode(true) : null;
    if (photoClone) {
      photoClone.removeAttribute('style');
      photoClone.removeAttribute('width');
      photoClone.removeAttribute('height');
      photoClone.loading = 'eager';
      hideOriginalBudiPhoto(originalPhoto);
    }

    var section = document.createElement('section');
    section.id = 'meet-budi';
    var inner = document.createElement('div');
    inner.className = 'tbt-budi-inner';

    if (photoClone) {
      var photoWrap = document.createElement('div');
      photoWrap.className = 'tbt-budi-photo';
      photoWrap.appendChild(photoClone);
      inner.appendChild(photoWrap);
    }

    var copy = document.createElement('div');
    copy.innerHTML =
      '<div style="font-size:12px;font-weight:800;letter-spacing:.13em;color:#1d6f4a;margin-bottom:8px;">YOUR LOCAL BALI DRIVER</div>' +
      '<h2 style="font-family:Playfair Display,serif;font-size:clamp(34px,5vw,52px);line-height:1.05;margin:0 0 14px;color:#071b2d;">Meet Budi</h2>' +
      '<p style="font-size:18px;line-height:1.58;color:#4f5d68;margin:0 0 13px;">Explore Bali with Budi, a friendly local private driver offering personal service, flexible itineraries and local knowledge. From airport pickups to full-day adventures, your trip can be shaped around what you want to see and do.</p>' +
      '<p style="font-size:16px;line-height:1.55;color:#4f5d68;margin:0;">Chat directly with Budi about your dates, pickup point and plans — no payment is needed just to enquire.</p>';
    inner.appendChild(copy);
    section.appendChild(inner);
    hero.parentNode.insertBefore(section, hero.nextSibling);
  }

  function addQuickChoices() {
    if (!isHomepage() || document.getElementById('tbt-quick-choices')) return;
    var tours = document.getElementById('tours');
    if (!tours || !tours.parentNode) return;
    var meet = document.getElementById('meet-budi');
    var quick = document.createElement('section');
    quick.id = 'tbt-quick-choices';
    quick.setAttribute('aria-label', 'Choose your Bali service');
    quick.style.cssText = 'max-width:1080px;margin:24px auto 34px;padding:0 20px;';
    quick.innerHTML =
      '<div style="text-align:center;margin-bottom:16px;"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#1d6f4a;">HOW CAN BUDI HELP?</div><h2 style="margin:7px 0 0;font-family:Playfair Display,serif;font-size:clamp(25px,4vw,34px);line-height:1.15;color:#071b2d;">Choose what you need</h2></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;">' +
      '<a data-lead-source="quick_private_driver" href="https://wa.me/6285738148276?text=Hi%20Budi%2C%20I%27d%20like%20to%20ask%20about%20a%20private%20driver%20in%20Bali." target="_blank" rel="noopener" style="display:block;padding:18px;border-radius:18px;background:#071b2d;color:#fff;text-decoration:none;text-align:center;font-weight:800;box-shadow:0 10px 28px rgba(7,27,45,.12);">Private Driver<br><span style="font-size:13px;font-weight:500;opacity:.82;">Message Budi</span></a>' +
      '<a href="#transfers" style="display:block;padding:18px;border-radius:18px;background:#f8f4ec;color:#071b2d;text-decoration:none;text-align:center;font-weight:800;border:1px solid #e7e5df;">Airport Transfers<br><span style="font-size:13px;font-weight:500;color:#66717f;">Pickup &amp; drop-off</span></a>' +
      '<a href="#tours" style="display:block;padding:18px;border-radius:18px;background:#f8f4ec;color:#071b2d;text-decoration:none;text-align:center;font-weight:800;border:1px solid #e7e5df;">Bali Tours<br><span style="font-size:13px;font-weight:500;color:#66717f;">Explore with Budi</span></a></div>';
    if (meet && meet.parentNode === tours.parentNode) {
      tours.parentNode.insertBefore(quick, meet.nextSibling);
    } else {
      tours.parentNode.insertBefore(quick, tours);
    }
  }

  function insertNuanuTourCard() {
    if (!isHomepage() || document.getElementById('nuanu-tour-home-card')) return;
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
    if (submit) {
      if (submit.tagName === 'INPUT') submit.value = 'Continue to WhatsApp';
      else submit.textContent = 'Continue to WhatsApp';
    }
    var note = document.createElement('p');
    note.id = 'waForm-send-note';
    note.style.cssText = 'margin:10px 0 0;font-size:13px;line-height:1.45;color:#66717f;text-align:center;';
    note.textContent = 'WhatsApp will open with your trip details ready. Please press Send in WhatsApp to complete your enquiry with Budi.';
    if (submit && submit.parentNode) submit.parentNode.insertBefore(note, submit.nextSibling);
    else form.appendChild(note);
  }

  function initialisePageEnhancements() {
    if (isHomepage()) addHomepageStyles();
    createMeetBudiSection();
    addQuickChoices();
    insertNuanuTourCard();
    enhanceWhatsAppBookingForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialisePageEnhancements);
  } else {
    initialisePageEnhancements();
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href*="api.whatsapp.com/send"], a[href*="wa.me/"]');
    if (!link) return;
    var source = getClickLocation(link);
    var label = (link.textContent || '').trim().slice(0, 100);
    sendAnalyticsEvent('whatsapp_click', { click_source: source, link_text: label });
    sendAnalyticsEvent('generate_lead', {
      click_source: source,
      lead_source: 'whatsapp_' + source,
      contact_method: 'whatsapp',
      link_text: label
    });
    if (link.href.indexOf('wa.me/') !== -1) link.href = getSafeWhatsAppUrl(link.href);
  }, true);

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-booking-app]');
    if (!link) return;
    sendAnalyticsEvent('booking_app_click', {
      click_source: getClickLocation(link),
      link_text: (link.textContent || '').trim().slice(0, 100)
    });
  }, true);

  document.addEventListener('submit', function (event) {
    if (!event.target.matches('#waForm')) return;
    var service = document.getElementById('service');
    var serviceValue = service ? service.value : 'unknown';

    sendAnalyticsEvent('whatsapp_form_open', {
      form_id: 'waForm',
      form_name: 'quick_whatsapp_booking',
      click_source: 'booking_form',
      handoff_status: 'whatsapp_opened',
      service: serviceValue
    });
    sendAnalyticsEvent('whatsapp_click', {
      click_source: 'booking_form',
      link_text: 'Continue to WhatsApp'
    });
    sendAnalyticsEvent('generate_lead', {
      click_source: 'booking_form',
      lead_source: 'quick_whatsapp_booking_form',
      contact_method: 'whatsapp',
      link_text: 'Continue to WhatsApp',
      service: serviceValue
    });

    event.preventDefault();
    event.stopImmediatePropagation();
    var date = document.getElementById('date');
    var guests = document.getElementById('guests');
    var pickup = document.getElementById('pickup');
    var notes = document.getElementById('notes');
    var message = "Hi Budi, I'd like to enquire about a " + serviceValue + '.\n\n' +
      'Date: ' + (date && date.value ? date.value : 'Not sure yet') + '\n' +
      'Guests: ' + (guests && guests.value ? guests.value : 'Not sure yet') + '\n' +
      'Pickup: ' + (pickup && pickup.value ? pickup.value : 'Not sure yet') + '\n' +
      'Places / notes: ' + (notes && notes.value ? notes.value : 'No extra notes') + '\n\n' +
      'Please let me know availability and price. Thank you.';
    window.open(
      'https://api.whatsapp.com/send?phone=6285738148276&text=' + encodeURIComponent(message),
      '_blank',
      'noopener'
    );
  }, true);
}());