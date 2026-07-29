# Smart Parcel Locker — Frontend

Static web client for the Smart Parcel Locker system. Plain HTML + jQuery +
Bootstrap, no build step: every page is a standalone `.html` with a same-named
script in `js/`.

## Tech stack

- HTML5 + Bootstrap 5.3, jQuery 3.7, simple-keyboard (all via CDN)
- No bundler / framework / build

## Backend calls

All requests go through `APP.api()` in `js/app.js`. `API_BASE` auto-detects the
host: `localhost` → `http://localhost:8080`, otherwise same origin (nginx proxies
`/api`). The signed-in user is stored in `sessionStorage`.

## Pages

Shared: `js/app.js` (API + session), `js/keypad.js` (on-screen keypad).

- **Auth** — `index.html` (sign in), `register.html` (create account), `machine-login.html` (staff sign in)
- **Resident (web)** — `home.html` (hub), `my-parcels.html` (parcels + codes), `send-parcel.html`, `manage.html` (reserve / extend), `group.html` (family group)
- **Locker machine** — `resident-home.html` (landing), `collect-parcel.html`, `pickup-parcel.html`, `store-parcel.html` (staff store a parcel)
- **Delivery staff** — `delivery-home.html`, `courier-parcels.html` (pending pickups)
- **Property manager** — `locker-status.html`

## Run locally

Serve on port 5500 (matches the backend CORS whitelist); backend on 8080.

```bash
python3 -m http.server 5500
```

## Deploy

Copy the files to the nginx web root and let it serve them + proxy the API:

```nginx
server {
    listen 80;
    root /var/www/spl;
    index index.html;
    location /api/ { proxy_pass http://127.0.0.1:8080; }
    location /     { try_files $uri $uri/ =404; }
}
```
