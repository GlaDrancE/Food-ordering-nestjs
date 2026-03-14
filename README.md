# Slooze Backend Challenge

A small **NestJS + GraphQL** API for a food-ordering flow: users browse restaurants, manage a cart, place orders, and (as admin/manager) checkout with payment. Built for speed over production hardening.

---

## Quick start

```bash
git clone <repo-url>
cd Food-ordering-nestjs
npm install -g pnpm (optional, if pnpm is not installed)
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

## GraphQL API

Single endpoint: `POST http://localhost:3000/graphql`. All operations (except `signUp` and `login`) require the `Authorization: Bearer <accessToken>` header.

### Queries

| Operation | Arguments | Returns | Auth / role |
|-----------|-----------|--------|-------------|
| `me` | — | `User` | JWT |
| `myOrders` | — | `[Order]` | JWT |
| `order` | `id: Int!` | `Order` | JWT |
| `myCart` | — | `Cart` (nullable) | JWT |
| `restaurants` | — | `[Restaurant]` | JWT |
| `restaurant` | `id: Int!` | `Restaurant` | JWT |
| `menuItemsByRestaurant` | `restaurantId: Int!` | `[MenuItem]` | JWT |
| `paymentMethods` | — | `[PaymentMethod]` | JWT + ADMIN |

### Mutations

| Operation | Arguments | Returns | Auth / role |
|-----------|-----------|--------|-------------|
| `signUp` | `input: SignUpInput!` | `AuthResponse` | — |
| `login` | `input: LoginInput!` | `AuthResponse` | — |
| `addToCart` | `menuItemId: Int!`, `quantity: Int!` | `Cart` (nullable) | JWT |
| `updateCartItem` | `cartItemId: Int!`, `quantity: Int!` | `Cart` (nullable) | JWT |
| `removeCartItem` | `cartItemId: Int!` | `Cart` (nullable) | JWT |
| `clearCart` | — | `Cart` (nullable) | JWT |
| `createOrderFromCart` | — | `Order` | JWT |
| `checkoutOrder` | `orderId: Int!`, `paymentMethodId: Int!` | `Order` | JWT + ADMIN/MANAGER |
| `cancelOrder` | `orderId: Int!` | `Order` | JWT + ADMIN/MANAGER |
| `createPaymentMethod` | `input: CreatePaymentMethodInput!` | `PaymentMethod` | JWT + ADMIN |
| `updatePaymentMethod` | `input: UpdatePaymentMethodInput!` | `PaymentMethod` | JWT + ADMIN |
| `deletePaymentMethod` | `id: Int!` | `Boolean` | JWT + ADMIN |

### Input types (summary)

- **SignUpInput:** `email: String!`, `password: String!`, `country: Country!`, `role: Role` (optional, defaults to MEMBER). Enums: `Country` = `INDIA` \| `AMERICA`, `Role` = `ADMIN` \| `MANAGER` \| `MEMBER`.
- **LoginInput:** `email: String!`, `password: String!`.
- **CreatePaymentMethodInput:** `type: PaymentType!` (`CARD` \| `UPI` \| `WALLET`), `provider: String!`, `last4: String` (optional).
- **UpdatePaymentMethodInput:** `id: Int!`, plus optional `type`, `provider`, `last4`.

Use the built-in **GraphQL Playground** at http://localhost:3000/graphql to explore the full schema (types, enums, and nested fields).

---

## What’s intentionally simplified

Trade-offs made for faster development in this challenge:

- **Auth:** Single long-lived JWT; no refresh tokens, no token rotation, no revocation. Fine for a short-lived challenge, not for production.
- **Payments:** No real payment provider; checkout just creates a `Payment` record. No idempotency keys or webhooks.
- **Roles:** Simple role checks (ADMIN/MANAGER for checkout); no fine-grained permissions or resource-level auth.
- **Validation:** Basic input validation; no rate limiting, request signing, or strict schema versioning.
- **DB:** Prisma + Postgres with straightforward schema; no read replicas, caching, or migrations strategy for zero-downtime.
- **API:** GraphQL only; no REST, no versioning, no OpenAPI export.
- **Test Coverage:** As per the time constraint, I wanted to finish this assignment asap, which is the reason, I didn't focused on test coverage of application

These are called out so it’s clear what you’d add (token rotation, proper payments, test coverage, etc.) in a real product.

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