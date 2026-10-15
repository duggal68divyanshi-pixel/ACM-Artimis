# Build prompt for Antigravity — Chowk (कामसेतु-style) frontend

Paste everything below this line into Antigravity as one prompt.

---

## 0. What you are building

Build the complete **frontend only** (no backend, no real API, no auth server) for a mobile-first web app that helps India's daily-wage and skilled tradespeople (plumbers, electricians, carpenters, painters, masons, labourers — "workers") find work, and lets homeowners/small contractors ("employers") post jobs and hire. The product is **not** a conventional job board or a browse-and-book marketplace like Urban Company. Its core differentiator: **workers discover jobs as a swipeable vertical video feed (like Instagram Reels), submit their own price quote per job, and employers compare all quotes on that job and either pick one directly or negotiate in-app.** There is no public bidding — quotes are private between the employer and each worker.

Treat this document as the complete spec. Do not invent screens, routes, fields, colors, or flows that aren't listed here. Where something is genuinely unspecified, pick the simplest option consistent with the rest of this doc and leave a `// TODO:` comment rather than guessing silently.

Working name for the app: **"Chowk"** (चौक). Put this in exactly one place (a constants/config file) so it can be renamed later in one edit.

---

## 1. Non-negotiable constraints

- **Frontend only.** No backend server, no real network calls, no real auth. All data is mock data, seeded at app start and held in client state (see §7).
- **Persist demo state to `localStorage`** so a page refresh doesn't lose what the user did (new quotes, negotiation messages, confirmed jobs, language choice). Wrap every read/write in try/catch; never let a storage failure crash the app.
- **Mobile-first, phone-width layout** (design for ~375–414px, but don't break on tablet/desktop — center the content column with a max-width on larger screens).
- **Two languages at launch: English and Hindi**, switchable at any time from a persistent top-bar toggle (§6). Structure the i18n system so adding a third language later means adding one JSON file, not touching components.
- **No WhatsApp deep links, no `wa.me` handoff anywhere.** All negotiation happens inside the app (this deliberately diverges from any reference screenshots you may have been given — if a reference shows a "send to WhatsApp" button, do not build that; build the in-app negotiation chat described in §9 instead).
- **Architecture must be easy to extend without breaking existing features** — see §4 for the required folder structure and component layering. A new screen or a tweak to one screen's copy must never require touching unrelated files.

---

## 2. Tech stack

- **React 18+ with TypeScript**, functional components + hooks only.
- **Vite** as the build tool.
- **React Router v6** for routing.
- **Tailwind CSS**, configured with the exact design tokens in §5 as Tailwind theme extensions (don't hardcode hex values in components — reference Tailwind classes or CSS variables).
- **State:** React Context + `useReducer` per domain (see §8), no Redux/Zustand needed for this scope.
- **Icons:** Lucide React icon set only. Do not hand-draw SVG icons.
- **Fonts:** Google Fonts — `Plus Jakarta Sans` (Latin) and `Noto Sans Devanagari` (Hindi), loaded via `<link>` or `@font-face`, with Devanagari as fallback in the font-stack so mixed-script strings render correctly without a FOUC.
- **Video:** use local placeholder `.mp4` files or looping placeholder thumbnails (poster images) — do not call any external video API or CDN that requires a key.

---

## 3. Design system — use these exact values (source: Bharat Kinetic Tactile)

Do not substitute, lighten, or "improve" these. Define them once as Tailwind theme tokens / CSS custom properties and reference them everywhere.

### Colors

| Token | Hex | Use |
|---|---|---|
| `primary` | `#075E54` | Top app bar, nav, headers, verified-org badges |
| `secondary` | `#128C7E` | Active tab indicators, secondary containers, filters, focus border |
| `accent` / CTA | `#25D366` | Primary forward-action buttons ("Confirm", "Accept", "Send Quote") — pair with `#111B21` or `#FFFFFF` text |
| `on-surface` (text primary) | `#111B21` | Body text, icons |
| `text-secondary` | `#54656F` | Captions, secondary labels |
| `surface-canvas` (app background) | `#F0F2F5` | Page background |
| `surface-card` | `#FFFFFF` | Cards, sheets |
| `border-subtle` | `#E2E5E9` | Hairline dividers, default input border |
| `border-strong` | `#8696A0` | Emphasized borders |
| `trust-amber` (accent/trust) | `#FFA000` | Verification stars, skill badges, wage highlights, escrow milestones — **nowhere else** |
| `success` | `#00A884` | Paid / confirmed / positive states |
| `danger` | `#EA0038` | Destructive actions, decline, unpaid-overdue flag |

Badge background tints (derived, use directly):
- Verified/Aadhaar badge: background `rgba(18,140,126,0.1)`, text `#075E54`
- Skill-certified badge: background `rgba(255,160,0,0.12)`, text `#B87400`

### Typography

- Font family: `'Plus Jakarta Sans', 'Noto Sans Devanagari', sans-serif`
- Minimum font-weight anywhere in the UI: **500** (never use 300/400 regular weight — legibility in sunlight)
- Scale: headline-lg 26–32px/800, headline-md 22px/700, headline-sm 18px/700, title-lg 16px/700, title-md 15px/600, body-lg 16px/500, body-md 14px/500, body-sm 12px/500, label-lg 14px/700, label-md 12px/600
- Currency and numeric values (₹ amounts, distances, ratings, job counts, timers) must use **tabular numerals** (`font-variant-numeric: tabular-nums`) so digits don't jitter when values update live.
- Sentence case everywhere. No ALL CAPS, no Title Case except proper nouns.

### Shape, spacing, elevation

- Corner radius: cards/content blocks `16px`, buttons/trays `12–16px`, chips/badges/pills `9999px` (fully rounded)
- Minimum touch target: **48×48px** for any interactive element. **Primary action buttons (Accept / Confirm / Quote / Post job) must be at least 56px tall**, full-width or near-full-width, pinned to the bottom "thumb zone" of the screen.
- Spacing scale (Tailwind spacing, map to rem): 2xs 4px, xs 8px, sm 12px, md 16px, lg 24px, xl 32px, 2xl 48px. Page gutter 16px mobile.
- Elevation: Tier 0 canvas flat `#F0F2F5` no shadow; Tier 1 cards `0 1px 3px rgba(17,27,33,0.08)` with `1px solid #E2E5E9`; Tier 2 floating trays/sticky bars `0 4px 12px rgba(7,94,84,0.12), 0 1px 2px rgba(17,27,33,0.04)`; Tier 3 bottom sheets/modals `0 -4px 20px rgba(17,27,33,0.16)` over a `#111B21` @ 60% opacity scrim.
- Button press feedback: `transform: scale(0.98)` on `:active`, no layout shift.

### Component conventions

- **Primary button:** solid `accent` (#25D366) background, `#111B21` text, 56px+ height, icon left of label, full width in sticky footers.
- **Secondary button:** white background, 1.5px `secondary` border, `secondary` text.
- **Destructive/decline button:** transparent background, `danger` text, no heavy fill — must not look scary or final at a glance (low visual weight, per accessibility goal of not intimidating low-literacy users into avoiding it).
- **Input fields:** min height 54px, 1.5px `border-subtle`, focus → 2px `secondary` border, placeholder text in the active language showing a real example value (not "e.g. ...").
- **Search / voice-input fields:** always include a trailing mic button tinted `secondary`.
- Every icon-only control additionally carries a short visible text label next to it (icon + word), **and** an `aria-label` / accessible name for screen readers. Never ship an icon with no text and no accessible name.
- Every screen has a 🔊/speaker icon button in the top bar that, when wired up, would read the screen's key content aloud — build it as a visible, always-present control even if the actual text-to-speech call is stubbed with a `// TODO: wire TTS` comment and a console log for now.

---

## 4. Required project structure

Organize for isolation: a change to one screen or one domain's logic must not require touching files in another domain.

```
src/
  app/
    App.tsx                 // router + providers shell
    routes.tsx               // central route table
    providers.tsx            // wraps LanguageProvider, JobsProvider, etc.
  config/
    constants.ts              // APP_NAME, nav tab lists, radius options, etc.
  design-system/
    tokens.css                // CSS variables for colors/spacing/radius from §3
    tailwind-theme.ts          // Tailwind theme extension pulling from tokens
    components/                // PRIMITIVES ONLY — Button, Chip, Badge, Card, BottomSheet,
                                // IconText, StatTile, Toggle, RatingStars3, VoiceButton, TopBar,
                                // BottomNav. No business logic in this folder.
  i18n/
    en.json
    hi.json
    LanguageContext.tsx        // provides t(key), current lang, setLang()
  data/
    mock/
      users.json
      workerProfiles.json
      jobs.json
      quotes.json
      negotiations.json
      reviews.json
      diaryEntries.json
    types.ts                   // TypeScript interfaces, see §7
    repository.ts              // ALL mock-data reads/writes go through here
                                // (so swapping mock for a real API later only touches this file)
  features/
    onboarding/
      screens/                 // LanguagePicker, RolePicker, TradePicker, IntroRecorder,
                                // RadiusSetter, AvailabilitySetter, EmployerBasicInfo
      components/
      state/
    worker-jobs/
      screens/                 // JobReelFeed, QuoteSheet, MyQuotes
      components/               // JobReelCard, QuoteStatusRow
      state/
    employer-jobs/
      screens/                 // PostJob, MyJobs, JobQuotesList
      components/               // QuoteCandidateRow
      state/
    negotiation/
      screens/                 // NegotiationThreadScreen
      components/               // MessageBubble, OfferCard, VoiceNoteBubble
      state/
    profile/
      screens/                 // WorkerProfile, EmployerProfile, ReelPortfolioGrid
      state/
    chowk-map/
      screens/
    rights/
      screens/
    diary/
      screens/
    reviews/
      screens/                 // RateJobScreen
      components/
  hooks/
    useLocalStorageState.ts
    useMockAuthSession.ts       // just remembers "who am I" (worker/employer id) client-side
  utils/
    currency.ts                 // formats ₹ with tabular-friendly output
    distance.ts
    time.ts
```

Rules to enforce:
- `design-system/components` never imports from `features/*`.
- `features/*` never imports another feature's internal `components/` or `state/` directly — if two features need to share something, promote it to `design-system/components` or `utils`.
- All mock data access goes through `data/repository.ts` functions (e.g. `getJobsForWorker(workerId)`, `submitQuote(...)`, `postMessage(...)`) — screens never import the JSON files directly.
- All user-facing strings go through the `t('key.path')` i18n function — no hardcoded English or Hindi strings inside components.

---

## 5. Multilingual system

- Top bar, every screen: a persistent toggle, e.g. `EN · हिं` as two tappable segments (not a dropdown — a dropdown assumes the user already knows to look for it). Tapping switches the entire active language immediately, no reload, no lost state.
- `en.json` / `hi.json` are flat-ish key → string maps, namespaced by feature (`"jobs.accept": "Accept"`, `"jobs.accept_hi": ...` — actually keep separate files per language with identical key sets, not suffixed keys).
- Onboarding still asks once at first run (big tappable language name tiles, not a dropdown) so the first screen a new user ever sees is already in their language — but this is just setting the same toggle's initial value, not a separate system.
- Numbers, currency, and icons do not change with language; only text and voice do.

---

## 6. Global shell (applies to every screen)

**Top bar:** app name/logo (left) · 🔊 listen button · language toggle (`EN · हिं`) · profile avatar (right-most).

**Bottom navigation — role-aware, 4–5 tabs, 56px+ tall each, icon + short label, current tab visually distinct (filled icon + `secondary` color):**

- Worker: **Jobs** (reel feed) · **Quotes** (my submitted quotes + status) · **Chowk** (map) · **Rights** · **Me**
- Employer: **My jobs** (posted jobs + quote counts) · **Post** (big center action, raised/circular like a FAB) · **Messages** (all active negotiation threads across jobs) · **Me**

A simple mock role switch lives in the profile screen ("Also hiring sometimes? Switch to posting jobs") — swapping the active role swaps which bottom-nav set and home route is shown. This is a nice-to-have; if time-constrained, hardcode the demo to start as Worker and make the switch a single button in Profile that flips a `currentRole` value in context.

---

## 7. Data model (TypeScript interfaces + mock seed shape)

```ts
type Language = 'en' | 'hi';
type UserRole = 'worker' | 'employer';

interface User {
  id: string;
  name: string;
  phone: string;
  roles: UserRole[];
  language: Language;
  verified: boolean; // Aadhaar-style mock verification flag
}

interface WorkerProfile {
  userId: string;
  trade: string;            // 'plumber' | 'electrician' | 'carpenter' | 'painter' | 'mason' | 'labourer' | ...
  experienceYears: number;
  introVideoUrl: string;    // local placeholder asset
  rating: number;           // 0-5
  jobsCompleted: number;
  radiusKm: number;         // worker-set, from onboarding / editable in profile
  availableToday: boolean;
  portfolioReels: { id: string; videoUrl: string; thumbUrl: string; caption: string }[];
}

interface Job {
  id: string;
  employerId: string;
  trade: string;
  videoUrl: string;
  description: string;
  suggestedPrice: number;   // anchor only, not binding
  location: { label: string; lat: number; lng: number; distanceKmFromViewer?: number };
  urgency: 'today' | 'tomorrow' | 'scheduled';
  scheduledFor?: string;    // ISO date if urgency === 'scheduled'
  paymentTiming: 'same_day' | 'on_completion' | 'daily';
  status: 'open' | 'filled' | 'completed' | 'cancelled';
  createdAt: string;
}

interface Quote {
  id: string;
  jobId: string;
  workerId: string;
  quotedPrice: number;
  voiceNoteUrl?: string;
  status: 'pending' | 'negotiating' | 'accepted' | 'declined';
  createdAt: string;
}

interface NegotiationMessage {
  id: string;
  threadId: string;
  sender: 'worker' | 'employer';
  type: 'text' | 'voice' | 'offer';
  text?: string;
  voiceUrl?: string;
  offerAmount?: number;
  createdAt: string;
}

interface NegotiationThread {
  id: string;
  jobId: string;
  workerId: string;
  employerId: string;
  currentOfferAmount: number;
  messages: NegotiationMessage[];
  locked: boolean;          // true once both sides confirm — this is the trust mechanism
  lockedTerms?: { price: number; time: string; paymentMethod: string };
}

interface Review {
  id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  rating: 1 | 2 | 3;        // 3-level simple scale: bad / ok / great
  mediaUrl?: string;
  note?: string;
}

interface DiaryEntry {
  id: string;
  workerId: string;
  jobId: string;
  amount: number;
  paid: boolean;
  paymentMethod: 'upi' | 'cash';
  date: string;
}
```

Seed `data/mock/*.json` with at least: 3 employers, 6 workers across at least 4 trades, 8 jobs in mixed statuses, several quotes per job (2–4) in mixed statuses, 2–3 negotiation threads with a few messages each (including one already `locked: true` so the locked-terms UI has something to render), a few reviews, a few diary entries (mix of paid/pending).

---

## 8. State management

One React Context + reducer per domain, each backed by `useLocalStorageState` so demo actions persist across refresh:

- `LanguageContext` — current language, `t()`, `setLang()`.
- `SessionContext` — current mock user id, current active role (`worker` | `employer`), onboarding-complete flag.
- `JobsContext` — all jobs, `postJob()`, `getJobsForWorkerFeed(filters)`, `getJobsForEmployer(employerId)`.
- `QuotesContext` — all quotes, `submitQuote()`, `getQuotesForJob(jobId)`, `getQuotesForWorker(workerId)`, `acceptQuote()`, `declineQuote()`.
- `NegotiationContext` — all threads, `openOrGetThread(jobId, workerId)`, `sendMessage()`, `sendCounterOffer()`, `lockTerms()`.
- `ProfileContext` — worker/employer profile edits (radius, availability, intro video, etc.)

Every write action updates context state **and** writes through `data/repository.ts` to `localStorage` in the same call — never let the two drift.

---

## 9. Core flows — build these exactly

### Flow A — Employer posts a job
`Post` screen: record/attach a short video → tap trade icon tile → pick urgency (Today / Tomorrow / Pick a date, with a time-slot chooser for Today/Tomorrow) → confirm auto-detected location (mock geolocation, editable) → set a suggested price (optional, numeric input with a hint like "workers nearby usually ask ₹400–600 for this") → pick payment timing → **Post job**. New `Job` with `status: 'open'`.

### Flow B — Worker browses jobs (reel feed)
`Jobs` tab: full-screen vertical swipeable video cards, filtered to the worker's trade(s) and within their set `radiusKm`. Each card shows: video, trade icon + label, suggested price (large, tabular numerals), distance, urgency/time, payment-timing badge, a small "no advance needed" trust line. Two big bottom buttons: **Skip** (secondary/outline, danger-tinted text only) and **Interested** (primary accent). Skip asks a one-tap reason (too far / pay too low / wrong timing) via 3 icon chips, no typing required, then advances to the next card. Interested opens a bottom sheet: a price field prefilled with the job's suggested price but editable (**this is the worker's own quote — not just an accept**), an optional voice-note recorder, a **Send quote** button. This creates a `Quote` with `status: 'pending'`.

### Flow C — Worker tracks their quotes
`Quotes` tab: list of jobs they've quoted on, each row shows job trade/thumbnail, their quoted price, and a status chip (Pending / Employer is negotiating / Confirmed / Not selected). Tapping a `negotiating` or `pending` row with employer activity opens the negotiation thread (Flow D). Tapping a `Confirmed` row shows the locked terms card (read-only) with a Call button (mock, just a toast/no-op) and a link into the job's progress.

### Flow D — Employer reviews quotes for one job
From `My jobs` → tap a job → **Quotes received** list: one row per worker who quoted — their work-reel thumbnail (not a headshot), name, trade, rating, years experience, distance, and their quoted price, sorted by price ascending by default with a sort control (price / rating / distance). Three actions per row: **Select** (skips straight to the lock step with that worker's quoted price pre-filled), **Negotiate** (opens Flow E with that worker), **Decline** (removes it from the active list, no message sent to the worker beyond their status flipping to "Not selected" — no reason shown, keep it low-key, not harsh).

Quotes are **never visible to other workers** — a worker only ever sees their own quote's status, never competing numbers. Multiple negotiation threads can be open in parallel on the same job; each thread screen shows a small, non-alarming note like "You're one of a few people the employer is talking to" so nobody feels misled. The moment one thread locks, the job flips to `status: 'filled'`, all other open quotes on that job flip to `declined`, and those workers see a neutral "This job has been filled" state — never which worker got it.

### Flow E — In-app negotiation
One `NegotiationThread` per (job, worker) pair. Screen layout: header shows the other party's name/trade + job trade/price context, scrollable message list (text bubbles, voice-note bubbles with a play button + waveform, and distinct "offer" bubbles showing a proposed ₹ amount with its own small Accept-this-offer action), a sticky **current offer** card pinned just above the composer showing the latest number either side proposed, and a composer with text input + mic button for a voice note + a way to propose a specific new number (not just free text — a small "Counter with ₹___" affordance). A full-width **Confirm terms** button becomes active once both sides' last actions agree on the same number; tapping it opens a confirmation summary (price, time, payment method) that both the worker and employer screens render identically, and sets `locked: true` plus `lockedTerms`. Once locked, the thread becomes read-only except for a "Message" option for logistics chat — no more price changes.

### Flow F — Execution, diary, and rating
Confirmed jobs show a simple status stepper (Confirmed → In progress → Completed) — employer and worker can each advance it from their own view (mark as started / mark as done), no real scheduling logic needed. On completion, both sides get a rating prompt (Flow G) and the worker's `DiaryEntry` for that job is created/marked.

### Flow G — Rating
3-level scale only (not 5 stars) — big tappable tiles: 😕 Bad / 🙂 Okay / 😄 Great (or the equivalent icon+word, no raw emoji in final UI — use icon components), optional photo/video attach, optional voice note. Worker's prompt specifically asks "Paid on time?" as one of the tiles' framing, not just overall satisfaction.

### Flow H — Rights tab
Static-content screen (mock data is fine, no real deep links required): a voice-search-styled input ("बोलो: मुझे क्या मिल सकता है?"), then a list of big tappable rows — labour card, insurance/pension, my documents, wage complaint — each opens a simple detail screen with a short mock explainer and a "nearest help centre" mock card. No functional backend needed; placeholder content is acceptable as long as the structure and navigation are real.

### Flow I — Chowk map
A map-styled screen (can be a static illustrated/mock map image with absolutely-positioned price-bubble pins — no real maps API key required) toggling between "Find work" / "Give work", showing the worker's radius as a visible circle, an "I'm free today" toggle (mirrors the profile's `availableToday`), and a small card summarizing nearby worker/job counts for the current area (mock numbers).

---

## 10. Accessibility checklist (verify before considering any screen done)

- [ ] Every primary action button ≥56px tall, bottom-pinned, icon + short word.
- [ ] Every icon has a text label beside it or an accessible name.
- [ ] Color is never the only signal (pair with icon + text, e.g. ✅ Confirmed in success-green, not green alone).
- [ ] No font-weight below 500, no body text below 14px.
- [ ] Sentence case everywhere, no raw exception strings, no corporate filler copy.
- [ ] Every screen's top bar has the 🔊 listen control and the language toggle.
- [ ] Both `en.json` and `hi.json` have a value for every key used — no missing-translation fallback text visible in the UI.
- [ ] Nothing depends on a network call; the app works fully offline against mock data.

---

## 11. What "done" looks like

A working Vite dev server where you can: pick a language, complete worker onboarding (trade, radius, availability), swipe through a mock job reel feed and submit a quote, switch to the employer mock account, post a job, see incoming quotes from the seeded workers, open a negotiation thread, exchange a couple of messages/offers, confirm terms, see the job move to "filled," mark it completed, rate it, and see it reflected in the worker's diary — all without a single network request, and with every string swapping correctly when the language toggle is tapped.
