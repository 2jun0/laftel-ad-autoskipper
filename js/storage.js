/**
 * Get data in chrome storage
 * @param {string} key 
 * @param {boolean} isLocal 
 * @param {callback} callback 
 */
function getDataInStorage(key, isLocal, callback) {
  var storage = isLocal ? chrome.storage.local : chrome.storage.sync;
  storage.get(key, callback);
}

/**
 * Set data into chrome storage
 * @param {object} dict
 * @param {boolean} isLocal 
 * @param {callback} callback 
 */
function setDataInStorage(dict, isLocal, callback) {
  var storage = isLocal ? chrome.storage.local : chrome.storage.sync;
  storage.set(dict, callback);
}

export {getDataInStorage, setDataInStorage};