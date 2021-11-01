var SELECTOR = {
  BTN_SKIP_GOOGLE_AD_WRAPPER: 'div.videoAdUiBottomBar',
  BTN_SKIP_GOOGLE_AD: 'button.videoAdUiSkipButton'
}

var TimeoutId;

/** Triggers a click event on the given DOM element.*/
function triggerClick(el) {
  var etype = 'click';

  if (typeof el.fireEvent === 'function') {
    el.fireEvent('on' + etype);
  } else if (typeof el.dispatchEvent === 'function') {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

/** Check if the skip button exists then, click the skip button. */
function checkAndSkipBtn() {
  let skipBtn = document.querySelector(SELECTOR.BTN_SKIP_GOOGLE_AD);
  if (skipBtn)
    triggerClick(skipBtn);
}

/** Init the ad skip button observer */
function initObserver() {
  if (!('MutationObserver' in window))
    return false;

  var skipBtnWapper = document.querySelector(SELECTOR.BTN_SKIP_GOOGLE_AD_WRAPPER);

  if (!skipBtnWapper)
    return false;

  var observer = new MutationObserver(() => {
    checkAndSkipBtn();
  });

  observer.observe(skipBtnWapper, { childList: true, subtree: true });

  return true;
}

/** Loop until the observer is successfully created. */
function initTimeout() {
  clearTimeout(TimeoutId);

  if (initObserver()) {
    // Stop the polling as the observer is set up.
    return;
  }

  TimeoutId = setTimeout(() => {
    checkAndSkipBtn();
    initTimeout();
  }, 500);
}

/** Check if this tab window url is https://laftel.net */
if (/.*:\/\/.*laftel.net\/.*/.test(document.referrer || document.URL)) {
  initTimeout();
}