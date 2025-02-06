"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Wallet, Users, LucideIcon } from "lucide-react"
import { NavButton } from "@/components/layout/NavButton"
import { useWalletFactory } from "@/hooks/useWalletFactory"
import { usePrivy } from "@privy-io/react-auth"
import { TransactionList } from "@/components/transaction/TransactionList"
import { WhaleList } from "@/components/whales/WhalesList"
import ChatInterface from "@/components/chat/ChatInterface"
import DeployWallet from "@/components/DeployWallet"
import Image from "next/image"
import AuthButton from "../../components/AuthButton"

type TabType = "chat" | "transactions" | "whales"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("chat")
  const [hasDeployedWallet, setHasDeployedWallet] = useState<boolean | null>(null)

  const { user } = usePrivy()
  const { getWalletsByOwner } = useWalletFactory()

  useEffect(() => {
    const checkWalletDeployment = async () => {
      if (!user?.wallet?.address) return
      try {
        const wallets = await getWalletsByOwner(user.wallet.address as `0x${string}`)
        setHasDeployedWallet((wallets as `0x${string}`[]).length > 0)
      } catch (error) {
        console.error("Error checking wallet:", error)
        setHasDeployedWallet(false)
      }
    }

    checkWalletDeployment()
  }, [user?.wallet?.address, getWalletsByOwner])

  const renderMainContent = () => {
    if (!user?.wallet?.address) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-background to-background/80">
          <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
            <div className="mb-8">
              <Image
                src="/icon.png"
                alt="Logo"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-primary">
              Welcome to your Dashboard
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect your wallet to access all dashboard features
            </p>
            <div className="flex justify-center">
              <AuthButton showWallet={false} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <FeatureCard
                icon={MessageSquare}
                title="Chat"
                description="Interact with our intelligent assistant"
              />
              <FeatureCard
                icon={Wallet}
                title="Transactions"
                description="Track your transactions in real time"
              />
              <FeatureCard
                icon={Users}
                title="Whales"
                description="Analyze large wallet movements"
              />
            </div>
          </div>
        </div>
      )
    }

    if (hasDeployedWallet === null) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!hasDeployedWallet) {
      return (
        <div className="flex h-full items-center justify-center">
          <DeployWallet onSuccess={() => setHasDeployedWallet(true)} />
        </div>
      )
    }

    return (
      <>
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "transactions" && (
          <TransactionList walletAddress={user.wallet.address as `0x${string}`} />
        )}
        {activeTab === "whales" && <WhaleList />}
      </>
    )
  }


  interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
  }

  const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
    <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
      <Icon className="w-12 h-12 text-primary mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      <div className="fixed w-20 h-screen bg-card p-4 flex flex-col items-center border-r overflow-hidden">
        <div className="">
          <Image
            src="/icon.png"
            alt="Logo"
            width={64}
            height={64}
            className="mb-4"
          />
        </div>
        <NavButton
          icon={MessageSquare}
          label="Chat"
          active={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        />
        <NavButton
          icon={Wallet}
          label="Transactions"
          active={activeTab === "transactions"}
          onClick={() => setActiveTab("transactions")}
        />
        <NavButton
          icon={Users}
          label="Whales"
          active={activeTab === "whales"}
          onClick={() => setActiveTab("whales")}
        />
      </div>

      <div className="ml-20 flex-1 p-6 pt-20">
        {renderMainContent()}
      </div>
    </div>
  )
}