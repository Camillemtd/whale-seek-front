"use client"
import { usePrivy } from "@privy-io/react-auth"
import { redirect } from "next/navigation"
import { Bot, Wallet, LineChart, ArrowRight, Users } from "lucide-react"

export default function LandingPage() {
  const { login, authenticated } = usePrivy()

  if (authenticated) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-20 relative">
        <div className="max-w-5xl mx-auto text-center">
          <div className="space-y-6 mb-16">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              WhaleSeek AI
            </h1>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your intelligent crypto assistant powered by AI, tracking whales
              and optimizing your portfolio
            </p>
          </div>

          <button
            onClick={login}
            className="group mb-6 px-8 py-4 bg-primary hover:bg-primary/90 rounded-full text-lg font-medium text-primary-foreground transition-all flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={Bot}
              title="AI Assistant"
              description="Real-time analysis and personalized trading strategies tailored to your goals"
            />
            <FeatureCard
              icon={Users}
              title="Whale Tracking"
              description="Monitor large wallet movements and anticipate market trends"
            />
            <FeatureCard
              icon={LineChart}
              title="Smart Trading"
              description="Automated transactions with AI-powered timing and risk management"
            />
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
            <StatCard number="$2M+" label="Trading Volume" />
            <StatCard number="1000+" label="Active Users" />
            <StatCard number="99.9%" label="Success Rate" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface Feature {
  icon: React.ElementType
  title: string
  description: string
}

function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <div className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

interface Stat {
  number: string
  label: string
}

function StatCard({ number, label }: Stat) {
  return (
    <div className="text-center p-4 rounded-xl bg-card/30">
      <div className="text-2xl font-bold text-primary mb-1">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
