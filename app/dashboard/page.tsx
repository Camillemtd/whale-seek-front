"use client"

import { useState, FormEvent, useEffect } from "react"
import { MessageSquare, Wallet, Users } from "lucide-react"
import { Message } from "@/types"
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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [hasDeployedWallet, setHasDeployedWallet] = useState<boolean | null>(
    null
  )

  const { user } = usePrivy()
  const { getWalletsByOwner } = useWalletFactory()

  useEffect(() => {
    const checkWalletDeployment = async () => {
      if (!user?.wallet?.address) return
      try {
        const wallets = await getWalletsByOwner(user.wallet.address as `0x${string}`)
        setHasDeployedWallet((wallets as `0x${string}`[]).length > 0)
      } catch (error) {
        console.error("Erreur lors de la vérification du wallet:", error)
        setHasDeployedWallet(false)
      }
    }

    checkWalletDeployment()
  }, [user?.wallet?.address, getWalletsByOwner])

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [...prev, { type: "user", content: input }])
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          content: "Je surveille votre portefeuille...",
        },
      ])
    }, 1000)
    setInput("")
  }

  const renderMainContent = () => {
    if (!user?.wallet?.address) {
      return (
        <div className="flex items-center justify-center h-64">
          <AuthButton showWallet={false} />
        </div>
      )
    }

    if (hasDeployedWallet === null) {
      return (
        <div className="flex h-full items-center justify-center">
          Loading...
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

      <div className="ml-20 flex-1 p-6 pt-20">{renderMainContent()}</div>
    </div>
  )
}
