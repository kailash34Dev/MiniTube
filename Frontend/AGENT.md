# MiniTube - AI Agent Instructions & Design System

You are an expert frontend AI coding agent tasked with building **MiniTube**, a fast, minimal, and professional YouTube clone, using the `antigravity` framework/stack. 

Read these instructions carefully before writing any code. Strict adherence to this design system is mandatory. Do NOT invent new styles, colors, or components that deviate from this document.

---

## 1. Core Coding Directives

* **No Hardcoded Values:** NEVER use hex codes (e.g., `#0F0F0F`) or arbitrary pixel values in the markup. Always use the defined semantic variables/classes (e.g., `bg-background`, `p-4`).
* **Component Architecture:** Every reusable component must support the following props: `variant`, `size`, `disabled`, `loading`, and `className`.
* **Loading States:** Always prefer **Skeletons** (`bg-skeleton`) over spinners. Every page must handle `Loading`, `Empty`, `Error`, and `Success` states.
* **Image Handling:** Always lazy load images.
* **Accessibility First:** Ensure a minimum 44px touch target for interactive elements, maintain WCAG AA contrast, always show a visible focus ring (`ring-focus`), and guarantee full keyboard navigation.

---

## 2. UI Philosophy

* **Dark-first:** The application is dark mode native. Build for dark mode first (light mode will be supported via semantic variables in the future).
* **Simplicity:** Minimal, clean, consistent, fast, and spacious.
* **Function over Form:** Avoid unnecessary gradients, bouncy/flashy animations, excessive colors, or decorative UI. If an element doesn't improve usability, remove it. Whitespace is preferred over visual clutter.

---

## 3. Design Tokens

### Colors (Semantic Variables)

Implement these as CSS variables or utility classes (e.g., Tailwind).

**Backgrounds:**
* `background`: `#0F0F0F` (Primary)
* `secondary`: `#181818` (Secondary Background)
* `surface`: `#212121` (Cards, Inputs)
* `surface-elevated`: `#272727` (Hover states for cards)
* `hover`: `#323232`
* `border`: `#3A3A3A`
* `divider`: `#303030`

**Text:**
* `text-primary`: `#FFFFFF`
* `text-secondary`: `#AAAAAA`
* `text-muted`: `#717171`
* `text-disabled`: `#5F5F5F`
* `text-inverse`: `#0F0F0F`

**Brand:**
* `brand-primary`: `#FF3B30`
* `brand-hover`: `#FF554B`
* `brand-active`: `#E62E24`

**Status:**
* `success`: `#22C55E`
* `warning`: `#F59E0B`
* `danger`: `#EF4444`
* `info`: `#3B82F6`

**Misc:**
* `skeleton`: `#2A2A2A`
* `overlay`: `rgba(0,0,0,0.6)`
* `focus-ring`: `#3EA6FF`

---

## 4. Typography

* **Primary Font:** `Inter`
* **Fallbacks:** `system-ui, Segoe UI, Roboto, Arial, sans-serif` (NEVER mix fonts).
* **Sizes:** `xs` (12px), `sm` (14px), `base` (16px), `lg` (18px), `xl` (20px), `2xl` (24px), `3xl` (30px), `4xl` (36px), `5xl` (48px).
* **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700).
* **Line Heights:** Heading (1.2), Body (1.5), Small Text (1.4).

---

## 5. Spacing & Layout

**Grid System:** Base-8 scale strictly.
* **Allowed spacing values:** 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96. (Map to utility classes like `p-2`, `space-4`, etc.).

**Layout Measurements:**
* Desktop Container: `1440px`
* Content Width: `1280px`
* Sidebar Width: `240px` (Collapsed: `72px`)
* Navbar Height: `64px`
* Page Padding: `24px`
* Section Gap: `32px`

**Breakpoints:**
* Mobile: `480px`
* Tablet: `768px`
* Laptop: `1024px`
* Desktop: `1280px`
* Large Desktop: `1536px`

---

## 6. Component Specifications

### Buttons
* **States required:** Hover, Focus, Disabled, Loading.
* **Primary:** `bg-brand-primary`, text white, pill radius (9999px), height 40px. Hover: `bg-brand-hover`.
* **Secondary:** `bg-surface`, text white. Hover: `bg-surface-elevated` or `hover`.
* **Ghost:** Transparent background. Hover: `bg-surface`.
* **Danger:** `bg-danger`, text white.

### Inputs
* **Styles:** Height 40px, pill radius (9999px), `border-border`, `bg-secondary`.
* **States:** Focus border uses `focus-ring`. Placeholder uses `text-muted`.

### Cards (General)
* **Styles:** Radius 12px, `bg-surface`, no border, padding 12px.
* **Hover:** `bg-surface-elevated`.

### Video Card
* **Thumbnail:** 16:9 ratio, radius 12px, image lazy loaded.
* **Title:** Line-clamp to maximum 2 lines.
* **Description:** Line-clamp to 1 line.
* **Metadata:** Uses `text-muted`.
* **Interaction:** On hover, apply a slight scale (1.02) with a 200ms transition.

### Icons
* **Library:** `Lucide React` (DO NOT use any other library).
* **Sizes allowed:** 16, 20, 24, 32.

---

## 7. Animation Rules
* **Allowed properties to animate:** `Opacity`, `Transform` (Scale, Translate).
* **Durations:** 150ms, 200ms, 300ms.
* **Easing:** `ease-in-out`
* **BANNED animations:** Bounce, Rotate, Flash, Large movements.

---
**Agent Confirmation:** Acknowledge these guidelines before proceeding to generate project structure or component code.
