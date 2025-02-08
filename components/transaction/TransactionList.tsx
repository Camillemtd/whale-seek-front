import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { useWalletFactory } from "@/hooks/useWalletFactory"
import { Address, formatEther } from "viem"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, Loader2 } from "lucide-react"
import { getTokens } from "@coinbase/onchainkit/api"

type Token = {
  address: Address
  chainId: number
  decimals: number
  image: string | null
  name: string
  symbol: string
}

type EnrichedSwap = {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  executedAt: string
}

interface TransactionListProps {
  walletAddress: Address
}

export const TransactionList = ({ walletAddress }: TransactionListProps) => {
  const [swaps, setSwaps] = useState<EnrichedSwap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getFullSwapHistory } = useWalletFactory()

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        const swapHistory = await getFullSwapHistory(walletAddress)

        // Enrich swap data with token information
        const enrichedSwaps = await Promise.all(
          swapHistory.map(async (swap) => {
            const [tokenInData, tokenOutData] = await Promise.all([
              getTokens({
                limit: "10",
                search: swap.tokenIn,
              }) as Promise<Token[]>,
              getTokens({
                limit: "10",
                search: swap.tokenOut,
              }) as Promise<Token[]>,
            ])

            return {
              tokenIn: tokenInData[0],
              tokenOut: tokenOutData[0],
              amountIn: swap.amountIn,
              executedAt: swap.executedAt,
            }
          })
        )

        setSwaps(enrichedSwaps)
      } catch (error) {
        console.error("Error while fetching swaps:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (walletAddress) {
      fetchSwaps()
    }
  }, [walletAddress, getFullSwapHistory])

  const formatDate = (timestamp: string) => {
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Swap History
        </CardTitle>
        <CardDescription>List of all swaps made by this wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : swaps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No swaps have been made yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Token In</TableHead>
                  <TableHead>Token Out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {swaps.map((swap, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatDate(swap.executedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {swap.tokenIn.image && (
                          <img
                            src={swap.tokenIn.image}
                            alt={swap.tokenIn.symbol}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {swap.tokenIn.symbol}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {swap.tokenIn.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {swap.tokenOut.image && (
                          <img
                            src={swap.tokenOut.image}
                            alt={swap.tokenOut.symbol}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {swap.tokenOut.symbol}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {swap.tokenOut.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatEther(BigInt(swap.amountIn))}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {swap.tokenIn.symbol}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        Success
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
