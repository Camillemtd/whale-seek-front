import { Transaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard = ({ transaction }: TransactionCardProps) => (
  <Card className="mb-4">
    <CardContent className="pt-6">
      <div className="font-semibold">{transaction.token}</div>
      <div className="text-sm text-muted-foreground">{transaction.address}</div>
      <div className={transaction.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
        {transaction.type === 'buy' ? '+' : '-'}{transaction.amount}
      </div>
    </CardContent>
  </Card>
);