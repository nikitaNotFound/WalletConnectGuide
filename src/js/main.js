import '../scss/variables.scss';
import '../scss/styles.scss';
import '../scss/background.scss';
import { connectWc, getSignClient, getLastSession } from './wc';
import { openModalSelector } from './modal-selector';
import { showToast } from './toasts';
import { ASSETS, getAmountOut } from './crypto';
import { ethers } from 'ethers';

let formData = {
  inAsset: 'ETH',
  outAsset: 'USDT',
  amountIn: null
};
const handleFormUpdate = async () => {
  if (/^(?!0\d|0(?!\.\d+$)|.*[,.]$|.*\s|^\.)\d+(\.\d+)?$/.test(formData.amountIn) === false || formData.amountIn === 0) {
    return;
  }

  if (formData.inAsset && formData.outAsset && formData.amountIn) {
    const inAsset = ASSETS.find(a => a.name == formData.inAsset);
    const outAsset = ASSETS.find(a => a.name == formData.outAsset);
    const amountIn = ethers.parseUnits(formData.amountIn, 18);
    const amountOut = await getAmountOut(amountIn, inAsset.address, outAsset.address);

    assetAmountOutEl.value = ethers.formatUnits(amountOut, outAsset.decimals);
  }
}

const actionsWrapper = document.getElementById("actionsWrapper");
let connectWcEl = null;
let connectWcHtml = '<button id="connectWcBtn" type="submit">Connect WallectConnect</button>';
let sendEl = null;
let sendHtml = '<button id="sendBtn" type="submit">Send Transaction</button>';
let actionsSpinnerEl = null;
let actionsSpinnerHtml = '<div class="actions-spinner" id="actionsSpinner"><img src="./icons/spinner.svg"></img></div>';

const assetSelectInEl = document.getElementById("assetSelectInBtn");
const assetAmountInEl = document.getElementById("amountInInput");
const assetSelectOutEl = document.getElementById("assetSelectOutBtn");
const assetAmountOutEl = document.getElementById("amountOutInput");
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

assetSelectInEl.onclick = () => openModalSelector({
  title: 'Select in asset',
  items: ASSETS.map(a => a.name),
  onSelectCallback: (i) => {
    assetSelectInEl.children[0].innerText = i;
    formData.inAsset = i;
    handleFormUpdate();
  },
  selected: assetSelectInEl.children[0].innerText
});

assetSelectOutEl.onclick = () => openModalSelector({
  title: 'Select out asset',
  items: ASSETS.map(a => a.name),
  onSelectCallback: (i) => {
    assetSelectOutEl.children[0].innerText = i;
    formData.outAsset = i;
    handleFormUpdate();
  },
  selected: assetSelectOutEl.children[0].innerText
});

assetAmountInEl.oninput = (event) => {
  const newValue = event.target.value;
  if (newValue != '' && /^(?!0\d|^\.)\d+(?:\.\d*)?$/.test(newValue) === false) {
    assetAmountInEl.value = formData.amountIn;
    return;
  }

  formData.amountIn = newValue;
  handleFormUpdate();
}

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