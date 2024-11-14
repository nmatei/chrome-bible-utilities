// Mock chrome.storage.sync using localStorage for development
// TODO read this article:
//   https://stackoverflow.com/questions/2963260/how-do-i-auto-reload-a-chrome-extension-im-developing
if (!chrome.storage) {
  console.warn("Mocking chrome.storage.sync with localStorage");
  Object.assign(chrome, {
    storage: {
      sync: {
        set: items => {
          console.info("chrome.storage.sync.set", items);
          return new Promise(resolve => {
            for (const key in items) {
              localStorage.setItem(key, JSON.stringify(items[key]));
            }
            resolve();
          });
        },
        get: keys => {
          keys = [].concat(keys);
          return new Promise(resolve => {
            const result = {};
            keys.forEach(key => {
              result[key] = JSON.parse(localStorage.getItem(key));
            });
            resolve(result);
          });
        }
      }
    },
    runtime: {
      sendMessage: function (payload) {
        console.info("Mocking chrome.runtime.sendMessage", payload);
        return new Promise(resolve => {
          resolve();
          switch (payload.action) {
            case "closeSettingsTab": {
              //window.location.reload();
              break;
            }
          }
        });
      }
    }
  });
}
