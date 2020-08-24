const { ethers } = require("ethers")
const Ganache = require("ganache-core")
var privates = require('./privates');


const startChain = async () => {
  const ganache = Ganache.provider({
    fork: privates.MAINNET_NODE_URL,
    network_id: 1,
    accounts: [
      {
        secretKey: privates.PRIV_KEY,
        balance: ethers.utils.hexlify(ethers.utils.parseEther("1000")),
      },
    ],
  })

  const provider = new ethers.providers.Web3Provider(ganache)
  const wallet = new ethers.Wallet(PRIV_KEY, provider)

  return wallet
}
