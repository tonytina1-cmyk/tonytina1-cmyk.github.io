# TBT Tours & Travel — Project Handover
Updated: 14 October 2026 (Brisbane time)

## Purpose
Permanent project handover for when ChatGPT conversations reach their length limit. Read this at the start of a new TBT build conversation. This is a manual record: update when meaningful changes occur. GitHub and Cloudflare remain the sources of truth for code and deployment.

## Project
Website: https://www.tbtbalitours.com
GitHub repo: tonytina1-cmyk/tonytina1-cmyk.github.io
Website hosting: Cloudflare Pages.
Budi is the owner of TBT Tours & Travel / Budi Bali Driver. His Australian collaborator handles website/app/IT support, not ownership.

## Business rules
Budi drives when available. Otherwise he delegates to one of six trusted drivers, with potential expansion to fifteen. Customers pay the assigned driver directly. The driver pays TBT/Budi a referral fee: outsourced airport transfers IDR 50,000; outsourced day tours generally IDR 100,000. No fee is due if Budi drives. Never show internal driver referral fees to customers.

## Website and booking requirements
- Airport Transfers page needs separate Request Airport Transfer (opens form) and WhatsApp Budi (opens WhatsApp) buttons.
- Request form should feed the agreed booking/admin process and also get details to Budi via WhatsApp. Verify actual functionality, not only button destination.
- Keep mobile layout usable, especially in Facebook's built-in browser, without horizontal overflow.
- Keep existing website visuals, services and working links unless change is requested.

## Most recent website change
- GitHub commit `8da9e7b` was reported as the fix for flashing/old airport-transfer buttons: render correct buttons immediately and remove late-replacement script.
- **Cloudflare green tick confirmed by user on 14 Oct 2026.** Next: refresh actual Airport Transfers page and confirm no flicker and form/WhatsApp both work consistently, including repeat visits.
- Do not claim form-to-admin/WhatsApp automation is fully working without an end-to-end test.

## App and admin
A connected customer app and separate internal admin workflow have been worked on. Goals: simple booking overview, assign drivers, track booking fees privately, booking alerts, archive/completion, refresh control under signed-in area. Admin access intended for Budi and Australian collaborator. iOS TestFlight used for app testing; Google Play setup underway awaiting Android-device verification. Do not assume app code is in this website repository.

## Pending / future
- Confirm airport form workflow end-to-end, including Budi receiving enquiry.
- Explore WhatsApp booking-confirmation replies updating admin automatically, noting that WhatsApp Business app by itself doesn't provide automation.
- Reduce work required for drivers to report availability.
- Keep Search Console, GA4 and booking conversion tracking healthy.
- TBT tours, reviews and marketing improvement ongoing.
- eSIM ideas on hold pending Budi's input.

## How to continue in a new chat
1. Ask ChatGPT: "Open TBT_PROJECT_HANDOVER.md from our GitHub website repo and continue from it."
2. Check the latest code/deployment and any new user observations; do not assume this file is newer than the actual repo.
3. Update this file after meaningful milestones, without exposing customer private information, credentials, API keys or unpublished personal driver contact details.

## Update — 14 October 2026, private booking flow review
- Inspected Floot /airport-transfer-request and /_api/bookings. Customer requests are stored first in bookingRequests; server then attempts emails to TBT Gmail and Australian collaborator's Hotmail and push messages to registered devices. Customer WhatsApp message requires manual Send. Email/push delivery is NOT yet independently verified; errors can be logged while the customer still receives success.
- Enhanced Admin-only Private Test Mode with a safe Preview customer enquiry & alerts walkthrough. No API calls, stored test bookings or messages; current deployment confirmed published at https://tbt-bali-tours.floot.app.
- Do not submit a real test booking without planning notifications to Budi, who may receive email or push. Next step is a controlled real-delivery check when appropriate and recording notification delivery status reliably.

## 14 October 2026 — driver admin simplification
- Floot owner Admin now has compact Driver check summary near the top, showing Booked, Unavailable, Check or Unconfirmed for six drivers based on confirmed bookings, driver responses and recorded time off. No bookings are NOT treated as confirmed availability. A button opens existing daily/weekly Driver Schedule; no daily login or messaging requirement was added.
- Typecheck clean; web app deployed to https://tbt-bali-tours.floot.app (no native build requested). Budi view was left unchanged.

## 14 October 2026 — quick driver assignment
- Owner Admin now shows 'Assign a driver' shortcuts for confirmed unassigned jobs. Clicking opens the existing booking edit form directly on the driver tab. Existing conflict and time-off checks apply when saved; no automatic messages are triggered by shortcut.
- Typecheck clean; published to https://tbt-bali-tours.floot.app. The section hides if no confirmed unassigned jobs.

## 14 October 2026 — reduce Admin clutter and alert on collapsed tools
- Owner Admin's Private Test Mode, quick assignment shortcuts and Driver Check are now grouped under a collapsed 'Extra Admin tools' section. Budi's Admin remains unchanged.
- The closed heading dynamically shows 'Needs attention' when there are confirmed unassigned bookings, pending driver replies, or driver schedule warnings. Expand to see issue counts. When clear it says 'No driver alerts'. No automated WhatsApp, email or push messages added.
- Floot web deployment succeeded at https://tbt-bali-tours.floot.app; TypeScript typecheck clean. Changes are web-only; no native mobile build triggered.

## 14 October 2026 — 3 pop-up Admin tools
- Replaced collapsed Extra Admin tools section with three compact owner-only pop-up buttons: Test Mode, Assign Driver, Driver Check. Assign Driver button shows count of confirmed unassigned jobs; Driver Check badge counts pending driver replies and schedule warnings. Each pop-up has Close; assign opens existing edit driver tab; Driver Check can open full driver schedule. Budi Admin unchanged.
- Typecheck clean, published to https://tbt-bali-tours.floot.app web only.

## 14 October 2026 — Business Snapshot pop-up
- Owner Admin Business Snapshot now appears as a single compact button. It opens a dismissible pop-up preserving all existing confirmed-job, Budi vs outsourced, booking value, and referral fee metrics. The button warns when referral fees are owing; otherwise shows Up to date. Budi Admin untouched.
- Typecheck clean; web deployment succeeded at https://tbt-bali-tours.floot.app.
