function createPromptEl(message, actions) {
  const el = document.createElement("div");
  el.id = "custom-prompt-container";
  el.innerHTML = `
    <form id="custom-prompt">
      <label for="custom-prompt-input">${message}</label>
      <div class="actions">
        ${actions.join("")} 
      </div>
    </form>`;
  return el;
}

export async function simplePrompt(message, _default, placeholder = "") {
  return new Promise(function (resolve) {
    const actions = [
      `<input type="text" id="custom-prompt-input" placeholder="${placeholder}" required>`,
      `<button type="submit">OK</button>`
    ];
    const el = createPromptEl(message, actions);
    document.body.appendChild(el);
    const input = $("#custom-prompt-input");
    input.focus();
    input.value = _default;
    $("#custom-prompt").addEventListener("submit", function (e) {
      e.preventDefault();
      const answer = input.value;
      document.body.removeChild(el);
      resolve(answer);
    });
  });
}

export function simpleConfirm(message) {
  return new Promise(function (resolve) {
    const actions = [
      '<div class="fill"></div>',
      `<button name="action" class="action-btn" type="submit" value="no">Cancel</button>`,
      `<button name="action" class="action-btn" type="submit" value="yes">OK</button>`
    ];
    const el = createPromptEl(message, actions);
    document.body.appendChild(el);
    const input = $("button", el);
    input.focus();
    $("#custom-prompt").addEventListener("submit", function (e) {
      e.preventDefault();
      const answer = e.submitter.value;
      document.body.removeChild(el);
      resolve(answer === "yes");
    });
  });
}

export function simpleAlert(message) {
  return new Promise(function (resolve) {
    const actions = [
      '<div class="fill"></div>',
      `<button name="action" class="action-btn" type="submit" value="yes">OK</button>`
    ];
    const el = createPromptEl(message, actions);
    document.body.appendChild(el);
    const input = $("button", el);
    input.focus();
    $("#custom-prompt").addEventListener("submit", function (e) {
      e.preventDefault();
      document.body.removeChild(el);
      resolve(true);
    });
  });
}
