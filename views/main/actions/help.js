function addHelpBox() {
  const helpBox = document.createElement("div");
  helpBox.className = "info-fixed-box hide-view arrow-left";
  helpBox.id = "help-text-box";
  helpBox.innerHTML = `
    <h2><span class="key-code">❔</span> Help / Usage</h2>
    <div class="info-text-content-wrapper">
    <ul>
      <li>
        <div class="title">🔤 <strong>Project selected verses</strong></div>
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
          <div class="title"><strong class="key-code">💬</strong> <strong>Project "live text"</strong> (fast and simple slide)</div>
          <ul>
            <li>input any text to be projected (<a href="https://github.com/markedjs/marked" target="_blank">Markdown</a> format). <a href="https://raw.githubusercontent.com/nmatei/chrome-bible-utilities/master/screens/README.md" target="_blank">Examples</a></li>
            <li><strong class="key-code">${
              isMac ? "⌘" : "CTRL"
            } + Enter</strong> to project live text (inside title or textarea)</li>
          </ul>
        </li>
        <li>
          <div class="title"><strong class="key-code">📌</strong> <strong>List/Pin some references</strong> (verses)</div>
          <ul>
            <li><strong class="key-code">💾</strong> Store references for future selection and project them faster</li>
            <li><strong class="key-code">Enter</strong> to add references 
              (<strong class="key-code key-code-padding">,</strong> or 
              <strong class="key-code key-code-padding">;</strong> as separator)
              in <strong class="key-code">Add Ref's 🔍</strong> input
            </li>
            <li><strong class="key-code">Enter + Enter</strong> to project added reference to List/Pin</li>
            <li><strong class="key-code">ALT + Click</strong> on Reference - force project (on top)</li>
            <li><strong class="key-code">CTRL + Click</strong> project all verses from pin (Mat 6:7-13)</li>
            <li><strong class="key-code">📝</strong> <strong>Edit All</strong> to Copy/Paste/Edit multiple References</li>
            <li><strong class="key-code">➕</strong> will pin current Reference if search input is empty</li>
            <li>
              <strong class="key-code">16</strong>, 
              <strong class="key-code">2-4</strong>, 
              <strong class="key-code">2:4</strong>, 
              <strong class="key-code">2 4</strong> + 
              <strong class="key-code">Enter</strong> pin current chapter or verses
            </li>
            <li><strong class="key-code">::</strong> <strong>drag & drop</strong> to reorder verses</li>
            <li><strong class="key-code">🖱</strong> <strong>Context menu</strong> (right click) for more actions inside pin list</li>
            <ul>
              <li><strong class="key-code" style="display: inline-block;padding: 0 0.3rem; vertical-align: middle;">${copyIcon}</strong> <strong>Copy</strong> all pin verses to clipboard</li>
              <li><strong class="key-code">✖</strong> Clear all</li>
            </ul>
          </ul>
        </li>
        <li>
          <div class="title"><strong class="key-code">🛠</strong> <strong>Settings</strong></div>
          <ul>          
            <li>
              <div class="displays actions row-actions" style="display: inline">
                <button class="action-btn">1️⃣</button> 
                <button class="action-btn active">2️⃣</button>
              </div> 
              Toggle [ OFF / ON ] Display for <strong>Primary / Parallel</strong> Chapter. <br />
              If both are off, no verses will be projected (toggles are saved)
            </li>
            <li><span class="displays actions row-actions" style="display: inline"><button class="action-btn active">🛠</button></span> Projector Screen Settings (Advanced)</li>
          </ul>
        </li>
        <li>
          <div class="title">2️⃣ open <strong>Multiple chrome tabs</strong> with different chapters</div>
          <ul>
            <li>all windows will project to the same projector page</li>
            <li>projector page will close automaticaly when all tabs from bible.com are closed</li>          
          </ul>
        </li>
        <li>
          <div class="title">👋 GitHub Project</div>
          <ul>
            <li>📃 External <a href="https://github.com/nmatei/chrome-bible-utilities/blob/master/README.md" target="_blank">README</a> & Screenshots</li>
            <li>👩‍💻 Source <a href="https://github.com/nmatei/chrome-bible-utilities" target="_blank">Code</a></li>
            <li>📩 Support <a href="https://github.com/nmatei/chrome-bible-utilities/issues" target="_blank">Tickets</a></li>
            <li>📈 <a href="https://github.com/nmatei/chrome-bible-utilities/blob/master/release-notes.md" target="_blank">Release Notes</a></li>
          </ul>  
        </li>
      </li>
    </ul>
    </div>
  `;
  document.body.appendChild(helpBox);
  return helpBox;
}
