export interface Transaction {
	id: number;
	token: string;
	address: string;
	amount: string;
	type: 'buy' | 'sell';
  }
  
  export interface Whale {
	id: number;
	address: string;
	holdings: string;
  }
  
  export interface Message {
	type: 'user' | 'agent';
	content: string;
  }