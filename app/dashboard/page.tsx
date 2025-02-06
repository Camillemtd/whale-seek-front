"use client"

import { useState, FormEvent, useEffect } from "react"
import { MessageSquare, Wallet, Users } from "lucide-react"
import { Message, Transaction, Whale } from "@/types"
import { NavButton } from "@/components/layout/NavButton"
import { useWalletFactory } from "@/hooks/useWalletFactory"
import { usePrivy } from "@privy-io/react-auth"

import { TransactionList } from "@/components/transaction/TransactionList"
import { WhaleList } from "@/components/whales/WhalesList"
import ChatInterface from "@/components/chat/ChatInterface"
import DeployWallet from "@/components/DeployWallet"
import Image from "next/image"
import AuthButton from "../../components/AuthButton"

const mockTransactions: Transaction[] = [
  {
    id: 1,
    token: "ETH",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    amount: "1.5",
    type: "buy",
  },
  {
    id: 2,
    token: "BTC",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    amount: "0.05",
    type: "sell",
  },
]

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
        const wallets = await getWalletsByOwner(user.wallet.address)
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

  // Fonction pour rendre le contenu principal
  const renderMainContent = () => {
    // Si l'utilisateur n'est pas connecté
    if (!user?.wallet?.address) {
      return (
        <div className="flex items-center justify-center h-64">
          <AuthButton showWallet={false} />
        </div>
      )
    }

    // Si on n'a pas encore vérifié le statut du wallet
    if (hasDeployedWallet === null) {
      return (
        <div className="flex h-full items-center justify-center">
          Loading...
        </div>
      )
    }

    // Si l'utilisateur n'a pas de wallet déployé
    if (!hasDeployedWallet) {
      return (
        <div className="flex h-full items-center justify-center">
          <DeployWallet onSuccess={() => setHasDeployedWallet(true)} />
        </div>
      )
    }

    // Contenu normal de l'application
    return (
      <>
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "transactions" && (
          <TransactionList transactions={mockTransactions} />
        )}
        {activeTab === "whales" && <WhaleList />}
      </>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="fixed w-20 h-screen bg-card p-4 flex flex-col items-center border-r overflow-y-hidden">
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
