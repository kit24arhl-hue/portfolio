# AI Agent Instructions

## Project Overview

- This is a Vite + React + TypeScript portfolio hero section project.
- The app is implemented primarily in `src/App.tsx` and uses Tailwind CSS for styling.
- Assets are served from the `public/` directory, including the hero background and foreground images in `public/hero section/`.

## Build and Run

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production output: `npm run build`
- Preview production build: `npm run preview`

## Key Files

- `src/App.tsx` — main application logic, hero layout, floating sections, and project cards.
- `src/main.tsx` — React entry point.
- `index.html` — document shell and viewport metadata.
- `tailwind.config.js` and `postcss.config.js` — Tailwind configuration.
- `public/hero section/hero background.jpeg` and `public/hero section/hero image.png.png` — hero section visuals.

## Important Conventions

- Responsive styling is handled with Tailwind classes such as `md:` and `lg:`.
- The hero image uses absolute positioning plus responsive width/height classes to control mobile and desktop sizing.
- Animations are powered by `framer-motion` and `gsap`.
- The project uses `react-router-dom`, though the current app appears to be a single-page hero layout.

## What Agents Should Know

- Focus changes to `AppHeroSection()` when improving hero image layout, especially for mobile.
- For mobile fit, adjust the hero image wrapper and the image itself rather than reworking unrelated sections.
- Preserve the existing visual layering: background image, gradient overlays, and foreground hero profile image.
- Keep text legibility and scroll indicator placement intact.

## Notes for Image / Mobile Updates

- The current hero foreground image is rendered with `className="relative z-20 h-full w-full object-contain object-bottom ..."` and is wrapped in a responsive container with `h-[75vh] md:h-[85vh]`.
- Mobile improvements should consider using `w-full`, `h-full`, and possibly `object-cover` or adjusted padding to make the image appear larger while still fitting the viewport.
- Avoid breaking the `absolute bottom-0 left-1/2 -translate-x-1/2` placement and the existing `opacity`/blur styling.

## Suggested Agent Behavior

- When asked to modify visual layout, update only the relevant Tailwind classes and image wrapper structure.
- Do not introduce new frameworks or major architectural changes for this project.
- Keep the project minimal and preserve the existing single-page hero-focused experience.
