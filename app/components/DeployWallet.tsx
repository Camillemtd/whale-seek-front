"use client"
import { usePrivy } from "@privy-io/react-auth"

export default function DeployWallet() {
  const { authenticated, user } = usePrivy()

  async function deployWallet() {
    if (!user?.wallet?.address) return

    const response = await fetch("/api/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: user.wallet.address }),
    })

    const { success, error } = await response.json()

    console.log("Success: ", success)
    console.log("Error: ", error)
  }

  return (
    <div>
      <button onClick={deployWallet}>Deploy wallet</button>
    </div>
  )
}
