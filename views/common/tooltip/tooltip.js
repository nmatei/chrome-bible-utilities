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

function createContextMenu(id = "context-menu", destroyIfExist = false) {
  let menu = document.getElementById(id);
  if (menu) {
    if (destroyIfExist) {
      document.body.removeChild(menu);
    } else {
      return menu;
    }
  }
  menu = document.createElement("div");
  menu.id = "context-menu";
  menu.className = "context-menu";
  document.body.appendChild(menu);

  function bodyClick() {
    document.body.removeEventListener("click", bodyClick);
    setTimeout(() => {
      try {
        document.body.removeChild(menu);
      } catch (error) {}
    }, 10);
  }

  document.body.addEventListener("click", bodyClick);
  menu.addEventListener("click", bodyClick);

  return menu;
}

function getContextMenu(items, destroyIfExist = false) {
  const menu = createContextMenu("context-menu", destroyIfExist);

  const contentItems = items
    .map((item, i) => {
      if (item === "-") {
        return `<hr class="separator">`;
      } else if (typeof item === "string") {
        return `<div class="context-menu-title">${item}</div>`;
      }
      return `<button type="button" class="action-btn ${item.cls ? item.cls : ""}"
        ${item.onmouseenter ? `onmouseenter="${item.onmouseenter}"` : ""} 
        data-idx="${i}" data-id="${item.itemId || item.text}" ${item.disabled ? "disabled" : ""}>
          <span class='menu-icon'>${item.icon || ""}</span>
          <span class="action-btn-text">${item.text}</span>
          ${item.shortcut ? `<span class="key-code">${item.shortcut}</span>` : ""}
          ${item.rightIcon ? `<span class="menu-right-icon">${item.rightIcon}</span>` : ""}
        </button>`;
    })
    .join("");
  menu.innerHTML = `<div class="context-menu-layout">${contentItems}</div>`;

  menu.querySelectorAll(".action-btn").forEach(btn => {
    const idx = btn.dataset.idx; // index of the item in the items array
    if (!idx) {
      return;
    }
    const data = items[idx].data;
    if (data) {
      Object.keys(data).forEach(key => {
        btn.dataset[key] = data[key];
      });
    }
    if (items[idx].active) {
      btn.classList.add("active");
    }
  });

  menu.addEventListener("click", e => {
    e.stopPropagation();
    e.preventDefault();
    const btn = e.target.closest(".action-btn");
    if (btn) {
      const item = items[btn.dataset.idx];
      item.handler && item.handler(btn, item);
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
