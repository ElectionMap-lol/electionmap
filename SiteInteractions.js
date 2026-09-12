// Display only: round a number to two decimal places for the hover box.
// Non-numbers (candidate names, blank polling data) are passed through untouched.
// Never use this for calculations - it returns a string.
function formatStat(value) {
  return typeof value === 'number' && isFinite(value) ? value.toFixed(2) : value;
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
