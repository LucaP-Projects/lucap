---
name: Mediterranean Institutional Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf0'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d9e3f9'
  on-surface: '#121c2c'
  on-surface-variant: '#45464e'
  inverse-surface: '#273141'
  inverse-on-surface: '#ebf1ff'
  outline: '#76767f'
  outline-variant: '#c6c6cf'
  surface-tint: '#515d84'
  primary: '#00020e'
  on-primary: '#ffffff'
  primary-container: '#0d1b3e'
  on-primary-container: '#7784ad'
  inverse-primary: '#b9c5f2'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#010204'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1d20'
  on-tertiary-container: '#828589'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b9c5f2'
  on-primary-fixed: '#0b1a3d'
  on-primary-fixed-variant: '#39456b'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e0e3e6'
  tertiary-fixed-dim: '#c4c7ca'
  on-tertiary-fixed: '#191c1f'
  on-tertiary-fixed-variant: '#44474a'
  background: '#f9f9ff'
  on-background: '#121c2c'
  surface-variant: '#d9e3f9'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 80px
---

## Brand & Style
The design system is engineered to evoke a sense of absolute trust, historical authority, and modern fiscal precision. Designed specifically for high-level institutional accounting and CPA services in the Tunisian context, it blends the gravitas of European financial traditions with a crisp, Mediterranean architectural clarity.

The style is **Corporate / Modern** with a strong **Editorial** influence. It prioritizes legibility, structured information density, and a "prestige-grade" finish. Every element is designed to feel intentional and permanent, avoiding fleeting trends in favor of a timeless, institutional aesthetic that commands respect from government bodies and international corporations alike. By moving to a more monochromatic secondary palette, the brand emphasizes purity, transparency, and clinical excellence.

## Colors
The palette is rooted in "Deep Navy" (#0D1B3E), representing stability, intelligence, and legacy. This primary tone provides the anchor for the institutional identity, used extensively in headers and primary actions.

The secondary color is "Pure White" (#FFFFFF), which serves as a high-contrast functional accent. Unlike the previous use of vibrant tones, this white-centric secondary approach emphasizes a clean, high-prestige aesthetic where focus is directed by typography and structure rather than loud color alerts. The tertiary "Cool Slate" (#F4F6FA) reduces eye strain during long periods of auditing and data review, providing a foundation for pure white surface cards to appear elevated and distinct.

## Typography
The typographic pairing reflects the intersection of classical academia and modern efficiency. **Playfair Display** is utilized for headlines to provide a traditional, authoritative, and literary tone—reminiscent of official certificates and ledger titles.

**Hanken Grotesk** serves as the primary functional typeface. Its contemporary, sharp grotesque letterforms ensure that complex financial data and dense reports remain highly legible and accessible. Upper-case labeling with increased letter spacing is used for metadata and category headers to reinforce the institutional feel.

## Layout & Spacing
The design system employs a **Fixed Grid** model on desktop to ensure a controlled, "printed-page" feel that mirrors professional accounting documents. A 12-column grid is used for the main content area, with a maximum width of 1200px to maintain optimal line lengths for reading.

Spacing follows a strict 8px rhythm. Large section gaps (80px) are used to separate distinct thematic areas, while internal component spacing remains tight and efficient. High-density layouts are preferred for data tables, while marketing and narrative pages use generous white space to emphasize high-value messaging.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows. This maintains the "flat" precision of a professional document. 

- **Surface Tiers:** Pure White cards sit on the Cool Slate background with a subtle 1px border (#E2E8F0).
- **Secondary Interaction:** Because the secondary color is White, interaction is indicated through subtle inversions or high-contrast Deep Navy outlines against white surfaces.
- **Interactivity:** Elements only gain a subtle, diffused shadow upon hover to indicate clickability, keeping the resting state of the UI static and formal.

## Shapes
The shape language is conservative and **Soft**. A default radius of 0.25rem (4px) is applied to buttons, input fields, and containers. This small radius prevents the UI from feeling "sharp" or "hostile" while avoiding the overly casual or playful nature of larger curves. 

Cards and large containers may scale up to a 0.5rem (8px) radius to soften the visual impact of large data blocks, but the overall geometry remains focused on rectangles and straight lines to mirror the structure of a ledger.

## Components
- **Buttons:** Primary buttons are Solid Navy with White text. Secondary actions use White backgrounds with Navy borders and text, ensuring a crisp, academic look.
- **Navy Headers:** Page headers and section containers often use a full Navy background with white text to instantly establish the brand's presence and authority.
- **Line Dividers:** Thin, 1px horizontal lines in low-contrast grey or subtle Navy tints are used to separate logical sections within a page or card.
- **Input Fields:** Clean, white backgrounds with a 1px Navy border on focus. Labels are always positioned above the field in Hanken Grotesk Semi-bold.
- **Data Tables:** High-density, with alternating row stripes in the background grey. Headers are Navy with White text for maximum contrast and importance.
- **Chips/Badges:** Used for status (e.g., "Audited", "Pending"). These use low-saturation background tints of the status color with high-contrast text, maintaining the professional tone without unnecessary vibrant colors.