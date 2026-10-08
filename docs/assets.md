# Asset provenance

## Gym

`src/components/GymScene.jsx` contains original procedural geometry for strength machines, treadmills, bike, benches, dumbbell racks, towels, plant, cabinet and the cutaway architectural floor. It is illustrative and is not a measured installation. A single 128px locally generated wood map supplies subtle grain. Static geometry is merged per material. Finite dynamic meshes and a one-plane original shader handle interaction. The shader derives distance/ring/fade operations from the concepts in The Book of Shaders; no reference shader code is copied.

## Sensor assembly

Source: the prior [SetQ hardware study](https://github.com/mohammedtalhaans/setq-hardware), exported `public/models/setq-ultrasonic-node.glb`. It combines Seeed's shared XIAO CAD adjusted to the standard board, a nominal ICU-20201 package rebuilt from TDK's drawing, and a proposed carrier/housing. The original study records the exact dimensional basis and illustrative limits.

Original SHA-256: `3147D2D7C935F862BEB54FBD579060A038BC76E7B685A52DEA290E633871AE2A`.

Original size 6,597,196 bytes. Website asset `public/models/setq-node.glb`: 2,453,340 bytes after glTF Transform dedup, weld and prune. No geometry simplification. Bounds before/after are identical: `(-.018, -.003, -.0145)` to `(.0180044813156128, .00802, .0145)` metres. Seven named assembly parts are retained. The actual CAD-derived small overshoots are preserved, rather than rounded to marketing dimensions. Source geometry remains untouched in its own repository.

The runtime changes finishes for brand coherence, keeps the sensor face down, and exposes an exploded view. It is a design study, not a released manufacturing specification. `public/images/setq-node-poster.png` is rendered from the actual assembled scene and serves as a fallback.

## SVGs

All gym icons, four small isometric figures and the layered sensor/floor/brief figure are original path geometry. Hairline is a visual grammar reference, with no code or SVG paths copied. Unique IDs and descriptive SVG titles support multiple instances and assistive technology.

## Anthropic

`public/brand/anthropic.svg` preserves the official inline wordmark geometry from [Anthropic's company page](https://www.anthropic.com/company), retrieved 2026-10-08. It is a trademark asset, not an asserted open-source asset. It identifies the planned model technology. The site explicitly discloses the development state and makes no partnership or endorsement claim.

## Fonts

Instrument Sans, Newsreader and IBM Plex Mono are served from local Fontsource packages under the SIL Open Font License. See installed package LICENSE files and THIRD_PARTY_NOTICES.md. Only the three used Latin WOFF2 faces are emitted by the build.
