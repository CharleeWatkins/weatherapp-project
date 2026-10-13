Algorithm

1. Detecting the user's location on first visit
When someone opens the app for the very first time, we don't know where they are. So:

1. We check if we've saved a location before (from a previous visit). If yes, use that  done.
2. If no saved location exists, we ask the browser for permission to know their location.
3. If they allow it, we take the GPS coordinates (latitude and longitude) and send them to a free reverse-geocoding service. That service tells us something like "you're in Kimberley, Northern Cape, South Africa."
4. We save that location so next time the app opens, it doesn't have to ask again.
5. If they deny permission or if their browser doesn't support location at all  we fall back to a default city, so the app still works.

The user is never stuck. Either we know where they are, or we gracefully pick a place for them.

2. Searching for a city
When a user types a city name into the search box:

1. We wait 350 milliseconds after they stop typing before doing anything. This is called debouncing. Without it, every keystroke would fire a request  wasteful and slow.
2. Once they've paused, we send what they typed to Open-Meteo's geocoding service.
3. That service returns a list of matching cities with their coordinates, regions, and countries.
4. We display those as clickable rows.

If the user keeps typing, we cancel the previous request and start a new one this prevents a slower, older request from overwriting newer results.

If they type fewer than 2 characters, we don't search at all. Too short to be useful.

3. Fetching the weather
Once we know a location's coordinates, we fetch its weather:

1. We check our in-memory cache first. If we already fetched weather for this exact location within the last 10 minutes, we use that no network call.
2. Otherwise, we call Open-Meteo's forecast endpoint with the coordinates.
3. The API returns current conditions, hourly data for the next few days, and daily data for the next 7 days.
4. We **normalize** the response  meaning we convert their data format into ours (e.g., turning a numeric weather code into `'rain'` or `'clear'`).
5. We store the normalized result in memory (for speed) and in localStorage (for offline use).
6. We return it to the UI.

Normalizing matters because the rest of the app only ever sees one consistent shape, regardless of what the API returns.


4. Offline fallback - when there's no internet
Sometimes the user's connection drops or the API is temporarily unreachable. Instead of showing an error, we fall back to cached data:

1. We try to fetch fresh weather.
2. If it succeeds  great, we update the cache and show the new data.
3. If it fails,  we check whether we have a previously saved copy of the weather for this location.
4. If yes, we show that cached copy and display a yellow banner: "Showing cached data from 5 minutes ago." The user knows the data might be slightly old, but the app keeps working.
5. If no cached copy exists either, we show an error with a retry button.

The key idea: never show a blank screen when we could show something useful.

5. Saving a location
When the user clicks "Add" on the Saved page:

1. A modal opens with a search input.
2. They type a city name the same debounced search runs as on the Search page.
3. The results appear as clickable rows. If a city is already saved, we mark it with a "Saved" badge and disable the row prevents duplicates.
4. When the user clicks a result, we build a new `SavedLocation` object with a unique ID (the API's ID plus the current timestamp, to guarantee uniqueness).
5. We prepend it to the saved list, so it appears at the top.
6. We save the updated list to localStorage.
7. We show a toast: *"Tokyo added to saved places."*
8. We close the modal.

Because the list lives in localStorage, it survives page reloads and browser restarts.

6. Fetching weather alerts
Weather alerts come from WeatherAPI.com (Open-Meteo doesn't provide alerts):

1. We check whether there's a cached alert response for this location from the last 15 minutes. If yes, use it.
2. Otherwise, we call WeatherAPI's `/alerts.json` endpoint with our API key and the coordinates.
3. If the API returns an error (bad key, quota exceeded), we log it and return an empty list the app never breaks.
4. If the API returns alerts, we map each one from their format to ours. This includes:
   - Converting their severity strings ("Severe", "Moderate", "Minor") into our three levels: High, Moderate, Low.
   - Converting their event type ("Thunderstorm Warning", "Flood Watch") into an icon category.
   - Formatting their timestamps into readable strings.
5. We cache the results and return them.

If there are no active alerts, we show a green "You're all clear" card  which is a valid, positive state, not an error.

7. Browser notifications for severe alerts
When severe weather is active, we want to alert the user even if they're not looking at the app. That's what browser notifications are for:

1. First, check: are notifications turned on in Settings? If not, skip.
2. Have we already notified the user in this session? If yes, skip — don't spam.
3. Does the browser support notifications? If not, skip.
4. Are there any alerts at all? If not, skip.
5. Are any of them severe (High)? If not, skip.
6. Check the browser's notification permission:
   - If already granted, fire the notifications.
   - If not yet asked, request permission, then fire if granted.
   - If denied, do nothing.
7. For each severe alert, create an OS-level notification with the title and description.

Results: the user sees a real popup notification, not just a badge inside the app.

8. Converting units
The app stores all weather data in metric (Celsius, km/h, mm). We only convert when displaying:

1. If the user has chosen Celsius, we show the raw number. If Fahrenheit, we apply the formula `F = C × 1.8 + 32` and round.
2. For wind, if the user prefers mph, we multiply km/h by 0.621371 and round.
3. For precipitation, if the user prefers inches, we multiply mm by 0.0393701 and round to two decimals.
4. For time, if the user prefers 24-hour format, we convert "6:42 AM" to "06:42" using a regular expression.

The advantage of this approach: the data model never changes. Switching units doesn't re-fetch anything. It just re-renders with different numbers.

9. Light/dark theme
Theming is handled with CSS variables:

1. The entire app uses CSS variables like `var(--bg)` and `var(--text-primary)`.
2. Those variables are defined twice in CSS: once under `[data-theme="light"]` and once under `[data-theme="dark"]`.
3. When the user changes the theme, we simply set `document.documentElement.setAttribute('data-theme', 'dark')`.
4. Every element using those variables instantly updates  no React re-render required, no per component logic.

This is much more efficient than passing the theme through every component.

10. Persisting data across sessions
Everything the user customises is stored in `localStorage`:

- Their last-viewed location
- Their saved locations list
- Their recent searches
- Their unit and notification preferences
- Their theme choice

We wrap every read and write in a small helper that:
- Handles JSON errors safely (returns a fallback instead of crashing)
- Handles storage being disabled (private browsing) by falling back to in-memory state
- Namespaces keys with a prefix (`weatherapp:`) to avoid collisions with other apps on the same domain

The result: if the user reloads the page, closes the tab, or comes back tomorrow, everything looks exactly the same.

