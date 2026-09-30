(function () {
  'use strict';

  function sendAnalyticsEvent(eventName, parameters) {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', eventName, Object.assign({
      page_path: window.location.pathname,
      transport_type: 'beacon'
    }, parameters || {}));
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
    } catch (error) {
      return url;
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
    card.innerHTML =
      '<div style="background:#f8f4ec;border:1px solid #e7e5df;border-radius:24px;padding:28px;box-shadow:0 14px 38px rgba(7,27,45,.09);display:grid;gap:14px;">' +
        '<div style="font-size:12px;font-weight:800;letter-spacing:.12em;color:#1d6f4a;">NEW TBT TOUR</div>' +
        '<h3 style="margin:0;font-family:Playfair Display,serif;font-size:clamp(26px,4vw,38px);line-height:1.1;color:#071b2d;">Nuanu Creative City &amp; Tanah Lot</h3>' +
        '<p style="margin:0;color:#4f5d68;max-width:760px;">Discover Bali\'s iconic Tanah Lot coastline, then experience the art, architecture, nature and creative spaces of Nuanu Creative City on a flexible private day with Budi.</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">' +
          '<a href="/nuanu-creative-city-tanah-lot-tour/" style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 20px;font-weight:700;background:#071b2d;color:#fff;text-decoration:none;">View Nuanu Tour</a>' +
          '<a data-lead-source="nuanu_home_card" href="https://wa.me/6285738148276?text=Hi%20Budi%2C%20I%27d%20like%20a%20price%20for%20the%20Nuanu%20Creative%20City%20and%20Tanah%20Lot%20tour." target="_blank" rel="noopener" style="display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 20px;font-weight:700;background:#1faa59;color:#fff;text-decoration:none;">WhatsApp Budi for price</a>' +
        '</div>' +
        '<small style="color:#66717f;">Private transport • Flexible itinerary • Price on request</small>' +
      '</div>';

    tours.appendChild(card);
  }

  function enhanceWhatsAppBookingForm() {
    var form = document.getElementById('waForm');
    if (!form || document.getElementById('waForm-send-note')) return;

    var submit = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submit) {
      if (submit.tagName === 'INPUT') {
        submit.value = 'Continue to WhatsApp';
      } else {
        submit.textContent = 'Continue to WhatsApp';
      }
    }

    var note = document.createElement('p');
    note.id = 'waForm-send-note';
    note.style.cssText = 'margin:10px 0 0;font-size:13px;line-height:1.45;color:#66717f;text-align:center;';
    note.textContent = 'WhatsApp will open with your trip details ready. Please press Send in WhatsApp to complete your enquiry with Budi.';

    if (submit && submit.parentNode) {
      submit.parentNode.insertBefore(note, submit.nextSibling);
    } else {
      form.appendChild(note);
    }
  }

  function initialisePageEnhancements() {
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

    sendAnalyticsEvent('whatsapp_click', {
      click_source: source,
      link_text: label
    });

    // Treat opening WhatsApp as lead initiation, not a confirmed message sent.
    sendAnalyticsEvent('generate_lead', {
      click_source: source,
      lead_source: 'whatsapp_' + source,
      contact_method: 'whatsapp',
      link_text: label
    });

    if (link.href.indexOf('wa.me/') !== -1) {
      link.href = getSafeWhatsAppUrl(link.href);
    }
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

    // This form does not send an email or a WhatsApp message itself. It opens
    // WhatsApp with a pre-filled message, so record a handoff rather than a
    // confirmed enquiry submission. This prevents false enquiry_submit alerts.
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
