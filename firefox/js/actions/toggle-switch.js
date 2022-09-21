export const isToogledSwitch = el => {
  return el.classList.contains('checked');
};
export const toggleSwitch = el => {
  el.classList.add('checked');
};
export const unToggleSwitch = el => {
  el.classList.remove('checked');
};

/** initialize toggle switch */
const initToggleSwitchesListener = () => {
  (Array.from(document.getElementsByClassName('toggle-switch')) || []).forEach(
    el => {
      el.addEventListener('click', event => {
        if (isToogledSwitch(el)) unToggleSwitch(el);
        else toggleSwitch(el);
      });
    },
  );
};

initToggleSwitchesListener();
