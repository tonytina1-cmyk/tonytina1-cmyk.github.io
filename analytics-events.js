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

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href*="api.whatsapp.com/send"], a[href*="wa.me/"]');
    if (!link) return;

    sendAnalyticsEvent('whatsapp_click', {
      click_source: getClickLocation(link),
      link_text: (link.textContent || '').trim().slice(0, 100)
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
    sendAnalyticsEvent('enquiry_submit', {
      form_id: 'waForm',
      form_name: 'quick_whatsapp_booking',
      service: service ? service.value : 'unknown'
    });

    sendAnalyticsEvent('whatsapp_click', {
      click_source: 'booking_form',
      link_text: 'Send details on WhatsApp'
    });

    event.preventDefault();
    event.stopImmediatePropagation();

    var date = document.getElementById('date');
    var guests = document.getElementById('guests');
    var pickup = document.getElementById('pickup');
    var notes = document.getElementById('notes');
    var message = "Hi Budi, I'd like to enquire about a " + (service ? service.value : 'Bali trip') + '.\n\n' +
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
