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
export const getSignClient = async () => {
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

export const connectWc = async (signClient) => {
  const web3Modal = new Web3Modal({
      walletConnectVersion: 2,
      projectId: projectId,
      themeMode: 'light',
      themeBackground: 'gradient',
      themeColor: 'purple'
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

const assetAmountFormatters = {
  ETH: (amount) => `0x${ethers.parseUnits(amount, 18).toString(16)}`,
  USDT: (amount) => `0x${ethers.parseUnits(amount, 6).toString(16)}`
}
const formatAssetAmount = (assetName, amount) => assetAmountFormatters[assetName](amount);

const assetTransactionDataGenerators = {
  USDT: (destinationAddress, amount) => {
      const usdtContract = new ethers.Contract(assetSmartContractAddresses.USDT, UsdtAbi);

      return usdtContract.interface.encodeFunctionData('transfer', [destinationAddress, amount]);
  }
};
const generateAssetTransactionData = (assetName, destinationAddress, amount) => {
  const generator = assetTransactionDataGenerators[assetName];

  return !generator ? '0x' : generator(destinationAddress, amount);
}

const assetChains = {
  ETH: 'eip155:1'
}

const assetSmartContractAddresses = {
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7'
};

export const getAccountsWc = () => {
  const accountArrays = Object.values(window.walletConnect.session.namespaces).map(n => n.accounts);
  return [].concat(...accountArrays);
}
