import { triggerClick } from '../utils/click.js';

const SELECTOR = {
  VIDEO_LAFTEL_SERVICE: 'video[data-cy="video"]',

  VIDEO_LAFTEL_AD: 'div[class^="LaftelAdsVideo"]>video',
  VIDEO_GOOGLE_AD: 'div[class^="GoogleIMA"] video',
  VIDEO_AD: 'video[title="Advertisement"]',
};

const AD_VIDEO_SELECTOR_LIST = [
  SELECTOR.VIDEO_GOOGLE_AD,
  SELECTOR.VIDEO_LAFTEL_AD,
  SELECTOR.VIDEO_AD,
];

var intervalId;

var option = {
  muteAd: true,
};

/** load options from browser storage */
const loadOptions = callback => {
  chrome.storage.local.get(['muteAd'], data => {
    callback(data);
  });
};

/** Loops over all the videos that need to be muted. */
const tryMuteAdVideos = muted => {
  document.querySelectorAll(AD_VIDEO_SELECTOR_LIST.join(',')).forEach(video => {
    video.muted = muted;
  });
};

/** Check if ther later button exists then, click the later button. */
const tryClickLaterBtn = () => {
  document.querySelectorAll('button').forEach(el => {
    if (el.innerHTML == '나중에') triggerClick(el);
  });
};

/** Init the ad video observer */
const initObserver = () => {
  if (!('MutationObserver' in window)) return false;

  let videoLaftelServiceEl = document.querySelector(
    SELECTOR.VIDEO_LAFTEL_SERVICE,
  );

  console.log(videoLaftelServiceEl);

  if (!videoLaftelServiceEl) return false;

  let observer = new MutationObserver(() => {
    tryMuteAdVideos(option.muteAd);
    tryClickLaterBtn();
  });

  let videoWapperEl = videoLaftelServiceEl.parentElement;
  observer.observe(videoWapperEl, { childList: true, subtree: true });

  return true;
};

/** Loop until the observer is successfully created. */
const initInterval = () => {
  intervalId = setInterval(() => {
    if (initObserver()) {
      console.log(123);
      // Stop the polling as the observer is set up.
      clearInterval(intervalId);
    }
  }, 500);
};

const initOption = () => {
  // option update handlers
  chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if ('muteAd' in req) {
      option.muteAd = req['muteAd'];
      tryMuteAdVideos(option.muteAd);
    }
  });

  loadOptions(data => {
    if ('muteAd' in data) option.muteAd = data['muteAd'];
  });
};

export const main = () => {
  /** Check if this tab window url is https://laftel.net and this window is the laftel */
  if (
    /.*:\/\/.*laftel.net\/.*/.test(document.referrer || document.URL) &&
    window.location.hostname == 'laftel.net'
  ) {
    initOption();
    initInterval();
  }
};
