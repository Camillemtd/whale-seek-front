"use client"
import { usePrivy } from "@privy-io/react-auth"
import { Contract, JsonRpcProvider } from "ethers"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RocketIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { BASE_MAINNET_FACTORY_ADDRESS, FACTORY_ABI } from "@/constants/contract"
import { Address, getAddress } from "viem"

export enum ContractEvent {
  WALLET_DEPLOYED = "WalletDeployed",
}

interface DeployWalletProps {
  onSuccess?: () => void
}

export default function DeployWallet({ onSuccess }: DeployWalletProps) {
  const { user } = usePrivy()
  const [isDeploying, setIsDeploying] = useState(false)
  const { toast } = useToast()

  const userAccount = user?.wallet?.address as Address

  useEffect(() => {
    const provider = new JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_BASE_RPC_URL
    )

    const contract = new Contract(
      BASE_MAINNET_FACTORY_ADDRESS,
      FACTORY_ABI,
      provider
    )

    contract.on(ContractEvent.WALLET_DEPLOYED, (...args) => {
      const [_, owner, ...rest] = args

      if (getAddress(owner) !== getAddress(userAccount)) return

      toast({
        title: "Wallet Deployed Successfully",
        description: "Your Smart Wallet is ready to use",
        variant: "default",
        duration: 5000,
      })

      setIsDeploying(false)

      if (onSuccess) onSuccess()
    })
  }, [])

  async function deployWallet() {
    if (!user?.wallet?.address) return

    setIsDeploying(true)
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: user.wallet.address }),
      })

      const { error } = await response.json()

      if (error) {
        toast({
          title: "Deployment Failed",
          description:
            "There was an error deploying your wallet. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
        console.error("Error: ", error)
      }
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description:
          "There was an error deploying your wallet. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
      console.error("Deployment error:", error)
    }
  }

  return (
    <Card className="w-[450px] bg-gradient-to-br from-background to-muted">
      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <RocketIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Deploy Your Smart Wallet</CardTitle>
        </div>
        <CardDescription className="text-base space-y-2">
          <p>Welcome to Whal-E, your personal trading assistant!</p>
          <p>
            To get started, we need to deploy a Smart Wallet that will allow our
            AI agent to execute trades on your behalf while keeping your funds
            secure.
          </p>
          <p className="font-medium text-primary">
            🔐 You maintain full control and can withdraw your funds at any
            time.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={deployWallet}
          disabled={isDeploying || !user?.wallet?.address}
          className="w-full h-12 text-lg font-medium"
        >
          {isDeploying ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              <span>Deploying...</span>
            </div>
          ) : (
            "Deploy Smart Wallet"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
