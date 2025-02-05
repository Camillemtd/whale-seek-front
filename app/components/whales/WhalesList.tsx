import { Whale } from "@/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { WhaleCard } from "./WhaleCard"

interface WhaleListProps {
  whales: Whale[]
}

export const WhaleList = ({ whales }: WhaleListProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Whales Surveillées</CardTitle>
    </CardHeader>
    <CardContent>
      {whales.map((whale) => (
        <WhaleCard key={whale.id} whale={whale} />
      ))}
    </CardContent>
  </Card>
)
