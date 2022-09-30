const DEBUG_MODE = true;

export const printLog = (...args) => {
  if (DEBUG_MODE) console.log(...args);
};
