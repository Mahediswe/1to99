# 1 to 99 Shop — Frontend Client Demo

A polished, responsive frontend-only ecommerce demo for a Bangladesh-focused “1 to 99” value shop. Product information, pricing, ratings, delivery text and photos are illustrative demo content.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite.

## Demo features

- Responsive homepage and category discovery
- Product listing with category filters, search and sorting
- Product detail pages, sample ratings and related products
- Add to bag, quantity updates, remove items and subtotal
- Demo checkout form with Cash on Delivery sample option
- Sample order confirmation (no real order is created)
- Cart saved in browser localStorage
- Demo info page for client walkthrough

## Important

This version's customer-facing storefront runs entirely in the frontend and uses dummy data from `frontend/src/data/products.js`. No backend API, real inventory, payment gateway, email, or order processing is connected. Product images are loaded from Unsplash, so internet access is needed for those images. The original backend folder is retained in the archive but is not required for this demo.

## Before production

Replace demo products/photos/content with the client's actual catalogue, confirm shipping/returns and contact details, connect the backend and database, then add production authentication, order handling and a secure payment integration if needed.
