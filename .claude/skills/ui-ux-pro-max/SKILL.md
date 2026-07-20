---
name: ui-ux-pro-max
description: UI/UX design intelligence. Searchable local database of UI styles, color palettes, font pairings, charts, UX guidelines, and per-stack patterns. Use when designing, building, or reviewing UI — pages, components, color schemes, typography, layout, accessibility, animation, or data visualization.
metadata:
  source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
  license: MIT
---

# UI/UX Pro Max — Design Intelligence

A searchable local database (CSV-backed BM25 + regex engine) of UI styles, color
palettes, font pairings, chart types, UX guidelines, and stack-specific patterns.

## Search command

Run from this skill directory:

```bash
python3 scripts/search.py "<query>" --domain <domain> [-n <max_results>]
```

**Domains:** `product`, `style`, `color`, `typography`, `landing`, `chart`, `ux`,
`icons`, `react`, `web`, `google-fonts`, `gsap`.

**Full design system** (recommends pattern + style + colors + typography + motion):

```bash
python3 scripts/search.py "<query>" --design-system --stack <stack> \
  --variance <1-10> --motion <1-10> --density <1-10>
```

- `--variance` biases style (centered/minimal → bold/asymmetric)
- `--motion` attaches a matching GSAP snippet
- `--density` overrides spacing-scale tokens (spacious → dense)

**Stacks:** `html-tailwind` (default), `react`, `nextjs`, `astro`, `vue`, `svelte`,
`swiftui`, `react-native`, `flutter`, `shadcn`, and more.

## Data

Canonical CSV databases live in `data/` (styles, colors, typography, products,
landing, charts, ux, icons, motion) and `data/stacks/` for per-stack guidance.
