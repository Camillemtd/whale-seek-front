import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Whale {
  whale_address: string
  first_seen: string
  last_seen: string
  created_at: string
  updated_at: string
  detected_transaction_id: string
  score: number
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-500 text-white"
  if (score >= 60) return "bg-green-400 text-white"
  if (score >= 40) return "bg-yellow-400 text-black"
  if (score >= 20) return "bg-orange-400 text-white"
  return "bg-red-500 text-white"
}

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Very High"
  if (score >= 60) return "High"
  if (score >= 40) return "Medium"
  if (score >= 20) return "Low"
  return "Very Low"
}

export const WhaleList = () => {
  const [whales, setWhales] = useState<Whale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWhales = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_API_URL}whales`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch whales")
        }
        const data = await response.json()
        setWhales(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWhales()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const filteredWhales = whales.filter((whale) =>
    whale.whale_address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">Loading whales...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center text-red-500">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Whales List ({filteredWhales.length})</span>
        </CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredWhales.map((whale, index) => (
            <Card
              key={whale.whale_address + index}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {truncateAddress(whale.whale_address)}
                    </Badge>
                    <a
                      href={`https://basescan.org/address/${whale.whale_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    TX: {truncateAddress(whale.detected_transaction_id)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">First Seen</p>
                    <p className="font-medium">
                      {formatDate(whale.first_seen)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Last Seen</p>
                    <p className="font-medium">{formatDate(whale.last_seen)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Created At</p>
                    <p className="font-medium">
                      {formatDate(whale.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Updated At</p>
                    <p className="font-medium">
                      {formatDate(whale.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-gray-500 text-xs">Score:</span>
                  <div
                    className={`px-3 py-1 rounded-full ${getScoreColor(
                      whale.score
                    )}`}
                  >
                    <span className="font-medium">{whale.score}</span>
                    <span className="ml-2 text-xs">
                      ({getScoreLabel(whale.score)})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default WhaleList
