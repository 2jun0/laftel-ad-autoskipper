var SELECTOR = {
  BTN_LATER: "button.MembershipSuggestDialog__Button-sc-1bcpbpm-6.bZbLzl", // Close google ad button

  VIDEO_WRAPPER: "div.player div.video",
  VIDEO_LAFTEL_AD: 'div[class^="LaftelAdsVideo"]>video',
  VIDEO_GOOGLE_AD: 'div[class^="GoogleIMA"] video',
};

var AD_VIDEO_SELECTOR_LIST = [
  SELECTOR.VIDEO_GOOGLE_AD,
  SELECTOR.VIDEO_LAFTEL_AD,
];

var TimeoutId;

var option = {
  muteAd: true,
};

/** load options from browser storage */
function loadOptions(callback) {
  chrome.storage.local.get(["muteAd"], (data) => {
    callback(data);
  });
}

/** Triggers a click event on the given DOM element.*/
function triggerClick(el) {
  var etype = "click";

  if (typeof el.fireEvent === "function") {
    el.fireEvent("on" + etype);
  } else if (typeof el.dispatchEvent === "function") {
    var evObj = document.createEvent("Events");
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

/** Loops over all the videos that need to be muted. */
function checkAndMuteAdVideos(mute) {
  document
    .querySelectorAll(AD_VIDEO_SELECTOR_LIST.join(","))
    .forEach((video) => {
      video.muted = mute;
    });
}

/** Check if ther later button exists then, click the later button. */
function checkAndLaterBtn() {
  let laterBtn = document.querySelector(SELECTOR.BTN_LATER);
  if (laterBtn) triggerClick(laterBtn);
}

/** Init the ad video observer */
function initObserver() {
  if (!("MutationObserver" in window)) return false;

  var videoWrapper = document.querySelector(SELECTOR.VIDEO_WRAPPER);

  if (!videoWrapper || !videoWrapper.itemscope || !videoWrapper.hasChildNodes())
    return false;

  var observer = new MutationObserver(() => {
    checkAndMuteAdVideos(option.muteAd);
    checkAndLaterBtn();
  });

  observer.observe(videoWrapper, { childList: true, subtree: true });

  clearTimeout(TimeoutId); // Just for good measure

  return true;
}

/** Loop until the observer is successfully created. */
function initTimeout() {
  clearTimeout(TimeoutId);

  // Stop the polling as the observer is set up.
  if (initObserver()) return;

  TimeoutId = setTimeout(() => {
    checkAndMuteAdVideos(option.muteAd);
    checkAndLaterBtn();
    initTimeout();
  }, 500);
}

/** Check if this tab window url is https://laftel.net and this window is the laftel */
if (
  /.*:\/\/.*laftel.net\/.*/.test(document.referrer || document.URL) &&
  window.location.hostname == "laftel.net"
) {
  // option update handlers
  chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if ("muteAd" in req) {
      option.muteAd = req["muteAd"];
      checkAndMuteAdVideos(option.muteAd);
    }
  });

  loadOptions((data) => {
    if ("muteAd" in data) option.muteAd = data["muteAd"];
  });

  initTimeout();
}
