import Definition from './Election.json'
import Connex from '@vechain/connex'
import { Transaction, secp256k1 } from 'thor-devkit'
import { Wallet } from './Wallet'
// const DELEGATE_URL = 'https://sponsor.vechain.energy/sign/ckk28bag303506wcrghrg3z9k'
const DELEGATE_URL = "http://127.0.0.1:8000";

const connex = new Connex({
  node: 'https://testnet.veblocks.net/',
  network: 'test'
})

const ContractAddress = Definition.networks['5777'].address
const Contract = { connex }

Definition.abi.forEach(method => {
  if (!method.name || method.type !== 'function') {
    return
  }

  if (method.constant) {
    Contract[method.name] = defineConstant(method)
  } else {
    Contract[method.name] = defineSignedRequest(method)
  }
})

function defineConstant (method) {
  return (...args) => connex.thor.account(ContractAddress).method(method).call(...args)
}

function defineSignedRequest (method) {
  return async (...args) => {
    const transferClause = connex.thor.account(ContractAddress).method(method).asClause(...args)
    return sendTransaction([transferClause])
  }
}

async function sendTransaction (clauses) {
  const transaction = new Transaction({
    chainTag: Number.parseInt(connex.thor.genesis.id.slice(-2), 16),
    blockRef: connex.thor.status.head.id.slice(0, 18),
    expiration: 32,
    clauses,
    gas: 300000,
    gasPriceCoef: 128,
    dependsOn: null,
    nonce: Math.ceil(Math.random() * 1000000),
    reserved: {
      features: 1
    }
  })

  console.log("wallet is ", Wallet.address)
  const signingHash = transaction.signingHash()

  const sponsorResponse = await window.fetch(DELEGATE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      origin: Wallet.address,
      raw: `0x${transaction.encode().toString('hex')}`
    })
  })
  const { signature } = await sponsorResponse.json()

  const sponsorSignature = Buffer.from(signature.slice(2), 'hex')
  const originSignature = secp256k1.sign(signingHash, Buffer.from(Wallet.privateKey.slice(2), 'hex'))
  transaction.signature = Buffer.concat([
    originSignature,
    sponsorSignature
  ])

  const rawTransaction = `0x${transaction.encode().toString('hex')}`
  const transactionResponse = await window.fetch('https://testnet.veblocks.net/transactions', {
    method: 'POST',
    body: JSON.stringify({
      raw: rawTransaction
    })
  })
  const { id } = await transactionResponse.json()

  return { txid: id }
}

export default Contract
