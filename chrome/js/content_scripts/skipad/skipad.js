import { triggerClick } from '../../utils/click.js';

const SELECTOR = {
  BTN_SKIP_GOOGLE_AD: 'button.videoAdUiSkipButton',
};

var intervalId;
var observer;

/** Check if the skip button exists then, click the skip button. */
const tryClickSkipBtn = () => {
  let skipBtn = document.querySelector(SELECTOR.BTN_SKIP_GOOGLE_AD);
  if (skipBtn) triggerClick(skipBtn);
};

/** Init the ad skip button observer */
const initObserver = () => {
  if (!('MutationObserver' in window)) return false;

  let htmlEl = document.querySelector('html');

  if (!htmlEl) return false;

  observer = new MutationObserver(() => {
    tryClickSkipBtn();
  });

  observer.observe(htmlEl, { childList: true, subtree: true });

  // Free observer when document unload
  window.addEventListener('beforeunload', () => {
    if (observer) clearInterval(observer);
  });

  return true;
};

/** Loop until the observer is successfully created. */
const initInterval = () => {
  intervalId = setInterval(() => {
    if (initObserver()) {
      // Stop the polling as the observer is set up.
      clearInterval(intervalId);
    }
  }, 500);

  // Free interval when document unload
  window.addEventListener('beforeunload', () => {
    if (intervalId) clearInterval(intervalId);
  });
};

export const main = () => {
  /** Check if this tab window url is https://laftel.net */
  if (/.*:\/\/.*laftel.net\/.*/.test(document.referrer || document.URL))
    initInterval();
};
