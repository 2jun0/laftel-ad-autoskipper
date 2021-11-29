function isToogledSwitch(el) {
  return el.classList.contains('checked');
}
function toggleSwitch(el) {
  el.classList.add('checked');
}
function unToggleSwitch(el) {
  el.classList.remove('checked');
}

// toggle switch
(Array.from(document.getElementsByClassName('toggle-switch')) || []).forEach(
  el => {
    el.addEventListener('click', event => {
      if (isToogledSwitch(el)) unToggleSwitch(el);
      else toggleSwitch(el);
    });
  },
);
