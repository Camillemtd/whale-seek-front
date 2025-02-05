import { Transaction } from "@/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { TransactionCard } from "./TransactionCard"

interface TransactionListProps {
  transactions: Transaction[]
}

export const TransactionList = ({ transactions }: TransactionListProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Transactions</CardTitle>
    </CardHeader>
    <CardContent>
      {transactions.map((tx) => (
        <TransactionCard key={tx.id} transaction={tx} />
      ))}
    </CardContent>
  </Card>
)
