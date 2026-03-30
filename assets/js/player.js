/* =============================================
   DRAMA PLUS — Player & SRT Engine
   ============================================= */

/**
 * parseTxtData(rawText)
 * Parses the drama .txt file into an array of episode objects:
 * [{ videoId: "ZjoKaASn78I", srt: "1\n00:00:01..." }, ...]
 */
function parseTxtData(rawText) {
  const episodes = [];
  // Split by episode blocks: video1="...", srt1="..."
  // We'll scan for all videoN keys and pair with srtN
  const videoRegex = /video(\d+)\s*=\s*"([^"]*)"/g;
  const srtRegex   = /srt(\d+)\s*=\s*"([\s\S]*?)"/g;

  const videos = {};
  const srts   = {};

  let m;
  while ((m = videoRegex.exec(rawText)) !== null) {
    videos[parseInt(m[1])] = m[2].trim();
  }
  while ((m = srtRegex.exec(rawText)) !== null) {
    srts[parseInt(m[1])] = m[2].trim();
  }

  const maxEp = Math.max(...Object.keys(videos).map(Number));
  for (let i = 1; i <= maxEp; i++) {
    episodes.push({
      num:     i,
      videoId: videos[i] || '',
      srt:     srts[i]   || ''
    });
  }
  return episodes;
}

/**
 * parseSRT(srtText)
 * Returns array of { start, end, text } in seconds.
 */
function parseSRT(srtText) {
  const blocks = srtText.trim().split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.trim().split('\n');
    if (lines.length < 2) return null;
    const timeLine = lines.find(l => l.includes('-->'));
    if (!timeLine) return null;
    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
    const toSec = ts => {
      const [hms, ms] = ts.replace(',', '.').split('.');
      const parts = hms.split(':').map(Number);
      return parts[0]*3600 + parts[1]*60 + parts[2] + parseFloat('0.' + (ms||'0'));
    };
    const text = lines.slice(lines.indexOf(timeLine)+1).join(' ').replace(/<[^>]+>/g, '');
    return { start: toSec(startStr), end: toSec(endStr), text };
  }).filter(Boolean);
}

/* ── Global player state ── */
window._dramaPlayer = {
  player:       null,
  srtCues:      [],
  subtitleBox:  null,
  rafId:        null,
  episodes:     [],
  currentEp:    null,
};

/* ── YouTube IFrame API ── */
if (!window._ytAPILoaded) {
  window._ytAPILoaded = true;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  window._ytReady = true;
  if (window._pendingVideoId) loadYouTubePlayer(window._pendingVideoId);
};

function loadYouTubePlayer(videoId) {
  if (!window._ytReady) { window._pendingVideoId = videoId; return; }
  window._pendingVideoId = null;
  const dp = window._dramaPlayer;

  if (dp.player) {
    dp.player.loadVideoById(videoId);
    return;
  }

  dp.player = new YT.Player('yt-player', {
    videoId,
    playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: e => { e.target.playVideo(); startSubtitleLoop(); },
      onStateChange: e => {
        if (e.data === YT.PlayerState.PLAYING) startSubtitleLoop();
        else stopSubtitleLoop();
      }
    }
  });
}

function startSubtitleLoop() {
  const dp = window._dramaPlayer;
  stopSubtitleLoop();
  dp.rafId = setInterval(() => {
    if (!dp.player || !dp.subtitleBox) return;
    const t = dp.player.getCurrentTime ? dp.player.getCurrentTime() : 0;
    const cue = dp.srtCues.find(c => t >= c.start && t <= c.end);
    dp.subtitleBox.textContent = cue ? cue.text : '';
  }, 300);
}

function stopSubtitleLoop() {
  clearInterval(window._dramaPlayer.rafId);
}

/**
 * initDramaPage(config)
 * Called from each drama HTML page.
 * config = { txtFile: 'path/to/data.txt', coverImg: 'url', title: 'Drama Name' }
 */
async function initDramaPage(config) {
  const dp = window._dramaPlayer;
  dp.subtitleBox = document.getElementById('subtitle-box');

  const coverEl    = document.getElementById('video-cover');
  const playerWrap = document.getElementById('player-wrapper');
  const epGrid     = document.getElementById('episodes-grid');
  const loadingEl  = document.getElementById('ep-loading');

  // Load txt data
  try {
    const res  = await fetch(config.txtFile);
    const text = await res.text();
    dp.episodes = parseTxtData(text);
  } catch (e) {
    if (loadingEl) loadingEl.textContent = 'تعذّر تحميل بيانات الحلقات.';
    return;
  }

  if (loadingEl) loadingEl.remove();

  // Build episode buttons
  dp.episodes.forEach((ep, idx) => {
    const btn = document.createElement('button');
    btn.className = 'ep-btn';
    btn.textContent = 'الحلقة ' + ep.num;
    btn.addEventListener('click', () => playEpisode(idx, btn));
    epGrid.appendChild(btn);
  });

  // Cover click → play first episode
  if (coverEl) {
    coverEl.addEventListener('click', () => {
      const firstBtn = epGrid.querySelector('.ep-btn');
      if (firstBtn) firstBtn.click();
    });
  }

  function playEpisode(idx, btn) {
    const ep = dp.episodes[idx];
    dp.currentEp = idx;
    dp.srtCues   = parseSRT(ep.srt);

    // Show player, hide cover
    if (coverEl) coverEl.closest('.video-cover-wrap').style.display = 'none';
    if (playerWrap) playerWrap.style.display = 'block';

    // Active button style
    document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Reset subtitle
    if (dp.subtitleBox) dp.subtitleBox.textContent = '📝 الترجمة ستظهر هنا...';

    // Load YouTube
    loadYouTubePlayer(ep.videoId);
  }
}
