// Loaded by the four map pages, after SiteInteractions.js. Everything behind the
// nav's Export button lives here, apart from the page and the model scripts.

// ---- IMAGE EXPORT ---------------------------------------------------------
// The nav's Export button: a PNG of the map exactly as it stands (colours, called
// states, zoom) under a title naming the view and the results bar, with the site
// and the time it was made in the bottom corners. Drawn onto a canvas by hand
// rather than captured: once the map's SVG is turned into an image the stylesheet
// no longer reaches it, so every shape gets its computed style written on first.
const EXPORT_BG = '#483d55';   // base.css's --maincolor, the neutral purple. The live
                               // variable slides toward blue or red with the result.
const EXPORT_WIDTH = 1600;     // layout units...
const EXPORT_SCALE = 2;        // ...drawn at two device pixels each, so text stays sharp
const EXPORT_PAD = 56;
const EXPORT_FONT = '"Josefin Sans", sans-serif';
const EXPORT_FAINT = 'rgba(255, 255, 255, 0.55)';

// States (or House districts) the user has called or given their own win chance
// since the current view loaded, in the order they were changed. The image notes
// them so an edited map is never passed off as the model's own. Kept up to date by
// the ADJUSTMENT TRACKING block further down.
const adjustedByUser = new Set();

// What the computed style has to carry across for the map to look the same.
// clip-path is how the Senate map splits a state that has two races.
const EXPORT_STYLE_PROPS = [
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
  'opacity', 'display', 'visibility', 'clip-path', 'clip-rule', 'vector-effect',
];

async function exportMapImage(button) {
  const idle = button.textContent;
  button.disabled = true;
  button.textContent = 'Exporting…';
  try {
    const view = describeView();
    const now = new Date();
    const canvas = await buildExportCanvas(view, now);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('The canvas produced no image.');
    downloadBlob(blob, exportFileName(view, now));
    button.textContent = idle;
  } catch (err) {
    console.error('Map export failed:', err);
    button.textContent = 'Export failed';
    setTimeout(() => { button.textContent = idle; }, 2500);
  } finally {
    button.disabled = false;
  }
}

// The image's title, read off the view selector. The year comes from the selected
// button; the election from the nearest data-export-election (the dashboard holds
// the page's own, and House overrides it for its presidential and incumbent views);
// the label from data-export-label or, failing that, the group the button sits in -
// a page of the selector, or on Governor the heading above its row.
function describeView() {
  const selected = document.querySelector('.view-select .button-container button.is-selected');
  const from = selected || document.querySelector('.dashboard');
  const nearest = (name) => {
    const holder = from && from.closest(`[data-export-${name}]`);
    return holder ? holder.getAttribute(`data-export-${name}`) : '';
  };

  let group = '';
  if (selected) {
    const page = selected.closest('.view-page');
    let heading = selected.parentElement.previousElementSibling;
    while (heading && !heading.matches('.view-title')) heading = heading.previousElementSibling;
    group = page ? page.dataset.title : (heading ? heading.textContent.trim() : '');
  }

  const year = selected ? (selected.textContent.match(/\d{4}(\s*-\s*\d{4})?/) || [''])[0] : '';
  const label = nearest('label') || group;
  const isModel = label === 'Model';
  // NAT is the dropdown's national row.
  const adjusted = [...adjustedByUser].map(name => name === 'NAT' ? 'National' : name);
  return {
    heading: [year.replace(/\s*-\s*/, '–'), nearest('election')].filter(Boolean).join(' '),
    // Once the user has changed anything it is no longer the model's own call.
    label: !isModel ? label : adjusted.length ? 'Prediction' : 'Model Prediction',
    note: adjusted.length ? `${adjusted.join(', ')} adjusted by user`
        : isModel ? 'Unadjusted model output' : 'No user adjustments',
  };
}

async function buildExportCanvas(view, now) {
  const svg = document.querySelector('.zoomspace svg.map');
  const bar = document.querySelector('.results-bar');   // the Governor map has none
  const HEADING = `700 56px ${EXPORT_FONT}`;
  const LABEL = `600 22px ${EXPORT_FONT}`;
  const COUNTS = `700 34px ${EXPORT_FONT}`;
  const BAR_HEIGHT = 64;

  // The canvas draws in whatever font has loaded, so make sure the site's has.
  await Promise.all([HEADING, LABEL, COUNTS].map(font => document.fonts.load(font)));

  const inner = EXPORT_WIDTH - EXPORT_PAD * 2;
  const map = await rasteriseMap(svg, inner);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Laid out top to bottom before anything is drawn, so the canvas can be sized
  // to fit. Text is placed by cap height, so the gaps are the gaps you see.
  const headingBase = EXPORT_PAD + capHeight(ctx, HEADING);
  const labelBase = headingBase + 32 + capHeight(ctx, LABEL);
  let y = labelBase + 34;
  const barTop = y;
  if (bar) y += BAR_HEIGHT + 28;
  const mapTop = y;
  const footBase = mapTop + map.height + 28 + capHeight(ctx, LABEL);

  // The note on what the user changed sits between the two corner labels when it
  // fits there, and otherwise starts a row of its own under them, wrapping as needed.
  const FOOT_LINE = 32;
  const date = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const stamp = `${date} · ${time}`;
  ctx.font = LABEL;
  const corner = Math.max(ctx.measureText('electionmap.lol').width, ctx.measureText(stamp).width);
  const fitsBetween = ctx.measureText(view.note).width <= inner - 2 * (corner + 32);
  const noteLines = fitsBetween ? [view.note] : wrapText(ctx, view.note, inner);
  const noteBase = fitsBetween ? footBase : footBase + FOOT_LINE;
  const height = Math.ceil(noteBase + (noteLines.length - 1) * FOOT_LINE + 40);

  canvas.width = EXPORT_WIDTH * EXPORT_SCALE;
  canvas.height = height * EXPORT_SCALE;
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

  ctx.fillStyle = EXPORT_BG;
  ctx.fillRect(0, 0, EXPORT_WIDTH, height);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.font = HEADING;
  ctx.fillText(view.heading, EXPORT_WIDTH / 2, headingBase);
  if (view.label) {
    ctx.font = LABEL;
    ctx.fillStyle = EXPORT_FAINT;
    ctx.letterSpacing = '4px';
    ctx.fillText(view.label.toUpperCase(), EXPORT_WIDTH / 2, labelBase);
    ctx.letterSpacing = '0px';
  }

  if (bar) drawResultsBar(ctx, bar, EXPORT_PAD, barTop, inner, BAR_HEIGHT, COUNTS);
  ctx.drawImage(map.image, EXPORT_PAD, mapTop, inner, map.height);

  ctx.font = LABEL;
  ctx.fillStyle = EXPORT_FAINT;
  ctx.textAlign = 'left';
  ctx.fillText('electionmap.lol', EXPORT_PAD, footBase);
  ctx.textAlign = 'right';
  ctx.fillText(stamp, EXPORT_WIDTH - EXPORT_PAD, footBase);
  ctx.textAlign = 'center';
  noteLines.forEach((line, i) => ctx.fillText(line, EXPORT_WIDTH / 2, noteBase + i * FOOT_LINE));

  return canvas;
}

// Splits text on spaces into lines no wider than maxWidth, in the current font.
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  text.split(' ').forEach(word => {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// The map as an image `width` layout units wide. It is styled in a copy parked off
// screen beside the original, so the same stylesheet rules reach it (House's
// .housemap ancestor included) but no hover does, and nothing on screen changes.
async function rasteriseMap(svg, width) {
  const box = svg.viewBox.baseVal;
  const height = width * box.height / box.width;

  const copy = svg.cloneNode(true);
  copy.querySelectorAll('.hovered').forEach(el => el.classList.remove('hovered'));
  copy.style.cssText = `position: fixed; left: -100000px; top: 0; width: ${svg.clientWidth}px;`;
  svg.after(copy);
  try {
    // Replaces the off-screen positioning on the copy itself too, as it should.
    [copy, ...copy.querySelectorAll('*')].forEach(el => {
      const computed = getComputedStyle(el);
      el.setAttribute('style', EXPORT_STYLE_PROPS
          .map(prop => `${prop}: ${computed.getPropertyValue(prop)}`).join('; '));
    });
  } finally {
    copy.remove();
  }
  copy.setAttribute('width', width * EXPORT_SCALE);
  copy.setAttribute('height', height * EXPORT_SCALE);

  const markup = new XMLSerializer().serializeToString(copy);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { image, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// The bar as it is on screen, segment by segment, stretched to the image's width.
function drawResultsBar(ctx, bar, x, y, width, height, countsFont) {
  const left = bar.getBoundingClientRect().left + bar.clientLeft;
  const scale = width / bar.clientWidth;
  const radius = 16;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.clip();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.275)';
  ctx.fillRect(x, y, width, height);
  bar.querySelectorAll('.color-segment').forEach(segment => {
    const part = segment.getBoundingClientRect();
    if (!part.width) return;
    ctx.fillStyle = getComputedStyle(segment).backgroundColor;
    // A hair wider than measured, so neighbouring segments never leave a seam.
    ctx.fillRect(x + (part.left - left) * scale, y, part.width * scale + 1, height);
  });
  // The 50/50 marker.
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width / 2, y + height);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.stroke();

  // The two counts, centred on the bar by their cap height.
  const count = (selector) => bar.querySelector(selector).textContent.trim();
  const base = y + (height + capHeight(ctx, countsFont)) / 2;
  ctx.save();
  ctx.font = countsFont;
  ctx.fillStyle = 'white';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 6;
  ctx.textAlign = 'left';
  ctx.fillText(count('.DemBarcount'), x + 28, base);
  ctx.textAlign = 'right';
  ctx.fillText(count('.RepBarcount'), x + width - 28, base);
  ctx.restore();
}

function capHeight(ctx, font) {
  ctx.font = font;
  return ctx.measureText('H').actualBoundingBoxAscent;
}

function exportFileName(view, now) {
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
      + `-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const slug = `${view.heading} ${view.label}`.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `electionmap-${slug}-${stamp}.png`;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Not revoked straight away: the browser may start the download after this returns.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- WIRING -----------------------------------------------------------------
// This file loads after SiteInteractions.js, so its load handler runs second: by the
// time the tracking below reads the win-chance box, the model's own Enter handler
// (wired up there) has already filled it in.
window.addEventListener('DOMContentLoaded', () => {
  const onClick = (id, handler) => {
    const element = document.getElementById(id);
    if (element) element.addEventListener('click', handler);
  };

  onClick('exportButton', (event) => exportMapImage(event.currentTarget));

  // ADJUSTMENT TRACKING - fills adjustedByUser for the export's note. A call, or a
  // win chance from Enter or the slider, changes whichever state the dropdown
  // names. Picking any view reloads that view's data, which undoes every change.
  const stateDropDown = document.getElementById('stateDropDown');
  const chanceInput = document.getElementById('numberInput');
  const noteAdjusted = () => {
    if (stateDropDown && stateDropDown.value) adjustedByUser.add(stateDropDown.value);
  };
  // Enter and the slider change nothing unless the box holds 0-100; the model
  // scripts copy the slider into the box before this reads it.
  const noteIfChanceSet = () => {
    const chance = chanceInput ? chanceInput.value : '';
    if (chance !== '' && chance >= 0 && chance <= 100) noteAdjusted();
  };
  onClick('callButtonD', noteAdjusted);
  onClick('callButtonR', noteAdjusted);
  onClick('enterButton', noteIfChanceSet);
  const chanceSlider = document.getElementById('sliderInput');
  if (chanceSlider) chanceSlider.addEventListener('change', noteIfChanceSet);
  document.querySelectorAll('.view-select .button-container button')
      .forEach(button => button.addEventListener('click', () => adjustedByUser.clear()));
});
