import { triggerClick } from '../../utils/click.js';
import { printLog } from '../../utils/log.js';
import { loadOption } from '../../utils/options.js';

const SELECTOR = {
  VIDEO_LAFTEL_SERVICE: 'video[data-cy="video"]',

  VIDEO_LAFTEL_AD: 'div[class^="LaftelAdsVideo"]>video',
  VIDEO_GOOGLE_AD: 'div[class^="GoogleIMA"] video',
  VIDEO_AD: 'video[title="Advertisement"]',
};

let intervalMuteAdId;
let intervalWaitingLaftelVideoId;
let intervalWaitingLaterBtnId;
let videoLaftelServiceEl;

let options = {
  muteAd: true,
};

/** Get ad video elements */
const getAdLikeVideos = () => {
  let adlikeVideos = [];

  if (!videoLaftelServiceEl) return null;

  let currDivEl = videoLaftelServiceEl.nextElementSibling;

  while (currDivEl) {
    adlikeVideos.push(...currDivEl.querySelectorAll('video'));
    currDivEl = currDivEl.nextElementSibling;
  }

  return adlikeVideos.length > 0 ? adlikeVideos : null;
};

/** Loops over all the videos that need to be muted. */
const tryMuteAdVideos = muted => {
  if (intervalMuteAdId) return;

  let tryCnt = 50;

  intervalMuteAdId = setInterval(() => {
    const adLikeVideos = getAdLikeVideos();
    printLog('[laftel-ad-autoskipper] try found vidoes ... ');

    if (adLikeVideos) {
      printLog('[laftel-ad-autoskipper] 광고 감지');

      adLikeVideos.forEach(video => {
        if (video.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA) {
          video.muted = muted;
        } else {
          video.addEventListener('loadeddata', () => {
            video.muted = muted;
          });
        }
      });

      if (intervalMuteAdId) {
        clearInterval(intervalMuteAdId);
        intervalMuteAdId = null;
      }
    }

    if (tryCnt == 0 && intervalMuteAdId) {
      intervalMuteAdId = null;
      clearInterval(intervalMuteAdId);
    }
  }, 50);
};

/** 나중에 버튼이 생길때까지 기다렸다가, click the later button. */
const tryClickLaterBtn = () => {
  if (intervalWaitingLaterBtnId) return;

  let tryCnt = 5;

  intervalWaitingLaterBtnId = setInterval(() => {
    tryCnt--;

    for (let btn of document.querySelectorAll('button')) {
      if (btn.innerHTML == '나중에') {
        triggerClick(btn);

        tryCnt = 0;

        break;
      }
    }

    if (tryCnt == 0 && intervalWaitingLaterBtnId) {
      clearInterval(intervalMuteAdId);
      intervalWaitingLaterBtnId = null;
    }
  }, 1000);
};

/** Check if ther later button exists then, click the later button. */
const initLaftelVideoListener = () => {
  if (intervalWaitingLaftelVideoId) return;

  intervalWaitingLaftelVideoId = setInterval(() => {
    videoLaftelServiceEl = document.querySelector(
      SELECTOR.VIDEO_LAFTEL_SERVICE,
    );

    if (!videoLaftelServiceEl) return;

    // 동영상이 일시중지 될때 광고 탐색
    videoLaftelServiceEl.addEventListener('pause', () => {
      tryMuteAdVideos(options.muteAd);
    });

    // 동영상이 로드될 때 광고 탐색
    videoLaftelServiceEl.addEventListener('loadeddata', () => {
      tryMuteAdVideos(options.muteAd);
    });

    // 동영상이 다시 실행할때 종료
    videoLaftelServiceEl.addEventListener('play', () => {
      if (intervalMuteAdId) {
        clearInterval(intervalMuteAdId);
        intervalMuteAdId = null;
      }

      tryClickLaterBtn();
    });

    // 맨 처음에 광고가 나오면 실행
    if (videoLaftelServiceEl.paused) {
      tryMuteAdVideos(options.muteAd);
    }

    // Free
    if (intervalWaitingLaftelVideoId) {
      clearInterval(intervalWaitingLaftelVideoId);
      intervalWaitingLaftelVideoId = null;
    }
  });

  // Free intervals when document unload
  window.addEventListener('beforeunload', () => {
    if (intervalMuteAdId) {
      clearInterval(intervalMuteAdId);
      intervalMuteAdId = null;
    }

    if (intervalWaitingLaftelVideoId) {
      clearInterval(intervalWaitingLaftelVideoId);
      intervalWaitingLaftelVideoId = null;
    }

    if (intervalWaitingLaterBtnId) {
      clearInterval(intervalWaitingLaterBtnId);
      intervalWaitingLaterBtnId = null;
    }
  });
};

/** Initialize option's relatives */
const initOption = async () => {
  // option update handlers
  chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if ('muteAd' in req) {
      options.muteAd = req['muteAd'];
      tryMuteAdVideos(options.muteAd);
    }
  });

  options.muteAd = await loadOption(['muteAd']);
};

export const main = async () => {
  /** Check if this tab window url is https://laftel.net and this window is the laftel */
  if (
    /.*:\/\/.*laftel.net\/.*/.test(document.referrer || document.URL) &&
    window.location.hostname == 'laftel.net'
  ) {
    initLaftelVideoListener();
    await initOption();
  }
};
