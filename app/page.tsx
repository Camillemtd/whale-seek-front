'use client';
import { usePrivy } from '@privy-io/react-auth';
import { redirect } from 'next/navigation';

export default function LandingPage() {
  const { login, authenticated } = usePrivy();

  if (authenticated) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-20">

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Agent IA Crypto</h1>
          <p className="text-xl mb-12">
            Votre assistant personnel pour gérer et optimiser votre portefeuille crypto
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <FeatureCard 
              title="Analyses IA"
              description="Analyse en temps réel de vos investissements"
            />
            <FeatureCard 
              title="Suivi des Whales"
              description="Surveillance des mouvements des grands portefeuilles"
            />
            <FeatureCard 
              title="Transactions"
              description="Gestion automatisée de vos transactions"
            />
          </div>

          <button
            onClick={login}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg"
          >
            Commencer maintenant
          </button>
        </div>
      </div>
    </div>
  );
}

interface Feature {
  title: string
  description: string
}

function FeatureCard({ title, description }: Feature) {
  return (
    <div className="p-6 bg-gray-800 rounded-xl">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}