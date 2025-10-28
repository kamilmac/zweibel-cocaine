# Zweibel Cocaine

Personal portfolio site featuring Three.js generative art experiments.

## Tech Stack

- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics and animations
- **Cloudflare Pages** - Static site hosting on edge network

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deployment

Deployed to Cloudflare Pages:

```bash
# Login to Cloudflare (first time only)
npx wrangler login

# Deploy to production
npm run deploy
```

## Project Structure

```
├── index.html          # Main landing page
├── index.js            # Three.js scene setup
├── lifeforms.js        # Generative art algorithm
├── public/             # Static assets (copied during build)
└── package.json        # Dependencies and scripts
```
