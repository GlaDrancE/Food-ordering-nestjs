# Slooze Backend Challenge

A small **NestJS + GraphQL** API for a food-ordering flow: users browse restaurants, manage a cart, place orders, and (as admin/manager) checkout with payment. Built for speed over production hardening.

---

## Quick start

```bash
git clone <repo-url>
cd Food-ordering-nestjs
pnpm install
npx prisma generate
npx prisma migrate deploy (optional, if got problem with any migrations)
npx tsx ./prisma/seed.ts
pnpm start:dev
```

Server runs at **http://localhost:3000**. GraphQL endpoint: **http://localhost:3000/graphql**.

**Before first run:** add a `.env` in the project root with at least:

- `DATABASE_URL` — Postgres connection string (e.g. `postgresql://user:pass@localhost:5432/slooze`)
- Providing you sample Neon DB link, so if you don't have one you can directly test with this: `postgresql://neondb_owner:npg_3HpLEFc9VrPB@ep-super-tree-a1jo487h.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- Optional: `JWT_SECRET` (defaults to `dev-secret`), `PORT` (defaults to `3000`)

Then:

```bash
npx prisma migrate dev    # create DB and run migrations
pnpm prisma:seed         # optional: seed restaurants + menu items
```

---

## Schema & architecture

Add your diagram images to the `docs/` folder; they will show up below once the files exist.

| Diagram | File to add |
|--------|---------------|
| Database / Prisma schema | `docs/schema.png` |
| Product / system architecture | `docs/architecture.png`|



Rough Schema

![Database schema](docs/schema.png)

![Architecture](docs/architecture.png)

---

## What’s intentionally simplified

Trade-offs made for faster development in this challenge:

- **Auth:** Single long-lived JWT; no refresh tokens, no token rotation, no revocation. Fine for a short-lived challenge, not for production.
- **Payments:** No real payment provider; checkout just creates a `Payment` record. No idempotency keys or webhooks.
- **Roles:** Simple role checks (ADMIN/MANAGER for checkout); no fine-grained permissions or resource-level auth.
- **Validation:** Basic input validation; no rate limiting, request signing, or strict schema versioning.
- **DB:** Prisma + Postgres with straightforward schema; no read replicas, caching, or migrations strategy for zero-downtime.
- **API:** GraphQL only; no REST, no versioning, no OpenAPI export.

These are called out so it’s clear what you’d add (token rotation, proper payments, etc.) in a real product.

---

## Project layout (high level)

- `src/auth` — sign up, login, JWT, guards, `me`.
- `src/users` — user entity used by auth.
- `src/restaurants` — restaurants + menu items (country-scoped).
- `src/cart` — cart and cart items (per user).
- `src/orders` — create order from cart, checkout, cancel, list.
- `src/payments` — payment methods (admin) and payment records tied to orders.
- `prisma/` — schema, migrations, seed.

GraphQL schema is generated (`autoSchemaFile: true`); run the server and open **http://localhost:3000/graphql** for the built-in playground to explore types and try operations.


Portfolio: https://gladcode.vercel.app

Ph No: +91 9049606217

Happy Coding 😊