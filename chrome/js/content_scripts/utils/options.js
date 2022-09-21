/** load options from browser storage */
export const loadOptions = keys => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, data => {
      resolve(data);
    });
  });
};
