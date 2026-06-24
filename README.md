# StallManager — modularized frontend

Split out of the original single-file `StallManager.jsx` into pages/components/api/utils,
with zero behavior changes except the one backend-driven fix noted below. This is now a
complete, runnable **Vite + React** project — not just the `src/` folder.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` produces a production bundle in `dist/`. If you deploy that `dist/`
folder, make sure your host does SPA fallback (serves `index.html` for any unmatched
path) — otherwise the public booking route `/event/:id` will 404 on a hard refresh.
Vite's own dev server already does this for you automatically.

## Structure

```
index.html               Vite entry HTML, mounts #root
package.json
vite.config.js
src/
├── main.jsx              actual React entry point — createRoot(...).render(<App />)
├── App.jsx                routes between public page / login / admin shell
├── api/
│   └── client.js        BASE_URL + every backend call (api.* methods)
├── utils/
│   ├── format.js         formatDate, formatCurrency
│   └── eventStatus.js     getEventStatus, STATUS_COLORS
├── styles/
│   └── styles.js          shared inline-style tokens (the "S" object)
├── router.js              path-based switch: /event/:id (public) vs admin app
├── components/
│   ├── Toast.jsx
│   ├── Sidebar.jsx
│   ├── BookingForm.jsx          (public vendor booking form)
│   ├── EditBookingForm.jsx      (admin edit confirmed booking)
│   ├── EventFormModal.jsx       (admin create/edit event)
│   └── StallModal.jsx           (admin view/add/edit/delete stall)
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Events.jsx               (list) -> renders EventDetail when one is selected
│   ├── EventDetail.jsx          (single-event admin management view)
│   ├── Bookings.jsx
│   ├── Invoice.jsx
│   └── PublicEventPage.jsx      (public booking flow + Razorpay)
```

This whole folder is a self-contained project (see "Run it" above). If you'd rather
merge it into an existing project instead, copy `src/` in and merge `package.json`
dependencies + `vite.config.js` / `index.html` as needed.

## Backend-driven change applied

`AdminEventController` now exposes a dedicated, admin-authenticated
`GET /admin/events/{eventId}`, separate from the public `GET /events/{eventId}`.

`api.getEvent()` in `src/api/client.js` was updated to call `/admin/events/{id}`
instead of reusing the public path — this is the only functional change.
`EventDetail.jsx` (admin) uses `api.getEvent()`; `PublicEventPage.jsx` uses
`api.getPublicEvent()` (`/events/{id}`, no auth) — these now stay fully separate,
matching the two controllers.

## Global exception handling

Your new `GlobalExceptionHandler` returns `{ timestamp, status, error, message, path }`
on errors. `api.request()` already reads `errorData.message` and throws an `Error`
with it, so every existing `catch` block (toasts, form errors) picks up your new
messages automatically — no frontend change was needed for this part.

Send over more backend changes any time and I'll fold them in here.
