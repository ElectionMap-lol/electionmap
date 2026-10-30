// Display only: round a number to two decimal places for the hover box.
// Non-numbers (candidate names, blank polling data) are passed through untouched.
// Never use this for calculations - it returns a string.
function formatStat(value) {
  return typeof value === 'number' && isFinite(value) ? value.toFixed(2) : value;
}

// ---- SITE BACKGROUND ------------------------------------------------------
// The page colour tracks the result: the site's own purple at a dead heat, sliding
// to solid blue or solid red as one side approaches the margin that page treats as
// a blowout. `lean` runs -1 (Republican) to +1 (Democratic).
//
// This replaces a `pollingAverage` ladder that never worked: the variable was set to
// 0, never updated, and read once at script load, so every page just painted the
// neutral middle of the scale forever.
const RESULT_BLUE = [41, 48, 141];
const RESULT_NEUTRAL = [87, 50, 73];
const RESULT_RED = [137, 37, 37];

function paintResultBackground(lean) {
  const t = Math.max(-1, Math.min(1, Number(lean) || 0));
  const target = t >= 0 ? RESULT_BLUE : RESULT_RED;
  // Same two tints the stylesheet has always used, just derived from the new colour.
  const shade = (darken) => RESULT_NEUTRAL
      .map((base, i) => Math.round((base + (target[i] - base) * Math.abs(t)) * (1 - darken)))
      .join(', ');

  const root = document.documentElement.style;
  root.setProperty('--maincolor', `rgb(${shade(0)})`);
  root.setProperty('--main2color', `rgb(${shade(0.1)})`);
  root.setProperty('--main3color', `rgb(${shade(0.275)})`);
}

// Where a seat or electoral-vote count sits between a dead heat and a blowout.
function resultLean(demCount, deadHeat, blowout) {
  return (Number(demCount) - deadHeat) / (blowout - deadHeat);
}

// The neutral starting colour, painted before any CSV has landed. Each map page
// used to carry its own copy of this as `setBackgroundColor`, driven by the dead
// `pollingAverage` ladder described above.
setBackgroundColor();

function setBackgroundColor() {
  paintResultBackground(0);
}

// ---- COLOUR TINTS ---------------------------------------------------------
// Derives --main2color and --main3color from whatever --maincolor currently is.
// paintResultBackground sets all three itself; these two exist for the older
// path where a page assigns --maincolor directly and needs the tints to follow.
// Both were duplicated verbatim in all four model files - mixColors five times
// over, because senateModel defined it twice.
function mixColors(baseColor, tint, weight) {
  const base = baseColor.match(/\d+/g).map(Number);
  const tintColor = tint.match(/\d+/g).map(Number);

  const mixed = base.map((c, i) => Math.round(c * (1 - weight) + tintColor[i] * weight));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

function updateTintedColors() {
  const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--maincolor').trim();
  const tint1 = 'rgba(0, 0, 0, 0.1)';   // 10% darker
  const tint2 = 'rgba(0, 0, 0, 0.275)'; // 27.5% darker

  document.documentElement.style.setProperty('--main2color', mixColors(mainColor, tint1, 0.1));
  document.documentElement.style.setProperty('--main3color', mixColors(mainColor, tint2, 0.275));
}

// ---- HOVER TOOLTIP POSITION ----------------------------------------------
// Follows the cursor. Which state is under it, and what the box says, stays with
// each map's own model script - those differ per race. This half does not.
window.addEventListener('mousemove', (e) => {
  const box = document.getElementById('details-box');
  if (!box) return;
  box.style.top = (e.clientY + 20) + 'px';
  box.style.left = e.clientX + 'px';
});

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

// Ensure the script runs only after the document is fully loaded
window.addEventListener('DOMContentLoaded', () => {

  // STATE LAYERING FIX
  const statePaths = document.querySelectorAll('path');

  function handleMouseOver(event) {
      const stateElement = event.target;
      d3.select(stateElement).raise();
      stateElement.classList.add('hovered');
  }

  function handleMouseOut(event) {
      const stateElement = event.target;
      stateElement.classList.remove('hovered');
  }

  function handleStateClick(event) {
      const stateAbbr = event.target.id;
      bringStateToFront(stateAbbr);
  }

  statePaths.forEach(path => {
      path.addEventListener('mouseover', handleMouseOver);
      path.addEventListener('mouseout', handleMouseOut);
      path.addEventListener('click', handleStateClick);
  });

  function bringStateToFront(stateAbbr) {
      const stateElement = document.getElementById(stateAbbr);
      if (stateElement) {
          d3.select(stateElement).raise();
      }
  }

  // CLICK A STATE TO PICK IT
  // Clicking a state (or House district) picks it in the Call State dropdown, so
  // you can click Texas, call it, click the next one and so on. The model scripts
  // colour the map by these same ids, so a shape's id is its option. Listened for
  // on the map rather than on each path: the Senate map adds a shape of its own
  // after load for the second race in a state that has two.
  //
  // A press and release on the same shape, not a 'click': the hover raise above
  // re-inserts the path, and when that lands mid-press (always, on a tap) Chrome
  // drops the click entirely. A press that moves more than a few pixels is a pan.
  const stateDropDown = document.getElementById('stateDropDown');
  const PICK_SLOP = 4;
  document.querySelectorAll('.zoomspace svg.map').forEach(map => {
      let pressed = null;
      map.addEventListener('pointerdown', (event) => {
          const shape = event.target.closest('path[id]');
          pressed = shape ? { id: shape.id, x: event.clientX, y: event.clientY } : null;
      });
      map.addEventListener('pointerup', (event) => {
          const start = pressed;
          pressed = null;
          const shape = event.target.closest('path[id]');
          if (!stateDropDown || !start || !shape || shape.id !== start.id) return;
          if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > PICK_SLOP) return;
          const option = [...stateDropDown.options].find(o => o.value === shape.id);
          if (!option) return;
          stateDropDown.value = option.value;
          stateDropDown.dispatchEvent(new Event('change', { bubbles: true }));
      });
  });

  // VIEW SELECTOR
  // Model and Actual Results are two pages of one control, not two lists: only
  // one view across both is ever active, so they share a single highlight. The
  // arrows flip between pages; each page shows all of its own buttons.
  const pages = [...document.querySelectorAll('.view-page')];
  const viewTitle = document.getElementById('viewTitle');
  // By container rather than by #model / #results: the House map splits its result
  // buttons across two pages, and the Governor map has no pages at all.
  const viewButtons = [...document.querySelectorAll('.view-select .button-container button')];

  // The highlight is useful even without a switcher (Governor shows all its
  // buttons at once), so it is not gated on there being pages to flip between.
  if (viewButtons.length) {
      const select = (button) => {
          viewButtons.forEach(other => other.classList.toggle('is-selected', other === button));
      };
      viewButtons.forEach(button => button.addEventListener('click', () => select(button)));
      select(viewButtons[0]);
  }

  if (pages.length > 1 && viewTitle) {
      // Any number of pages: the House map will want Model / House / Pres.
      let current = 0;
      const showPage = (index) => {
          current = (index + pages.length) % pages.length;
          pages.forEach((page, i) => {
              page.style.transform = `translateX(${-current * 100}%)`;
              page.setAttribute('aria-hidden', String(i !== current));
          });
          viewTitle.textContent = pages[current].dataset.title;
      };

      onClick('viewPrev', () => showPage(current - 1));
      onClick('viewNext', () => showPage(current + 1));
      showPage(0);
  }

  // BUTTON WIRING
  // Each button says in the markup which view it loads; this hands that to the
  // page's own model script. Previously all four model files carried a block
  // listing every button by id and attaching a listener - about 130 lines that
  // said nothing the HTML did not already know. The Governor page also had ids
  // copied from the President page, so its year buttons had silently done
  // nothing until those were corrected.
  //
  // The handlers themselves stay in the model scripts. They are function
  // declarations in classic scripts, so they hang off window by the time this
  // runs; a page that does not define one simply has no button carrying it.
  const callHandler = (name, arg) => {
      const fn = window[name];
      if (typeof fn !== 'function') {
          console.warn(`No ${name} on this page; button ignored.`);
          return;
      }
      arg === undefined ? fn() : fn(arg);
  };

  const ACTION_HANDLERS = {
      enter:     'handleClickEnterButton',
      callD:     'handleClickCallButtonD',
      callR:     'handleClickCallButtonR',
      incumbent: 'handleClickIncumbent',
  };

  document.querySelectorAll('[data-model]').forEach(button => {
      button.addEventListener('click', () => callHandler('handleClick', button.dataset.model));
  });

  document.querySelectorAll('[data-results]').forEach(button => {
      button.addEventListener('click', () => callHandler('handleClickResults', button.dataset.results));
  });

  document.querySelectorAll('[data-action]').forEach(button => {
      const handler = ACTION_HANDLERS[button.dataset.action];
      if (handler) button.addEventListener('click', () => callHandler(handler));
  });

  // EXPORT - see exportMapImage above. Only the map pages have the button.
  onClick('exportButton', (event) => exportMapImage(event.currentTarget));

  // ADJUSTMENT TRACKING - fills adjustedByUser for the export's note. A call, or a
  // win chance from Enter or the slider, changes whichever state the dropdown
  // names. Picking any view reloads that view's data, which undoes every change.
  // These listeners are added after the model scripts' own, so they run second.
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
  viewButtons.forEach(button => button.addEventListener('click', () => adjustedByUser.clear()));

  // ZOOM AND PAN
  // d3.zoom drives this: one code path covers mouse drag, touch drag and pinch.
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 20;
  const ZOOM_STEP = 1.6;   // multiplier per button press, not an additive jump
  const MAP_MARGIN = 0.03; // breathing room around the map at 1x, as a share of its size
  // The zoom buttons step 1, 1.6, 2.56, 4.1, 6.6, 10.5, 16.8, 20. This sits between the
  // 6th and 7th, so it marks the top two steps - where the House map thins its strokes.
  const DEEP_ZOOM = 12;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  document.querySelectorAll('.zoomspace svg.map').forEach(setUpZoom);

  function setUpZoom(svg) {
      // d3.zoom transforms one element, but the map paths are direct children of
      // the <svg> and some carry their own transform. Move them into a group so we
      // never touch a path's own transform.
      let layer = svg.querySelector('g.zoomlayer');
      if (!layer) {
          layer = document.createElementNS(SVG_NS, 'g');
          layer.setAttribute('class', 'zoomlayer');
          while (svg.firstChild) layer.appendChild(svg.firstChild);
          svg.appendChild(layer);
      }

      // Without this the browser claims the pinch and pans the whole page instead.
      svg.style.touchAction = 'none';

      // Frame the map on what it actually draws, plus a margin, so at 1x the country
      // has room to breathe instead of touching the border. The margin lives in the
      // viewBox rather than in CSS padding, so it scales away as you zoom in and the
      // map still fills the frame edge to edge.
      //
      // Anything drawn outside the file's own viewBox is there deliberately but meant
      // to stay cropped - the House map hides magnified Los Angeles and Chicago inset
      // callouts off to the right that way - so never widen the frame past it.
      const crop = svg.viewBox.baseVal;
      const cropRight = crop.x + crop.width;
      const cropBottom = crop.y + crop.height;
      const content = layer.getBBox();
      const contentRight = content.x + content.width;
      const contentBottom = content.y + content.height;

      const margin = Math.max(
          Math.min(contentRight, cropRight) - Math.max(content.x, crop.x),
          Math.min(contentBottom, cropBottom) - Math.max(content.y, crop.y),
      ) * MAP_MARGIN;

      const left = content.x < crop.x ? crop.x : content.x - margin;
      const top = content.y < crop.y ? crop.y : content.y - margin;
      const right = contentRight > cropRight ? cropRight : contentRight + margin;
      const bottom = contentBottom > cropBottom ? cropBottom : contentBottom + margin;
      const framed = { x: left, y: top, width: right - left, height: bottom - top };

      svg.setAttribute('viewBox', `${framed.x} ${framed.y} ${framed.width} ${framed.height}`);

      // Now that the map has the full width the old right column used to take, its
      // proportional height can exceed the column and get clipped at the bottom.
      // Size the frame to whichever of width or height runs out first, and hand the
      // same width to the results bar so the two line up.
      const fitFrame = () => {
          const frame = svg.closest('.map-viewbox');
          const column = svg.closest('.dashboard-main');
          // The Governor map has no results bar. Bailing out here left its map
          // width unset, so it fell back to full width and ran off the bottom.
          const bar = column && column.querySelector('.results');
          const barHeight = bar ? bar.offsetHeight : 0;
          if (!frame || !column) return;

          // Stacked on a phone the map is width-driven; the stylesheet handles that.
          if (window.matchMedia('(max-width: 960px)').matches) {
              column.style.removeProperty('--map-width');
              return;
          }

          // Bounded by height as well as width. Filling the width makes the map
          // taller than the viewport and cuts the bottom off, so whichever runs
          // out first wins; the bar above is given the same width to match.
          const columnStyle = getComputedStyle(column);
          // Measured from the viewport, not from the column: the column stretches to
          // fit whatever the frame needs, so reading its height here would just hand
          // back the size we are trying to constrain and the clamp would never bite.
          const columnTop = column.getBoundingClientRect().top + window.scrollY;
          const inner = window.innerHeight - columnTop
              - parseFloat(columnStyle.paddingTop) - parseFloat(columnStyle.paddingBottom);
          const spare = inner - barHeight - (bar ? (parseFloat(columnStyle.rowGap) || 0) : 0);

          const border = frame.offsetWidth - frame.clientWidth;   // the dotted frame itself
          const aspect = framed.width / framed.height;
          // Measured from the dashboard minus the rail, not from the column. The
          // column now shrinks to hug the map, so reading its width here would feed
          // the answer back into the question and ratchet the map smaller each pass.
          const dashboard = column.closest('.dashboard');
          const rail = dashboard && dashboard.querySelector('.dashboard-rail');
          const outer = dashboard ? dashboard.clientWidth : column.clientWidth;
          // Same trap with the rail: it grows into whatever width the map leaves
          // spare, so it is measured with the map unfitted, back at its base share.
          // Measured grown, the map could never widen again on a later resize.
          column.style.removeProperty('--map-width');
          const railWidth = rail ? rail.getBoundingClientRect().width : 0;
          const widest = outer - railWidth
              - parseFloat(columnStyle.paddingLeft) - parseFloat(columnStyle.paddingRight);

          column.style.setProperty('--map-width',
              Math.max(0, Math.min(widest, (spare - border) * aspect + border)) + 'px');
      };

      fitFrame();
      window.addEventListener('resize', fitFrame);

      // Keep the map inside its own frame: at 1x it cannot move, and zoomed in it
      // stops at the edges rather than drifting off into empty space.
      // extent must be set explicitly: d3 4.13 defaults it to the element's pixel
      // size, but d3.mouse() reports viewBox units, so the two disagree and the
      // bounds come out wrong (badly so when viewBox x/y aren't 0).
      const bounds = [[framed.x, framed.y], [framed.x + framed.width, framed.y + framed.height]];

      const target = d3.select(svg);
      const zoom = d3.zoom()
          .scaleExtent([MIN_ZOOM, MAX_ZOOM])
          .extent(bounds)
          .translateExtent(bounds)
          .clickDistance(4)   // a drag must not register as picking a state
          .filter(() => {
              // Plain wheel still scrolls the page; ctrl/cmd + wheel zooms the map.
              if (d3.event.type === 'wheel') return d3.event.ctrlKey || d3.event.metaKey;
              return !d3.event.button;
          })
          .on('zoom', () => {
              layer.setAttribute('transform', d3.event.transform);
              // Only the House map styles this; see .housemap .map.deep-zoom in css/maps.css.
              svg.classList.toggle('deep-zoom', d3.event.transform.k >= DEEP_ZOOM);
          });

      target.call(zoom);

      // Applied straight away rather than through a d3 transition: a transition only
      // advances while requestAnimationFrame is running, so in a background or
      // throttled tab the buttons would silently do nothing and queue up instead.
      onClick('Zoomin', () => target.call(zoom.scaleBy, ZOOM_STEP));
      onClick('Zoomout', () => target.call(zoom.scaleBy, 1 / ZOOM_STEP));
      onClick('Resetview', () => target.call(zoom.transform, d3.zoomIdentity));
  }

  function onClick(id, handler) {
      const button = document.getElementById(id);
      if (button) button.addEventListener('click', handler);
  }

});
