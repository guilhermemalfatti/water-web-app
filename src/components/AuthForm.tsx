import React, { useState } from 'react';
import { signIn, signUp, confirmSignUp } from 'aws-amplify/auth';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [formState, setFormState] = useState<'signIn' | 'signUp' | 'confirmSignUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signIn({ username: email, password });
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: true,
        },
      });
      setFormState('confirmSignUp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });
      // Auto sign in is enabled, so we should be signed in now
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {formState === 'signIn' ? 'Sign In' : formState === 'signUp' ? 'Create Account' : 'Confirm Sign Up'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {formState === 'signIn' 
            ? 'Sign in to access your plant watering system' 
            : formState === 'signUp' 
              ? 'Create an account to get started' 
              : 'Enter the confirmation code sent to your email'}
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {formState === 'signIn' && (
        <form onSubmit={handleSignIn} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => setFormState('signUp')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      )}

      {formState === 'signUp' && (
        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="At least 8 characters with uppercase, lowercase, numbers and symbols"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign Up'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => setFormState('signIn')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      )}

      {formState === 'confirmSignUp' && (
        <form onSubmit={handleConfirmSignUp} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700">Confirmation Code</label>
              <input
                id="confirmationCode"
                name="confirmationCode"
                type="text"
                required
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter code from your email"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify Account'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => setFormState('signIn')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Back to sign in
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthForm;