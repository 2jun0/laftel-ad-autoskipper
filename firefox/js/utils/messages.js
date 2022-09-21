/** Send message to tabs(content_script) */
export const sendMessage = (message, callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    tabs.forEach(tab => {
      chrome.tabs
        .sendMessage(tab.id, message)
        .then(res => {
          console.log(chrome.runtime.lastError, res);
        })
        .catch(err => {
          /** This error occur, not initializing chrome.runtime.sendMessage listener in content_script. */
        });
    });
  });
};
