# 1 to 99 Shop — Client Demo

This is a frontend-only React/Vite demo. It uses illustrative product data and browser localStorage for the cart and sample order tracking.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

## Demo features

- Home page with categories, popular products and clearly labelled sample reviews
- Product listing with search, category filters and price/rating sorting
- Product details, cart and sample checkout
- Budget Finder (rule-based, no AI API)
- Combo Builder (select products, set a budget and add the combo to cart)
- FAQ assistant (prewritten answers, no AI API)
- Simulated order tracking (after sample checkout, copy the O99-XXXXXX ID)
- Delivery/returns/policy placeholders and contact form preview
- Responsive layout and Bangladesh-oriented currency/contact form labels

## Important demo limitations

- No backend, database, real stock, real customer reviews, email sending, payment processing, courier connection or real order placement.
- All products, prices, review names, policies and contact details are sample content. Replace them with approved business information before launch.
- The sample order ID is stored in this browser's localStorage only.
