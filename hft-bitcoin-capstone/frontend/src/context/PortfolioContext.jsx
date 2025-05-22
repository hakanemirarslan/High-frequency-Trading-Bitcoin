import React, { createContext, useState, useEffect, useMemo } from 'react';

// Create the context with a default value
export const PortfolioContext = createContext({
  balance: 10000,
  btcBalance: 0,
  transactions: [],
  purchasePrice: 0,
  updateBalance: () => {},
  updateBtcBalance: () => {},
  addTransaction: () => {},
  updatePurchasePrice: () => {}
});

// Custom hook to use the portfolio context
export const usePortfolio = () => {
  const context = React.useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

// Provider component
export const PortfolioProvider = ({ children }) => {
  // Load from localStorage if available, otherwise use defaults
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('walletBalance');
    return saved ? parseFloat(saved) : 10000; // Default $10,000
  });
  
  const [btcBalance, setBtcBalance] = useState(() => {
    const saved = localStorage.getItem('btcBalance');
    return saved ? parseFloat(saved) : 0;
  });
  
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [purchasePrice, setPurchasePrice] = useState(() => {
    const saved = localStorage.getItem('btcPurchasePrice');
    return saved ? parseFloat(saved) : 0;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('walletBalance', balance);
    localStorage.setItem('btcBalance', btcBalance);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('btcPurchasePrice', purchasePrice);
  }, [balance, btcBalance, transactions, purchasePrice]);

  const updateBalance = (newBalance) => {
    setBalance(parseFloat(newBalance.toFixed(2)));
  };

  const updateBtcBalance = (newBtcBalance) => {
    setBtcBalance(parseFloat(newBtcBalance.toFixed(8)));
  };

  const addTransaction = (transaction) => {
    setTransactions(prev => [transaction, ...prev].slice(0, 50)); // Keep last 50 transactions
  };
  
  const updatePurchasePrice = (price) => {
    setPurchasePrice(price);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    balance,
    btcBalance,
    transactions,
    purchasePrice,
    updateBalance,
    updateBtcBalance,
    addTransaction,
    updatePurchasePrice
  }), [balance, btcBalance, transactions, purchasePrice]);

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
};
