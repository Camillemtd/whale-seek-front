import React, { useEffect, useState, useRef } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, X } from "lucide-react"
import { useWalletFactory } from "@/hooks/useWalletFactory"
import { usePrivy } from "@privy-io/react-auth"
import { Address, erc20Abi, parseUnits } from "viem"
import { getTokens } from "@coinbase/onchainkit/api"

type Token = {
  address: Address
  chainId: number
  decimals: number
  image: string | null
  name: string
  symbol: string
}

export default function WalletManagement({
  tradingWallet,
}: {
  tradingWallet: Address
}) {
  const { getWalletClient, publicClient } = useWalletFactory()
  const { user } = usePrivy()
  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [searchedToken, setSearchedToken] = useState<string>("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [amount, setAmount] = useState<string>("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userAccount = user?.wallet?.address as Address

  useEffect(() => {
    if (!searchedToken) {
      setTokens([])
      return
    }

    async function fetchTokens() {
      try {
        const tokens = (await getTokens({
          limit: "10",
          search: searchedToken,
        })) as Token[]
        setTokens(tokens)
        setIsDropdownOpen(true)
      } catch (error) {
        console.error(error)
        setTokens([])
      }
    }

    const timeoutId = setTimeout(fetchTokens, 300)
    return () => clearTimeout(timeoutId)
  }, [searchedToken])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function fundWallet() {
    if (!amount || !selectedToken) return

    if (selectedToken.address) {
      const walletClient = await getWalletClient()
      const decimals = selectedToken?.decimals ?? 18

      const { request } = await publicClient.simulateContract({
        address: selectedToken.address,
        abi: erc20Abi,
        functionName: "transfer",
        args: [tradingWallet, parseUnits(amount, decimals)],
        account: userAccount,
      })

      const hash = await walletClient.writeContract(request)
      console.log("hash: ", hash)

      return
    }

    const walletClient = await getWalletClient()
    const decimals = 18

    const hash = await walletClient.sendTransaction({
      account: userAccount,
      to: tradingWallet,
      value: parseUnits(amount, decimals),
    })

    console.log("hash: ", hash)
  }

  function handleTokenSelect(token: Token) {
    setSelectedToken(token)
    setSearchedToken("")
    setIsDropdownOpen(false)
  }

  function clearSelection() {
    setSelectedToken(null)
    setSearchedToken("")
    setAmount("")
    setIsDropdownOpen(false)
  }

  return (
    <div className="w-full max-w-md">
      <h3 className="mb-2">{tradingWallet}</h3>
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Input
            value={searchedToken}
            onChange={(e) => setSearchedToken(e.target.value)}
            placeholder="Search token name or paste address"
            className="w-full pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          {searchedToken && (
            <button
              onClick={clearSelection}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {isDropdownOpen && tokens.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto">
            {tokens.map((token, index) => (
              <button
                key={`${token.address}-${index}`}
                className="w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-colors"
                onClick={() => handleTokenSelect(token)}
              >
                {token.image ? (
                  <img
                    src={token.image}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        "/api/placeholder/32/32"
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="ml-3 text-left">
                  <div className="font-medium text-gray-900">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-gray-500">{token.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedToken && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedToken.image ? (
                <img
                  src={selectedToken.image}
                  alt={selectedToken.symbol}
                  className="w-12 h-12 rounded-full"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      "/api/placeholder/48/48"
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">
                    {selectedToken.symbol.slice(0, 2)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {selectedToken.symbol}
                </h3>
                <p className="text-sm text-gray-500">{selectedToken.name}</p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Chain ID</p>
                <p className="font-medium text-gray-900">
                  {selectedToken.chainId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Decimals</p>
                <p className="font-medium text-gray-900">
                  {selectedToken.decimals}
                </p>
              </div>
            </div>
            {!!selectedToken.address && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Contract Address</p>
                <p className="font-medium text-gray-900 truncate">
                  {selectedToken.address}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount of ${selectedToken.symbol}`}
              className="w-full mb-4"
            />
            <Button
              onClick={fundWallet}
              className="w-full"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Fund trading wallet
            </Button>
          </div>
        </div>
      )}

      {!selectedToken && (
        <div className="mt-4">
          <Button onClick={fundWallet} className="w-full" disabled>
            Send
          </Button>
        </div>
      )}
    </div>
  )
}
