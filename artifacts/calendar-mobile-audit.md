# Calendar mobile audit

## Current implementation

- `src/lib/calendar.ts` builds the Google Calendar template URL at `https://calendar.google.com/calendar/render` with `action=TEMPLATE`, all-day `dates=20261031/20261101`, title, description, and location.
- The same event is serialized to a client-generated `.ics` file (`text/calendar`) using `DTSTART;VALUE=DATE:20261031` and exclusive `DTEND;VALUE=DATE:20261101`.
- Event data is unchanged: title `Casamento de Maria e Sérgio`, description `Celebração do casamento de Maria e Sérgio.`, location `Paróquia Nossa Senhora de Nazaré, Cabedelo, Paraíba`.

## Before this round

- Desktop: HTTPS link opened in a new browser tab.
- Mobile: the same HTTPS link also opened a browser tab/window; there was no app-specific handling.

## Mobile strategy decision

Google does not publish a stable web deep link that creates a prefilled event directly in the Google Calendar Android or iOS app. Android documents native `ACTION_INSERT` intents for installed apps, but a web page cannot invoke that native intent without an app-specific bridge. Google's Android Calendar manifest supports selected `www.google.com/calendar/event` URLs, not the `calendar/render?action=TEMPLATE` creation flow. iOS has no documented Google Calendar custom URL scheme for this flow.

Therefore this round keeps the HTTPS universal/web URL on both platforms. On narrow/touch layouts it opens in the current tab (avoiding a ghost tab); Android browsers may still hand the HTTPS URL to the installed app through their own verified-link behavior, otherwise the web fallback remains available. iOS stays on the universal web route. `.ics` remains the deterministic app alternative.

## QA target

- Desktop keeps a new-tab HTTPS web flow.
- Mobile uses the current tab and the label `Abrir no Google Calendar`.
- No custom scheme, iframe, or timed redirect is used, so there is no broken navigation or fallback race.
