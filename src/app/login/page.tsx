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

  // If already authenticated, redirect to dashboard
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
        style={{ backgroundColor: '#07172e' }}
      >
        <div className="flex flex-col items-center gap-3" style={{ color: '#bae6fd' }}>
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" 
            style={{ borderColor: '#38bdf8', borderTopColor: 'transparent' }}
          />
          <span className="text-xs font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#2563eb] selection:text-white font-sans"
      style={{
        background: 'linear-gradient(180deg, #081d39 0%, #0b2548 40%, #061326 100%)',
        color: '#ffffff',
      }}
    >
      {/* Background Decorative Ambient Glows */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#0284c71a' }}
      />
      <div 
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#4f46e51a' }}
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div 
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl border mb-2"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
              borderColor: '#93c5fd4d',
              boxShadow: '0 10px 25px #02061766',
            }}
          >
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase font-mono" style={{ color: '#ffffff' }}>
            emirate hub
          </h1>
          <p className="text-xs max-w-xs mx-auto" style={{ color: '#bae6fdcc' }}>
            Sign in to access your CRM and advisory portal.
          </p>
        </div>

        {/* Login Card */}
        <div 
          className="rounded-3xl p-6 sm:p-8 shadow-2xl border backdrop-blur-xl relative"
          style={{
            backgroundColor: '#0d284cf2',
            borderColor: '#93c5fd40',
            boxShadow: '0 25px 50px #020617cc',
          }}
        >
          {/* Error Message Box */}
          {errorMessage && (
            <div 
              className="mb-5 p-3 rounded-xl border flex items-start gap-2.5 text-xs"
              style={{
                backgroundColor: '#f43f5e26',
                borderColor: '#fb71854d',
                color: '#fca5a5',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f43f5e' }} />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: '#bae6fd' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#7dd3fc' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-xs text-white focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#061834',
                    borderColor: '#93c5fd4d',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: '#bae6fd' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#7dd3fc' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs text-white focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#061834',
                    borderColor: '#93c5fd4d',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors cursor-pointer hover:text-white"
                  style={{ color: '#7dd3fccc' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group active:scale-[0.99] border"
              style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #0284c7 100%)',
                borderColor: '#60a5fa66',
                boxShadow: '0 4px 14px #1e3a8a80',
              }}
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

        {/* Footer info */}
        <div className="text-center text-[11px]" style={{ color: '#bae6fd99' }}>
          Emirate Hub Business Consultancy CRM
        </div>
      </div>
    </div>
  );
}
