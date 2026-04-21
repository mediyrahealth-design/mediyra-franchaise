# Design Brief: Mediyra Lab

## Overview
B2B pathology laboratory admin dashboard. Professional medical UI for lab staff and collection center partners. Card-based layout, teal accent on white, surgical precision in information hierarchy.

## Tone
Refined, clinical, trustworthy. No decoration. Pure function. Enterprise healthcare aesthetic inspired by Linear and Stripe minimalism.

## Color Palette

| Use           | Light OKLCH       | Dark OKLCH        | Notes                                    |
|:--------------|:------------------|:------------------|:-----------------------------------------|
| Primary       | 0.56 0.16 190     | 0.65 0.18 190     | Teal (#0D9488). Brand identity, CTAs    |
| Background    | 0.99 0.01 200     | 0.13 0.01 200     | Cool neutral. Breathable space           |
| Card          | 1.0 0 0           | 0.16 0.01 200     | Pure white light; dark neutral           |
| Muted         | 0.94 0.02 200     | 0.20 0.01 200     | Zone separator, disabled states          |
| Foreground    | 0.12 0.02 200     | 0.92 0.01 200     | Near-black light; light grey dark        |
| Destructive   | 0.60 0.25 30      | 0.65 0.25 30      | Medical alert red. Rare, reserved        |
| Success       | 0.65 0.18 140     | 0.70 0.18 140     | Chart-3. Status badges                   |
| Warning       | 0.60 0.12 185     | 0.65 0.15 185     | Chart-2. Processing states               |
| Border        | 0.91 0.01 190     | 0.25 0.01 190     | Teal-tinted, subtle                      |

## Typography

| Role    | Font             | Weight | Size   | Line Height | Use Case              |
|:--------|:-----------------|:-------|:-------|:------------|:----------------------|
| Display | Figtree, 600     | 600    | 24–32  | 1.2        | Page titles, section  |
| Body    | DM Sans, 400     | 400    | 14–16  | 1.5        | Labels, descriptions  |
| Mono    | System monospace | 400    | 12–14  | 1.4        | Patient IDs, codes    |

## Structural Zones

| Zone      | Surface                | Pattern                                                  |
|:----------|:----------------------|:---------------------------------------------------------|
| Header    | `bg-card border-b border-primary/20`     | Fixed top. Title + nav. Teal accent line signals authority. |
| Sidebar   | `bg-sidebar border-r border-sidebar-border` | Persistent navigation. Teal active state.                |
| Content   | `bg-background`                          | Main grid. White card-based layout on cool grey.        |
| Card      | `bg-card border border-border rounded-lg` | Elevated. Subtle border. Max 3 per row.                 |
| Badge     | `bg-accent/10 text-accent rounded-full`   | Inline status. Teal primary; chart colors for success.  |
| Footer    | `bg-muted border-t border-border`        | Minimal. Muted text. Right-aligned actions.            |

## Component Patterns

- **Buttons**: `bg-primary text-primary-foreground` (primary), `border border-primary/20` (secondary), `bg-destructive` (danger). No gradient.
- **Inputs**: `bg-input border border-border rounded-md`. Focus ring: `ring-2 ring-primary/30`.
- **Cards**: Grouped in 1–3 column grid. Consistent padding (1.5rem). Border on hover (interactive cards).
- **Tables**: Alternating row background (`even:bg-muted/30`). Right-aligned numeric data. No borders.
- **Status Badges**: Success (teal/chart-3), Warning (orange/chart-2), Pending (muted), Error (red).

## Motion & Interaction

- **Transitions**: `transition-smooth` (0.3s cubic-bezier). Applied to all interactive elements.
- **Hover states**: Border shift (primary/20 → primary/40). No scale, no shadow inflation.
- **Focus states**: Ring (2px, primary/30). Keyboard-accessible.
- **Loading**: Pulse animation on badge or spinner. No bouncing.

## Constraints

- **No raw hex or RGB.** All colors via OKLCH tokens in CSS variables.
- **No arbitrary Tailwind classes.** Semantic tokens only.
- **Max 2 font families.** Figtree (display) + DM Sans (body).
- **Rounded corners**: 8px (lg), 6px (md), 4px (sm). No full-circle except badges.
- **Shadows**: Subtle only (`shadow-sm`, `shadow-elevated`). No glow, no neon.
- **Dark mode**: Intentional. Teal persists. Backgrounds shift cool-dark; text brightens.

## Signature Detail

**Teal accent border on cards (`.card-interactive`)**: On hover, border shifts from `primary/20` to `primary/40`. This micro-interaction — a quiet highlight — signals medical precision and attention to detail without any decorative distraction.

## File References

- `src/frontend/src/index.css`: OKLCH tokens, @font-face, utility classes
- `src/frontend/tailwind.config.js`: boxShadow (subtle, elevated), animation
- `src/frontend/public/assets/fonts/`: DMSans.woff2, Figtree.woff2

