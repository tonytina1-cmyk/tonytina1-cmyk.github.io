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
      '#tbt-hero-image{width:100%;height:clamp(280px,42vw,560px);background-position:center center;background-size:cover;background-repeat:no-repeat;background-color:#18352c;}' +
      '.tbt-compact-hero{min-height:auto!important;padding-top:54px!important;padding-bottom:44px!important;background-image:none!important;background:#18352c!important;}' +
      '.tbt-compact-hero h1{margin-bottom:16px!important;}' +
      '#meet-budi{background:#fffaf0!important;color:#18352c!important;padding:38px 20px 28px!important;position:relative;z-index:2;}' +
      '#meet-budi .tbt-budi-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:minmax(260px,.9fr) minmax(300px,1.1fr);gap:32px;align-items:center;}' +
      '#meet-budi .tbt-budi-photo{border-radius:22px;overflow:hidden;box-shadow:0 14px 34px rgba(24,53,44,.13);background:#f3f3f3;}' +
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

  function removeRedundantMeetBudiButton() {
    var meet = document.getElementById('meet-budi');
    if (!meet) return;
    var links = meet.querySelectorAll('a');
    for (var i = 0; i < links.length; i += 1) {
      var label = (links[i].textContent || '').toLowerCase();
      if (label.indexOf('chat with budi') !== -1 || links[i].dataset.leadSource === 'meet_budi') {
        links[i].remove();
      }
    }
  }

  function createMeetBudiSection() {
    if (!isHomepage()) return;
    var hero = getHomepageHero();
    if (!hero || !hero.parentNode) return;

    createTopHeroImage(hero);
    hero.classList.add('tbt-compact-hero');

    if (document.getElementById('meet-budi')) {
      removeRedundantMeetBudiButton();
      return;
    }

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
      '<div style="font-size:12px;font-weight:800;letter-spacing:.13em;color:#176b4d;margin-bottom:8px;">YOUR LOCAL BALI DRIVER</div>' +
      '<h2 style="font-family:Playfair Display,serif;font-size:clamp(34px,5vw,52px);line-height:1.05;margin:0 0 14px;color:#18352c;">Meet Budi</h2>' +
      '<p style="font-size:18px;line-height:1.58;color:#52675d;margin:0 0 13px;">Explore Bali with Budi, a friendly local private driver offering personal service, flexible itineraries and local knowledge. From airport pickups to full-day adventures, your trip can be shaped around what you want to see and do.</p>' +
      '<p style="font-size:16px;line-height:1.55;color:#52675d;margin:0;">Chat directly with Budi about your dates, pickup point and plans — no payment is needed just to enquire.</p>';
    inner.appendChild(copy);
    section.appendChild(inner);
    hero.parentNode.insertBefore(section, hero.nextSibling);
  }

  function prioritiseHomepageSections() {
    if (!isHomepage()) return;
    var tours = document.getElementById('tours');
    var transfers = document.getElementById('transfers');
    if (!tours || !transfers || tours.parentNode !== transfers.parentNode) return;
    if (transfers.nextElementSibling === tours) return;
    tours.parentNode.insertBefore(transfers, tours);
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
      '<div style="text-align:center;margin-bottom:16px;"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#176b4d;">HOW CAN BUDI HELP?</div><h2 style="margin:7px 0 0;font-family:Playfair Display,serif;font-size:clamp(25px,4vw,34px);line-height:1.15;color:#18352c;">Choose what you need</h2></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;">' +
      '<a data-lead-source="quick_private_driver" href="https://wa.me/6285738148276?text=Hi%20Budi%2C%20I%27d%20like%20to%20ask%20about%20a%20private%20driver%20in%20Bali." target="_blank" rel="noopener" style="display:block;padding:18px;border-radius:18px;background:#18352c;color:#fffaf0;text-decoration:none;text-align:center;font-weight:800;box-shadow:0 10px 28px rgba(24,53,44,.12);">Private Driver<br><span style="font-size:13px;font-weight:500;opacity:.82;">Message Budi</span></a>' +
      '<a href="#transfers" style="display:block;padding:18px;border-radius:18px;background:#f8f3e9;color:#18352c;text-decoration:none;text-align:center;font-weight:800;border:1px solid #dfd3bf;">Airport Transfers<br><span style="font-size:13px;font-weight:500;color:#687a71;">Pickup &amp; drop-off</span></a>' +
      '<a href="#tours" style="display:block;padding:18px;border-radius:18px;background:#f8f3e9;color:#18352c;text-decoration:none;text-align:center;font-weight:800;border:1px solid #dfd3bf;">Bali Tours<br><span style="font-size:13px;font-weight:500;color:#687a71;">Explore with Budi</span></a></div>';
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
    card.innerHTML = '<div style="background:#f8f3e9;border:1px solid #dfd3bf;border-radius:24px;padding:28px;box-shadow:0 14px 38px rgba(24,53,44,.09);display:grid;gap:14px;"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#176b4d;">NEW TBT TOUR</div><h3 style="margin:0;font-family:Playfair Display,serif;font-size:clamp(26px,4vw,38px);line-height:1.1;color:#18352c;">Nuanu Creative City &amp; Tanah Lot</h3><p style="margin:0;color:#52675d;max-width:760px;">Discover Bali\'s iconic Tanah Lot coastline, then experience the art, architecture, nature and creative spaces of Nuanu Creative City on a flexible private day with Budi.</p><div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;"><a href="/nuanu-creative-city-tanah-lot-tour/" style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 20px;font-weight:700;background:#18352c;color:#fffaf0;text-decoration:none;">View Nuanu Tour</a><a data-lead-source="nuanu_home_card" href="https://wa.me/6285738148276?text=Hi%20Budi%2C%20I%27d%20like%20a%20price%20for%20the%20Nuanu%20Creative%20City%20and%20Tanah%20Lot%20tour." target="_blank" rel="noopener" style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 20px;font-weight:700;background:#176b4d;color:#fffaf0;text-decoration:none;">WhatsApp Budi for price</a></div><small style="color:#687a71;">Private transport • Flexible itinerary • Price on request</small></div>';
    tours.appendChild(card);
  }

  function addHomepageWarmth() {
    if (!isHomepage()) return;
    document.body.classList.add('tbt-home-warm');
    var duplicateQuick = document.getElementById('tbt-quick-choices');
    if (duplicateQuick) duplicateQuick.remove();
    var duplicateNuanu = document.getElementById('nuanu-tour-home-card');
    if (duplicateNuanu) duplicateNuanu.remove();

    if (!document.getElementById('tbt-home-warm-style')) {
      var style = document.createElement('style');
      style.id = 'tbt-home-warm-style';
      style.textContent =
        'body.tbt-home-warm main{background:#f8f3e9;}' +
        'body.tbt-home-warm #tours{background:#f8f3e9!important;}' +
        'body.tbt-home-warm #why{background:#efe4d3!important;}' +
        'body.tbt-home-warm #reviews{background:#fffaf0!important;}' +
        'body.tbt-home-warm .home-choices .tour-card{box-shadow:0 12px 32px rgba(24,53,44,.08);border-color:#dfd3bf;min-height:0!important;height:auto!important;}' +
        'body.tbt-home-warm #tours,body.tbt-home-warm #transfers{align-self:start!important;height:auto!important;min-height:0!important;}' +
        'body.tbt-home-warm #tours .tour-card,body.tbt-home-warm #transfers .tour-card{min-height:0!important;height:auto!important;align-self:start!important;}' +
        '#tbt-quick-choices{grid-column:1/-1!important;width:100%!important;}' +
        '#tbt-trust-row{grid-column:1/-1!important;width:min(1080px,calc(100% - 40px))!important;max-width:1080px;margin:8px auto 42px!important;padding:0!important;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:stretch;}' +
        '#tbt-trust-row .tbt-trust-card{background:#fffaf0;border:1px solid #dfd3bf;border-radius:18px;padding:22px 20px;text-align:center;min-height:0!important;}' +
        '#tbt-trust-row strong{display:block;color:#18352c;font-size:17px;margin-bottom:5px;}' +
        '#tbt-trust-row span{color:#687a71;font-size:14px;line-height:1.45;}' +
        '#tbt-bali-band{position:relative;overflow:hidden;min-height:300px;margin:0;background:#18352c;background-size:cover;background-position:center;display:flex;align-items:center;}' +
        '#tbt-bali-band:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(24,53,44,.88),rgba(24,53,44,.42));}' +
        '#tbt-bali-band .tbt-bali-band-inner{position:relative;z-index:1;width:min(1080px,calc(100% - 40px));margin:0 auto;color:#fffaf0;padding:48px 0;}' +
        '#tbt-bali-band h2{font-family:Playfair Display,serif;font-size:clamp(36px,5vw,58px);line-height:1.05;margin:0 0 12px;max-width:660px;}' +
        '#tbt-bali-band p{max-width:620px;color:#e4e9df;font-size:18px;line-height:1.55;margin:0;}' +
        '#tbt-wa-strip{background:#0f2a23;color:#fffaf0;padding:30px 20px;}' +
        '#tbt-wa-strip .tbt-wa-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px;}' +
        '#tbt-wa-strip h3{font-family:Playfair Display,serif;font-size:clamp(28px,4vw,40px);margin:0 0 6px;}' +
        '#tbt-wa-strip p{margin:0;color:#e4e9df;}' +
        '#tbt-wa-strip .tbt-wa-actions{display:flex;gap:10px;flex-wrap:wrap;}' +
        '#tbt-wa-strip a{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;color:#fffaf0;text-decoration:none;font-weight:800;border-radius:999px;padding:14px 22px;}' +
        '#tbt-wa-strip .tbt-wa-primary{background:#176b4d;}' +
        '#tbt-wa-strip .tbt-booking-app{background:#dcc89d;color:#18352c;}' +
        '@media(max-width:760px){#tbt-trust-row{grid-template-columns:1fr!important;margin:12px auto 30px!important;width:min(100% - 32px,1080px)!important}#tbt-trust-row .tbt-trust-card{padding:18px!important}body.tbt-home-warm #tours .tour-card,body.tbt-home-warm #transfers .tour-card{min-height:0!important;height:auto!important;padding:22px!important}#tbt-bali-band{min-height:250px}#tbt-wa-strip .tbt-wa-inner{flex-direction:column;align-items:flex-start}#tbt-wa-strip .tbt-wa-actions{width:100%;flex-direction:column}#tbt-wa-strip a{width:100%}}';
      document.head.appendChild(style);
    }

    if (!document.getElementById('tbt-trust-row')) {
      var tours = document.getElementById('tours');
      var trust = document.createElement('section');
      trust.id = 'tbt-trust-row';
      trust.setAttribute('aria-label', 'Why travel with Budi');
      trust.innerHTML =
        '<div class="tbt-trust-card"><strong>Personal Service</strong><span>Friendly, direct help from Budi from enquiry to your day in Bali.</span></div>' +
        '<div class="tbt-trust-card"><strong>Flexible Day</strong><span>Adjust the timing and stops to suit your holiday.</span></div>' +
        '<div class="tbt-trust-card"><strong>Local Knowledge</strong><span>Friendly Bali advice from Budi along the way.</span></div>';
      var whySection = document.getElementById('why');
      if (whySection && whySection.parentNode) whySection.parentNode.insertBefore(trust, whySection);
      else if (tours && tours.parentNode) tours.parentNode.insertBefore(trust, tours);
    }

    if (!document.getElementById('tbt-bali-band')) {
      var why = document.getElementById('why');
      var band = document.createElement('section');
      band.id = 'tbt-bali-band';
      var heroImage = document.getElementById('tbt-hero-image');
      if (heroImage && heroImage.style.backgroundImage) band.style.backgroundImage = heroImage.style.backgroundImage;
      band.innerHTML =
        '<div class="tbt-bali-band-inner"><div style="font-size:12px;font-weight:800;letter-spacing:.13em;color:#dcc89d;margin-bottom:10px;">SEE BALI YOUR WAY</div><h2>More than a ride — your local Bali experience.</h2><p>From airport pickup to full-day exploring, Budi keeps the day personal, flexible and easy.</p></div>';
      if (why && why.parentNode) why.parentNode.insertBefore(band, why);
    }

    if (!document.getElementById('tbt-wa-strip')) {
      var footer = document.querySelector('footer');
      var strip = document.createElement('section');
      strip.id = 'tbt-wa-strip';
      strip.innerHTML =
        '<div class="tbt-wa-inner"><div><h3>Ready to plan your Bali day?</h3><p>Choose WhatsApp for a quick chat with Budi, or open the booking app to browse and request a booking.</p></div><div class="tbt-wa-actions"><a class="tbt-wa-primary" data-lead-source="home_bottom_strip" href="https://wa.me/6285738148276?text=Hi%20Budi%2C%20I%27d%20like%20to%20plan%20my%20Bali%20trip." target="_blank" rel="noopener">WhatsApp Budi</a><a class="tbt-booking-app" data-booking-app="true" data-lead-source="home_booking_app" href="https://tbt-bali-tours.floot.app/book" target="_blank" rel="noopener">Book Online</a></div></div>';
      if (footer && footer.parentNode) footer.parentNode.insertBefore(strip, footer);
      else document.body.appendChild(strip);
    }
  }


  function addHeaderBookingButton() {
    if (!isHomepage()) return;
    var header = document.querySelector('header');
    if (!header || document.getElementById('tbt-header-booking-app')) return;
    var whatsappCta = header.querySelector('.nav-cta') ||
      header.querySelector('a[href*="wa.me/"]') ||
      header.querySelector('a[href*="api.whatsapp.com/send"]');
    if (!whatsappCta || !whatsappCta.parentNode) return;

    var button = document.createElement('a');
    button.id = 'tbt-header-booking-app';
    button.href = 'https://tbt-bali-tours.floot.app/book';
    button.target = '_blank';
    button.rel = 'noopener';
    button.dataset.bookingApp = 'true';
    button.dataset.leadSource = 'header_booking_app';
    button.textContent = 'Book Online';
    button.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:10px 16px;background:#dcc89d;color:#18352c;text-decoration:none;font-weight:800;font-size:14px;white-space:nowrap;margin-left:10px;box-shadow:0 6px 16px rgba(0,0,0,.12);';
    whatsappCta.insertAdjacentElement('afterend', button);

    if (!document.getElementById('tbt-header-booking-style')) {
      var style = document.createElement('style');
      style.id = 'tbt-header-booking-style';
      style.textContent = '@media(max-width:960px){#tbt-header-booking-app{display:none!important}}';
      document.head.appendChild(style);
    }
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
    note.style.cssText = 'margin:10px 0 0;font-size:13px;line-height:1.45;color:#687a71;text-align:center;';
    note.textContent = 'WhatsApp will open with your trip details ready. Please press Send in WhatsApp to complete your enquiry with Budi.';
    if (submit && submit.parentNode) submit.parentNode.insertBefore(note, submit.nextSibling);
    else form.appendChild(note);
  }

  function removeStrayLiteralNewline() {
    if (!isHomepage()) return;
    var root = document.querySelector('main') || document.body;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if ((node.nodeValue || '').trim() === '\\n') {
        node.nodeValue = '';
      }
    }
  }

  function fixEmailLinks() {
    var email = 'tbt.tours.travel@gmail.com';
    var links = document.querySelectorAll('a');
    for (var i = 0; i < links.length; i += 1) {
      var text = (links[i].textContent || '').trim().toLowerCase();
      var href = links[i].getAttribute('href') || '';
      if (text === 'email tbt' || text === email || href.indexOf('/cdn-cgi/l/email-protection') !== -1) {
        links[i].setAttribute('href', 'mailto:' + email);
        links[i].removeAttribute('data-cfemail');
      }
    }
  }

  function initialisePageEnhancements() {
    if (isHomepage()) addHomepageStyles();
    createMeetBudiSection();
    prioritiseHomepageSections();
    addHomepageWarmth();
    addHeaderBookingButton();
    enhanceWhatsAppBookingForm();
    removeStrayLiteralNewline();
    fixEmailLinks();
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
    var link = event.target.closest('a[href^="mailto:"]');
    if (!link) return;
    var source = getClickLocation(link);
    var label = (link.textContent || '').trim().slice(0, 100);
    sendAnalyticsEvent('email_click', { click_source: source, link_text: label });
    sendAnalyticsEvent('generate_lead', {
      click_source: source,
      lead_source: 'email_' + source,
      contact_method: 'email',
      link_text: label
    });
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