import React, { useEffect, useState, useRef } from "react"
import {
  Search,
  X,
  Wallet,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { useWalletFactory } from "@/hooks/useWalletFactory"
import { usePrivy } from "@privy-io/react-auth"
import { Address, erc20Abi, parseUnits } from "viem"
import { GetTokensResponse, getTokens } from "@coinbase/onchainkit/api"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

type Token = {
  address: Address
  chainId: number
  decimals: number
  image: string | null
  name: string
  symbol: string
}

type TokenBalance = {
  contractAddress: string | null
  name: string
  symbol: string
  balance: string
  valueInUSD: string
  image: string
}

type WalletBalance = {
  address: string
  tokens: TokenBalance[]
}

type Mode = "fund" | "withdraw"

export default function WalletManagement({
  tradingWallet,
}: {
  tradingWallet: Address
}) {
  const { toast } = useToast()
  const { getWalletClient, publicClient, withdrawEth, withdrawERC20 } =
    useWalletFactory()
  const { user } = usePrivy()
  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [searchedToken, setSearchedToken] = useState<string>("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [amount, setAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<Mode>("fund")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [walletBalances, setWalletBalances] = useState<WalletBalance | null>(
    null
  )
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)

  const userAccount = user?.wallet?.address as Address

  const fetchBalances = async () => {
    setIsLoadingBalances(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}alchemy/balances/${tradingWallet}`,
        {
          method: "GET",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch balances")
      }

      const data = await response.json()

      const enrichedTokens = await Promise.all(
        data.tokens.map(async (token: any) => {
          if (!token.contractAddress) {
            const tokenInfo: GetTokensResponse = await getTokens({
              limit: "1",
              search: "eth",
            })

            if (Array.isArray(tokenInfo) && tokenInfo.length > 0) {
              const firstToken = tokenInfo[0]
              return {
                ...token,
                image: firstToken.image || null,
                symbol: firstToken.symbol || token.symbol,
              }
            }

            return
          }

          try {
            const tokenInfo: GetTokensResponse = await getTokens({
              limit: "1",
              search: token.contractAddress,
            })

            if (Array.isArray(tokenInfo) && tokenInfo.length > 0) {
              const firstToken = tokenInfo[0]
              return {
                ...token,
                image: firstToken.image || null,
                symbol: firstToken.symbol || token.symbol,
              }
            }
          } catch (error) {
            console.error(
              `Error fetching token info for ${token.contractAddress}:`,
              error
            )
          }
        })
      )

      console.log("enrichedTokens: ", enrichedTokens)

      setWalletBalances({
        ...data,
        tokens: enrichedTokens,
      })
    } catch (error) {
      console.error("Error fetching balances:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch wallet balances",
      })
    } finally {
      setIsLoadingBalances(false)
    }
  }

  useEffect(() => {
    fetchBalances()
  }, [tradingWallet])

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

  async function handleTransaction() {
    if (!amount || !selectedToken) return

    setIsLoading(true)
    try {
      const decimals = selectedToken?.decimals ?? 18
      const parsedAmount = parseUnits(amount, decimals)

      let hash: `0x${string}`

      if (mode === "fund") {
        if (selectedToken.address) {
          const walletClient = await getWalletClient()
          const { request } = await publicClient.simulateContract({
            address: selectedToken.address,
            abi: erc20Abi,
            functionName: "transfer",
            args: [tradingWallet, parsedAmount],
            account: userAccount,
          })
          hash = await walletClient.writeContract(request)
        } else {
          const walletClient = await getWalletClient()
          hash = await walletClient.sendTransaction({
            account: userAccount,
            to: tradingWallet,
            value: parsedAmount,
          })
        }
      } else {
        if (selectedToken.address) {
          hash = await withdrawERC20(
            tradingWallet,
            selectedToken.address,
            userAccount,
            parsedAmount
          )
        } else {
          hash = await withdrawEth(tradingWallet, userAccount, parsedAmount)
        }
      }

      toast({
        title: "Transaction Successful",
        description: `Successfully ${
          mode === "fund" ? "funded" : "withdrawn"
        } ${amount} ${selectedToken.symbol || "ETH"}`,
        action: (
          <ToastAction
            altText="View on Explorer"
            onClick={() =>
              window.open(`https://etherscan.io/tx/${hash}`, "_blank")
            }
          >
            View on Explorer
          </ToastAction>
        ),
      })

      clearSelection()
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "There was an error processing your transaction",
      })
    } finally {
      setIsLoading(false)
      fetchBalances()
    }
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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Wallet className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Wallet Management
          </h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={mode === "fund" ? "default" : "outline"}
            onClick={() => setMode("fund")}
            className="flex items-center"
            disabled={isLoading}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Fund
          </Button>
          <Button
            variant={mode === "withdraw" ? "default" : "outline"}
            onClick={() => setMode("withdraw")}
            className="flex items-center"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Trading Wallet Address</p>
            <p className="font-mono text-sm text-gray-700">{tradingWallet}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchBalances}
            disabled={isLoadingBalances}
            className="ml-2"
          >
            <RefreshCw
              className={`h-5 w-5 ${isLoadingBalances ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {isLoadingBalances ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : walletBalances?.tokens.length ? (
            <div className="space-y-2">
              {walletBalances.tokens.map((token, index) => {
                if (!token) return

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      {token.image ? (
                        <img
                          src={token.image}
                          alt={token.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                              "/api/placeholder/40/40"
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {token.symbol?.slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {token.symbol}
                        </p>
                        <p className="text-sm text-gray-500">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {token.balance}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${token.valueInUSD}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No tokens found in wallet
            </p>
          )}
        </div>

        <div className="flex items-center mt-4">
          {mode === "fund" ? (
            <ArrowRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div className="relative mb-4">
          <Input
            value={searchedToken}
            onChange={(e) => setSearchedToken(e.target.value)}
            placeholder="Search for a token..."
            className="w-full pl-12 pr-12 h-14 bg-gray-50 border-gray-200 focus:border-blue-500 rounded-xl"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
          {searchedToken && (
            <button
              onClick={clearSelection}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {isDropdownOpen && tokens.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-auto">
            {tokens.map((token, index) => (
              <button
                key={`${token.address}-${index}`}
                className="w-full px-4 py-4 flex items-center hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                onClick={() => handleTokenSelect(token)}
                disabled={isLoading}
              >
                {token.image ? (
                  <img
                    src={token.image}
                    alt={token.symbol}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        "/api/placeholder/40/40"
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="ml-4 text-left flex-1">
                  <div className="font-semibold text-gray-900">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-gray-500">{token.name}</div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedToken ? (
        <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {selectedToken.image ? (
                <img
                  src={selectedToken.image}
                  alt={selectedToken.symbol}
                  className="w-14 h-14 rounded-full"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      "/api/placeholder/56/56"
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-blue-600">
                    {selectedToken.symbol.slice(0, 2)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  {selectedToken.symbol}
                </h3>
                <p className="text-sm text-gray-500">{selectedToken.name}</p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-500 mb-1">Chain ID</p>
              <p className="font-semibold text-gray-900">
                {selectedToken.chainId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Decimals</p>
              <p className="font-semibold text-gray-900">
                {selectedToken.decimals}
              </p>
            </div>
            {selectedToken.address && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">Contract Address</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {selectedToken.address}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount of ${selectedToken.symbol || "ETH"}`}
              className="w-full h-14 text-lg"
              disabled={isLoading}
            />
            <Button
              onClick={handleTransaction}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : mode === "fund" ? (
                "Fund Trading Wallet"
              ) : (
                "Withdraw from Trading Wallet"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <Button
            className="w-full h-14 text-lg bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            Select a token to continue
          </Button>
        </div>
      )}
    </div>
  )
}
