var getDataInStorage, setDataInStorage;

var muteAdToggled = false;

function sendMessage(message, callback) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, message, callback);
    });
  });
}

function loadOptions() {
  getDataInStorage('muteAd', false, (data) => {
    muteAdToggled = (data['muteAd'] == 'true') ? true : false;
    if (muteAdToggled) toggleSwitch(document.getElementById('mute-ad'));
    else unToggleSwitch(document.getElementById('mute-ad'));
  })
}

function saveOption(dict) {
  setDataInStorage(dict, false, null);
}

function toggleSwitch(el) {
  if (!el.classList.contains('checked')) el.classList.add('checked');
}

function unToggleSwitch(el) {
  if (el.classList.contains('checked')) el.classList.remove('checked');
}

// toggle switch
(Array.from(document.getElementsByClassName('toggle-switch')) || []).forEach(el => {
  el.addEventListener('click', event => {
    if (el.classList.contains('checked')) {
      unToggleSwitch(el);
    }
    else {
      toggleSwitch(el);
    }
  });
});

// toggle mute ad
document.getElementById('mute-ad').addEventListener('click', event => {
  muteAdToggled = !muteAdToggled;
  if (muteAdToggled) {
    saveOption({muteAd: 'true'})
    sendMessage({muteAd: 'true'});
  }
  else {
    saveOption({muteAd: 'false'});
    sendMessage({muteAd: 'false'});
  }
});

/**
 * main routine
 */
(async () => {
  // dynamic import
  const src = chrome.runtime.getURL('js/storage.js');
  var storage = await import(src);
  getDataInStorage = storage.getDataInStorage;
  setDataInStorage = storage.setDataInStorage;

  loadOptions();
})();