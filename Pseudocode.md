Pseudocode

1. App startup
Procedure App:
    Load theme and settings from localStorage (with defaults)
    Apply theme to <html data-theme>
    Render: ThemeProvider → SettingsProvider → ToastProvider → Shell
    Shell renders: Header, OfflineBanner, Routes, BottomNav, Toasts

2. Auto-detect location
Procedure useAutoLocation:
    If a saved activeLocation exists: return it

    If geolocation is unavailable:
        Use fallback (Kimberley) → save → return

    Request user location

    If granted:
        Reverse-geocode coordinates → build Location → save → return

    If denied:
        Use fallback (Kimberley) → save → return

3. Fetch weather with offline fallback
Procedure useWeather(lat, lng):
    If lat or lng missing: return empty

    key ← "weatherCache:<lat>,<lng>"
    Mark loading = true

    Try:
        raw  ← fetch Open-Meteo (current, hourly, daily)
        data ← normalizeWeather(raw)
        Save to localStorage under key
        Return { data, isStale: false }

    Catch:
        cached ← read localStorage under key
        If cached exists:
            Return { data: cached.data, isStale: true, cachedAt: cached.cachedAt }
        Else:
            Return { data: null, error }

    Finally:
        Mark loading = false

4. Normalize weather response
Procedure normalizeWeather(raw):
    hourIndex ← position of current hour in raw.hourly.time

    hourly ← next 12 hours mapped to:
        { label, condition, temp, rain, wind }

    daily ← all days mapped to:
        { day, condition, low, high, uv, uvLabel, rain, wind, sunrise, sunset }

    Return {
        current: { temp, feelsLike, condition, conditionKey, isDay,
                   humidity, windSpeed, windDirection, pressure, visibility,
                   precipitation, uvIndex, uvLabel, high, low, sunrise, sunset },
        hourly,
        daily
    }

5. WMO weather code mapping

Procedure wmoToCondition(code, isDay):
    0        → isDay ? "clear" : "clear-night"
    1..2     → "partly-cloudy"
    3        → "cloudy"
    45..48   → "fog"
    51..67   → "rain"
    71..77   → "snow"
    80..82   → "rain"
    85..86   → "snow"
    95+      → "thunderstorm"
    default  → "cloudy"


 6. Search for a city
Procedure searchLocations(query):
    If length(query) < 2: return []

    If in-memory cache has a hit < 1 hour old: return it

    results ← fetch Open-Meteo geocoding (count: 8)
    results ← results mapped to { id, name, region, country, lat, lng }

    Store in memory cache
    Return results

7. Debounced search on Search page
Procedure SearchPage:
    debouncedQuery ← debounce(query, 350ms)

    Whenever debouncedQuery changes:
        If length < 2: clear results; return

        isSearching = true

        Try:
            results ← searchLocations(debouncedQuery)
            Set results
        Catch:
            Clear results
        Finally:
            isSearching = false

        Cleanup: cancel stale request

 8. Add a saved location
Procedure handleAdd(location):
    newLoc ← {
        id: location.id + "-" + now(),
        name, region, country, lat, lng,
        addedAt: now()
    }

    savedLocations = [newLoc, ...savedLocations]
    Show toast "<name> added"
    Close modal

9. Delete a saved location
Procedure handleDelete(target):
    savedLocations = savedLocations.filter(l ≠ target.id)
    Show toast "<name> removed"
    Close confirmation modal

10. Fetch alerts
Procedure getAlerts(lat, lng):
    key ← "<lat>,<lng>"
    cache ← read localStorage alertsCache

    If cache[key] exists and age < 15 min: return it

    If API key missing:
        Log warning; return []

    Try:
        response ← fetch WeatherAPI alerts (key, lat, lng)

        If response.error: log; return []

        alerts ← response.alerts mapped to:
            { id, type, title, severity, location, description, until, issued }

        Save cache[key] = { time: now(), data: alerts }
        Return alerts

    Catch:
        Return []

11. Fire severe-alert notifications
Procedure notifyIfSevere(alerts):
    If notifications disabled: return
    If already notified this session: return
    If Notification API unavailable: return
    If alerts empty: return

    severe ← alerts.filter(severity = "High")
    If severe empty: return

    Mark notified

    If permission = "granted":
        Fire
    Else if permission ≠ "denied":
        Request permission
        If granted: Fire

Procedure Fire:
    For each alert:
        Show OS notification(title, description)
    Show toast "<n> severe alerts active"

12. Unit conversion
Procedure formatTemp(celsius, unit):
    If unit = "F": value = round(celsius × 1.8 + 32)
    Else:          value = round(celsius)
    Return value + "°"

Procedure formatWind(kmh, unit):
    If unit = "mph": return round(kmh × 0.621371) + " mph"
    Else:            return round(kmh) + " km/h"

Procedure formatPrecipitation(mm, unit):
    If unit = "in": return round(mm × 0.0393701 × 100) / 100 + " in"
    Else:           return round(mm × 10) / 10 + " mm"

Procedure formatTime(timeStr, format):
    If format = "12h": return timeStr

    Parse "H:MM AM/PM" via regex
    If no match: return timeStr

    If PM and hour ≠ 12: hour += 12
    If AM and hour = 12: hour = 0

    Return pad(hour) + ":" + minutes

13. Theme switching

Procedure ThemeProvider:
    theme ← read localStorage "theme" (default "light")

    Whenever theme changes:
        Set <html data-theme> = theme
        Save to localStorage

    Provide { theme, setTheme, toggleTheme }

Procedure toggleTheme:
    setTheme(theme = "light" ? "dark" : "light")

14. Persisted state

Procedure useLocalStorage(key, initial):
    value ← read localStorage on mount (fallback to initial)

    Whenever value changes:
        Write to localStorage

    Return [value, setValue, reset]

Procedure readLocalStorage(key, fallback):
    If localStorage unavailable: return fallback

    Try:
        raw = localStorage.getItem("weatherapp:" + key)
        Return raw ? parse(raw) : fallback
    Catch:
        Return fallback

Procedure writeLocalStorage(key, value):
    If localStorage unavailable: return false

    Try:
        localStorage.setItem("weatherapp:" + key, serialize(value))
        Return true
    Catch:
        Return false

15. Offline banner
Procedure WeatherPage:
    { data, isStale, cachedAt } ← useWeather(lat, lng)

    Whenever isStale or cachedAt changes:
        setLastCachedAt(isStale ? cachedAt : null)

Procedure OfflineBanner:
    Subscribe to the offline store

    If timestamp is null: return null

    Render "Showing cached data from <relative time>"

Procedure formatRelative(timestamp):
    mins = floor((now - timestamp) / 60000)
    0        → "just now"
    1        → "1 minute ago"
    < 60     → "<n> minutes ago"
    < 1440   → "<n> hours ago"
    else     → "<n> days ago"

16. Full data flow
Open app
  → useAutoLocation (check localStorage)
  → if empty: request geolocation → reverse geocode → save
  → useWeather (check in-memory cache)
  → if empty: fetch Open-Meteo → normalize → cache to localStorage
  → render Weather page
  → user navigates via React Router (no refetch)
  → user types "Tokyo" → debounced search → results
  → user clicks result → setActiveLocation → useWeather refetches
  → new city's weather renders

