# Assets — upload guide

Drop your files into these folders and the site picks them up. Filenames matter for
banners/videos (the size names below); for logos, landings, and brandbooks any name works.

## Naming convention (item folders)

Each banner, video, and landing lives in its own folder named with its **5-digit code + name**,
e.g. `27735 - AlbaNeagra`. Inside that folder go the size/device files (below). The code + name
is also shown as the item's title on the site.

## Marketing Solutions logo

Put the main logo here:

```
public/assets/marketing-solutions-logo.png     (or .svg / .webp)
```

## Per-project folders

| Project    | Has        | Folders present                         |
|------------|------------|-----------------------------------------|
| `winboss`  | brandbook + portfolio | `brandbook/ banners/ landings/ videos/` |
| `win2`     | portfolio  | `banners/ landings/ videos/`            |
| `fansport` | brandbook  | `brandbook/`                            |
| `topbet`   | brandbook  | `brandbook/`                            |
| `top-win`  | brandbook + banners | `brandbook/ banners/`          |
| `bet2fun`  | brandbook + banners | `brandbook/ banners/`          |
| `jackpot`  | banners (rebrand in progress) | `banners/`            |
| `max-win`  | scaffolded — GEO Georgia (upload pending) | `brandbook/ banners/ landings/ videos/ store/` |
| `doncash`  | scaffolded — GEO Uzbekistan (upload pending) | `brandbook/ banners/ landings/ videos/ store/` |

Each project also takes a logo:

```
public/assets/<project>/logo.png     (or .svg / .webp)
```

## Brandbook

Either a PDF or a Figma link.

- **PDF:** drop it in the project's `brandbook/` folder, e.g.
  `public/assets/winboss/brandbook/winboss-brandbook.pdf`
- **Figma:** no upload needed — send the Figma share link and it gets embedded.

## Banners (images)

Each banner is its own subfolder inside `banners/`. Inside, name the files by aspect ratio.
Only include the sizes you have.

```
public/assets/winboss/banners/summer-promo/1x1.jpg     1080×1080  (the grid thumbnail)
public/assets/winboss/banners/summer-promo/9x16.jpg    1080×1920
public/assets/winboss/banners/summer-promo/16x9.jpg    1920×1080
public/assets/winboss/banners/summer-promo/4x5.jpg     1080×1350  (optional)
```

`.jpg`, `.png`, and `.webp` all work. The `1x1` file is what shows in the grid; clicking a
tile opens the other sizes.

## Videos

One subfolder per video inside `videos/`, MP4s named by their pixel dimensions.
**Everything else is automatic** — no data-file edits, and no manual compression:

```
public/assets/win2/videos/27170 - Launch/1080x1080.mp4
public/assets/win2/videos/27170 - Launch/1080x1920.mp4
public/assets/win2/videos/27170 - Launch/1920x1080.mp4
```

After you push, a GitHub Action (usually within 1–2 minutes):

- **compresses** every new MP4 (H.264, ~40–70% smaller) and commits the result back;
- **generates the poster** (`cover.webp`) from the 1080x1080 version at the
  4.5-second mark (drop your own `cover.jpg/webp` in the folder if you want a
  specific frame — a manual cover always wins);
- the video then appears on the site on the next deploy.

Rules: keep each raw file **under 100 MB** (GitHub rejects bigger pushes), and put
the dimensions in the filename (`1080x1080.mp4`, `1920-1080.mp4` — dashes and
Cyrillic х are fine).

## Landings (images — mobile + desktop)

Each landing is its own subfolder inside `landings/`, with a **mobile** and/or **desktop**
export (full-length screenshot from Figma). Mobile leads — it's shown first and is the default
in the viewer. Include only the versions you have.

```
public/assets/winboss/landings/27735 - AlbaNeagra/mobile.jpg     portrait, full page
public/assets/winboss/landings/27735 - AlbaNeagra/desktop.jpg    wide, full page
```

Exporting from Figma: select the frame → Export → PNG (or JPG). Use the mobile frame for
`mobile` and the desktop frame for `desktop`. `.jpg`, `.png`, and `.webp` all work. The tile
shows the top of the mobile page; clicking opens the full-length page with a Mobile/Desktop toggle.

---

After uploading, tell me and I'll register the new items in `src/data/projects.ts` so they
appear on the site (or I can auto-detect them — just say the word).
