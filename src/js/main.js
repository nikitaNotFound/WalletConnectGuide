import '../scss/styles.scss';
import { connectWc } from './wc';
import { openModalSelector } from "./modal-selector";
import { ASSETS, BLOCKCHAINS } from './crypto';

const inputEl = document.getElementById("recipientAddressInput");
const connectWcEl = document.getElementById("connectWcBtn");
const sendEl = document.getElementById("sendBtn");

const blockchainSelectEl = document.getElementById("blockchainSelectBtn");
const assetSelectEl = document.getElementById("assetSelectBtn");

const onBlockchainSelected = (selectedItem) => {
  blockchainSelectEl.children[0].innerText = selectedItem;
}

const onAssetSelected = (selectedItem) => {
  assetSelectEl.children[0].innerText = selectedItem;
}

blockchainSelectEl.onclick = () => openModalSelector({
  title: 'Select transaction blockchain',
  items: BLOCKCHAINS,
  onSelectCallback: onBlockchainSelected,
  selected: blockchainSelectEl.children[0].innerText
});
assetSelectEl.onclick = () => openModalSelector({
  title: 'Select transaction asset',
  items: ASSETS,
  onSelectCallback: onAssetSelected,
  selected: assetSelectEl.children[0].innerText
});

const tryGetWcSession = () => {
  return true;
}

const onConnectWlClicked = () => {
  connectWc();
}

connectWcEl.onclick = onConnectWlClicked;

const oldSession = tryGetWcSession();
if (!oldSession) {
  sendEl.style.display = 'none';
  inputEl.disabled = true;
}
