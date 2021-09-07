(function () {
  var getDataInStorage;

  var SELECTOR = {
    BTN_LATER: 'button.MembershipSuggestDialog__Button-sc-1bcpbpm-6.bZbLzl', // Close google ad button
    BTN_SKIP_GOOGLE_AD: 'button.videoAdUiSkipButton', // 나중에 button in laftel suggest dialog

    VIDEO_WRAPPER: 'div.player div.video',
    VIDEO_LAFTEL: 'div.player div.video > video',
    VIDEO_LAFTEL_AD: 'div[class^="LaftelAdsVideo"]>video',
    VIDEO_GOOGLE_AD: 'div[class^="GoogleIMA"] video'
  }

  var BTN_SELECTOR_LIST = [
    SELECTOR.BTN_LATER,
    SELECTOR.BTN_SKIP_GOOGLE_AD
  ]

  var AD_VIDEO_SELECTOR_LIST = [
    SELECTOR.VIDEO_GOOGLE_AD,
    SELECTOR.VIDEO_LAFTEL_AD
  ]

  var option = {
    muteAd: false
  }

  var timeoutId;
  var observedSkipBtn;
  var skipBtnObserver;

  /**
   * Loops over all the selector of elements that we need to find 
   * and returns an array of those elements.
   *
   * @param {Array<String>} selectorList - an array of selector of elements that we need to find
   * @returns {Array<Element>} - An array of DOM elements
   */
  function existingElements(selectorList) {
    return selectorList
      .map(selector => {
        return Array.from(document.querySelectorAll(selector)) || [];
      })
      .reduce(function(acc, elems) {
        return acc.concat(elems);
      }, [])
  }

  /**
   * We check if the button is visible by using the `offsetParent` attribute
   * on an element. It is `null` if the element, or any of its parents, is set
   * to have style `display:none`.
   * 
   * @param {Element} button - The button element
   * @returns {boolean} - Whether the element is visible on the screen
   */
  function isBtnVisible(button) {
    return button.offsetParent === null ? false : true;
  }

  /**
   * Since we do not click the button as long as it is not visible, we can
   * attach an observer to listen for the button's attribute changes to figure
   * out when the element becomes visible.
   * 
   * @param {Element} button - The button element to click
   */
  function triggerClickWhenVisible(button) {
    if (button === observedSkipBtn) {
      // We are already observing this button.
      return;
    }

    // Find the actual parent with the display style 'none' so that we can
    // listen to that element's changes.
    var parentWithDisplayStyle = (function() {
      var currentParent = button;
      while (currentParent !== null) {
        if (currentParent.style.display === 'none') {
          return currentParent;
        }

        currentParent = currentParent.parentElement;
      }

      return null;
    })();

    if (!parentWithDisplayStyle) {
      // Give up.
      return;
    }

    // If we had been observing another button, disconnect from that. If that
    // element still exists in the DOM, click on it for good measure.
    if (skipBtnObserver && observedSkipBtn) {
      skipBtnObserver.disconnect();
      triggerClick(observedSkipBtn);
    }

    // If this is the first skip button we have encountered, we will have to
    // set up the observer first.
    if (!skipBtnObserver) {
      skipBtnObserver = new MutationObserver(function() {
        if (!isBtnVisible(observedSkipBtn)) {
          return;
        }

        triggerClick(observedSkipBtn);
        observedSkipBtn = undefined;
        skipBtnObserver.disconnect();
      });
    }

    // Since we will eventually be working on the button we need to have this
    // reference stored.
    observedSkipBtn = button;
    
    // Note that we are actually observing the button's parent that has the
    // display attribute, as the skip button's visibilty is controlled by its
    // parent.
    skipBtnObserver.observe(parentWithDisplayStyle, { attributes: true });
  }

  /**
   * Loops over all the buttons that need to be clicked and triggers the click
   * even on those buttons.
   */
  function checkAndClickButtons() {
    existingElements(BTN_SELECTOR_LIST).forEach(button => {
      // We want to make sure that we are only pressing the skip button when it
      // is visible on the screen, so that it is like an actual user is pressing
      // it. This also gives a user time to not-skip the ad in the future.
      if (!isBtnVisible(button)) {
        triggerClickWhenVisible(button);
        
        return;
      } 

      triggerClick(button);
    })
  }

  /**
   * Loops over all the videos that need to be muted.
   */
  function checkAndMuteAdVideos(mute) {
    existingElements(AD_VIDEO_SELECTOR_LIST).forEach(video => {
      video.muted = mute;
    })
  }
  

  /**
   * Triggers a click event on the given DOM element.
   * 
   * This function is based on an answer here:
   * http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
   * 
   * @param {Element} el - The element on which to trigger the event
   */
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

  /**
   * Initializes an observer on the Laftel Video Player to get events when any
   * of its child elements change. We can check for the existance of the skip ad
   * buttons on those changes.
   *
   * @returns {Boolean} - true if observer could be set up, false otherwise
   */
  function initObserver() {
    if (!('MutationObserver' in window)) {
      return false;
    }
    var videoWrapper = (function(nodeList) {
      return nodeList && nodeList[0];
    })(document.querySelector(SELECTOR.VIDEO_WRAPPER));

    if (!videoWrapper) {
      // When inserting this script into google ad iframe, there is no laftel player
      return false;
    }

    var observer = new MutationObserver(function() {
      checkAndClickButtons();
      checkAndMuteAdVideos(option.muteAd);
    });

    observer.observe(videoWrapper, { childList: true, subtree: true });

    clearTimeout(timeoutId); // Just for good measure

    return true;
  } 

  /**
   * Initializes options that load from chrome storage
   */
  function initOptions() {
    // get initial options
    getDataInStorage('muteAd', false, (data) => {
      option.muteAd = (data['muteAd'] == 'true') ? true : false;
    })

    // option update handlers
    chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
      if (req.muteAd) {
        option.muteAd = (req.muteAd == 'true') ? true : false;
        checkAndMuteAdVideos(option.muteAd);
      }
    });
  }

  /**
   * We have two implementations to check for the skip ad buttons: one is based on
   * MutationObserver, that is only triggered when the video-player is updated in
   * the page; second is a simple poll that constantly checks for the existence of
   * the skip ad buttons.
   * 
   * We first try to set up the mutation observer. It can sometimes fail even when the
   * browser supports it, if the video player has not yet been attached to the DOM.
   * In such cases, we continue the polling implementation until the observer can be
   * set up.
   */
  function initTimeout() {
    clearTimeout(timeoutId);

    if (initObserver()) {
      // We can stop the polling as the observer is set up.
      return;
    }

    /**
     * Starts the poll to see if any of the ad buttons are present in the page now.
     * The interval of 2 seconds is arbitrary. I believe it is a good compromise.
     */
    timeoutId = setTimeout(function() {
      checkAndClickButtons();
      checkAndMuteAdVideos(option.muteAd);
      initTimeout();
    }, 2000);
  }

  /**
   * main routine
   */
  (async () => {
    // dynamic import
    const src = chrome.runtime.getURL('js/storage.js');
    getDataInStorage = (await import(src)).getDataInStorage;

    initOptions();
    initTimeout();
  })();

})();