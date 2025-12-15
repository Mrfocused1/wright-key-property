# Wright Key Property - Luxury Co-Living Website

A stunning, animation-rich website for Wright Key Property, featuring advanced GSAP animations, custom cursor interactions, and luxury design aesthetics.

## Features

- **Advanced GSAP Animations**: Smooth scroll-triggered animations, parallax effects, and text reveals
- **Custom Cursor**: Elegant custom cursor with hover states
- **Video Background**: Luxury interior video in the hero section
- **Co-Living Page**: Dedicated page showcasing HMO properties for young professionals, NHS staff, and students
- **Interactive Community Section**: Hover-triggered image previews for different tenant types
- **Featured Spaces**: Grid layout of available properties with pricing
- **Responsive Design**: Fully responsive layout built with Tailwind CSS
- **Image Reveal Effects**: Beautiful overlay reveal animations on images
- **Menu Overlay**: Smooth full-screen menu navigation
- **Pexels Integration**: High-quality UK luxury house images and videos from Pexels API

## Tech Stack

- **GSAP** (GreenSock Animation Platform) - Advanced animations
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon library
- **Google Fonts** - Cormorant Garamond & Manrope
- **Axios** - HTTP client for API requests

## Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Fetch images and videos from Pexels (already done):
```bash
npm run fetch-assets
```

## Development

Start the development server:
```bash
npm run dev
```

This will start a local server at `http://localhost:3000` and automatically open the website in your browser.

## Project Structure

```
wright-key-property/
├── assets/                      # Pexels images and videos
│   ├── hero-video.mp4
│   ├── hero-luxury-interior.jpg
│   ├── about-modern-interior.jpg
│   └── ...
├── src/
│   └── css/
│       └── input.css           # Tailwind CSS input file
├── index.html                   # Main homepage
├── coliving.html               # Co-Living/HMO page
├── fetch-pexels.js             # Script to fetch Pexels assets
├── pexels-credits.json         # Credits for Pexels contributors
├── tailwind.config.js          # Tailwind configuration
└── package.json

```

## Key Components

### Custom Cursor
The website features a custom cursor with a dot and outline that follows mouse movement with a smooth lag effect using GSAP.

### Preloader Animation
An elegant loading sequence that animates the brand name and a progress line before revealing the site.

### Hero Section
- Video background with overlay
- Animated text reveals using GSAP
- Scroll indicator

### Image Reveals
All images use a reveal overlay effect that slides away on scroll, coupled with a subtle zoom-out parallax effect.

### Menu Overlay
Full-screen menu with staggered link animations when opened.

## Animations

All animations are powered by GSAP and ScrollTrigger:

- Text reveal animations
- Image overlay reveals
- Parallax scrolling effects
- Header fade-in animations
- Marquee text animation
- Menu transitions

## Credits

### Images & Videos
All images and videos are sourced from [Pexels](https://www.pexels.com/). See `pexels-credits.json` for individual photographer credits.

### Fonts
- **Cormorant Garamond** - Elegant serif font for headings
- **Manrope** - Clean sans-serif for body text

## Customization

### Colors
Update the CSS variables in the `<style>` section of `index.html`:
```css
:root {
    --color-dark: #1a1a1a;
    --color-light: #f5f3ef;
    --color-gold: #d4af37;
    --color-gray: #888888;
}
```

### Tailwind Configuration
Modify `tailwind.config.js` to add custom colors, fonts, or other utilities.

## Browser Support

This website uses modern web features including:
- CSS Grid & Flexbox
- CSS Custom Properties
- ES6+ JavaScript
- HTML5 Video

Recommended browsers: Latest versions of Chrome, Firefox, Safari, and Edge.

## License

ISC

## Contact

For inquiries about Wright Key Property:
- Email: hello@wrightkey.com
- Phone: +44 20 1234 5678
- Location: London, UK
