import { FACTORY_ABI, BASE_MAINNET_FACTORY_ADDRESS } from "@/constants/contract"
import {
  Address,
  createPublicClient,
  createWalletClient,
  Hash,
  http,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { base } from "viem/chains"

export async function deployWallet(account: Address): Promise<any> {
  const AGENT_WALLET = "0x35E34708C7361F99041a9b046C72Ea3Fcb29134c"

  return await executeContractWriteGasless({
    functionName: "deployWallet",
    args: [account, AGENT_WALLET],
  })
}

export async function executeContractWriteGasless({
  functionName,
  args,
}: {
  functionName: string
  args: any[]
}): Promise<Hash> {
  try {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x`)

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_RPC_URL),
    })

    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_RPC_URL),
    })

    // Get current gas prices
    const gasPrice = await publicClient.getGasPrice()
    const block = await publicClient.getBlock({ blockTag: "latest" })
    const baseFee = block.baseFeePerGas || gasPrice

    // Calculate gas parameters with a buffer
    const maxFeePerGas = baseFee * BigInt(2) // 2x buffer
    const maxPriorityFeePerGas = BigInt(1500000) // 1.5 gwei priority fee

    const { request: gaslessRequest } = await publicClient.simulateContract({
      account,
      address: BASE_MAINNET_FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName,
      args,
      maxFeePerGas,
      maxPriorityFeePerGas,
    })

    const result = await walletClient.writeContract(gaslessRequest)

    console.log("result: ", result)

    return result
  } catch (error: any) {
    console.log(error)
    throw new Error(error)
  }
}
