// hooks/useWalletFactory.ts
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { useCallback } from 'react'
import {BASE_SEPOLIA_FACTORY_ADDRESS, BASE_SEPOLIA_FACTORY_ABI} from '@/constants/contract'

type WalletInfo = {
  walletAddress: `0x${string}`
  owner: `0x${string}`
  agent: `0x${string}`
  deployedAt: bigint
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
  const checkIsWalletDeployed = useCallback(async (walletAddress: string) => {
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
  const getWalletInformation = useCallback(async (walletAddress: string) => {
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
  const getWalletsByOwner = useCallback(async (ownerAddress: string) => {
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

  return {
    checkIsWalletDeployed,
    getWalletInformation,
    getAllDeployedWallets,
    getWalletsByOwner,
    getWalletClient
  }
}