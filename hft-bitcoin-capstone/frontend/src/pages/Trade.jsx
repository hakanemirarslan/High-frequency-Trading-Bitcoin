import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import '../styles/Trade.css';

const Trade = () => {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('buy');
  const [price, setPrice] = useState(0);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const navigate = useNavigate();
  
  const { balance, btcBalance, updateBalance, updateBtcBalance, addTransaction, transactions, updatePurchasePrice } = usePortfolio();

  // Fetch current BTC price from the backend API
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch('http://localhost:8000/predict');
        const data = await response.json();
        setPrice(parseFloat(data.price) || 50000); // Fallback to $50,000 if price is not available
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        setPrice(50000); // Fallback to $50,000 if API call fails
      }
    };

    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 30000); // Update price every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const usdAmount = parseFloat(amount);
    const safeBalance = typeof balance === 'number' ? balance : 0;
    const safeBtcBalance = typeof btcBalance === 'number' ? btcBalance : 0;
    const safePrice = typeof price === 'number' && price > 0 ? price : 1; // Prevent division by zero
    
    if (isNaN(usdAmount) || usdAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (transactionType === 'buy') {
      if (usdAmount > safeBalance) {
        setError(`Insufficient funds. Your available balance is $${safeBalance.toFixed(2)}`);
        return;
      }
      
      // Calculate BTC amount based on current price
      const btcAmount = usdAmount / safePrice;
      
      // Update the purchase price to the current price for all new purchases
      // This ensures we always show the latest purchase price in the wallet
      updatePurchasePrice(safePrice);
      localStorage.setItem('btcPurchasePrice', safePrice.toString());
      
      // Update balances
      updateBalance(safeBalance - usdAmount);
      updateBtcBalance(safeBtcBalance + btcAmount);
      
      // Add to transaction history with the purchase price
      addTransaction({
        id: Date.now(),
        type: 'buy',
        btcAmount: btcAmount,
        usdAmount,
        price: safePrice,
        purchasePrice: safePrice, // Store the purchase price with the transaction
        date: new Date().toISOString(),
      });
      
      // Show success message
      alert(`Successfully purchased ${btcAmount.toFixed(8)} BTC for $${usdAmount.toFixed(2)}`);
      
    } else { // sell
      // Calculate BTC amount based on current price
      const btcAmount = usdAmount / safePrice;
      
      if (btcAmount > safeBtcBalance) {
        setError(`Insufficient BTC balance. You have ${safeBtcBalance.toFixed(8)} BTC available`);
        return;
      }
      
      // Update balances
      updateBalance(safeBalance + usdAmount);
      updateBtcBalance(safeBtcBalance - btcAmount);
      
      // Add to transaction history
      addTransaction({
        id: Date.now(),
        type: 'sell',
        btcAmount: btcAmount,
        usdAmount,
        price: safePrice,
        date: new Date().toLocaleString(),
      });
      
      // Show success message
      alert(`Successfully sold ${btcAmount.toFixed(8)} BTC for $${usdAmount.toFixed(2)}`);
    }
    
    // Reset form
    setAmount('');
  };

  const handleMaxBuy = () => {
    const safeBalance = typeof balance === 'number' ? balance : 0;
    setAmount(safeBalance.toFixed(2));
  };

  const handleMaxSell = () => {
    const safeBtcBalance = typeof btcBalance === 'number' ? btcBalance : 0;
    const safePrice = typeof price === 'number' && price > 0 ? price : 1;
    setAmount((safeBtcBalance * safePrice).toFixed(2));
  };

  // Format numbers with proper checks
  const formatNumber = (value, decimals = 2) => {
    const num = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  return (
    <div className="trade-container">
      <header className="trade-header">
        <h1>Trade Bitcoin</h1>
        <div className="price-ticker">
          <span className="price">${formatNumber(price)}</span>
          <span className="price-change">BTC/USD</span>
        </div>
      </header>
      
      <div className="balance-info-container">
        <div className="balance-info-item">
          <span className="balance-label">Available Balance</span>
          <span className="balance-amount">${formatNumber(balance)}</span>
        </div>
        <div className="balance-info-item">
          <span className="balance-label">BTC Balance</span>
          <span className="balance-amount">{formatNumber(btcBalance, 8)} BTC</span>
        </div>
        <div className="balance-info-item">
          <span className="balance-label">BTC Value</span>
          <span className="balance-amount">${formatNumber(btcBalance * price)}</span>
        </div>
      </div>
      
      <div className="trade-card">
        <div className="trade-tabs">
          <button 
            className={`tab ${transactionType === 'buy' ? 'active' : ''}`}
            onClick={() => setTransactionType('buy')}
            type="button"
          >
            <span className="tab-icon">⬆️</span>
            <span>Buy BTC</span>
          </button>
          <button 
            className={`tab ${transactionType === 'sell' ? 'active' : ''}`}
            onClick={() => setTransactionType('sell')}
            type="button"
          >
            <span className="tab-icon">⬇️</span>
            <span>Sell BTC</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="trade-form">
          <div className="form-group">
            <div className="amount-header">
              <label htmlFor="amount">
                {transactionType === 'buy' ? 'Amount to Spend (USD)' : 'Amount to Receive (USD)'}
              </label>
            </div>
            <div className="max-buttons">
              {transactionType === 'buy' ? (
                <button 
                  type="button" 
                  className="max-btn" 
                  onClick={handleMaxBuy}
                  title={`Use maximum available ($${formatNumber(balance)})`}
                >
                  MAX
                </button>
              ) : (
                <button 
                  type="button" 
                  className="max-btn" 
                  onClick={handleMaxSell}
                  title={`Use maximum available BTC (${formatNumber(btcBalance, 8)} BTC)`}
                >
                  MAX
                </button>
              )}
            </div>
            <div className="input-group">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`0.00`}
                step="0.01"
                min="0.01"
                max={transactionType === 'buy' 
                  ? (typeof balance === 'number' ? balance : 0) 
                  : ((typeof btcBalance === 'number' && typeof price === 'number' ? btcBalance * price : 0).toFixed(2))}
                required
              />
            </div>
            <div className="balance-info">
              <span>Available: ${(typeof balance === 'number' ? balance : 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="form-group">
            <div className="conversion-info">
              <div className="conversion-amount">
                {amount && !isNaN(parseFloat(amount)) && price > 0 ? (
                  <>
                    <span className="amount">{formatNumber(parseFloat(amount) / price, 8)}</span>
                    <span className="currency">BTC</span>
                  </>
                ) : (
                  <span className="amount">0.00000000</span>
                )}
              </div>
              <div className="conversion-rate">
                1 BTC = ${formatNumber(price)}
              </div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className={`submit-btn ${transactionType}`}
          >
            {transactionType === 'buy' ? 'Buy Bitcoin' : 'Sell Bitcoin'}
          </button>
        </form>
      </div>
      
      <div className="transaction-history">
        <h2>Recent BTC Trades</h2>
        <div className="transactions-list">
          {(() => {
            const btcTrades = transactions.filter(tx => tx.type === 'buy' || tx.type === 'sell');
            const indexOfLastTransaction = currentPage * transactionsPerPage;
            const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
            const currentTransactions = btcTrades.slice(indexOfFirstTransaction, indexOfLastTransaction);
            const totalPages = Math.ceil(btcTrades.length / transactionsPerPage);

            if (btcTrades.length === 0) {
              return <p>No BTC trades yet</p>;
            }

            return (
              <>
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount (BTC)</th>
                      <th>Price (USD)</th>
                      <th>Total (USD)</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((tx) => {
                      if (!tx) return null;
                      const safeType = tx.type || 'unknown';
                      const safeBtcAmount = typeof tx.btcAmount === 'number' ? tx.btcAmount : 0;
                      const safePrice = typeof tx.price === 'number' ? tx.price : 0;
                      const safeUsdAmount = typeof tx.usdAmount === 'number' ? tx.usdAmount : 0;
                      const safeDate = tx.date || new Date().toLocaleString();
                      
                      return (
                        <tr key={tx.id || Date.now() + Math.random()} className={`tx-${safeType}`}>
                          <td className="tx-type">{safeType.toUpperCase()}</td>
                          <td>{safeBtcAmount.toFixed(8)}</td>
                          <td>${safePrice.toLocaleString()}</td>
                          <td>${safeUsdAmount.toFixed(2)}</td>
                          <td className="tx-date">{safeDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="page-btn"
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="page-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default Trade;
