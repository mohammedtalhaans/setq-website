# SetQ

Premium marketing site for SetQ, the AI native operating system for gyms. Built as its own repository, separate from the hardware prototype and gym-tracker software.

![SetQ brand and architectural gym](public/social-preview.png)

[Open the website preview](https://mohammedtalhaans.github.io/setq-website/)

**Brand/domain:** SetQ · setq.com.au
**Demo enquiries:** founder@setq.com.au

## Run

Node 24 or newer.

```powershell
npm ci
npm run dev
```

Local site: http://127.0.0.1:13073/.

```powershell
npm run build
npm run preview
```

Build output is `dist/`, suitable for any static host. Fonts, models, illustrations and runtime assets are served locally; no CDN, tracking scripts, live gym service or API keys are required.

## Experience

- Original architectural gym scene: merged equipment geometry, warm materials, finite weight-stack motion and an original distance/smoothstep signal shader. Click any of its twelve equipment items for a smoothly anchored data card with an hourly usage graph; the camera frames the selected machine beneath its annotation.
- Interactive workspace: machine selection, equipment rankings and location comparisons.
- Assistant preview: prepared answers, evidence charts, source labels and local example follow-ups.
- Original SVG illustrations with GSAP motion. Clear machine, operations checklist and location figures explain the three decision areas; benefit icons animate on scroll.
- CAD-derived sensor assembly with 36 × 29 × 11 mm enclosure dimensions and an installed-machine view. A continuous weight-stack animation and rolling graph share the same clock, with stack travel, sensor distance, peak travel and cycle readings.
- Branded enquiry dialog: prepares an email to the founder. It does **not** submit to a nonexistent backend or claim an email was sent. Visitors send from their own mail application.
- Mobile navigation, native focus-trapping dialogs, keyboard controls, a saved manual motion control and WebGL fallbacks.

Machine annotations include activity, coverage, trends and peak periods for the three weight-stack machines, and useful inventory/review records for the other equipment. Hourly strength profiles sum to the existing daily totals; other equipment has dashed planning profiles. `Inspect equipment` provides keyboard access; Escape, the close button or the scene background returns to the overview. The hourly graph also supports pointer and arrow-key inspection.

Cards fade, lift and scale into place, then follow the machine projection with a finite damped transition. They gently float and close about ten seconds after appearing, without a visible countdown. `Keep open` pins a card; allowing auto-close starts a fresh ten seconds. Automatic dismissal stays functional when decorative motion is paused. A saved `Pause motion` preference settles the experience. The website deliberately uses that explicit control rather than the OS motion preference, as requested by the founder.

Visible-only motion adds a travelling diagram signal, authored chart reveals, benefit-icon micro animations, a subtle gym-render float, and an orbital demo invitation. Controls remain steady. The installed sensor animation collects a bounded rolling twelve-second history; its mechanism, distance and graph remain synchronized. See `docs/motion-ideas.md` for applied touches and future concepts.

## Product scope

The public site presents an early-access product, with Australian availability and installation demand supplied by the founder. Dashboard figures, locations, assistant responses and follow-ups are authored demonstration content; there is no live model or equipment API. The website omits repeated example labels at the founder's request. The installation animation shows nominal enclosure dimensions and a 550 mm rest gap with 0–300 mm stack travel. These are visual design values, not a claim of validated sensor performance. Equipment movement is not occupancy, queue length, member identity or selected weight. There are no fabricated customer names, testimonials, measured returns or integrations.

See `.agents/product-marketing.md`, `docs/research-positioning.md` and `docs/copy.md` for the claim boundaries and source-backed positioning.

## Verification

```powershell
npx playwright install chromium
npm run test:browser
```

Start the preview first. Set `SETQ_QA_URL` to run against a published site. QA covers actual WebGL views, workspace controls, ranking order, assistant state, FAQ, enquiry fields/Escape, privacy dialog, mobile navigation and responsive overflow. Axe checks the page and enquiry dialog. Results are written to ignored `output/`.

`node scripts/capture.mjs` captures desktop/mobile previews from the local site. `docs/verification.md` records final validation.

`node scripts/qa-motion.mjs` verifies real ten-second timing, pin/reset behaviour, bubble/connector motion, pause/resume, saved preference, mobile bounds and idle WebGL work. `node scripts/qa-redesign.mjs` verifies annotation entry frames and hourly keyboard inspection, dimension labels, synchronized stack/graph readings, rolling history and local/global/offscreen pause.

## Hosting and setq.com.au

The Pages workflow publishes `dist/` automatically on pushes to `main`. The initial Pages URL is a staging preview. No DNS changes or custom-domain claim are made by this repository.

To connect the requested domain after your DNS is available:

1. Add `setq.com.au` in this repository's GitHub Pages custom-domain settings.
2. Follow [GitHub's official instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for the apex DNS records and domain verification.
3. Enable enforced HTTPS after GitHub provisions the certificate.
4. Re-run the Pages workflow and confirm the apex site, asset loading and email-draft flow. Source canonical/social metadata defaults to `https://setq.com.au/`; the Pages build replaces it with GitHub's configured site URL, so staging links share the correct preview image and the custom domain works after it is configured.

Avoid setting a Pages custom domain before the DNS is prepared; doing so can redirect the working staging link to an unavailable domain.

## Research and provenance

- `docs/design-direction.md`: direction chosen before implementation.
- `docs/research-3d.md`: actual reference imagery, material decisions and scene performance.
- `docs/research-motion.md`: Recent, CollectUI, X resource library, Hairline, motion resources and logo provenance.
- `docs/research-positioning.md`: gym-operator needs and precise claims.
- `docs/brand.md`: SetQ mark, palette, voice and usage.
- `docs/assets.md`: exact model source, geometry-preserving optimization and brand attribution.
- `THIRD_PARTY_NOTICES.md`: third-party software/fonts and trademark identification.

All SetQ illustrations and gym geometry are original. Research references inform composition and interaction; their artworks and websites were not copied. Claude's authentic symbol identifies the model technology and does not imply a partnership or endorsement. The requested product line reads "Claude [symbol] powered AI native gym operating system". Implementation and data provenance are recorded here and in the project documents.
