const { ethers } = require('@vechain/ethers')

function getWallet () {
  const walletKey = 'test-wallet'

  // const savedPrivateKey = window.localStorage.getItem(walletKey)
  // if (savedPrivateKey) {
  //   return new ethers.Wallet(savedPrivateKey)
  // }

  const wallet = ethers.Wallet.createRandom()
  window.localStorage.setItem(walletKey, wallet.privateKey)

  return wallet
}

function deleteWallet() {
  	const walletKey = 'test-wallet'

	const savedPrivateKey = window.localStorage.getItem(walletKey)
	localStorage.removeItem(savedPrivateKey);
}

const Wallet = getWallet()
export { Wallet, deleteWallet }
