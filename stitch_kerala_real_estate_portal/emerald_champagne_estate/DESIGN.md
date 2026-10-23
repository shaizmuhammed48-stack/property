---
name: Emerald & Champagne Estate
colors:
  surface: '#f5fbf7'
  surface-dim: '#d5dbd8'
  surface-bright: '#f5fbf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5f1'
  surface-container: '#e9efec'
  surface-container-high: '#e4eae6'
  surface-container-highest: '#dee4e0'
  on-surface: '#171d1b'
  on-surface-variant: '#414845'
  inverse-surface: '#2c3230'
  inverse-on-surface: '#ecf2ee'
  outline: '#717975'
  outline-variant: '#c1c8c3'
  surface-tint: '#3f6658'
  primary: '#002218'
  on-primary: '#ffffff'
  primary-container: '#0f382c'
  on-primary-container: '#79a292'
  inverse-primary: '#a6d0be'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#002219'
  on-tertiary: '#ffffff'
  tertiary-container: '#00392c'
  on-tertiary-container: '#6da492'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecda'
  primary-fixed-dim: '#a6d0be'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#274e41'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#b5efda'
  tertiary-fixed-dim: '#99d2be'
  on-tertiary-fixed: '#002018'
  on-tertiary-fixed-variant: '#155041'
  background: '#f5fbf7'
  on-background: '#171d1b'
  surface-variant: '#dee4e0'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 44px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 34px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 38px
  headline-md:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Manrope
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system embodies the serene opulence of God’s Own Country, merging Kerala's lush tropical heritage with high-end architectural luxury. Tailored for discerning high-net-worth individuals, NRI investors, and seekers of coastal and backwater retreats, the interface evokes calm distinction, bespoke craftsmanship, and institutional trust.

The design movement synthesizes modern minimalism with tactile editorial luxury. Generous negative space, whisper-soft neutral framing, and crystalline glass accents frame high-resolution architectural photography. The visual voice avoids ostentatious gold effects in favor of understated champagne highlights, balanced against profound deep emeralds that ground every interaction in stability and prestige.

## Colors

The palette draws directly from Kerala’s indigenous flora and natural stone finishes:

- **Primary (`#0F382C`)**: Deep Malabar Emerald. Anchors the primary identity, prominent navigation anchors, major call-to-action fills, and primary headers.
- **Secondary (`#C5A059`)**: Champagne Ochre. Serves as the luxury accent for status chips, verified badges, active states, key price callouts, and subtle border highlights.
- **Tertiary (`#134E3F`)**: Palm Canopy Green. Acts as an elevated surface tint, secondary interactive state, and focus boundary.
- **Neutral (`#1E2422`)**: Deep Slate Charcoal. Used for core body typography, deep structural lines, and crisp icons.

Supporting surfaces rely on crisp natural whites (`#FFFFFF`), misty coconut shell grey (`#F6F8F7`), and architectural linen (`#EDEFEF`) to ensure ample breathing room for photography.

## Typography

The type system pairs **Newsreader** for distinguished editorial headings with **Manrope** for technical clarity, data density, and effortless legibility.

- **Newsreader**: Brings classical architectural gravitas to estate titles, luxury tier designations, and price points. It invokes the feeling of a curated private archive.
- **Manrope**: Supplies geometric precision for floorplans, amenity listings, specs (sq. ft, beds, location tags), and inquiry form elements.
- **Labels & Micro-copy**: Employs uppercase tracking (`letter-spacing: 0.04em` to `0.08em`) on badges and section pre-headers to impart bespoke horological precision.

## Layout & Spacing

A mobile-first fluid layout built on an 8pt architectural rhythm governs the interface.

- **Mobile (< 640px)**: 4-column fluid layout with `margin: 1.25rem` and `gutter: 1rem`. Cards and carousels expand close to the viewport edge to prioritize panoramic photography.
- **Tablet (640px – 1024px)**: 8-column layout with `margin-tablet: 2rem` and `gutter-tablet: 1.5rem`, splitting listing details and interactive map panes into equal or 5:3 arrangements.
- **Desktop / Foldables (> 1024px)**: 12-column grid capped at 1280px maximum content width with `margin-desktop: 3rem`, accommodating side-by-side floorplan inspection and concierge inquiry dialogues.

Elements maintain breathing room using `space-lg` between distinct property sections, and `space-sm` to `space-md` for internal card padding and metric badges.

## Elevation & Depth

Visual hierarchy combines warm ambient shadows with whisper-thin metallic borders to mimic pristine architectural stone and glass panels:

- **Surface Level 0 (Base Canvas)**: Clean architectural white (`#FFFFFF`) or pale slate tint (`#F8FAF9`).
- **Surface Level 1 (Card & Module Layer)**: Pure white `#FFFFFF` paired with an ultra-delicate outline (`1px solid rgba(15, 56, 44, 0.07)`) and a diffused ambient shadow (`0 8px 24px -4px rgba(15, 56, 44, 0.05)`).
- **Surface Level 2 (Floating Action Bars & Overlays)**: Frosted backdrops using `backdrop-filter: blur(16px)` on `rgba(255, 255, 255, 0.88)` anchored by champagne border accents (`1px solid rgba(197, 160, 89, 0.25)`).
- **Surface Level 3 (Modals & Concierge Sheets)**: Tinted deep elevation (`0 20px 48px -12px rgba(15, 56, 44, 0.16)`), providing separation during private booking inquiries.

## Shapes

The interface embraces a restrained, architectural softness (`roundedness: 1`). Buttons, property cards, and structural panels utilize disciplined 4px to 12px radiuses (`0.25rem` base, up to `0.75rem` for expansive containers), rejecting over-rounded bubble shapes in favor of crisp, engineered elegance.

Pill geometry (`9999px`) is reserved exclusively for select status chips and contextual filter tags (such as "Waterfront", "Penthouse", or "RERA Approved") to balance structural card lines.

## Components

### Buttons
- **Primary Action**: Solid `#0F382C` fill, pure white text, 48px height, `0.5rem` radius. Subtle inner golden glow or active state tinted to `#134E3F`.
- **Secondary Action**: Transparent background with a 1px border in `#C5A059`, styled with `#0F382C` text.
- **Floating Concierge CTA**: Elevated champagne accent (`#C5A059`) with `#0F382C` bold text and subtle emerald ambient shadow for instant WhatsApp/broker inquiries.

### Badges & Chips
- **Status Badges**: Semi-translucent pill chips (`rgba(197, 160, 89, 0.12)`) framed with `1px solid rgba(197, 160, 89, 0.4)`. Text set in `label-sm` uppercase champagne (`#8F6F2C` on light backgrounds).
- **Location & Attribute Chips**: Soft slate fill (`#F0F3F2`), dark emerald text (`#0F382C`), with 4px corner rounding.

### Property Cards
- 16:10 or 4:3 high-resolution media window with corner-anchored price badges.
- Content body features high-contrast `Newsreader` titles, followed by Manrope specs (bedrooms, square footage, district such as Marine Drive, Kochi or Kowdiar, Trivandrum) separated by subtle golden hairline dividers.
- Pinned bottom row with instant virtual tour launcher and direct inquiry triggers.

### Form Inputs & Fields
- Pure white background with a clean 1px border in `rgba(30, 36, 34, 0.15)`.
- Active focus state transitions border to `#0F382C` with a 2px outer ring in `rgba(197, 160, 89, 0.3)`.
- Floating labels formatted in `label-md` with refined uppercase tracking.

### Checkboxes & Radios
- Square with 3px subtle rounding for checkboxes; pristine concentric circles for radio buttons.
- Checked state: Filled `#0F382C` featuring a sharp champagne tick (`#C5A059`) or center pip.

### Concierge & Schedule Drawer
- Slide-up bottom sheet framed with a top brass-inspired grab bar (`#C5A059` at 40% opacity).
- Pre-filled private viewing slot selectors arranged in clean, responsive horizontal tiles.