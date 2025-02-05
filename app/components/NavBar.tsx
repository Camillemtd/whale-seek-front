export const Navbar = ({ activeTab, setActiveTab }) => (
	<div className="w-20 bg-gray-900 p-4 flex flex-col items-center">
	  <NavButton 
		icon={<MessageSquare />} 
		label="Chat" 
		active={activeTab === 'chat'} 
		onClick={() => setActiveTab('chat')} 
	  />
	  <NavButton 
		icon={<Wallet />} 
		label="Transactions" 
		active={activeTab === 'transactions'} 
		onClick={() => setActiveTab('transactions')} 
	  />
	  <NavButton 
		icon={<Users />} 
		label="Whales" 
		active={activeTab === 'whales'} 
		onClick={() => setActiveTab('whales')} 
	  />
	</div>
  );
  