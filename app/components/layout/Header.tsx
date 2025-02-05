'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function Header() {
  const { login, logout, authenticated, user, ready } = usePrivy();

  return (
    <header className="fixed top-0 right-0 ml-20 w-[calc(100%-5rem)] bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">WHAL-E</h1>
        </div>
        <div className="flex items-center gap-4">
          {!ready ? (
            <div className="h-9 w-24 bg-gray-100 animate-pulse rounded" />
          ) : authenticated ? (
            <div className="flex items-center gap-4">
              {user?.email?.address && (
                <span className="text-sm text-gray-600">
                  Email: {user.email.address}
                </span>
              )}
              {user?.wallet?.address && (
                <span className="text-sm text-gray-600">
                  Wallet: {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                </span>
              )}
              <button
                onClick={logout}
                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}