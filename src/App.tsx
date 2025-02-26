import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { Droplet, Loader2 } from "lucide-react";
import { awsConfig } from "./aws-config";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";

// Configure Amplify
Amplify.configure(awsConfig);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const session = await fetchAuthSession();
        setIsAuthenticated(!!session.tokens);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {!isAuthenticated ? (
        <>
          <div className="flex items-center mb-8">
            <Droplet className="h-10 w-10 text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              Plant Watering System
            </h1>
          </div>
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </>
      ) : (
        <Dashboard onSignOut={handleSignOut} />
      )}
    </div>
  );
}

export default App;
