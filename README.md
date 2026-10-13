# ShopKart

A full-stack MERN e-commerce application built across Engineering Labs 01–06: customer authentication, a searchable product catalogue, wishlist, shopping cart with global state, and a Razorpay-backed checkout that produces persistent orders.

**Stack:** MongoDB · Express · React · Node.js · Mongoose · JWT · bcrypt · Razorpay (Test Mode)

---

## Features

| Area | What it does |
|---|---|
| **Authentication** | Register, login, logout and profile, with bcrypt-hashed passwords and a JWT delivered in an HttpOnly cookie |
| **Product catalogue** | Dynamic search, category filter and price sorting, all built as one MongoDB query |
| **Product details** | Dynamic route driven by a URL parameter |
| **Wishlist** | Product references stored on the customer and resolved with `populate()`, with duplicate prevention |
| **Shopping cart** | Quantity-aware cart rows, stock-validated, shared across the app through React Context |
| **Checkout** | Validated shipping form, server-side pricing and a final stock re-check |
| **Payments** | Razorpay Test Mode with mandatory HMAC-SHA256 signature verification on the server |
| **Orders** | Purchase-time snapshots, order history and a per-order detail page |

Every protected route is guarded by one authentication middleware, and every user-scoped query filters on the id taken from the verified JWT — never from the request.

---

## Project structure

```
Shop Kart/
├── Server/                          # Node + Express API
│   ├── config/razorpay.js           # Razorpay client, keys read lazily
│   ├── controllers/                 # customer, product, wishlist, cart, order
│   ├── middlewares/auth.middleware.js
│   ├── models/                      # customer, product, order
│   ├── routes/                      # one router per resource
│   ├── utils/generateToken.js       # JWT signing + cookie options
│   ├── seed.js                      # loads 15 demo products
│   ├── index.js                     # middleware order, route mounting, DB connect
│   └── .env.example
│
└── Client/                          # React + Vite
    └── src/
        ├── components/              # Navbar, ProductCard, CartItem, buttons…
        ├── context/CartContext.jsx  # the single shared cart
        ├── pages/                   # Login, Register, Home, Products,
        │                            # ProductDetails, Wishlist, Cart,
        │                            # Checkout, Orders, OrderDetails, OrderSuccess
        ├── services/api.js          # one axios instance for the whole app
        ├── utils/                   # razorpay script loader, formatters
        └── App.jsx                  # routes
```

---

## Prerequisites

- **Node.js 18 or newer** (built on 24.x) — `node -v`
- **A MongoDB Atlas cluster** (or a local MongoDB instance)
- **A Razorpay account in Test Mode**, for the checkout flow

---

## Setup

### 1. Clone and install

```bash
git clone <your-repository-url>
cd "Shop Kart"

cd Server && npm install
cd ../Client && npm install
```

### 2. Configure the backend

```bash
cd Server
cp .env.example .env     # on Windows: copy .env.example .env
```

Open `Server/.env` and fill in:

| Variable | Where it comes from |
|---|---|
| `dbURL` | Atlas → Connect → Drivers → copy the connection string |
| `PORT` | Any free port. `6769` by default |
| `JWT_SECRET` | Any long random string you invent |
| `JWT_EXPIRES` | e.g. `6d` |
| `RAZORPAY_KEY_ID` | Razorpay dashboard → **Test Mode on** → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Shown once when you generate the key — copy it immediately |

In Atlas, add your current IP under **Network Access** or the connection will be refused.

### 3. Configure the frontend

```bash
cd ../Client
cp .env.example .env     # on Windows: copy .env.example .env
```

`VITE_API_URL` must match the backend `PORT`. Vite reads `.env` only at startup, so restart the dev server after changing it.

### 4. Load the demo catalogue

```bash
cd ../Server
npm run seed
```

This clears the `products` collection and inserts 15 products across Books, Electronics, Fashion and Home. Safe to re-run at any time.

---

## Running the app

Two terminals, both kept open.

**Terminal 1 — API**

```bash
cd Server
npm run dev
```

Wait for:

```
MongoDB connected
Server running on port 6769
```

**Terminal 2 — frontend**

```bash
cd Client
npm run dev
```

Then open **http://localhost:5173**.

Register an account, browse the catalogue, add to the cart, and check out. For the Razorpay Test Mode payment use card **4111 1111 1111 1111**, any future expiry and any CVV. No real money moves in Test Mode.

### npm scripts

| Location | Command | Does |
|---|---|---|
| Server | `npm run dev` | Starts the API with nodemon |
| Server | `npm start` | Starts the API with plain node |
| Server | `npm run seed` | Resets and loads the demo products |
| Client | `npm run dev` | Vite dev server on port 5173 |
| Client | `npm run build` | Production build into `dist/` |
| Client | `npm run preview` | Serves the production build locally |

---

## API reference

All paths are relative to `http://localhost:6769`. Routes marked **Auth** require the session cookie, which the browser sends automatically because axios is configured with `withCredentials: true`.

### Customers

| Method | Endpoint | Auth | Purpose |
|---|---|:--:|---|
| POST | `/customers/register` | | Create an account. 409 if the email exists |
| POST | `/customers/login` | | Verify the password and set the HttpOnly cookie |
| GET | `/customers/me` | ✔ | Return the signed-in customer |
| POST | `/customers/logout` | ✔ | Clear the cookie |
| PATCH | `/customers/change-password` | ✔ | Verify the old password, hash the new one |

### Products

| Method | Endpoint | Auth | Purpose |
|---|---|:--:|---|
| POST | `/products` | | Create a product |
| GET | `/products` | | List, with `?search=`, `?category=`, `?sort=price_asc\|price_desc` |
| GET | `/products/:id` | | One product. 400 on a malformed id, 404 if absent |
| GET | `/products/categories/list` | | Distinct categories, used by the filter dropdown |

### Wishlist

| Method | Endpoint | Auth | Purpose |
|---|---|:--:|---|
| POST | `/wishlist/:productId` | ✔ | Save a product. 409 if already saved |
| GET | `/wishlist` | ✔ | Saved products, populated |
| GET | `/wishlist/ids` | ✔ | Just the ids and a count, for the heart icons and badge |
| DELETE | `/wishlist/:productId` | ✔ | Remove. 404 if not saved |
| PATCH | `/wishlist/:productId/toggle` | ✔ | Add or remove, returns `saved: true/false` |

### Cart

| Method | Endpoint | Auth | Purpose |
|---|---|:--:|---|
| POST | `/cart/:productId` | ✔ | Add, or increment if already present. 400 above stock |
| GET | `/cart` | ✔ | Cart rows with populated products and quantities |
| PATCH | `/cart/:productId` | ✔ | Set an exact quantity, re-validated against live stock |
| DELETE | `/cart/:productId` | ✔ | Remove a row |

### Orders

| Method | Endpoint | Auth | Purpose |
|---|---|:--:|---|
| POST | `/orders/create-payment-order` | ✔ | Validate the address and cart, price it on the server, create a pending order and a Razorpay order |
| POST | `/orders/verify-payment` | ✔ | Verify the HMAC signature, mark the order paid, clear the cart |
| POST | `/orders/:id/payment-failed` | ✔ | Record a failed attempt |
| GET | `/orders` | ✔ | This customer's orders, newest first |
| GET | `/orders/:id` | ✔ | One order. Ownership is part of the query |
| PATCH | `/orders/:id/status` | ✔ | Development helper: PLACED → CONFIRMED → SHIPPED → DELIVERED |

---

## Design decisions worth knowing

**Passwords are hashed by the model, not a controller.** A `pre("save")` hook on the customer schema bcrypts the password, so no route can forget to. `select: false` on the field keeps it out of every query result unless explicitly requested.

**The frontend never holds the token.** The JWT lives in an HttpOnly cookie that JavaScript cannot read, so the client has no way to know its own login state. It asks: `GET /customers/me` returns 200 or 401, and the server stays the authority.

**References for live data, snapshots for history.** Wishlist and cart rows store Product ObjectIds, so prices and stock are always current. Order items copy the name, price and image at purchase time, so a receipt never changes when the catalogue does.

**The server owns pricing.** Checkout sends only the shipping address. The backend reads the cart from the database, re-checks stock, and computes the total from live product prices. Any amount sent by the client is ignored.

**A payment is only real once its signature verifies.** Razorpay's browser callback proves nothing on its own. The server recomputes `HMAC-SHA256(order_id|payment_id)` with the Key Secret, compares it in constant time, and only then marks the order paid and clears the cart.

**Derived values are never stored.** Cart subtotals and item counts are computed from the cart rows on every render, so they cannot drift out of step with it.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Could not connect to any servers in your MongoDB Atlas cluster` | Your IP is not allow-listed. Atlas → Network Access → Add Current IP Address |
| `querySrv ECONNREFUSED` | Node's DNS resolver cannot do the SRV lookup for `mongodb+srv://`. `index.js` already forces a public resolver with `dns.setServers`; otherwise set your adapter DNS to `8.8.8.8` |
| `EADDRINUSE` on startup | An old server is still running. `netstat -ano \| findstr :6769`, then `taskkill /PID <pid> /F` |
| CORS error in the browser console, but Postman works | CORS is a browser rule. Check the backend is running and that the origin in `index.js` exactly matches the Vite URL |
| Login succeeds but `/customers/me` returns 401 | The request was sent without credentials. Always call through `services/api.js`, which sets `withCredentials: true` |
| Checkout says payments are not configured | `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` is missing from `Server/.env`. Restart the backend after adding them |
| Products page shows "No products found" | The collection is empty. Run `npm run seed` in `Server/` |
| Changes to `.env` seem ignored | Both Vite and Node read it at startup only. Restart the server |

---

## Security notes

- `.env` files are gitignored in both folders and are never committed. `.env.example` documents the variables with placeholder values.
- The Razorpay Key Secret exists only on the server. Only the public Key Id is ever sent to the browser.
- Passwords are stored as bcrypt hashes with a cost factor of 10, and are excluded from every API response.
- Card details are never collected or stored by this application — Razorpay's hosted checkout handles them. Only payment identifiers are saved.
- Every user-scoped query derives the customer id from the verified JWT, so one customer cannot read or modify another's wishlist, cart or orders.
