import React, { useEffect, useState } from "react";
// import "./BudgetTracker.css";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

export default function BudgetTracker() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("penpad_budget");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense"); // 'income' or 'expense'
  const [dbInitialized, setDbInitialized] = useState(false);

  // Sync with Firestore for authenticated users
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    (async () => {
      try {
        const snap = await getDoc(userRef);
        const dbBudget = snap.exists() ? snap.data().budget || [] : [];
        const local = JSON.parse(localStorage.getItem("penpad_budget") || "[]");
        if ((!dbBudget || dbBudget.length === 0) && local && local.length > 0) {
          await setDoc(userRef, { budget: local }, { merge: true });
        }
      } catch (e) {
        console.debug("BudgetTracker: getDoc error", e);
      }
    })();

    let initial = true;
    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) {
        const local = JSON.parse(localStorage.getItem("penpad_budget") || "[]");
        if (initial && local && local.length > 0) {
          setDoc(userRef, { budget: local }, { merge: true }).catch((err) => console.error(err));
        }
        initial = false;
        setDbInitialized(true);
        return;
      }

      const dbBudget = snap.data().budget || [];
      const local = JSON.parse(localStorage.getItem("penpad_budget") || "[]");

      if (initial) {
        if ((!dbBudget || dbBudget.length === 0) && local && local.length > 0) {
          setDoc(userRef, { budget: local }, { merge: true }).catch((err) => console.error(err));
          initial = false;
          setDbInitialized(true);
          return;
        }
      }

      setTransactions(dbBudget);
      localStorage.setItem("penpad_budget", JSON.stringify(dbBudget));
      initial = false;
      setDbInitialized(true);
    });

    return () => unsub();
  }, [user]);

  // Persist to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem("penpad_budget", JSON.stringify(transactions));
    if (!user || !dbInitialized) return;
    const userRef = doc(db, "users", user.uid);
    setDoc(userRef, { budget: transactions }, { merge: true }).catch(() => { });
  }, [transactions, user, dbInitialized]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!text || !amount) return;

    const newTransaction = {
      id: Date.now(),
      text,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    setText("");
    setAmount("");
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  return (
    <div className="budget-page">

      <div className="budget-content">
        <h1>Budget Tracker</h1>

        <div className="budget-summary">
          <div className="summary-card balance">
            <h3>Net Balance</h3>
            <p className={balance >= 0 ? "positive" : "negative"}>
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="summary-card income">
            <h3>Total Income</h3>
            <p>${income.toFixed(2)}</p>
          </div>
          <div className="summary-card expenses">
            <h3>Total Expenses</h3>
            <p>${expenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="budget-main-container">
          <div className="transaction-form-section">
            <h2>Add Transaction</h2>
            <form onSubmit={addTransaction} className="transaction-form">
              <input
                type="text"
                placeholder="Description (e.g., Grocery, Salary)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <div className="type-selector">
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={type === "expense"}
                    onChange={() => setType("expense")}
                  />
                  <span>Expense</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={type === "income"}
                    onChange={() => setType("income")}
                  />
                  <span>Income</span>
                </label>
              </div>
              <button type="submit" className="add-transaction-btn">
                Add Transaction
              </button>
            </form>
          </div>

          <div className="transaction-list-section">
            <h2>History</h2>
            <ul className="transaction-list">
              {transactions.length === 0 && (
                <li className="empty-msg">No transactions yet.</li>
              )}
              {transactions
                .slice()
                .reverse()
                .map((t) => (
                  <li key={t.id} className={`transaction-item ${t.type}`}>
                    <div className="transaction-info">
                      <span className="transaction-text">{t.text}</span>
                      <span className="transaction-date">
                        {new Date(t.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="transaction-amount-group">
                      <span className="transaction-amount">
                        {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                      </span>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTransaction(t.id)}
                        aria-label="Delete transaction"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
