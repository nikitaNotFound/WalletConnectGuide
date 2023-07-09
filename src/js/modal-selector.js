const modalWindowEl = document.getElementById('modalSelector');
const modalSelectorTitleEl = document.getElementById('modalSelectorTitle');
const modalSelectorItemsEl = document.getElementById('modalSelectorItems');

const onItemSelected = (item, itemEl, callback) => {
  callback(item);
  close();
}

export const openModalSelector = ({
  title,
  items,
  onSelectCallback,
  selected = ''
}) => {
  modalSelectorItemsEl.innerHTML = '';
  modalWindowEl.className = 'modal-selector-wrapper';
  window.onclick = onClickClose;
  modalSelectorTitleEl.innerText = title;

  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'item';
    itemEl.onclick = () => onItemSelected(item, itemEl, onSelectCallback);
    if (item == selected) {
      itemEl.classList += ' selected';
    }

    const titleEl = document.createElement('div');
    titleEl.className = 'title';
    titleEl.innerText = item;

    itemEl.appendChild(titleEl);

    modalSelectorItemsEl.appendChild(itemEl);
  });
}

const onClickClose = (event) => {
  if (event.target == modalWindowEl) {
    close();
  }
}

const close = () => {
  modalWindowEl.classList += ' not-active';
}
