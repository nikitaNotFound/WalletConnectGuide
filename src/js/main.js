import '../scss/styles.scss';
import { connectWc, getSignClient, getLastSession } from './wc';
import { openModalSelector } from './modal-selector';
import { ASSETS, BLOCKCHAINS } from './crypto';

const onBlockchainSelected = (selectedItem) => {
  blockchainSelectEl.children[0].innerText = selectedItem;
}

const onAssetSelected = (selectedItem) => {
  assetSelectEl.children[0].innerText = selectedItem;
}

const onConnectWlClicked = async () => {
  const signClient = await getSignClient();
  const session = await connectWc(signClient);
  console.log(session);
}

const inputEl = document.getElementById("recipientAddressInput");
const connectWcEl = document.getElementById("connectWcBtn");
const sendEl = document.getElementById("sendBtn");

const blockchainSelectEl = document.getElementById("blockchainSelectBtn");
const assetSelectEl = document.getElementById("assetSelectBtn");

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

connectWcEl.onclick = onConnectWlClicked;

const main = async () => {
  const signClient = await getSignClient();
  const lastSession = getLastSession(signClient);
  console.log({signClient, lastSession})
  if (!lastSession) {
    connectWcEl.style.display = 'block';
  } else {
    sendEl.style.display = 'block';
  }
}
main();