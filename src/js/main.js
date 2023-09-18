import '../scss/variables.scss';
import '../scss/styles.scss';
import '../scss/background.scss';
import { connectWc, getSignClient, getLastSession } from './wc';
import { openModalSelector } from './modal-selector';
import { ASSETS, BLOCKCHAINS } from './crypto';
import { showToast } from './toasts';

const onBlockchainSelected = (selectedItem) => {
  blockchainSelectEl.children[0].innerText = selectedItem;
}

const onAssetSelected = (selectedItem) => {
  assetSelectEl.children[0].innerText = selectedItem;
}

const inputEl = document.getElementById("recipientAddressInput");
const actionsWrapper = document.getElementById("actionsWrapper");
let connectWcEl = null;
let connectWcHtml = '<button id="connectWcBtn" type="submit">Connect WallectConnect</button>';
let sendEl = null;
let sendHtml = '<button id="sendBtn" type="submit">Send Transaction</button>';
let actionsSpinnerEl = null;
let actionsSpinnerHtml = '<div class="actions-spinner" id="actionsSpinner"><img src="./icons/spinner.svg"></img></div>';

const blockchainSelectEl = document.getElementById("blockchainSelectBtn");
const assetSelectEl = document.getElementById("assetSelectBtn");

const rightSideMenu = document.getElementById("rightSideMenu");
const txHistoryBtn = document.getElementById("txHistoryBtn");

const enableConnectWcBtn = () => {
  actionsWrapper.innerHTML = connectWcHtml;
  connectWcEl = document.getElementById("connectWcBtn");
  connectWcEl.onclick = onConnectWlClicked;
}
const disableConnectWcBtn = () => {
  connectWcEl.remove();
}

const enableSendTxBtn = () => {
  actionsWrapper.innerHTML = sendHtml;
  sendEl = document.getElementById("sendBtn");
  sendEl.onclick = () => {}
}
const disableSendTxBtn = () => {
  sendEl.remove();
}

const enableSpinner = () => {
  actionsWrapper.innerHTML = actionsSpinnerHtml;
  actionsSpinnerEl = document.getElementById("actionsSpinner");
}
const disableSpinner = () => {
  actionsSpinnerEl.remove();
}

const onWcSessionDeleted = () => {
  disableSendTxBtn();
  enableConnectWcBtn();
}

const onConnectWlClicked = async () => {
  const signClient = await getSignClient({
    onWcSessionDeleted,
  });
  try {
    disableConnectWcBtn();
    enableSpinner();
    const session = await connectWc(
      signClient,
      (isSuccess) => {
        disableSpinner();
        if (isSuccess) {
          enableSendTxBtn();
        } else {
          enableConnectWcBtn();
        }
      }
    );
  } catch {
    showToast('error', 'Connect request was rejected.');
  }
}

let txHistoryOpened = false;

const disableRightSideMenu = () => {
  rightSideMenu.className = 'right-side-menu';
  window.removeEventListener('click', onRightSideMenuClose);
}

const onRightSideMenuClose = (event) => {
  txHistoryOpened = false;
  if (event.target != rightSideMenu) {
    disableRightSideMenu();
  }
}

const enableRightSideMenu = (event) => {
  txHistoryOpened = true;
  rightSideMenu.className = 'right-side-menu opened';

  event.stopPropagation();
  window.addEventListener('click', onRightSideMenuClose);
}

txHistoryBtn.onclick = (event) => {
  if (txHistoryOpened === false) {
    enableRightSideMenu(event);
  } else {
    disableRightSideMenu();
  }
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

const main = async () => {
  const signClient = await getSignClient({
    onWcSessionDeleted,
  });
  const lastSession = getLastSession(signClient);
  console.log({signClient, lastSession})
  if (!lastSession) {
    enableConnectWcBtn();
  } else {
    enableSendTxBtn();
  }
}
main();