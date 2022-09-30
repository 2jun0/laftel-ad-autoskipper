const DEBUG_MODE = chrome.runtime.id == 'dcpckjplmdcgdbapaepejenmkknkoimg';

export const printLog = (...args) => {
  if (DEBUG_MODE) console.log('[laftel-ad-autoskipper]', ...args);
};
