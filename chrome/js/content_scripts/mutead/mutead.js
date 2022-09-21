import { triggerClick } from '../../utils/click.js';
import { loadOption } from '../../utils/options.js';

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

var intervalObserverId;
var intervalMuteAdId;
var observer;

var option = {
  muteAd: true,
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

  observer = new MutationObserver(() => {
    tryClickLaterBtn();
    tryMuteAdVideos(option.muteAd);
  });

  let videoWapperEl = videoLaftelServiceEl.parentElement;
  observer.observe(videoWapperEl, { childList: true });

  // Free observer when document unload
  window.addEventListener('beforeunload', () => {
    if (observer) clearInterval(observer);
  });

  return true;
};

/** Loop until the observer is successfully created. */
const initWatingObserverInterval = () => {
  intervalObserverId = setInterval(() => {
    if (initObserver()) {
      // Stop the polling as the observer is set up.
      clearInterval(intervalObserverId);
      intervalObserverId = null;
    }
  }, 500);

  // Free interval when document unload
  window.addEventListener('beforeunload', () => {
    if (intervalObserverId) clearInterval(intervalObserverId);
  });
};

/** Loop try to mute ad */
const initMuteAdInterval = () => {
  intervalMuteAdId = setInterval(() => {
    tryMuteAdVideos(option.muteAd);
  }, 100);
};

/** Initialize option's relatives */
const initOption = async () => {
  // option update handlers
  chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if ('muteAd' in req) {
      option.muteAd = req['muteAd'];
      tryMuteAdVideos(option.muteAd);
    }
  });

  option.muteAd = await loadOption(['muteAd']);
};

export const main = async () => {
  /** Check if this tab window url is https://laftel.net and this window is the laftel */
  if (
    /.*:\/\/.*laftel.net\/.*/.test(document.referrer || document.URL) &&
    window.location.hostname == 'laftel.net'
  ) {
    await initOption();
    initWatingObserverInterval();
    initMuteAdInterval();
  }
};
