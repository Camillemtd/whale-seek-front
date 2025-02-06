import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { useCallback } from 'react'
import {BASE_SEPOLIA_FACTORY_ADDRESS, BASE_SEPOLIA_FACTORY_ABI, BASE_SEPOLIA_WALLET_ABI} from '@/constants/contract'

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

export const useWalletFactory = () => {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  })

  const getWalletClient = useCallback(async () => {
    if (!window.ethereum) throw new Error("Metamask non détecté")
    
    return createWalletClient({
      chain: baseSepolia,
      transport: custom(window.ethereum)
    })
  }, [])

  // Vérifier si un wallet est déployé
  const checkIsWalletDeployed = useCallback(async (walletAddress: `0x${string}`) => {
    try {
      return await publicClient.readContract({
        address: BASE_SEPOLIA_FACTORY_ADDRESS,
        abi: BASE_SEPOLIA_FACTORY_ABI,
        functionName: 'isDeployedWallet',
        args: [walletAddress]
      })
    } catch (error) {
      console.error('Erreur lors de la vérification du wallet:', error)
      throw error
    }
  }, [publicClient])

  // Obtenir les infos d'un wallet
  const getWalletInformation = useCallback(async (walletAddress: `0x${string}`) => {
    try {
      const walletInfo = await publicClient.readContract({
        address: BASE_SEPOLIA_FACTORY_ADDRESS,
        abi: BASE_SEPOLIA_FACTORY_ABI,
        functionName: 'getWalletInfo',
        args: [walletAddress]
      }) as WalletInfo
      
      return {
        walletAddress: walletInfo.walletAddress,
        owner: walletInfo.owner,
        agent: walletInfo.agent,
        deployedAt: walletInfo.deployedAt.toString()
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos du wallet:', error)
      throw error
    }
  }, [publicClient])

  // Obtenir tous les wallets
  const getAllDeployedWallets = useCallback(async () => {
    try {
      return await publicClient.readContract({
        address: BASE_SEPOLIA_FACTORY_ADDRESS,
        abi: BASE_SEPOLIA_FACTORY_ABI,
        functionName: 'getAllWallets'
      })
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les wallets:', error)
      throw error
    }
  }, [publicClient])

  // Obtenir les wallets d'un propriétaire
  const getWalletsByOwner = useCallback(async (ownerAddress: `0x${string}`) => {
    try {
      return await publicClient.readContract({
        address: BASE_SEPOLIA_FACTORY_ADDRESS,
        abi: BASE_SEPOLIA_FACTORY_ABI,
        functionName: 'getOwnerWallets',
        args: [ownerAddress]
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des wallets du propriétaire:', error)
      throw error
    }
  }, [publicClient])

  // Obtenir le dernier ID de swap
  const getLastSwapId = useCallback(async (walletAddress: `0x${string}`) => {
    try {
      const swapId = await publicClient.readContract({
        address: walletAddress as `0x${string}`,
        abi: BASE_SEPOLIA_WALLET_ABI,
        functionName: 'getSwapId'
      }) as bigint
      return swapId
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier ID de swap:', error)
      throw error
    }
  }, [publicClient])

  // Obtenir les informations d'un swap spécifique
  const getSwapInfo = useCallback(async (walletAddress: `0x${string}`, swapId: number) => {
    try {
      const swapInfo = await publicClient.readContract({
        address: walletAddress as `0x${string}`,
        abi: BASE_SEPOLIA_WALLET_ABI,
        functionName: 'getSwap',
        args: [BigInt(swapId)]
      }) as SwapInfo

      return {
        tokenIn: swapInfo.tokenIn,
        tokenOut: swapInfo.tokenOut,
        amountIn: swapInfo.amountIn.toString(),
        executedAt: swapInfo.executedAt.toString()
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du swap:', error)
      throw error
    }
  }, [publicClient])

  // Obtenir l'historique complet des swaps d'un wallet
  const getFullSwapHistory = useCallback(async (walletAddress: `0x${string}`) => {
    try {
      const lastSwapId = await getLastSwapId(walletAddress)
      const swaps = []

      for (let i = 0; i <= Number(lastSwapId); i++) {
        const swapInfo = await getSwapInfo(walletAddress, i)
        swaps.push(swapInfo)
      }

      return swaps
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des swaps:', error)
      throw error
    }
  }, [getLastSwapId, getSwapInfo])

  return {
    checkIsWalletDeployed,
    getWalletInformation,
    getAllDeployedWallets,
    getWalletsByOwner,
    getWalletClient,
    getLastSwapId,
    getSwapInfo,
    getFullSwapHistory
  }
}