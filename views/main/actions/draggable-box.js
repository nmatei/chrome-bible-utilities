// Info boxes (Live Text, Help) can be dragged by their title (.drag-handle) away from the toolbar.
//   The custom position is per browser (localStorage, not chrome.storage);
//   dropping it back next to its toolbar button re-docks it (arrow-left + no stored position).
const dockDistance = 50;

function getBoxPositionKey(box) {
  return `${box.id}-position`;
}

function getBoxPosition(box) {
  try {
    return JSON.parse(localStorage.getItem(getBoxPositionKey(box)));
  } catch (e) {
    return null;
  }
}

function setBoxPosition(box, position) {
  if (position) {
    localStorage.setItem(getBoxPositionKey(box), JSON.stringify(position));
  } else {
    localStorage.removeItem(getBoxPositionKey(box));
  }
}

// the docked position (same as showBoxBy for an arrow-left box)
function getBoxDockPosition(btn) {
  const rect = btn.getBoundingClientRect();
  return {
    left: rect.right + 10,
    top: rect.top + rect.height / 2 - 17
  };
}

function isNearBoxDock(btn, left, top) {
  const dock = getBoxDockPosition(btn);
  return Math.hypot(left - dock.left, top - dock.top) < dockDistance;
}

// keep at least the title reachable when the window got smaller
function clampBoxPosition(box, { left, top }) {
  const maxLeft = window.innerWidth - Math.min(box.offsetWidth || 100, 100);
  const maxTop = window.innerHeight - 40;
  return {
    left: Math.max(0, Math.min(left, maxLeft)),
    top: Math.max(0, Math.min(top, maxTop))
  };
}

function setDropZoneActive(box, btn, active) {
  box.classList.toggle("dock-preview", active);
  $("#project-actions").classList.toggle("drop-zone", active);
  btn.classList.toggle("drop-target", active);
}

/**
 * Position a box next to its toolbar button, or at its stored (dragged) position.
 */
function positionBox(box, btn) {
  const position = box.classList.contains("draggable-box") && getBoxPosition(box);
  if (position) {
    const { left, top } = clampBoxPosition(box, position);
    box.style.left = left + "px";
    box.style.top = top + "px";
    box.classList.remove("arrow-left");
  } else {
    if (box.classList.contains("draggable-box")) {
      box.classList.add("arrow-left");
    }
    showBoxBy(box, btn);
  }
}

/**
 * @param {HTMLElement} box - .info-fixed-box with an id (the storage key) and a .drag-handle title
 * @param {string} key - its toolbar button data-key (eg. live-text / help)
 */
function initDraggableBox(box, key) {
  const handle = $(".drag-handle", box);
  const getBtn = () => $(`#project-actions button[data-key="${key}"]`);
  let drag = null;

  box.classList.add("draggable-box");

  handle.addEventListener("pointerdown", e => {
    if (e.button !== 0 || e.target.closest("button, a")) {
      return;
    }
    e.preventDefault();
    const rect = box.getBoundingClientRect();
    drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, moved: false, btn: getBtn() };
    handle.setPointerCapture(e.pointerId);
    box.classList.add("dragging");
  });

  handle.addEventListener("pointermove", e => {
    if (!drag) {
      return;
    }
    const left = e.clientX - drag.dx;
    const top = e.clientY - drag.dy;
    drag.moved = true;
    box.style.left = left + "px";
    box.style.top = top + "px";
    const nearDock = isNearBoxDock(drag.btn, left, top);
    // arrow-left only while it is (or would be) docked
    box.classList.toggle("arrow-left", nearDock);
    setDropZoneActive(box, drag.btn, nearDock);
  });

  const endDrag = () => {
    if (!drag) {
      return;
    }
    const { moved, btn } = drag;
    drag = null;
    box.classList.remove("dragging");
    setDropZoneActive(box, btn, false);
    if (!moved) {
      return;
    }
    const left = parseFloat(box.style.left);
    const top = parseFloat(box.style.top);
    if (isNearBoxDock(btn, left, top)) {
      setBoxPosition(box, null);
    } else {
      setBoxPosition(box, clampBoxPosition(box, { left, top }));
    }
    positionBox(box, btn);
  };
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
}
