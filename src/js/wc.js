import { SignClient } from "@walletconnect/sign-client";
import { Web3Modal } from "@web3modal/standalone";

const projectId = '2cabcfee46170d98607bbb692b9b2704';
const namespaces = {
  eip155: {
    methods: ['eth_sendTransaction'],
    chains: ['eip155:1'],
    events: ['accountsChanged']
  }
};

let buffSignClient = null;
export const getSignClient = async ({
  onWcSessionDeleted,
}) => {
  if (!buffSignClient) {
    const signClient = await SignClient.init({
      projectId: projectId,
      metadata: {
          name: 'dPosit',
          description: 'Sample app to test WalletConnect.',
          url: 'https://dev.dposit.dev/',
          icons: ['https://dev.dposit.dev/svg/logo.svg']
      }
    });
    signClient.on('session_delete', () => {
      localStorage.clear();
      onWcSessionDeleted();
    });
    signClient.on('session_request', () => {
      console.log('on session request');
    });

    buffSignClient = signClient;
    return signClient;
  } else {
    return buffSignClient;
  }
}

export const getLastSession = (signClient) => {
  const lastKeyIndex = signClient.session.getAll().length - 1;
  const lastSession = signClient.session.getAll()[lastKeyIndex];

  return lastSession;
}

export const connectWc = async (signClient, onModalClose) => {
  const web3Modal = new Web3Modal({
      walletConnectVersion: 2,
      projectId: projectId,
      themeMode: 'light',
      themeBackground: 'gradient',
      themeColor: 'purple'
  });
  let isSuccess = false;
  web3Modal.subscribeModal(newState => {
    if (!newState.open) {
      onModalClose(isSuccess);
    }
  });

  const { uri, approval } = await signClient.connect({
      requiredNamespaces: namespaces
  });

  if (uri) {
    await web3Modal.openModal({
        uri: uri,
        standaloneChains: [...namespaces.eip155.chains]
    });
    const session = await approval();
    isSuccess = true;
    web3Modal.closeModal();
    return session;
  }
}

export const sendTransactionWc = async ({
  assetName,
  destinationAddress,
  tokenAmount,
  predefinedData = null
}) => {
  try {
      const accountFrom = window.walletConnect.session.namespaces.eip155.accounts[0].slice(9);
      const session = window.walletConnect.session;
      const signClient = window.walletConnect.signClient;
      console.log({accountFrom, assetName, destinationAddress, tokenAmount, predefinedData})

      const amount = formatAssetAmount(assetName, tokenAmount);
      const chain = assetChains[assetName];
      const toAddress = !assetSmartContractAddresses[assetName]
          ? destinationAddress
          : assetSmartContractAddresses[assetName];
      const data = !predefinedData
          ? generateAssetTransactionData(assetName, destinationAddress, amount)
          : predefinedData;

      const transaction = {
          from: accountFrom,
          to: toAddress,
          data: data,
          value: amount
      };
      console.log(transaction);

      const result = await signClient.request({
          topic: session.topic,
          request: {
              method: 'eth_sendTransaction',
              params: [transaction]
          },
          chainId: chain
      });
      console.log(result);
      return result;
  } catch (e) {
      console.error(e);
      return null;
  }
}

const assetChains = {
  ETH: 'eip155:1'
}

export const getAccountsWc = () => {
  const accountArrays = Object.values(window.walletConnect.session.namespaces).map(n => n.accounts);
  return [].concat(...accountArrays);
}
