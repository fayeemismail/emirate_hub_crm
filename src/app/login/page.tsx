'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F7F5F1' }}
      >
        <div className="flex flex-col items-center gap-3" style={{ color: '#78716C' }}>
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" 
            style={{ borderColor: '#E02126', borderTopColor: 'transparent' }}
          />
          <span className="text-xs font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#E02126] selection:text-white font-sans"
      style={{
        backgroundColor: '#F7F5F1',
        color: '#1C1917',
      }}
    >
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div 
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border mb-2"
            style={{
              backgroundColor: '#E02126',
              borderColor: '#E7E5E4',
            }}
          >
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase font-mono" style={{ color: '#1C1917' }}>
            emirate hub
          </h1>
          <p className="text-xs max-w-xs mx-auto" style={{ color: '#78716C' }}>
            Sign in to access your CRM and advisory portal.
          </p>
        </div>

        <div 
          className="rounded-3xl p-6 sm:p-8 border relative bg-white"
          style={{ borderColor: '#E7E5E4' }}
        >
          {errorMessage && (
            <div 
              className="mb-5 p-3 rounded-xl border flex items-start gap-2.5 text-xs"
              style={{
                backgroundColor: '#FEE2E2',
                borderColor: '#FECACA',
                color: '#B91C1C',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#E02126' }} />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: '#57534E' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A8A29E' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-xs focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#FAF9F6',
                    borderColor: '#E7E5E4',
                    color: '#1C1917',
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: '#57534E' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#A8A29E' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#FAF9F6',
                    borderColor: '#E7E5E4',
                    color: '#1C1917',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors cursor-pointer"
                  style={{ color: '#A8A29E' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group active:scale-[0.99]"
              style={{ backgroundColor: '#E02126' }}
            >
              {isSubmitting ? (
                <>
                  <div 
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" 
                    style={{ borderColor: '#ffffff', borderTopColor: 'transparent' }}
                  />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-white" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px]" style={{ color: '#A8A29E' }}>
          Emirate Hub Business Consultancy CRM
        </div>
      </div>
    </div>
  );
}
