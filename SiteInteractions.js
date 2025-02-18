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
  const zoomElement = document.querySelector('.zoomspace');
  let zoom = 1;
  const ZOOM_SPEED = 0.2;
  let translateX = 0, translateY = 0;
  let isDragging = false;
  let startX, startY;

  document.getElementById('Zoomin').addEventListener('click', () => {
      if (zoom < 8) {
          zoom += ZOOM_SPEED;
          updateTransform();
      }
  });

  document.getElementById('Zoomout').addEventListener('click', () => {
      if (zoom > 1) {
          zoom -= ZOOM_SPEED;
          updateTransform();
      }
  });

  document.getElementById('Resetview').addEventListener('click', () => {
      zoom = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
  });

  function updateTransform() {
      zoomElement.style.transform = `scale(${zoom}) translate(${translateX}px, ${translateY}px)`;
  }

  // Dragging functionality
  zoomElement.addEventListener('mousedown', (e) => {
      if (zoom > 1) {
          isDragging = true;
          startX = e.clientX - translateX;
          startY = e.clientY - translateY;
      }
  });

  document.addEventListener('mousemove', (e) => {
      if (isDragging && zoom > 1) {
          translateX = e.clientX - startX;
          translateY = e.clientY - startY;
          updateTransform();
      }
  });

  document.addEventListener('mouseup', () => {
      isDragging = false;
  });

  console.log('Site interactions initialized successfully');
});
