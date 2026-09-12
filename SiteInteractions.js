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

// Ensure the script runs only after the document is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('SiteInteractions.js loaded successfully');

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
      console.log('Selected state:', stateAbbr);
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
          const column = svg.closest('.center-column');
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
          const widest = column.clientWidth
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
              // Only the House map styles this; see .housemap .map.deep-zoom in style.css.
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

  console.log('Site interactions initialized successfully');
});
