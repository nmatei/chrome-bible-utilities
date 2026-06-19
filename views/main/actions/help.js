function addHelpBox() {
  const version = chrome.runtime.getManifest().version; // TODO test version
  const helpBox = document.createElement("div");
  helpBox.className = "info-fixed-box hide-view arrow-left";
  helpBox.id = "help-text-box";
  helpBox.innerHTML = `
    <h2 class="actions win-title">
      <span class="key-code">${icons.question}</span>
      <span class="fill">Help / Usage</span>
      <a class="app-version abp-badge" title="Release Notes" href="https://nmatei.github.io/chrome-bible-utilities/release-notes" target="_blank">[ v.${version} ]</a>
      <button type="button" class="action-btn" data-key="close" title="Close">${icons.close}</button>
    </h2>
    <div class="info-text-content-wrapper">
    ${getHelpContent()}
    </div>
  `;
  document.body.appendChild(helpBox);

  $("button[data-key='close']", helpBox).addEventListener("click", () => {
    $(`#project-actions button[data-key="help"]`).click();
  });

  return helpBox;
}
