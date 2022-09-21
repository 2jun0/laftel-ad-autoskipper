/** load options from browser storage */
export const loadOption = keys => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, data => {
      resolve(data);
    });
  });
};

/** save options to browser storage */
export const saveOption = dict => {
  chrome.storage.local.set(dict);
};
