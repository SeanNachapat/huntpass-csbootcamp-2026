# ZooStamp — Product Specsheet
### Scavenger Hunt Platform for Animacode City Bootcamp

---

## Overview

**ZooStamp** is a web-based scavenger hunt verification system built for the *Animacode City* CS bootcamp — a 5-day Zootopia-themed event. Participants receive a personal QR code that staff scan at checkpoints to record discoveries. Participants never hold a scanner, closing the exploit of screenshot-sharing QR codes.

- **Event:** Animacode City CS Bootcamp (5 days)
- **Theme:** Zootopia — districts, animal species, ZPD aesthetic
- **Primary users:** Student participants + bootcamp staff
- **Platform:** Web app (mobile-first for participants, any device for staff)

---

## Roles

| Role | Description |
|---|---|
| **Participant** | Student attending the bootcamp. Gets a personal QR code and tracks their own progress. |
| **Officer (Staff)** | Bootcamp staff assigned to a checkpoint/district. Uses scanner to verify participant finds. |
| **Chief (Admin)** | Event organizer. Manages hunts, checkpoints, participants, and views analytics. |

---

## Zootopia Theme Mapping

| Game Concept | Zootopia Skin |
|---|---|
| Scavenger hunt | "ZPD Case File" |
| Participant | "Recruit" |
| Staff / scanner | "Officer" |
| Admin | "Chief Bogo" |
| Checkpoint | "District" |
| QR code | "Badge" |
| Stamp / verify | "Case closed" |
| Checklist | "Case board" |
| Leaderboard | "ZPD Precinct Rankings" |
| Item found | "Clue solved" |
| Hunt complete | "Badge earned" |

Districts (checkpoints) can be named after Zootopia neighborhoods:
`Tundratown` · `Sahara Square` · `Rainforest District` · `Bunnyburrow` · `Little Rodentia` · `The Naturalist Club` · `Zootopia City Hall`

---

## Core Features

### F1 — Participant Badge (QR Code)
- Each recruit gets a unique QR code on registration encoding `participant_id` + `hunt_id`
- Displayed prominently on their dashboard, always accessible
- Static QR (no rotation needed for bootcamp scale); optional TOTP rotation as future enhancement
- Participant cannot scan anything — they only *show* their badge

### F2 — Case Board (Checklist)
- Visual scratch-off style checklist of all districts/clues in the hunt
- Updates in real-time when an Officer stamps them
- Each item shows: district name, Zootopia icon, status (`Pending` / `Case Closed ✓`), timestamp of solve
- Progress bar: "X of Y clues solved"

### F3 — Officer Scanner
- Staff logs in with a checkpoint code (e.g. `SAHARA_SQUARE`)
- Camera opens immediately — no extra steps
- Scans recruit's QR badge
- Server responds with:
  - ✅ **New find** — recruit name + avatar, confirm button
  - ⚠️ **Already stamped** — shows when + by whom
  - ❌ **Invalid** — unknown QR or wrong hunt
- Officer taps confirm to record the stamp

### F4 — Stamp Validation (Anti-cheat)
A stamp is only accepted by the server when the request carries:
- Valid `participant_id` (from scanned QR)
- Valid `checkpoint_id` (from authenticated Officer session)
- Valid `staff_token` (Officer login, server-issued)
- `timestamp`

Sharing a screenshot of your badge to a friend does nothing — their device has no Officer token. The stamp endpoint rejects unauthenticated requests regardless of QR content.

### F5 — Leaderboard (ZPD Precinct Rankings)
- Live leaderboard visible to all participants
- Ranked by: number of clues solved → tiebreak by earliest completion time
- Shows recruit name, species avatar (chosen on signup), clues solved, and completion time
- Chief Bogo view: full table with per-checkpoint breakdown

### F6 — Admin Panel (Chief Bogo)
- Create / edit hunts and districts
- Add/remove participants and Officers
- View per-participant progress
- Export stamp log as CSV
- Toggle hunt open/closed

---

## Data Models

### Hunt
```
id, name, description, status (draft | active | closed), created_at
```

### Checkpoint (District)
```
id, hunt_id, name (e.g. "Tundratown"), zootopia_icon, order (optional)
```

### Participant (Recruit)
```
id, hunt_id, display_name, species_avatar, qr_token (unique), registered_at
```

### Staff (Officer)
```
id, checkpoint_id, display_name, session_token, role (officer | chief)
```

### Stamp (Case Log)
```
id, participant_id, checkpoint_id, officer_id, stamped_at
unique constraint: (participant_id, checkpoint_id) — one stamp per district per recruit
```

---

## User Flows

### Recruit onboarding
1. Organizer shares join link (with hunt code)
2. Recruit enters name, picks a species avatar
3. Receives their Badge (QR) + Case Board

### Checkpoint verify (Officer)
1. Officer opens scanner on their device
2. Recruit shows their Badge
3. Officer scans → server responds
4. Officer confirms → stamp recorded → recruit's Case Board updates live

### Hunt completion
- When all districts are stamped, recruit sees "Badge Earned" screen with confetti
- Chief Bogo gets a notification; recruit appears on leaderboard as complete

---

## Technical Stack (Recommended)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) | Shared codebase for both Recruit and Officer views |
| Styling | Tailwind CSS | Mobile-first, fast to theme |
| QR generation | `qrcode` (npm) | Render participant badge client-side |
| QR scanning | `html5-qrcode` or `zxing` | Camera access in browser, no native app needed |
| Backend | Next.js API routes or FastAPI | Stamp validation, auth |
| Database | PostgreSQL + Prisma | Relational, supports unique stamp constraint cleanly |
| Auth | Simple session tokens | No OAuth needed at bootcamp scale |
| Real-time updates | Server-Sent Events or polling | Case board updates after stamp |
| Hosting | Vercel (frontend) + Railway/Supabase (DB) | Fast deploy for event use |

---

## Security Model

| Threat | Mitigation |
|---|---|
| Participant shares QR screenshot | Stamp requires authenticated Officer session token — screenshot alone does nothing |
| Participant scans another's QR | Participants have no scanner access |
| Officer stamps same recruit twice | Unique constraint on `(participant_id, checkpoint_id)` — server rejects duplicates |
| Fake Officer session | Session tokens are server-issued on login; no client-side forgery |
| Replay attack on stamp endpoint | Timestamps logged; duplicate requests rejected by DB constraint |

---

## Out of Scope (v1)

- Native iOS/Android app (web is sufficient)
- QR token rotation (TOTP-style)
- Offline stamp queuing
- Multiple hunts running simultaneously per participant
- In-app chat or hints system

---

## 5-Day Event Timeline Fit

| Day | Suggested Hunt Mechanic |
|---|---|
| Day 1 | Hunt opens — first 2–3 districts unlocked (orientation zones) |
| Day 2–3 | All districts active — main hunt phase |
| Day 4 | Bonus clue drop — hidden district revealed via announcement |
| Day 5 | Hunt closes — final leaderboard revealed at closing ceremony |

---

## Design Direction

- **Color palette:** Zootopia city blues + warm ambers, ZPD badge gold accents
- **Typography:** Rounded, friendly sans-serif (e.g. Nunito or Poppins)
- **Illustrations:** Flat animal silhouettes per district; species avatar picker on signup
- **Tone of copy:** Playful police procedural — "Your case file," "Report to the district," "Clue solved, Officer."

---

*ZooStamp — Built for Animacode City. Every recruit leaves with a badge.*
