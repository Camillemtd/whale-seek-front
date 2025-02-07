import React from "react"
import { usePrivy } from "@privy-io/react-auth"

const AuthButton = ({
  showEmail = true,
  showWallet = true,
  className = "",
}) => {
  const { login, logout, authenticated, user, ready } = usePrivy()

  if (!ready) {
    return <div className="h-9 w-24 bg-gray-100 animate-pulse rounded" />
  }

  if (authenticated) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {showEmail && user?.email?.address && (
          <span className="text-sm text-gray-600">
            Email: {user.email.address}
          </span>
        )}
        {showWallet && user?.wallet?.address && (
          <span className="text-sm text-gray-600">
            Wallet: {user.wallet.address.slice(0, 6)}...
            {user.wallet.address.slice(-4)}
          </span>
        )}
        <button
          onClick={logout}
          className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={login}
      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
    >
      Connect your wallet
    </button>
  )
}

export default AuthButton
