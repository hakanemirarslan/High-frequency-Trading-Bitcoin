import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/Wallet.css';

const Wallet = () => {
  const [balance, setBalance] = useState(10000); // Starting with a default balance
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [withdrawWarning, setWithdrawWarning] = useState(false);
  const navigate = useNavigate();

  const handleDeposit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      const newBalance = balance + numAmount;
      setBalance(newBalance);
      const newTransaction = {
        id: Date.now(),
        type: 'deposit',
        amount: numAmount,
        date: new Date().toLocaleString(),
      };
      setTransactions([newTransaction, ...transactions]);
      setAmount('');
    }
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (numAmount > 0 && numAmount <= balance) {
      const newBalance = balance - numAmount;
      setBalance(newBalance);
      const newTransaction = {
        id: Date.now(),
        type: 'withdrawal',
        amount: numAmount,
        date: new Date().toLocaleString(),
      };
      setTransactions([newTransaction, ...transactions]);
      setAmount('');
      setWithdrawWarning(false);
    } else if (numAmount > balance) {
      setWithdrawWarning(true);
    }
  };

  return (
    <div className="wallet-container">
      <header className="wallet-header">
        <h1>Wallet</h1>
      </header>
      
      <div className="balance-card">
        <h2>Current Balance</h2>
        <div className="balance-amount">${balance.toFixed(2)}</div>
      </div>

      <div className="transaction-form">
        <h2>Make a Transaction</h2>
        {withdrawWarning && (
          <p className="warning-message">
            Warning: Withdrawal amount exceeds your current balance
          </p>
        )}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="0.01"
          step="0.01"
        />
        <div className="button-group">
          <button onClick={handleDeposit} className="deposit-btn">
            Deposit
          </button>
          <button onClick={handleWithdraw} className="withdraw-btn">
            Withdraw
          </button>
        </div>
      </div>

      <div className="transaction-history">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <ul>
            {transactions.map((tx) => (
              <li key={tx.id} className={`transaction-item ${tx.type}`}>
                <span className="tx-type">{tx.type.toUpperCase()}</span>
                <span className={`tx-amount ${tx.type}`}>
                  {tx.type === 'withdrawal' ? '-' : ''}${tx.amount.toFixed(2)}
                </span>
                <span className="tx-date">{tx.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Wallet;
