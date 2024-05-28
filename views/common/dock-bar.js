function addDockBar() {
  const bar = document.createElement("form");
  bar.id = "dock-bar";
  bar.method = "GET";
  bar.action = "#";
  bar.innerHTML = `
    <div id="dock-actions">
      <div class="pin-search-bar row-actions form-field form-field-wrapper">
        <input
          name="reference"
          placeholder="Change Reference"
          type="text"
          autocomplete="off"
          class="fill pin-add-verse"
          title="Type References then press [ Enter ]"
        />
      </div>
    </div>`;

  document.body.appendChild(bar);
  return bar;
}

function createDockBar() {
  const bar = addDockBar();
  const input = $(".pin-add-verse", bar);
  input.addEventListener("focus", () => {
    bar.classList.add("focused");
  });
  input.addEventListener("blur", () => {
    bar.classList.remove("focused");
  });
  return bar;
}
