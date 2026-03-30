# 🎬 دراما بلس — Drama Plus Website

A static Arabic drama streaming site with YouTube player + SRT subtitles.
Deploy on **GitHub Pages** or **Vercel** — no backend needed.

---

## 📁 Folder Structure

```
drama-site/
├── index.html              ← Homepage (drama grid)
├── vercel.json             ← Vercel deploy config
├── assets/
│   ├── css/main.css        ← All styles
│   ├── js/player.js        ← Player + SRT engine
│   └── img/                ← Put drama thumbnail images here
│       ├── humrahi.webp
│       └── rangde.webp
├── dramas/                 ← One HTML file per drama
│   ├── humrahi.html
│   └── rangde.html
└── data/                   ← One TXT file per drama
    ├── humrahi.txt
    └── rangde.txt
```

---

## ➕ How to Add a New Drama

### Step 1 — Add thumbnail image
Put your `.webp` (or `.jpg`) cover image in `assets/img/`.

### Step 2 — Add drama card to homepage
Open `index.html` and copy this block inside `<div class="series-grid">`:

```html
<div class="series-item">
  <a href="dramas/MY-DRAMA.html">
    <div class="thumb-wrap">
      <img loading="lazy" src="assets/img/MY-DRAMA.webp" alt="Drama Title" />
      <div class="thumb-overlay"><span>▶ شاهد الآن</span></div>
    </div>
    <span class="series-title">Drama Title Here</span>
  </a>
</div>
```

### Step 3 — Create drama page
Copy `dramas/humrahi.html` → rename to `dramas/MY-DRAMA.html`.
Change:
- The `<title>` tag
- The `<h1>` text
- The `<img src="">` to your thumbnail
- The `txtFile` in `initDramaPage({ txtFile: '../data/MY-DRAMA.txt' })`

### Step 4 — Create data file
Create `data/MY-DRAMA.txt` with this format:

```
video1="YOUTUBE_VIDEO_ID"
srt1="
1
00:00:01,000 --> 00:00:04,000
Arabic subtitle line here

2
00:00:05,000 --> 00:00:08,000
Next subtitle line
"

video2="YOUTUBE_VIDEO_ID_FOR_EP2"
srt2="
1
00:00:01,000 --> 00:00:04,000
Episode 2 subtitle
"
```

**That's it!** The episode buttons are generated automatically from the txt file.

---

## 📝 Data File Format

| Key      | Meaning                              |
|----------|--------------------------------------|
| `video1` | YouTube video ID for Episode 1       |
| `srt1`   | SRT subtitle block for Episode 1     |
| `video2` | YouTube video ID for Episode 2       |
| `srt2`   | SRT subtitle block for Episode 2     |
| ...      | Continue for as many episodes as you have |

The **YouTube video ID** is the part after `v=` in a YouTube URL.  
Example: `https://youtube.com/watch?v=ZjoKaASn78I` → ID is `ZjoKaASn78I`

---

## 🚀 Deploy to Vercel

1. Push this folder to a **GitHub repository**
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Framework Preset: **Other** (Static Site)
5. Root Directory: leave as `/`
6. Click **Deploy** ✅

---

## 🌐 Deploy to GitHub Pages

1. Push to GitHub repo
2. Go to repo **Settings → Pages**
3. Source: **Deploy from branch** → `main` → `/` (root)
4. Your site will be at `https://YOUR-USERNAME.github.io/REPO-NAME/`

---

## ✏️ Updating Episode Data

To add/edit/delete episodes, simply edit the `.txt` file in `data/` and push to GitHub.  
Vercel will automatically redeploy within seconds.
