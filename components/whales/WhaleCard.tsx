import { Whale } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface WhaleCardProps {
  whale: Whale;
}

export const WhaleCard = ({ whale }: WhaleCardProps) => (
  <Card className="mb-4">
    <CardContent className="pt-6">
      <div className="font-mono text-sm">{whale.address}</div>
      <div className="font-semibold mt-2">{whale.holdings}</div>
    </CardContent>
  </Card>
);