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
import { ArrowRightLeft } from "lucide-react"

type SwapTransaction = {
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  amountIn: string
  executedAt: string
}

interface TransactionListProps {
  walletAddress: Address
}

export const TransactionList = ({ walletAddress }: TransactionListProps) => {
  const [swaps, setSwaps] = useState<SwapTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getFullSwapHistory } = useWalletFactory()

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        const swapHistory = await getFullSwapHistory(walletAddress)
        setSwaps(swapHistory)
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

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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
            <div className="animate-pulse">Loading swaps...</div>
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
                    <TableCell className="font-mono">
                      {truncateAddress(swap.tokenIn)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {truncateAddress(swap.tokenOut)}
                    </TableCell>
                    <TableCell>{formatEther(BigInt(swap.amountIn))}</TableCell>
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
