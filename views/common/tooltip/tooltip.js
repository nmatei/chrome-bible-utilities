function showByCursor(el, e, offsets = [0, 0]) {
  let left = e.clientX + offsets[0];
  let top = e.clientY + offsets[1];
  let outside = false;
  setPosition(el, left, top);
  el.style.display = "block";
  if (top + el.offsetHeight > window.innerHeight) {
    outside = true;
    top -= el.offsetHeight;
  }
  if (left + el.offsetWidth > window.innerWidth) {
    outside = true;
    left -= el.offsetWidth;
  }
  if (outside) {
    setPosition(el, left, top);
  }
}

function setPosition(el, left, top) {
  el.style.left = left + "px";
  el.style.top = top + "px";
}

function showBy(el, target, offsets = [0, 0], align = "bottom") {
  el.style.display = "block";
  const bounds = target.getBoundingClientRect();
  let left = bounds.x;
  let top = bounds.y;
  if (align === "top") {
    top -= el.offsetHeight;
  } else {
    top += bounds.height;
  }
  setPosition(el, left + offsets[0], top + offsets[1]);
}

function createContextMenu(id = "context-menu") {
  let menu = document.getElementById(id);
  if (menu) {
    return menu;
  }
  menu = document.createElement("div");
  menu.id = "context-menu";
  menu.className = "context-menu";
  document.body.appendChild(menu);

  function bodyClick() {
    document.body.removeEventListener("click", bodyClick);
    setTimeout(() => {
      document.body.removeChild(menu);
    }, 10);
  }

  document.body.addEventListener("click", bodyClick);
  menu.addEventListener("click", bodyClick);

  return menu;
}

function getContextMenu(items) {
  const menu = createContextMenu("context-menu");

  const contentItems = items
    .map((item, i) => {
      if (item === "-") return `<hr class="separator">`;
      return `<button type="button" class="action-btn ${item.cls ? item.cls : ""}"
        ${item.onmouseenter ? `onmouseenter="${item.onmouseenter}"` : ""} 
        data-idx="${i}" data-id="${item.itemId}">
          <span class='menu-icon'>${item.icon || ""}</span>
          <spam class="action-btn-text">${item.text}</spam>
        </button>`;
    })
    .join("");
  menu.innerHTML = `<div class="context-menu-layout">${contentItems}</div>`;

  menu.addEventListener("click", e => {
    e.stopPropagation();
    e.preventDefault();
    const btn = e.target.closest(".action-btn");
    if (btn) {
      const item = items[btn.dataset.idx];
      item.handler && item.handler(btn);
    }
  });
  // setTimeout(() => {
  //   menu.querySelector(".action-btn").focus();
  // }, 200);
  return menu;
}

function createTooltip(id, arrow = "arrow-down") {
  let element = document.getElementById(id);
  if (element) {
    return element;
  }
  element = document.createElement("div");
  element.id = id;
  element.className = `context-menu ${arrow}`;
  document.body.appendChild(element);

  element.addEventListener("click", e => {
    e.stopPropagation();
  });
  return element;
}

function getTooltip(items, arrow = "arrow-down") {
  const element = createTooltip("extension-tooltip");
  element.className = `context-menu ${arrow}`;
  element.innerHTML = items.join("");
  return element;
}
