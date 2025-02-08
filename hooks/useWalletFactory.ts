import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  http,
} from "viem"
import { base } from "viem/chains"
import { useCallback } from "react"
import {
  BASE_MAINNET_FACTORY_ADDRESS,
  FACTORY_ABI,
  BASE_SEPOLIA_WALLET_ABI,
} from "@/constants/contract"
import { usePrivy } from "@privy-io/react-auth"

type WalletInfo = {
  walletAddress: `0x${string}`
  owner: `0x${string}`
  agent: `0x${string}`
  deployedAt: bigint
}

type SwapInfo = {
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  amountIn: bigint
  executedAt: bigint
}

export enum ContractEvent {
  WALLET_DEPLOYED = "WalletDeployed",
}

interface WatchContractEventArgs {
  event: ContractEvent
  args?: any
  handler: (logs?: any) => void
}

export const useWalletFactory = () => {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  })

  const { user } = usePrivy()

  const userAccount = user?.wallet?.address as Address

  const getWalletClient = useCallback(async () => {
    if (!window.ethereum) throw new Error("Metamask non détecté")

    return createWalletClient({
      chain: base,
      transport: custom(window.ethereum),
    })
  }, [])

  async function watchForEvent({
    event,
    args,
    handler,
  }: WatchContractEventArgs) {
    publicClient.watchContractEvent({
      address: BASE_MAINNET_FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      eventName: event,
      args,
      onLogs: (logs: any) => {
        handler(logs)
      },
    })
  }

  // Vérifier si un wallet est déployé
  const checkIsWalletDeployed = useCallback(
    async (walletAddress: `0x${string}`) => {
      try {
        return await publicClient.readContract({
          address: BASE_MAINNET_FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: "isDeployedWallet",
          args: [walletAddress],
        })
      } catch (error) {
        console.error("Erreur lors de la vérification du wallet:", error)
        throw error
      }
    },
    [publicClient]
  )

  // Obtenir les infos d'un wallet
  const getWalletInformation = useCallback(
    async (walletAddress: `0x${string}`) => {
      try {
        const walletInfo = (await publicClient.readContract({
          address: BASE_MAINNET_FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: "getWalletInfo",
          args: [walletAddress],
        })) as WalletInfo

        return {
          walletAddress: walletInfo.walletAddress,
          owner: walletInfo.owner,
          agent: walletInfo.agent,
          deployedAt: walletInfo.deployedAt.toString(),
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des infos du wallet:",
          error
        )
        throw error
      }
    },
    [publicClient]
  )

  // Obtenir tous les wallets
  const getAllDeployedWallets = useCallback(async () => {
    try {
      return await publicClient.readContract({
        address: BASE_MAINNET_FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "getAllWallets",
      })
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de tous les wallets:",
        error
      )
      throw error
    }
  }, [publicClient])

  // Obtenir les wallets d'un propriétaire
  const getOwnerWallet = useCallback(
    async (ownerAddress: `0x${string}`) => {
      try {
        return await publicClient.readContract({
          address: BASE_MAINNET_FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: "getOwnerWallet",
          args: [ownerAddress],
        })
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du wallet propriétaire:",
          error
        )
        throw error
      }
    },
    [publicClient]
  )

  // Obtenir le dernier ID de swap
  const getLastSwapId = useCallback(
    async (walletAddress: `0x${string}`) => {
      try {
        const swapId = (await publicClient.readContract({
          address: walletAddress as `0x${string}`,
          abi: BASE_SEPOLIA_WALLET_ABI,
          functionName: "getSwapId",
        })) as bigint
        return swapId
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du dernier ID de swap:",
          error
        )
        throw error
      }
    },
    [publicClient]
  )

  // Obtenir les informations d'un swap spécifique
  const getSwapInfo = useCallback(
    async (walletAddress: `0x${string}`, swapId: number) => {
      try {
        const swapInfo = (await publicClient.readContract({
          address: walletAddress as `0x${string}`,
          abi: BASE_SEPOLIA_WALLET_ABI,
          functionName: "getSwap",
          args: [BigInt(swapId)],
        })) as SwapInfo

        return {
          tokenIn: swapInfo.tokenIn,
          tokenOut: swapInfo.tokenOut,
          amountIn: swapInfo.amountIn.toString(),
          executedAt: swapInfo.executedAt.toString(),
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des informations du swap:",
          error
        )
        throw error
      }
    },
    [publicClient]
  )

  // Obtenir l'historique complet des swaps d'un wallet
  const getFullSwapHistory = useCallback(
    async (walletAddress: `0x${string}`) => {
      try {
        const lastSwapId = await getLastSwapId(walletAddress)
        const swaps = []

        for (let i = 0; i <= Number(lastSwapId); i++) {
          const swapInfo = await getSwapInfo(walletAddress, i)

          if (swapInfo.executedAt === "0") continue
          swaps.push(swapInfo)
        }

        return swaps
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'historique des swaps:",
          error
        )
        throw error
      }
    },
    []
  )

  const withdrawEth = useCallback(
    async (walletAddress: `0x${string}`, to: `0x${string}`, amount: bigint) => {
      try {
        const walletClient = await getWalletClient()

        const { request } = await publicClient.simulateContract({
          address: walletAddress,
          abi: BASE_SEPOLIA_WALLET_ABI,
          functionName: "withdrawEth",
          args: [to, amount],
          account: userAccount,
        })

        const hash = await walletClient.writeContract(request)
        return hash
      } catch (error) {
        console.error("Erreur lors du retrait d'ETH:", error)
        throw error
      }
    },
    [publicClient, getWalletClient]
  )

  const withdrawERC20 = useCallback(
    async (
      walletAddress: `0x${string}`,
      tokenAddress: `0x${string}`,
      to: `0x${string}`,
      amount: bigint
    ) => {
      try {
        const walletClient = await getWalletClient()

        const { request } = await publicClient.simulateContract({
          address: walletAddress,
          abi: BASE_SEPOLIA_WALLET_ABI,
          functionName: "withdrawERC20",
          args: [tokenAddress, to, amount],
          account: userAccount,
        })

        const hash = await walletClient.writeContract(request)
        return hash
      } catch (error) {
        console.error("Erreur lors du retrait du token ERC20:", error)
        throw error
      }
    },
    [publicClient, getWalletClient]
  )

  return {
    checkIsWalletDeployed,
    getWalletInformation,
    getAllDeployedWallets,
    getOwnerWallet,
    getWalletClient,
    getLastSwapId,
    getSwapInfo,
    getFullSwapHistory,
    watchForEvent,
    withdrawEth, 
    withdrawERC20,
    publicClient,
  }
}
