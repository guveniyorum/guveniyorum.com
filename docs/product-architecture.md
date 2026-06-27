# Guveniyorum Product Architecture

## Product identity

Guveniyorum is not a static information website. It is a trust intelligence platform that connects membership, complaint review, brand scoring, psychology tests, community contribution, rewards, and admin moderation.

Core promise:

- User creates a verified account.
- User submits a complaint about a brand.
- Complaint goes to admin moderation.
- Admin approves, rejects, or requests more evidence.
- Approved complaint affects the user's points and XP.
- Approved complaint affects brand trust analytics.
- Brand may respond through a brand panel.
- Psychology tests update the user's risk profile and recommendations.
- Notifications keep every actor informed.

## Required surfaces

### Public

- `/`
- `/marka-ligi`
- `/marka/:slug`
- `/sikayetler`
- `/sikayet/:publicId`
- `/guven-merkezi`
- `/sorumlu-kullanim`
- `/kullanici-psikolojisi`
- `/wellness-merkezi`
- `/topluluk-merkezi`
- `/ai-danisman`
- `/sertifikasyon`

### Member

- `/profil`
- `/profil/sikayetlerim`
- `/profil/puanlarim`
- `/profil/odullerim`
- `/profil/test-sonuclarim`
- `/profil/bildirimler`
- `/profil/rozetlerim`

### Admin

- `/admin`
- `/admin/sikayetler`
- `/admin/sikayetler/:publicId`
- `/admin/markalar`
- `/admin/kullanicilar`
- `/admin/puanlama`
- `/admin/oduller`
- `/admin/sertifika-basvurulari`
- `/admin/psikoloji-testleri`
- `/admin/ai-raporlar`
- `/admin/ayarlar`

### Brand owner

- `/marka-panel`
- `/marka-panel/sikayetler`
- `/marka-panel/yanitlar`
- `/marka-panel/skor`
- `/marka-panel/sertifika`
- `/marka-panel/analitik`

## Complaint lifecycle

1. User signs in.
2. User submits complaint.
3. System creates `complaints.public_id` such as `GVN-2026-0001`.
4. Complaint status becomes `pending_review`.
5. Admin sees complaint in `/admin/sikayetler`.
6. Admin can:
   - approve
   - reject
   - request evidence
   - forward to brand
   - mark solved
7. If approved:
   - `point_transactions` row is created.
   - User receives XP and points.
   - Notification is created.
   - Brand score engine updates brand metrics.
8. If rejected:
   - user receives rejection reason.
   - no reward is released.
9. If solved:
   - brand trust score can recover.
   - user receives resolution notification.

## Scoring rules v1

### User contribution points

- Approved complaint: +25 points, +80 XP
- Helpful review: +8 points, +20 XP
- Psychology test completion: +10 points, +35 XP
- Evidence attached to approved complaint: +15 points, +30 XP
- Brand response marked useful: +5 points, +10 XP

### Brand trust score

Base score: 70

Positive signals:

- Solved complaint: +2
- Fast response under 6 hours: +2
- Valid certification: +5
- High user rating average: +3

Negative signals:

- Approved unresolved complaint: -3
- Evidence-backed severe complaint: -8
- No brand response after SLA: -5
- Repeated rejection/avoidance: -10

## Psychology test requirements

The psychology module should not be a decorative page. It should create a result record.

Minimum result fields:

- user_id
- score
- risk_level: low / medium / high / critical
- answers JSON
- recommendations JSON
- created_at

Result must update:

- user profile risk notes
- recommendation panel
- XP and contribution points
- optional notification

## Admin approval rules

Admin approval is mandatory for:

- complaint publication
- user reward release
- brand score negative impact
- certification approval
- public brand response publication

No public complaint should appear before approval.

## Technical implementation phases

### Phase 1

- Add Supabase project.
- Run `supabase/schema.sql`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel.
- Replace local store reads with Supabase queries.

### Phase 2

- Build `/admin` route.
- Build complaint moderation queue.
- Build user profile and points page.
- Build complaint detail pages.

### Phase 3

- Build brand owner panel.
- Build real AI report persistence.
- Build rewards marketplace.
- Build badge automation.

## Non-negotiable acceptance criteria

- No button should be a dead demo button.
- Every CTA must either change route, create data, update state, or open a real workflow.
- Complaint submission must create a persistent record.
- Admin approval must control publication and reward release.
- User points must be transaction-based, not hardcoded.
- Brand score must be recalculated from events.
- Psychology test must create a user-specific result.
