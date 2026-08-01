# Kenny AI World Portfolio

A desktop-first, playable 3D portfolio built with Three.js and plain JavaScript modules. The player controls a procedural avatar, explores AI/ML-themed environments, collects knowledge nodes, and opens portfolio panels through in-world holograms.

## Project structure

```text
kenny-ai-world/
├── index.html                 # 3D game shell and HUD markup
├── field-guide.html           # accessible, crawlable text version
├── css/
│   ├── base.css               # tokens, typography, shared controls
│   ├── game.css               # canvas, boot/loading/error states
│   ├── ui.css                 # HUD, panels, map, toast components
│   └── responsive.css         # smaller-screen adaptations
├── js/
│   ├── main.js                # application entry point
│   ├── config/
│   │   └── content.js         # profile, zones, projects, beacons, nodes
│   └── core/
│       ├── game.js            # render loop and input orchestration
│       ├── player.js          # avatar, movement, animation, camera
│       ├── world.js           # procedural environments and effects
│       ├── interactions.js    # proximity, zones, collectibles
│       └── ui.js              # HUD, panels, map, toast behavior
├── assets/icons/              # favicon / future static assets
├── docs/WORLD_DESIGN.md       # environment and prop map
└── legacy/                    # original uploaded portfolio files
```

## Run locally

ES modules must be served over HTTP. From this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

On Windows, double-click `start.bat`.

## Controls

- `WASD` or arrow keys: move
- Mouse: rotate the third-person camera
- `Shift`: sprint
- `E`: interact with the nearest hologram
- `Space`: emit scan pulse
- `M`: open or close the map
- `Esc`: release mouse / close panels

## Editing portfolio content

Most personal content is centralized in `js/config/content.js`:

- `PROFILE`
- `SKILLS`
- `PROJECTS`
- `ZONES`
- `INTERACTIONS`
- `COLLECTIBLES`

This lets you update the portfolio without changing rendering code.

## Deployment

The project is static and can be deployed to GitHub Pages, Netlify, Cloudflare Pages, or any static host. It imports a pinned Three.js module from jsDelivr.
