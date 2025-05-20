import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import PriceDisplay from "./components/PriceDisplay";
import Sidebar from "./components/Sidebar";
import Wallet from "./pages/Wallet";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import AssetComparison from "./pages/AssetComparison";
import { Oval } from "react-loader-spinner";
import "./components/Sidebar.css";
import ProfitComparision from "./pages/ProfitComparision";

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated") === "true";
      setIsAuth(authStatus);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Oval color="#4a6cf7" height={50} width={50} />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            localStorage.getItem("isAuthenticated") === "true" ? (
              <Navigate to="/" replace />
            ) : (
              <Auth />
            )
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ marginLeft: 220, flex: 1, padding: "20px" }}>
                  <PriceDisplay />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ marginLeft: 220, flex: 1, padding: "20px" }}>
                  <Wallet />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/comparison"
          element={
            <ProtectedRoute>
              <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ marginLeft: 220, flex: 1, padding: "20px" }}>
                  <AssetComparison />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/comparison-assets"
          element={
            <ProtectedRoute>
              <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ marginLeft: 220, flex: 1, padding: "20px" }}>
                  <ProfitComparision />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ marginLeft: 220, flex: 1, padding: "20px" }}>
                  <Profile />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
