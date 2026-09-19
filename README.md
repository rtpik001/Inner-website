# Inner Oldest Dream

Discover, ask, buy, sell and learn in one place.

![HTML](https://img.shields.io/badge/HTML-5-orange) ![CSS](https://img.shields.io/badge/CSS-3-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

**Live site:** [inner-website-rho.vercel.app](https://inner-website-rho.vercel.app)

## Features

- Product listing loaded from `products.json`
- Search box with price filter (try "laptop under $800")
- Category filter buttons
- Stock status: in stock, low stock, out of stock
- Light and dark mode
- Star Catch mini game

## Coming soon

- Product details page
- Login and selling
- Ori AI assistant

## Project files

| File | What it does |
|------|--------------|
| `index.html` | The main page: layout, design and styles |
| `products.json` | Product data: name, price, stock and more |
| `products.js` | Reads `products.json` and shows product cards |

## How to add a product

Open `products.json`, copy one product block, change the details, and give it a new `id`.

## Run it locally

Open the folder in VS Code and use the **Live Server** extension.
(Opening `index.html` directly won't load products, because `fetch` needs a server.)

## Deployment

Hosted on Vercel. Every push to `main` updates the live site automatically.

## Built by

Rafi — [@rtpik001](https://github.com/rtpik001)
