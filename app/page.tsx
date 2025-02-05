"use client"

import { useState, FormEvent } from "react"
import { MessageSquare, Wallet, Users } from "lucide-react"
import { Message, Transaction, Whale } from "@/types"
import { NavButton } from "@/components/layout/NavButton"

import { TransactionList } from "@/components/transaction/TransactionList"
import { WhaleList } from "@/components/whales/WhalesList"
import ChatInterface from "@/components/chat/ChatInterface"
import Image from "next/image"

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

const mockWhales: Whale[] = [
  {
    id: 1,
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    holdings: "1000 ETH",
  },
  {
    id: 2,
    address: "0x842d35Cc6634C0532925a3b844Bc454e4438f44f",
    holdings: "100 BTC",
  },
]

type TabType = "chat" | "transactions" | "whales"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

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
  return (
    <div className="flex h-screen bg-background ">
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
      <div className="ml-20 flex-1 p-6 pt-20">
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "transactions" && (
          <TransactionList transactions={mockTransactions} />
        )}
        {activeTab === "whales" && <WhaleList whales={mockWhales} />}
      </div>
    </div>
  )
}
