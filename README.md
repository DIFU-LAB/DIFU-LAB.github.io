# SEIL Lab website

The bilingual website of the Social Interaction and Embodied Intelligence Lab (SEIL Lab), University of Surrey. This is a static React/Vite site hosted by GitHub Pages. The content lives in plain JSON files, so everyday edits do not require changing React or running a public CMS server.

## Start here: how to edit the website

### Option A — use the local content editor (recommended)

1. Clone the repository, or open your existing local copy.
2. In the repository root, run `python3 scripts/cms.py` (Python 3.10+). No npm installation is necessary for editing. Alternatively use `pnpm cms`.
3. Open **http://127.0.0.1:8765/** in your browser. Choose a collection or search for a content file in the sidebar.
4. To add an entry, select News, Gallery, Publications or Videos and click **New entry**. Fill in the fields. Use **Upload** in the media library to add a local image, video or caption, then copy its `/media/...` path into the record. Video source lists have a provider selector and an **Add item** button.
5. Click **Save content**. The editor validates changes before writing them. Use **JSON view** for advanced data structures. Preview the website (see below) and check the English and Chinese versions.
6. Commit and push your changes, including newly uploaded media. GitHub Actions builds and publishes the updated website when changes reach `main`.

### Option B — edit directly on GitHub

Open the relevant file on GitHub, click the pencil icon, edit and commit (preferably via a branch and pull request). To add a new entry, copy an existing record or a template from [`content/templates/`](content/templates/) into the corresponding collection, using **Add file → Create new file**. Use **Add file → Upload files** for media. Do not include the `.example` suffix on a published record. The website discovers new collection files automatically.

## Where to edit

| I want to… | File or folder |
|---|---|
| Add news or an award | [`content/news/`](content/news/) |
| Add photographs to the gallery | [`content/gallery/`](content/gallery/) |
| Add a paper, preprint or conference reference | [`content/publications/`](content/publications/) |
| Add detailed DOI/BibTeX metadata | [`content/site/publication-citations.json`](content/site/publication-citations.json) |
| Add a research video | [`content/videos/`](content/videos/) |
| Change a finding or its video | [`content/research/findings.json`](content/research/findings.json) |
| Change the keynote and chapters | [`content/research/keynote.json`](content/research/keynote.json) |
| Change the home film or alternate video hosts | [`content/pages/home/film.json`](content/pages/home/film.json) |
| Add a team member or change a portrait | [`content/team/groups.json`](content/team/groups.json) |
| Edit content translations | Each content record’s `translations` object |
| Edit UI translations | [`translations/locales/`](translations/locales/) |
| Edit home images, framework or hero | [`content/pages/home/`](content/pages/home/) |
| Edit About Di | [`content/pages/about-di/`](content/pages/about-di/) |
| Edit research themes, figures and framework | [`content/research/`](content/research/) |
| Change contact details, logo or navigation | [`content/site/`](content/site/) |
| Turn external services on/off | [`content/site/services.json`](content/site/services.json) |
| Upload assets | [`client/public/media/`](client/public/media/) |

## 1. Add news and announcements

Use [`content/templates/news.json.example`](content/templates/news.json.example). For example, create `content/news/2026-11-25-new-paper.json`:

```json
{
  "id": "2026-11-25-new-paper",
  "title": "Our new paper has been accepted",
  "excerpt": "A short summary of the announcement.",
  "translations": {"zh": {"title": "我们的新论文已被接收", "excerpt": "新闻简介。"}},
  "content": "",
  "imageUrl": "",
  "publishedAt": "2026-11-25T12:00:00Z",
  "linkedinUrl": "https://example.org/announcement"
}
```

Replace the sample URL and text. For a picture, upload it to `client/public/media/news/` and set `imageUrl` to `/media/news/your-photo.webp`. Use a unique `id` and ISO timestamp. `linkedinUrl` is the primary source link; a university news page, event page or LinkedIn post all work. The optional `source` fields in the template provide source attribution and date context. The news page sorts by `publishedAt`; the four latest news items automatically appear on Home. A blank image is supported.

## 2. Add photographs

1. Put the image in `client/public/media/gallery/` (for example `lab-meeting.webp`).
2. Copy [`content/templates/gallery.json.example`](content/templates/gallery.json.example) to `content/gallery/000-lab-meeting.json`.
3. Fill in the record. The filename controls the order; use a three-digit prefix (`000`, `001`, etc.) and do not overwrite another file. Width and height must be the actual image dimensions.

```json
{
  "id": "lab-meeting-2026",
  "title": "Lab meeting",
  "description": "Members discussing their latest experiments.",
  "translations": {"zh": {"title": "实验室组会", "description": "成员讨论最新实验。", "category": "实验室生活"}},
  "category": "Lab life",
  "image": "/media/gallery/lab-meeting.webp",
  "width": 1600,
  "height": 1200,
  "date": "2026-11-25",
  "dateLabel": "25 November 2026",
  "sourceUrl": "",
  "sourceLabel": "",
  "originalImageUrl": ""
}
```

Reuse an existing category to keep filters consistent. Add source/credit information where required. The masonry grid, gallery filters and lightbox update automatically.

## 3. Add publications and references

Create `content/publications/044-your-paper.json` using [`content/templates/publications.json.example`](content/templates/publications.json.example):

```json
{
  "id": "your-paper-2026",
  "title": "Your publication title",
  "authors": "First Author, Second Author",
  "authorNames": ["First Author", "Second Author"],
  "authorsComplete": true,
  "year": 2026,
  "journal": "Journal or conference name",
  "doi": "",
  "url": "https://example.org/paper",
  "type": "journal",
  "status": "published",
  "sourceUrl": "https://example.org/paper",
  "sourceRecordIds": [],
  "versions": []
}
```

Use the real publication link and DOI (without `https://doi.org/`). Follow existing records for other publication types, preprints, status and version metadata. The Publications page sorts and filters records automatically. Publication titles and bibliographic details use their original source language.

For richer citation exports, add an entry keyed by the DOI in `content/site/publication-citations.json`. Follow an existing entry's `authors` (family/given), `title`, `containerTitle`, `year`, `doi`, `pages`, and `sourceUrl` fields. Add a real DOI rather than a placeholder. Citation controls use the metadata when available; no live API is necessary. Research-page paper links are independently editable in `content/research/findings.json`.

## 4. Add videos and alternate hosts

All click-to-play research videos support a single `sources` list. Use any combination of YouTube, Bilibili and local video files for the **same recording**. Use the real provider IDs, not copied iframe markup. A local video is preferred when available; otherwise Chinese prefers Bilibili and English prefers YouTube, respecting enabled providers and existing consent choices. Visitors can select any supplied alternative, including a direct provider link if embedding is disabled or playback fails.

Create `content/videos/001-your-video.json` using [`content/templates/videos.json.example`](content/templates/videos.json.example). This example has three alternatives; replace the sample IDs, upload the local files or remove those entries you do not have:

```json
{
  "id": "robot-demo",
  "title": "Robot attention demo",
  "description": "Our attention model in action.",
  "translations": {"zh": {"title": "机器人注意演示", "description": "注意模型演示。"}},
  "poster": "/media/research/videos/robot-demo.webp",
  "captionsEn": "/media/research/videos/robot-demo-en.vtt",
  "captionsZh": "",
  "sources": [
    { "provider": "youtube", "id": "bjiYEs1x-7E" },
    { "provider": "bilibili", "id": "BV1B7411m7LV", "page": 1 },
    { "provider": "local", "src": "/media/research/videos/robot-demo.mp4" }
  ]
}
```

The example IDs illustrate syntax only; **they are not a verified pair of mirrors**. A YouTube ID is the 11-character value after `watch?v=`; a Bilibili ID starts with `BV` and appears in `/video/BV.../`. `page` is optional for Bilibili multipart videos. `poster` and captions are optional but must be local files. Use WebVTT for local captions; embedded providers control their own captions. The new Research videos section appears only when you add a record.

To add a Bilibili mirror to an existing research finding, open `content/research/findings.json`, locate the finding and append the Bilibili source to its `sources` array. You can do the same for the keynote in `content/research/keynote.json`; its chapter links pass the selected timestamp to both providers, so use mirrors with matching timelines. For the home film, append entries to the `alternatives` array in `content/pages/home/film.json`; the original local bilingual narration/subtitle controls remain available. Alternative hosts appear under the film only if configured. Silent research loops and animated backgrounds stay self-hosted to preserve their responsive and reduced-motion behavior.

YouTube and Bilibili are separately consent-controlled. Selecting a source does not grant consent, and no third-party video or thumbnail loads before permission. The cookie settings can be reopened from the footer. Disable embedding in `content/site/services.json` without deleting video records; normal outbound links remain available.

## 5. Edit team members and pages

For a new team member, add an object to the desired group's `members` array in `content/team/groups.json`:

```json
{
  "name": "New Member",
  "affiliation": "School of Psychology",
  "institution": "University of Surrey",
  "photo": {
    "src": "/media/team/new-member.webp",
    "width": 800,
    "height": 800,
    "position": "50% 35%"
  }
}
```

The `photo` is optional. Use `role` to override the group's role. Upload portraits into `client/public/media/team/`. Edit other team data in `robots.json` and `collaborations.json`.

### Translating content and interface

Content text is kept next to its record. The canonical fields are English. Add a language ID and translated field names under `translations`, including on nested objects:

```json
{
  "title": "Join the lab",
  "description": "Applications are welcome.",
  "translations": {
    "zh": {"title": "加入实验室", "description": "欢迎申请。"}
  }
}
```

`c(record, "title")` automatically selects the current language's override and falls back to English if absent. Keep IDs, dates, URLs, media paths and citation metadata canonical. `content/pages/about-di/story.json` retains its independently authored language versions. Do not use old `titleZh` or global content dictionaries for new records.

UI labels follow TeXlyre: `useTranslation()` and `t("English source key")`, with flat locale files `translations/locales/en.json` and `zh-CN.json`. Interpolation uses `{{variable}}`. `client/src/i18n.ts` registers languages, and `translations/locales.config.json` documents IDs and direction. Add another locale to both when expanding the UI, then expose it in the language selector. Content supports arbitrary language IDs with English fallback. The local CMS exposes the two UI catalogs for value edits; when adding UI keys, update both files together and run `pnpm validate`. The old `content/translations/` dictionaries are retired and no longer read by the app; they can be deleted after applying this update.

For new page layouts, create a component under `client/src/pages/`, register its route in `client/src/App.tsx`, add UI strings to both catalogs, update `scripts/routes.mjs` as needed, and add a link to `content/site/navigation.json`.

## 6. Media and services

Use lowercase descriptive filenames, keep files in purpose-specific folders, and use `/media/...` paths (not `client/public/media/...`) in content. Images should be appropriately compressed WebP/JPEG/PNG, videos MP4 or WebM, captions VTT. Keep files below GitHub's 100 MiB single-file limit; use provider alternatives for larger videos. Do not store site-served media in Git LFS. Upload assets before saving records referencing them. Publishing generates content-addressed WebP variants at up to six widths (320–2400 px), preserves originals and explicit image families, and lets the browser select via `srcset`/`sizes`. The CI media cache avoids regeneration. Route-level splitting and a bounded service-worker cache for immutable images and JS/CSS reduce repeat loading; HTML, video, analytics and visitor summaries are never stored by the service worker. Deleting a record does not delete its assets automatically because other pages might use them.

External integrations are in `content/site/services.json`. YouTube and Bilibili embeds can be individually disabled. The free Abacus counter is enabled for `difulab.org`, `www.difulab.org` and `difu-lab.github.io` only, after consent. It counts opted-in browser tab sessions approximately, not unique visitors or locations. It requires no account or API key. Once the Cloudflare Worker endpoint is configured, the geographical map replaces Abacus as the sole public visitor count. It requires its own consent. See [SERVICES.md](SERVICES.md) for settings, limitations and privacy information. The rest of the site works without any optional external service.

## 7. Preview, validate and publish

Requirements for a local site preview: Node.js 22, pnpm 10.4.1 (Corepack), Python 3.10+ with Pillow, Git and an internet connection for dependency/font downloads.

```sh
corepack enable
python3 -m pip install Pillow==12.3.0
pnpm install --frozen-lockfile
pnpm dev          # preview website; open the URL printed by Vite
pnpm cms          # optional: run in another terminal
```

Before publishing:

```sh
pnpm validate     # content, required fields, media, service configuration
pnpm check        # TypeScript
pnpm build        # build the static site into dist/
pnpm preview      # preview production build
```

The workflow at `.github/workflows/pages.yml` builds pull requests without deployment and publishes changes to `main`/`master`. In GitHub **Settings → Pages**, select **GitHub Actions**. Configure a custom domain in Pages settings when needed. The workflow derives the base path; direct page links and refreshes are supported. The CMS runs locally and is not published. See [SERVICES.md](SERVICES.md) for service setup and the `client/src` directory for layout and style code.
