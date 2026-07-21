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
| `jackpot`  | banners (rebrand in progress) | `banners/`            |

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

Same idea as banners — one subfolder per video inside `videos/`, size-named files.

```
public/assets/win2/videos/launch/1x1.mp4     1080×1080  (the grid thumbnail)
public/assets/win2/videos/launch/9x16.mp4    1080×1920
public/assets/win2/videos/launch/16x9.mp4    1920×1080
public/assets/win2/videos/launch/4x5.mp4     1080×1350  (optional)
```

`.mp4` (and `.webm`) work.

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
