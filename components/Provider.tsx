// app/providers.tsx
"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "viem/chains"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#3B82F6",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ["email", "wallet"],
      }}
    >
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
      >
        {children}
      </OnchainKitProvider>
    </PrivyProvider>
  )
}
