# 🎨 VyBzzZ Brand Guidelines

**Version**: 1.0
**Last Updated**: November 16, 2025
**Owner**: VyBzzZ Design Team

---

## 📐 Logo Usage

### Primary Logo

**File**: `public/logo.svg`

The VyBzzZ logo consists of:
- **Symbol**: An animated "V" shape with a pulsing circle
- **Logotype**: "VyBzzZ" in Inter font, extrabold weight

### Logo Variations

| Version | Use Case | File |
|---------|----------|------|
| **Full Color** | Dark backgrounds (primary) | `logo.svg` |
| **White** | Photos, colored backgrounds | `logo-white.svg` |
| **Black** | Light backgrounds, print | `logo-black.svg` |
| **Icon Only** | App icons, favicons | `icon-192.png`, `icon-512.png` |

### Minimum Sizes

- **Digital**: 120px wide minimum
- **Print**: 30mm wide minimum
- **Favicon**: 32x32px (icon only)

### Clear Space

Maintain a minimum clearspace of **1/4 of the logo height** on all sides.

```
┌─────────────────────────┐
│         ↑ 1/4h          │
│    ┌─────────────┐      │
│ ←  │   VyBzzZ    │  →   │
│    └─────────────┘      │
│         ↓ 1/4h          │
└─────────────────────────┘
```

### Logo Don'ts

❌ **Don't** rotate the logo
❌ **Don't** change the gradient colors
❌ **Don't** add effects (drop shadow, outline, etc.)
❌ **Don't** place on busy backgrounds without sufficient contrast
❌ **Don't** stretch or distort proportions
❌ **Don't** use low-resolution versions

---

## 🎨 Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Violet (Primary)** | `#9333ea` | Main brand color, CTAs, primary buttons |
| **Pink (Secondary)** | `#ec4899` | Highlights, hover states, accents |
| **Amber (Accent)** | `#f59e0b` | Badges, notifications, special offers |

**Gradient**: Use for logos, special headings, and premium features
```css
background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
```

### UI Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#0f172a` | Main background |
| **Surface** | `#1e293b` | Cards, modals, panels |
| **Border** | `#334155` | Dividers, input borders |

### Text Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#f8fafc` | Headings, important text |
| **Secondary** | `#cbd5e1` | Body text, descriptions |
| **Muted** | `#64748b` | Helper text, placeholders |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Success** | `#22c55e` | Confirmations, success messages |
| **Error** | `#ef4444` | Errors, destructive actions |
| **Warning** | `#f59e0b` | Warnings, pending states |
| **Info** | `#3b82f6` | Information, tips |

### Accessibility

- **Minimum contrast ratio**: 4.5:1 for normal text, 3:1 for large text
- Test colors with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Primary violet (#9333ea) on dark background (#0f172a): ✅ WCAG AA

---

## ✍️ Typography

### Font Family

**Primary**: Inter (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap">
```

**Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| **Light** | 300 | Subtle text, large headings |
| **Regular** | 400 | Body text |
| **Medium** | 500 | Emphasized text |
| **Semibold** | 600 | Subheadings |
| **Bold** | 700 | Headings |
| **Extrabold** | 800 | Hero text, logos |
| **Black** | 900 | Display text (rare) |

### Type Scale

| Size | rem | px | Usage |
|------|-----|----|-------|
| **xs** | 0.75rem | 12px | Small labels, badges |
| **sm** | 0.875rem | 14px | Secondary text |
| **base** | 1rem | 16px | Body text |
| **lg** | 1.125rem | 18px | Lead paragraphs |
| **xl** | 1.25rem | 20px | H5 |
| **2xl** | 1.5rem | 24px | H4 |
| **3xl** | 1.875rem | 30px | H3 |
| **4xl** | 2.25rem | 36px | H2 |
| **5xl** | 3rem | 48px | H1 |
| **6xl** | 3.75rem | 60px | Hero text |

### Line Height

- **Headings**: 1.25 (tight)
- **Body text**: 1.5 (normal)
- **Captions**: 1.375 (snug)

---

## 🖼️ Imagery

### Photography Style

**Characteristics**:
- High-energy concert photography
- Vibrant colors, dynamic lighting
- Focus on artist-fan connection
- Authentic, unposed moments

**Don'ts**:
- Stock photos of generic concerts
- Overly edited/filtered images
- Poor quality or pixelated images

### Illustrations

**Style**: Minimalist, geometric, with gradient accents

**Use for**:
- Empty states
- Onboarding screens
- Error pages
- Marketing materials

### Icons

**Style**: Lucide React (outlined, 24px default)

```tsx
import { Music, User, Ticket } from 'lucide-react'

<Music className="w-6 h-6 text-brand-primary" />
```

---

## 🎬 Animations & Motion

### Principles

1. **Purpose**: Every animation serves a function
2. **Performance**: Smooth 60fps, hardware-accelerated
3. **Duration**: 150-300ms for UI interactions
4. **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for natural motion

### Animation Types

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| **Micro-interactions** | 150ms | `ease-out` | Button hovers, toggles |
| **Transitions** | 200ms | `ease-in-out` | Page transitions, modals |
| **Reveals** | 300ms | `ease-out` | Content appearing |
| **Emphasis** | 500ms | `spring` | Special effects, celebrations |

### Examples

```css
/* Button hover */
.button {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(147, 51, 234, 0.3);
}

/* Modal entrance */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 🗣️ Voice & Tone

### Brand Personality

**VyBzzZ is**:
- **Energetic**: High-energy, exciting, dynamic
- **Inclusive**: Welcoming to all music lovers
- **Authentic**: Real connections, genuine experiences
- **Innovative**: Cutting-edge technology, forward-thinking

**VyBzzZ is NOT**:
- Formal or corporate
- Exclusive or elitist
- Traditional or old-fashioned
- Passive or boring

### Writing Style

**Do**:
- Use active voice
- Write in present tense
- Keep sentences short and punchy
- Address users as "you"
- Use emojis sparingly (only when appropriate)

**Don't**:
- Use jargon or technical terms
- Write passive, long sentences
- Be overly formal
- Use excessive exclamation marks!!!

### Example Copy

✅ **Good**:
> "Join 10,000 fans streaming live concerts from your favorite artists. Get your ticket now."

❌ **Bad**:
> "VyBzzZ is a platform that has been designed to facilitate the streaming of live musical performances by various artists to a diverse audience of music enthusiasts."

### Common Phrases

| Situation | Phrase |
|-----------|--------|
| **Welcome** | "Welcome to VyBzzZ! 🎵" |
| **Success** | "You're in! See you at the show 🎉" |
| **Error** | "Oops! Something went wrong. Let's try again." |
| **Empty state** | "No concerts yet. Check back soon!" |
| **Loading** | "Loading your experience..." |

---

## 📱 Component Patterns

### Buttons

**Primary** (CTAs, important actions):
```css
background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
```

**Secondary** (Less important actions):
```css
background: transparent;
color: #9333ea;
border: 2px solid #9333ea;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
```

### Cards

```css
background: #1e293b;
border-radius: 12px;
padding: 24px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

### Inputs

```css
background: #0f172a;
border: 2px solid #334155;
border-radius: 8px;
padding: 12px 16px;
color: #f8fafc;
transition: border-color 200ms;

/* Focus state */
&:focus {
  border-color: #9333ea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}
```

---

## 📐 Spacing & Layout

### Grid System

**12-column grid** with 24px gutters

**Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Spacing Scale

Use multiples of **4px**:

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-1` | 4px | Tight spacing |
| `spacing-2` | 8px | Icon-to-text |
| `spacing-3` | 12px | Small gaps |
| `spacing-4` | 16px | Default spacing |
| `spacing-6` | 24px | Section spacing |
| `spacing-8` | 32px | Large gaps |
| `spacing-12` | 48px | Major sections |

---

## 🌍 Localization

VyBzzZ supports **6 languages**:
- 🇫🇷 French (primary)
- 🇬🇧 English
- 🇪🇸 Spanish
- 🇧🇷 Portuguese
- 🇩🇪 German
- 🇨🇳 Chinese (Simplified)

### Guidelines

- Keep text concise (some languages expand by 30%)
- Avoid idioms or cultural references
- Use Unicode emoji (universally understood)
- Test RTL layouts if adding Arabic/Hebrew

---

## ✅ Brand Checklist

Before launching any design:

- [ ] Logo used correctly (size, clearspace)
- [ ] Colors match brand palette
- [ ] Typography follows guidelines
- [ ] Animations are smooth (60fps)
- [ ] Voice matches brand personality
- [ ] Accessibility standards met (WCAG AA)
- [ ] Works on mobile and desktop
- [ ] Tested in dark mode
- [ ] Copy reviewed for tone
- [ ] Images follow photography style

---

## 📞 Questions?

**Design Team**: design@vybzzz.com
**Brand Assets**: [Figma Link] (internal only)
**This Document**: `/BRAND_GUIDELINES.md`

---

**Last Updated**: November 16, 2025
**Version**: 1.0
