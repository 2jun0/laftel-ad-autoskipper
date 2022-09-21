import { loadOption, saveOption } from '../utils/options.js';
import {
  toggleSwitch,
  unToggleSwitch,
  isToogledSwitch,
} from './toggle-switch.js';
import { sendMessage } from '../utils/messages.js';

const muteAdSwitch = document.getElementById('mute-ad');

const initAdSwitchListener = () => {
  // toggle mute ad
  muteAdSwitch.addEventListener('click', event => {
    if (isToogledSwitch(muteAdSwitch)) {
      saveOption({ muteAd: true });
      sendMessage({ muteAd: true });
    } else {
      saveOption({ muteAd: false });
      sendMessage({ muteAd: false });
    }
  });
};

const initOption = async () => {
  let data = await loadOption(['muteAd']);
  if (!('muteAd' in data) || data['muteAd']) toggleSwitch(muteAdSwitch);
  else unToggleSwitch(muteAdSwitch);
};

/** main routine */
initOption();
initAdSwitchListener();
