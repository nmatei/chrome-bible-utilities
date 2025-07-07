function addHelpBox() {
  const version = chrome.runtime.getManifest().version; // TODO test version
  const helpBox = document.createElement("div");
  helpBox.className = "info-fixed-box hide-view arrow-left";
  helpBox.id = "help-text-box";
  helpBox.innerHTML = `
    <h2 class="actions win-title">
      <span class="key-code">${icons.question}</span>
      <span class="fill">Help / Usage</span>
      <span class="app-version">[ v.${version} ]</span>
      <button type="button" class="action-btn" data-key="close" title="Close">${icons.close}</button>
    </h2>
    <div class="info-text-content-wrapper">
    <ul class="main-list">
      <li>
        <div class="title">
          <span class="displays actions row-actions">
            <button class="action-btn active">${icons.projectAll}</button>
          </span>
          <strong>Project selected verses</strong>
        </div>
        <ul>
          <li><strong class="key-code">Click</strong> on verse number to display it on projector (eg. <strong class="key-code key-code-padding">1</strong>)</li>
          <li><strong class="key-code">Up / Down / Left / Right</strong> arrows to navigate to next/preview verses</li>
          <li><strong class="key-code">${
            isMac ? "⌘" : "CTRL"
          } + Click</strong> to add verse to selection (multi select)</li>
          <li><strong class="key-code">Shift + Click</strong> to multi select between last selection</li>
          <li><strong class="key-code">ALT + Click</strong> on verse number or Pinned reference, <br/>to force project window to be on top (in case is not visible)</li>
          <li><strong class="key-code">ESC</strong> to show blank page (hide all selected verses)</li>
          <li><strong class="key-code">${
            isMac ? "⌃⌘F" : "F11"
          }</strong> to enter/exit fullscreen projector window (first focus it)</li>
        </ul>
        
        <li>
          <div class="title">
            <span class="displays actions row-actions">
              <button class="action-btn active">${icons.liveChat}</button>
            </span>
            <strong>Project "live text"</strong> (fast and simple slide)
          </div>
          <ul>
            <li>input any text to be projected (<a href="https://github.com/markedjs/marked" target="_blank">Markdown</a> format). <a href="https://raw.githubusercontent.com/nmatei/chrome-bible-utilities/master/screens/README.md" target="_blank">Examples</a></li>
            <li><strong class="key-code">${
              isMac ? "⌘" : "CTRL"
            } + Enter</strong> to project live text (inside title or textarea)</li>
          </ul>
        </li>
        
        <li>
          <div class="title">
            <span class="displays actions row-actions">
              <button class="action-btn active">${icons.lightFavorite}</button>
            </span>
            <strong>List/Pin some references</strong> (verses)
          </div>
          <ul>
            <li>
              <strong class="key-code example-btn">${icons.save}</strong> 
              Store references for future selection and project them faster
            </li>
            <li><strong class="key-code">Enter</strong> to add references 
              (<strong class="key-code key-code-padding">,</strong> or 
              <strong class="key-code key-code-padding">;</strong> as separator)
              in <strong class="key-code example-search">Add Ref's ${icons.lightSearch}</strong> input
            </li>
            <li><strong class="key-code">Enter + Enter</strong> to project added reference to List/Pin</li>
            <li><strong class="key-code">Shift + Enter</strong> to add and project full reference (Mat 6:7-13)</li>
            <li><strong class="key-code">${isMac ? "⌘" : "CTRL"} + Click</strong> project all verses from pin (Mat 6:7-13)</li>
            <li><strong class="key-code">ALT + Click</strong> on Reference - force project (on top)</li>
            <li>
              <strong class="key-code example-btn">${icons.edit}</strong>
              <strong>Edit All</strong> to Copy/Paste/Edit multiple References
            </li>
            <li>
              <strong class="key-code example-btn">${icons.add}</strong> 
              will pin current Reference if search input is empty</li>
            <li>
              <strong class="key-code">16</strong>, 
              <strong class="key-code">2-4</strong>, 
              <strong class="key-code">2:4</strong>, 
              <strong class="key-code">2 4</strong> + 
              <strong class="key-code">Enter</strong> pin current chapter or verses
            </li>
            <li><strong class="key-code">::</strong> <strong>drag & drop</strong> to reorder verses</li>
            <li>
              <strong class="key-code example-btn">${icons.lightMouse}</strong>
              <strong>Context menu</strong> (right click) for more actions inside pin list</li>
            <ul>
              <li><strong class="key-code example-btn">${
                icons.copyIcon
              }</strong> <strong>Copy</strong> all pin verses to clipboard</li>
              <li>
                <strong class="key-code example-btn">${icons.removeAll}</strong>
                Clear all
              </li>
            </ul>
            <li>
              <strong class="key-code example-search">Change Reference ${icons.lightSearch}</strong> 
              from Projector tab - works same as 
              <strong class="key-code example-search">Add Ref's <span>${icons.lightSearch}</span></strong>
            </li>
            <ul>
              <li><strong class="key-code">Tab</strong> inside projector tab to see bottom dock-bar</li>
              <li>
                <strong class="key-code example-btn">${icons.lightMouse}</strong> 
                move mouse at the bottom edge of projector tab
              </li>
              <li>Type any reference and use same shortcuts to project it <br />
                  (<strong class="key-code">Enter</strong> or <strong class="key-code">Shift + Enter</strong> for multiple verses)
              </li>
            </ul>
          </ul>
        </li>
        
        <li>
          <div class="title">
            <span class="displays actions row-actions">
              <button class="action-btn active">${icons.lightSettings}</button>
            </span>
            <strong>Settings</strong>
          </div>
          <ul>          
            <li>
              <div class="actions row-actions" style="display: inline-flex">
                <button class="action-btn screen-source scale-large" data-state="0" title="Don't display verses on this window">${
                  icons.screenSources
                }</button> 
                <button class="action-btn screen-source scale-large" data-state="2" title="Primary verses only">${
                  icons.screenSources
                }</button> 
                <button class="action-btn screen-source scale-large" data-state="1" title="Parallel verses only">${
                  icons.screenSources
                }</button> 
                <button class="action-btn screen-source scale-large" data-state="3" title="Primary & Parallel verses">${
                  icons.screenSources
                }</button> 
              </div>
              <ul>
                <li>Select which verses to be projected on this window (<strong>Primary / Parallel</strong>)</li>
                <li>
                  There are 2 windows available for projection
                  (<span class="screen-badge" data-display="1">Window</span> and 
                    <span class="screen-badge" data-display="2">Window</span>
                  ), <br />
                  each of them could project different content or none based on your needs.
                </li>
              </ul>
            </li>
            <li>
              <div class="title">
                <span class="displays actions row-actions">
                  <button class="action-btn active">${icons.lightSettings}</button>
                </span>
                Projector Screen Settings (Advanced / <strong>Slide master</strong>)
              </div>
              <ul>
                <li>
                  Try right click on settings slides to see more options (reorder, remove, etc)
                </li>
              </ul>
            </li>
          </ul>
        </li>
        
        <li>
          <div class="title">
            <span class="displays actions row-actions">
              <button class="action-btn active">${icons.lightMore}</button>
            </span>
            open <strong>Multiple browser tabs</strong> with different chapters
          </div>
          <ul>
            <li>all windows will project to the same projector page</li>
            <li>projector page will close automaticaly when all tabs from bible.com are closed</li>          
          </ul>
        </li>
        
        <li>
          <div class="title">
            <span class="displays actions row-actions">
              <button class="action-btn active">👋</button>
            </span>
            About this Project
          </div>
          <ul>
            <li>📃 External <a href="https://github.com/nmatei/chrome-bible-utilities/blob/master/README.md" target="_blank">README</a> & Screenshots</li>
            <li>👩‍💻 Source <a href="https://github.com/nmatei/chrome-bible-utilities" target="_blank">Code</a></li>
            <li>📩 Support <a href="https://github.com/nmatei/chrome-bible-utilities/issues" target="_blank">Tickets</a></li>
            <li>📈 <a href="https://nmatei.github.io/chrome-bible-utilities/release-notes" target="_blank" class="abp-badge">Release Notes</a> - see what are the latest fixes and features</li>
            <li>💚 <span style="color: #ff3d4d">Love this extension?</span> Share <a href="https://chromewebstore.google.com/detail/project-verses-from-bible/fklnkmnlobkpoiifnbnemdpamheoanpj" target="_blank">feedback</a> and help us make it even better!</li>
            <li>☽ Try <a href="https://chromewebstore.google.com/detail/night-mode-bible/ebiieffikaglhelcnogmmijmlejdhngk" target="_blank">Night mode</a> extension
          </ul>  
        </li>
      </li>
    </ul>
    </div>
  `;
  document.body.appendChild(helpBox);

  $("button[data-key='close']", helpBox).addEventListener("click", () => {
    $(`#project-actions button[data-key="help"]`).click();
  });

  return helpBox;
}
