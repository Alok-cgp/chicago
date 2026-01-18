# Chicago Art Gallery

Hey there! 👋 This is my React app that pulls artwork data from the Art Institute of Chicago's API and displays it in a nice table with some cool features.

## What it does

Basically, it's a gallery viewer that lets you browse through thousands of artworks. You can search, select items, and navigate through pages without losing your selections. I built it with modern React and made it look pretty with Tailwind CSS and some glassmorphism effects.

## Features I added

- **Browse artworks** from the Chicago museum's collection
- **Search** through titles and artists in real-time
- **Select rows** individually or in bulk (there's this cool overlay where you can pick exactly how many you want)
- **Pagination** that doesn't mess up your selections when you switch pages
- **Dark mode** toggle that remembers your preference
- **Responsive design** that works on phones and tablets
- **Smooth animations** because who doesn't like nice transitions?

## Tech stuff

I used:
- React 18 with TypeScript (because type safety is important!)
- Vite for fast development
- PrimeReact for the table component
- Tailwind CSS for styling
- The Art Institute of Chicago API for data

## Getting started

First, clone this repo and cd into it:

```bash
git clone <your-repo-url>
cd chicago-art-gallery
```

Install the dependencies:

```bash
npm install
```

Then run the dev server:

```bash
npm run dev
```

Open up `http://localhost:5173` and you should see the app running!

## How to use it

- **Navigation**: Use the pagination at the bottom to flip through pages
- **Searching**: Type in the search box to filter artworks
- **Selecting**: Check the boxes next to rows to select them. The header checkbox selects/deselects everything on the current page
- **Bulk selection**: Click the little dropdown arrow next to the main checkbox to open a panel where you can enter exactly how many items you want to select
- **Dark mode**: Hit the sun/moon icon in the top right

## Project structure

```
src/
├── components/
│   ├── Navbar.tsx          # Top bar with title and dark mode toggle
│   ├── SearchBar.tsx       # Search input
│   └── SelectionToolbar.tsx # Shows how many items are selected
├── App.tsx                 # Main component with all the logic
├── App.css                 # Some custom styles for PrimeReact
├── index.css               # Tailwind imports and global styles
└── main.tsx                # App entry point
```

## API details

I'm using the Art Institute of Chicago's public API. The main endpoint is:

```
https://api.artic.edu/api/v1/artworks?page={page}
```

It returns JSON with pagination info and an array of artwork objects. Each artwork has fields like title, artist, dates, and origin.

## Building for production

When you're ready to deploy:

```bash
npm run build
```

This creates a `dist` folder that you can upload to Netlify, Vercel, or any static hosting service.

## Contributing

Feel free to open issues or submit pull requests if you find bugs or want to add features. I'm always happy to collaborate!

## Thanks

Big thanks to the Art Institute of Chicago for their awesome API, and to the creators of React, Tailwind, and PrimeReact for making development so much fun.

---

Built with ☕ and lots of trial and error. Hope you enjoy browsing the artworks!
