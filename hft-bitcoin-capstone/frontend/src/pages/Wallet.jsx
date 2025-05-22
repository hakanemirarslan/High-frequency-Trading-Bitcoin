import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import '../styles/Wallet.css';
import { Link } from 'react-router-dom';

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [livePrice, setLivePrice] = useState(0);
  const [withdrawWarning, setWithdrawWarning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const navigate = useNavigate();
  const { balance, btcBalance, updateBalance, transactions, addTransaction, purchasePrice } = usePortfolio();

  // Only set purchase price when we don't have one yet and we're making a deposit
  const handleDeposit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      // Purchase price is now managed by the PortfolioContext
      
      updateBalance(balance + numAmount);
      addTransaction({
        id: Date.now(),
        type: 'deposit',
        amount: numAmount,
        date: new Date().toISOString()
      });
      setAmount('');
    }
  };

  useEffect(() => {
    // Fetch current BTC price from the same endpoint used in PriceDisplay
    const fetchPrice = async () => {
      try {
        const response = await fetch('http://localhost:8000/predict');
        const data = await response.json();
        setLivePrice(parseFloat(data.price));
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        setLivePrice(50000); // Fallback price
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Calculate profit/loss
  const calculateProfitLoss = () => {
    if (purchasePrice === 0 || livePrice === 0) return 0;
    return ((livePrice - purchasePrice) / purchasePrice) * 100;
  };

  const profitLoss = calculateProfitLoss();
  const isProfit = profitLoss >= 0;
  
  // Calculate total values
  const totalPortfolioValue = balance + (btcBalance * livePrice);
  const totalInvestment = balance + (btcBalance * purchasePrice);
  const totalProfitLoss = btcBalance * (livePrice - purchasePrice);
  const totalProfitLossPercentage = purchasePrice > 0 ? (totalProfitLoss / (btcBalance * purchasePrice)) * 100 : 0;

  const handleWithdraw = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (numAmount > 0 && numAmount <= balance) {
      updateBalance(balance - numAmount);
      addTransaction({
        id: Date.now(),
        type: 'withdrawal',
        amount: numAmount,
        date: new Date().toLocaleString(),
      });
      setAmount('');
      setWithdrawWarning(false);
    } else if (numAmount > balance) {
      setWithdrawWarning(true);
    }
  };

  // Ensure balance is a number before using toFixed
  const displayBalance = typeof balance === 'number' ? balance : 0;
  
  return (
    <div className="wallet-container">
      <header className="wallet-header">
        <h1>Wallet</h1>
      </header>
      
      <div className="wallet-layout">
        {/* Left Column - Wallet */}
        <div className="wallet-column">
          <div className="balance-card">
            <h2>Current Balance</h2>
            <div className="balance-amount">${displayBalance.toFixed(2)}</div>
          </div>

          <div className="transaction-form">
            <h2>Make a Transaction</h2>
            {withdrawWarning && (
              <p className="warning-message">
                Warning: Withdrawal amount exceeds your current balance
              </p>
            )}
            <div className="amount-input-container">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="amount-input"
              />
              <button 
                type="button" 
                className="max-button"
                onClick={() => setAmount(balance.toFixed(2))}
              >
                MAX
              </button>
            </div>
            <div className="button-group">
              <button onClick={handleDeposit} className="deposit-btn">
                Deposit
              </button>
              <button onClick={handleWithdraw} className="withdraw-btn">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Exchange */}
        <div className="exchange-column">
          <div className="exchange-card">
            <h2>Crypto Assets</h2>
            <div className="crypto-balance">
              <div className="crypto-asset">
                <div className="crypto-icon">₿</div>
                <div className="crypto-info">
                  <span className="crypto-name">Bitcoin</span>
                  <span className="crypto-symbol">BTC</span>
                </div>
                <div className="crypto-amount">
                  <div className="crypto-balance">{btcBalance.toFixed(8)}</div>
                  <div className="crypto-value">
                    <div className="price-row">
                      <span className="price-label">Purchase:</span>
                      <span>${purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="price-row">
                      <span className="price-label">Live:</span>
                      <span className={isProfit ? 'price-profit' : 'price-loss'}>
                        ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {purchasePrice > 0 && (
                          <span className="price-change">
                            {isProfit ? '↑' : '↓'} {Math.abs(profitLoss).toFixed(2)}%
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="portfolio-summary">
                      <div className="portfolio-row">
                        <span className="portfolio-label">Total Value:</span>
                        <span className="portfolio-value">
                          ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {btcBalance > 0 && (
                        <div className="portfolio-row total-pl">
                          <span className="portfolio-label">Total P/L:</span>
                          <span className={`portfolio-value ${totalProfitLoss >= 0 ? 'price-profit' : 'price-loss'}`}>
                            {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$
                            <span className="price-change">
                              ({totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%)
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="exchange-actions">
              <Link to="/trade" className="exchange-btn">
                Trade Crypto
              </Link>
              <Link to="/trade" className="exchange-btn secondary">
                Buy/Sell
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full width transaction history at the bottom */}
      <div className="full-history">
        <h2>Transaction History</h2>
        {(() => {
          const walletTransactions = transactions.filter(tx => tx.type === 'deposit' || tx.type === 'withdrawal');
          const indexOfLastTransaction = currentPage * transactionsPerPage;
          const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
          const currentTransactions = walletTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
          const totalPages = Math.ceil(walletTransactions.length / transactionsPerPage);

          if (walletTransactions.length === 0) {
            return <p>No deposit or withdrawal transactions yet</p>;
          }

          return (
            <>
              <ul>
                {currentTransactions.map((tx) => {
                  const txAmount = typeof tx.amount === 'number' ? tx.amount : 0;
                  return (
                    <li key={tx.id} className={`transaction-item ${tx.type}`}>
                      <span className="tx-type">{tx.type.toUpperCase()}</span>
                      <span className={`tx-amount ${tx.type}`}>
                        {tx.type === 'withdrawal' ? '-' : ''}${txAmount.toFixed(2)}
                      </span>
                      <span className="tx-date">
                        {new Date(tx.date).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </li>
                  );
                })}
              </ul>
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
  );
};

export default Wallet;
