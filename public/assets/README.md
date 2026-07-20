# Assets — upload guide

Drop your files into these folders and the site picks them up. Filenames matter for
banners/videos (the size names below); for logos, landings, and brandbooks any name works.

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

## Landings (images)

Just drop landing screenshots straight into the project's `landings/` folder — any filenames.
They show as a gallery.

```
public/assets/winboss/landings/homepage.jpg
public/assets/winboss/landings/promo-page.jpg
```

---

After uploading, tell me and I'll register the new items in `src/data/projects.ts` so they
appear on the site (or I can auto-detect them — just say the word).
