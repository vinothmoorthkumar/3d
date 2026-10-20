# A World of Possibilities — UN Careers concept

An immersive 3D concept redesign of the [UN Careers](https://careers.un.org/home?language=en) homepage.
**This is a design concept, not an official United Nations website.** Every application route leads to careers.un.org and Inspira.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (includes the API proxy)
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ with the same API proxy
npm run lint
```

Optional maintenance scripts:

```bash
npm run data       # refresh src/data/un-filters.json from the official filter API
npm run assets     # rebuild public/textures and public/images from assets-src/
```

## What's on the page

All copy, images, icons and the video come from the UN Careers home page in [English](https://careers.un.org/home?language=en) and [French](https://careers.un.org/home?language=fr), in the same order. Nothing is new copy. The 3D Earth is design only and carries no text.

## English and French

- The **English / Français** switch is in the header, the mobile menu and the footer. As on careers.un.org, the language is set by `?language=en|fr` in the URL. The choice is also remembered in the browser, and `<html lang>` is updated.
- French text, French Spotlight graphics, the French logo and French link targets (un.org/fr, Inspira FRA, contact `lang=FR`) all come from the official French pages.
- Each language has its own live data: the job listing (`filteredV2/fr` returns French field values and its own set of openings), announcements, news and the "Join Us!" list. Filter names use the official French names, snapshotted in `src/data/un-filters.json` by `npm run data`.
- Where the official French site keeps English (the skip link, slide buttons, and the Consultancies/Internships dialog labels and listing), the concept does too.
- When there are no French announcements, the block is hidden, because the French site has no "no announcements" text.
- Concept-only strings, which exist on neither site, are marked in `content.ts`: the "Concept" tag, the footer disclaimer, "Credits", and the screen-reader "opens in a new tab" hint.

| Home-page content | Component | Notes |
| --- | --- | --- |
| Navigation + Apply Now | `Header.tsx` | The official nav items, linking to careers.un.org. |
| "WORK for the United Nations" + Search Jobs | `Hero.tsx`, `three/CinematicScene.tsx` | The SDG wheel forms the "O", as on the home page. The search box feeds the job search below. |
| Search by Location / Search by Expertise | `MissionStory.tsx`, `Cinematic.tsx` | Both panels, with their staff photos and captions. As you scroll, the globe turns toward each one. |
| Job openings | `JobSearch.tsx` | Live results using the official Job Openings field labels. |
| "Where would you like to work?" | `GlobalOpportunities.tsx`, `three/PresenceScene.tsx` | Search by Location as a rotatable globe of the 439 official duty stations. |
| "Become part of a workforce of the world, for the world." | `FinalCTA.tsx`, `three/HorizonScene.tsx` | The home-page video, streamed from careers.un.org. |
| Announcements, Latest News | `Updates.tsx` | Live from the same feeds as the home page. |
| Staff in the Spotlight | `Spotlight.tsx` | The eight #WomenInTech graphics, linked to their stories. |
| Keep Exploring, Latest Opportunities | `ExploreCards.tsx` | The ten home-page cards. Roster Exercises, Join Us!, Consultancies and Internships open the same dialogs, with verbatim text or live listings. |
| Footer | `Footer.tsx` | Official footer links and social channels, plus a one-line concept disclaimer. |

Copy and links live in `src/data/content.ts`. Asset credits are in [`public/CREDITS.md`](public/CREDITS.md).

## Job Openings: demo mode (default)

By default the Job Openings list shows **24 sample jobs** from `src/data/sampleJobs.ts`, not live vacancies.

- Each sample has a `SAMPLE-0001`-style reference, a "Sample" badge and a dashed border. The list header says "Sample data – these are not real job openings" (French: "Données fictives – ces postes ne sont pas réels").
- Sample cards have no "View Job Description" link, because there is no real posting to open.
- Samples use real duty stations, job networks and categories from the official filters, so the keyword, Duty Station, Job Network and Category filters, Clear Filters, "See More" paging and the hero search all work. Dates are relative to today.
- Only the main list is affected. The Consultancies/Internships dialogs, announcements and news stay live.

Switch to real openings with an environment variable, e.g. in a `.env.local` file:

```bash
VITE_JOBS_MODE=live
```

## About the live job data

The UN Careers website calls an undocumented public API (`careers.un.org/api`). This concept calls the same endpoints. Nothing about vacancies is invented: titles, levels, locations, deadlines and counts all come from the API's responses.

- **Why there is a proxy:** the filtered job search only accepts JSON `POST`s, and the API's CORS preflight omits `Access-Control-Allow-Headers`, so browsers can't call it cross-origin. `vite.config.ts` proxies `/un-api/*` to `https://careers.un.org/api/*` for `dev` and `preview`.
- **Static hosting:** without a proxy every live call fails, and the page falls back to its error states, which link to the official search with the visitor's filters. To use your own proxy, set `VITE_UN_API_BASE`.
- **Before any public deployment:** the API is not documented or supported for third parties. A production version would need the UN's agreement, or a supported feed.
- **Known API behaviour:** when a category is selected, the API ignores the keyword. The concept fetches the keyword matches and filters them by category in the browser, so both filters apply.
- **Bot protection:** CloudFront returns `403` to headless browsers that announce themselves (`HeadlessChrome`). Real browsers are unaffected.

## Performance and accessibility

- The initial JavaScript is React plus the app (about 150 kB gzip). three.js and R3F (about 250 kB gzip) load only when a 3D scene mounts.
- Each canvas renders only while it is on screen (`frameloop` toggled by IntersectionObserver). DPR is capped. Mobile uses 2K textures, fewer segments and fewer stars.
- Without WebGL, or if a scene throws, a static NASA Blue Marble image replaces the globe and all content keeps working.
- `prefers-reduced-motion` disables the auto-spin, parallax, reveal animations and scrubbed easing. Chapter changes jump straight to their position.
- Semantic landmarks, a skip link, visible focus states, labelled form controls, an `aria-live` results heading that receives focus after a search, and screen-reader text on every link that leaves the site.
"# 3d" 
