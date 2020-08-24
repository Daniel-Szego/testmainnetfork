const { ethers } = require("ethers")
const Ganache = require("ganache-core")
const privates = require('./privates')

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
  const wallet = new ethers.Wallet(privates.PRIV_KEY, provider)

  return wallet
}

const erc20 = require("@studydefi/money-legos/erc20")

jest.setTimeout(100000)
const uniswap = require("@studydefi/money-legos/uniswap")

describe("do some tests", () => {
  let wallet

  beforeAll(async () => {
    wallet = await startChain()
  })

  test("initial DAI balance of 0", async () => {
    const daiContract = new ethers.Contract(
      erc20.dai.address,
      erc20.dai.abi,
      wallet
    )
    const daiBalanceWei = await daiContract.balanceOf(wallet.address)
    const daiBalance = ethers.utils.formatUnits(daiBalanceWei, 18)
    expect(parseFloat(daiBalance)).toBe(0)
  })

  test("initial ETH balance of 1000 ETH", async () => {
    const ethBalanceWei = await wallet.getBalance()
    const ethBalance = ethers.utils.formatEther(ethBalanceWei)
    expect(parseFloat(ethBalance)).toBe(1000)
  })

  test("buy DAI from Uniswap", async () => {
    // 1. instantiate contracts
    const daiContract = new ethers.Contract(
      erc20.dai.address,
      erc20.dai.abi,
      wallet
    )
    const uniswapFactoryContract = new ethers.Contract(
      uniswap.factory.address,
      uniswap.factory.abi,
      wallet
    )
    const daiExchangeAddress = await uniswapFactoryContract.getExchange(
      erc20.dai.address
    )
    const daiExchangeContract = new ethers.Contract(
      daiExchangeAddress,
      uniswap.exchange.abi,
      wallet
    )
  
    // 2. do the actual swapping
    await daiExchangeContract.ethToTokenSwapInput(
      1, // min amount of token retrieved
      2525644800, // random timestamp in the future (year 2050)
      {
        gasLimit: 8000000,
        value: ethers.utils.parseEther("5"),
      }
    )
  
    // util function
    const fromWei = x => ethers.utils.formatUnits(x, 18)
  
    // 3. check DAI balance
    const daiBalanceWei = await daiContract.balanceOf(wallet.address)
    const daiBalance = parseFloat(fromWei(daiBalanceWei))
    expect(daiBalance).toBeGreaterThan(0)
    console.log("daiBalance", daiBalance)
  })

})
