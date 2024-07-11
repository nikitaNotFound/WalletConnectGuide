import { ethers } from 'ethers';

const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const ETH_PSEUDO_ADDRESS = ethers.ZeroAddress;
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const provider = new ethers.AlchemyProvider('mainnet', 'IqzfJqmrMujEmAlqprW-e9Nw5944Lb41');

const routerContract = new ethers.Contract(UNISWAP_V2_ROUTER, [
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'
], provider);

const ercAbi = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string memory)',
];

export const getAmountOut = async (amountIn, tokenIn, tokenOut) => {
  console.log([tokenIn, tokenOut])
  let path = [];
  if (tokenIn == ETH_PSEUDO_ADDRESS) {
    path = [WETH_ADDRESS, tokenOut];
  } else if (tokenOut == ETH_PSEUDO_ADDRESS) {
    path = [tokenIn, WETH_ADDRESS];
  } else {
    path = [tokenIn, tokenOut];
  }

  const amounts = await routerContract.getAmountsOut(amountIn, path);
  return amounts[1];
}

export const swap = async (tokenIn, amountIn, tokenOut) => {
  const amountOut = await getAmountOut(amountIn, tokenIn, tokenOut);
  const to = window.walletConnect.session.namespaces.eip155.accounts[0];
  const expires = Math.floor(Date.now() / 1000) + 60;
  let data;
  if (tokenIn == ETH_PSEUDO_ADDRESS) {
    routerContract.interface.encodeFunctionData('swapExactETHForTokens', [amountOut, [tokenIn, tokenOut], to, expires]);
  } else if (tokenOut == ETH_PSEUDO_ADDRESS) {
    routerContract.interface.encodeFunctionData('swapExactTokensForETH', [amountIn, amountOut, [tokenIn, tokenOut], to, expires]);
  } else {
    routerContract.interface.encodeFunctionData('swapExactTokensForTokens', [amountIn, amountOut, [tokenIn, tokenOut], to, expires]);
  }

  return await window.walletConnect.signClient.request({
    topic: window.walletConnect.session.topic,
    request: {
      method: 'eth_sendTransaction',
      params: [{
        from: window.walletConnect.session.namespaces.eip155.accounts[0],
        to: tokenIn,
        data: data,
        value: amountIn
      }]
    },
    chainId: window.walletConnect.session.namespaces.eip155.chains[0]
  });
};

export const ASSETS = [
  { name: 'ETH', address: ETH_PSEUDO_ADDRESS, decimals: 18 },
  { name: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
  { name: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { name: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { name: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { name: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  { name: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
];
