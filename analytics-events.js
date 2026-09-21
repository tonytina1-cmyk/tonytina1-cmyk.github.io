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

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href*="wa.me/"]');
    if (!link) return;

    sendAnalyticsEvent('whatsapp_click', {
      click_source: getClickLocation(link),
      link_text: (link.textContent || '').trim().slice(0, 100)
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
    sendAnalyticsEvent('enquiry_submit', {
      form_id: 'waForm',
      form_name: 'quick_whatsapp_booking',
      service: service ? service.value : 'unknown'
    });

    sendAnalyticsEvent('whatsapp_click', {
      click_source: 'booking_form',
      link_text: 'Send details on WhatsApp'
    });
  }, true);
}());
