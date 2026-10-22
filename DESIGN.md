# Design

How Portfoliofy looks and moves. Every value here is taken from the code; when you change one, change it here too. The general UI rules (accessibility, forms, motion etiquette) live in [agents.md](./agents.md); this file is the product's own system.

## Principles

- **Calm and typographic.** A profile reads like a well-set CV: one column, one type size, hierarchy from colour and spacing rather than size or weight.
- **Content first, chrome last.** Controls appear where they're needed and stay quiet. No ads, badges or decoration.
- **Every theme, both modes.** Nothing is hard-coded to one theme. Profile UI takes its colours from `--theme-*`; app UI (editor, dialogs) from the app tokens.
- **Motion explains, never decorates.** Short fades and one spring. Everything honours `prefers-reduced-motion`.

## Colour

There are two token layers. Use the one that matches where the UI lives.

### App tokens (editor, dialogs, sidebar)

Defined in `app/globals.css` under `:root` and `.dark`, exposed in Tailwind as `surface-*`, `content-*`, `border-*` and `action-*`.

| Token                 | Light     | Dark      | Use                         |
| --------------------- | --------- | --------- | --------------------------- |
| `--surface-1`         | `#ffffff` | `#222222` | Page and dialog background  |
| `--surface-2`         | `#f4f4f4` | `#1f1f1f` | Pressed and selected states |
| `--surface-3`         | `#f2f2f2` | `#2c2c2c` | Inputs, skeletons           |
| `--surface-card`      | surface-1 | `#1f1f1f` | Cards and buttons           |
| `--content-primary`   | `#111111` | `#eeeeee` | Text                        |
| `--content-secondary` | `#666666` | `#aaaaaa` | Supporting text             |
| `--content-muted`     | `#6b7280` | `#9ca3af` | Labels, hints               |
| `--border-subtle`     | `#f3f4f6` | `#333333` | Dividers                    |
| `--border-strong`     | `#e5e7eb` | `#444444` | Control borders             |
| `--action-danger`     | `#dc2626` | red 90%   | Destructive actions         |

### Profile themes (profile, posts, lightbox)

A profile sets `theme-<name>` on its root. Tailwind exposes the tokens as `theme-bg`, `theme-primary`, `theme-secondary`, `theme-muted`, `theme-border` and `theme-accent`.

| Theme          | Background | Primary   | Secondary | Muted     | Border    |
| -------------- | ---------- | --------- | --------- | --------- | --------- |
| Default        | `#ffffff`  | `#111111` | `#555555` | `#999999` | `#e5e5e5` |
| Default (dark) | `#222222`  | `#eeeeee` | `#bbbbbb` | `#888888` | `#333333` |
| Brutalist      | `#bbbbbb`  | `#000000` | `#555555` | `#777777` | `#aaaaaa` |
| Swiss          | `#e25336`  | `#ffffff` | `#f6cbc3` | `#ee9886` | `#e66d54` |
| Klein          | `#002fa7`  | `#ffffff` | `#bfcbe9` | `#7998de` | `#3359b9` |
| Red            | `#fdf2f1`  | `#e50800` | `#ec4e48` | `#f39491` | `#f9cfcd` |
| Green          | `#edfced`  | `#008000` | `#47a547` | `#8bc98b` | `#bee3be` |
| Blue           | `#edf5fd`  | `#0066cc` | `#4791db` | `#8dbbf0` | `#bed8f3` |
| Albers         | `#f7e3ea`  | `#4c3e51` | `#8b5088` | `#c068a0` | `#efc5d4` |

Only the default theme has a dark variant; the coloured themes look the same in both modes.

Supporting tokens, set per theme:

| Token                  | Default (light / dark) | Coloured themes                | Use                               |
| ---------------------- | ---------------------- | ------------------------------ | --------------------------------- |
| `--theme-wash`         | `#f2f2f2` / `#333333`  | A tint of the theme            | Input fills, inline code          |
| `--theme-code-bg`      | `#fafafa` / `#2f2f2f`  | `--theme-wash`                 | Code blocks                       |
| `--theme-code-text`    | `#90a4ae` / `#eeeeee`  | `--theme-primary` (monochrome) | Code text                         |
| `--theme-media-bg`     | `#fafafa` / `#333333`  | `--theme-wash`                 | Placeholder until media loads     |
| `--theme-thumb-bg`     | `#f2f2f2` / `#383838`  | `--theme-wash`                 | Writing-tab thumbnails            |
| `--theme-faint-border` | black 5% / white 10%   | 10% of the theme colour        | Hairlines on thumbnails and pills |
| `--theme-glass`        | white 50% / `#111` 50% | Page colour at 50%             | Lightbox pills, over a 5px blur   |

Tailwind's opacity modifier (`/20`) doesn't work on these variables. Use `color-mix(in srgb, var(--theme-primary) 20%, transparent)` instead.

## Typography

| Option | Typeface (`next/font`) | Variable              | Body   | Secondary | Line height |
| ------ | ---------------------- | --------------------- | ------ | --------- | ----------- |
| Sans   | Inter 400, 500, 600    | `--font-graphik`      | 14px   | 12px      | 1.6         |
| Serif  | Fraunces 400, 500      | `--font-signifier`    | 15px   | 13px      | 1.49        |
| Mono   | JetBrains Mono 400     | `--font-diatype-mono` | 13.5px | 11.5px    | 1.65        |

- A profile's `typography-<option>` class sets `--type-size`, `--secondary-type-size` and `--line-height`. Profile text uses `text-[length:var(--type-size)] leading-[var(--line-height)]`.
- **Weights:** `font-semibold` and `font-bold` deliberately render at 400. Emphasis comes from `font-medium` (500). Use `font-[600]` only where a real semibold is intended, such as the landing page highlight.
- Dates and counts use `tabular-nums`.
- Text uses `…`, never `...`.

## Layout

- **Profile and post column:** 540px wide, centred.

  | Viewport  | Top inset            | Side inset | Bottom |
  | --------- | -------------------- | ---------- | ------ |
  | ≥ 685px   | 72px                 | 0          | 72px   |
  | 637–684px | `calc(50vw - 270px)` | 0          | 96px   |
  | 481–636px | 48px                 | 48px       | 96px   |
  | ≤ 480px   | 24px                 | 24px       | 96px   |

- **List entries:** a 94px date column, 36px gap, then the content. At 480px and below the date stacks above the title.
- **Writing tab:** year groups 60px apart, posts 36px apart, a 106px date column with a 24px gap, and 152×90 thumbnails with 8px corners.
- **Profile photo:** 92px in the header, 72px on the lock screen, 48px on posts.
- **Post media:** single images run edge to edge at 540px and below, with captions inset 12px from 600px down. Several images form a horizontal strip, 320px tall and 12px apart, that scrolls sideways.

## Motion

| What            | Value                                                                     | Where                                 |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------- |
| Fades           | 0.3s                                                                      | Page, lightbox, lock screen           |
| The spring      | stiffness 700, damping 50 (95% at 164ms, settled by ~300ms, no overshoot) | Dialogs, tab underlines               |
| Sidebar slide   | 0.3s (`SIDEBAR_SLIDE`)                                                    | `store/useSidebarStore.ts`            |
| Dialogs         | Backdrop fades; card fades and rises 20px; reversed on close              | `.dialog-overlay` / `.dialog-content` |
| Lightbox        | Page-coloured layer fades in; media and controls follow 600ms later       | `components/composite/Lightbox.tsx`   |
| Post image zoom | 450ms `cubic-bezier(0.4, 0, 0.1, 1)`; page scrolls 400ms ease-in-out      | `postMediaInteractions.ts`            |
| Padlock unlock  | Shackle rises 2px, then swings open; 400ms in all                         | `.padlock-shackle`                    |
| Wrong password  | Small side-to-side shake: x 0, 3, −3, 0, 0.15s, repeated 4 times          | `PageLockScreen.tsx`                  |

- The dialog spring is reproduced in CSS with `linear()` (`--dialog-spring` in `globals.css`), so `components/ui/dialog` and `alert-dialog` match the sign-in dialog without Framer Motion.
- Prefer CSS animations; use Framer Motion for layout, presence and gestures.
- Under `prefers-reduced-motion`, dialogs fade without rising and the padlock opens instantly.

## Components

### Buttons

The standard button, used for **Done**, **Save** and the lock screen's **Submit**:

```
h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-[14px] font-medium
text-content-primary shadow-sm active:bg-surface-2 disabled:opacity-80
dark:border-none dark:bg-border-subtle dark:active:bg-border-strong
```

- **No hover state**, only a pressed state.
- **A loading button keeps its width.** The label and spinner share one grid cell: the label turns `invisible` and the spinner sits over it. Never swap the label for the spinner.
- **Disable a button that can't act yet**, such as Submit with an empty field. Pressing it should never do nothing silently.
- Secondary actions (Cancel) are plain text that underlines on hover.

### Dialogs

- Build on `components/ui/dialog` or `alert-dialog`; both carry the shared motion.
- Confirmation dialogs: `p-6`, `sm:max-w-sm`, a left-aligned title in `text-lg font-medium`, actions right-aligned.
- Backdrops are plain black, never a blur: 30% on sign-in, 50% on editor dialogs, 70% on confirmations.

### Inputs

- Field fill: `--theme-wash` on profile surfaces, `surface-3` in the editor.
- At least 16px text on phones so iOS doesn't zoom, 14px from `sm` up.
- Visible focus ring; never remove the outline without replacing it.

### Lock screen

A 375px card centred on the page: 1px `theme-border`, 24px radius, 24px padding, 12px between rows, everything left-aligned. Inside: the owner's 72px photo with their status, a line of text with the name underlined in the border colour, a password field with the padlock inside it, and the standard button on the right.

## Rules

1. Profile UI uses `theme-*` tokens; app UI uses `surface-*`, `content-*` and `border-*`. Never a literal colour that only works in one theme.
2. One body size per profile; set hierarchy with colour, spacing and `font-medium`.
3. Buttons have no hover state and keep their width while loading.
4. All motion respects `prefers-reduced-motion`.
5. Check every visual change in light, dark and at least one coloured theme (Klein or Swiss), at phone and desktop width.
