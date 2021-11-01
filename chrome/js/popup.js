const muteAdSwitch = document.getElementById('mute-ad');

function sendMessage(message, callback) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, message, callback);
    });
  });
}

// toggle mute ad
muteAdSwitch.addEventListener('click', event => {
  if (isToogledSwitch(muteAdSwitch)) {
    saveOption({muteAd: true});
    sendMessage({muteAd: true});
  }
  else {
    saveOption({muteAd: false});
    sendMessage({muteAd: false});
  }
});

/**
 * option functions
 */
function saveOption(dict) {
  chrome.storage.local.set(dict);
}
function loadOptions(callback) {
  chrome.storage.local.get([
    'muteAd'
  ], (data) => { callback(data); });
}

/**
 * main routine
 */
loadOptions((data) => {
  if ('muteAd' in data)
    toggleSwitch(muteAdSwitch);
  else
    unToggleSwitch(muteAdSwitch);
});