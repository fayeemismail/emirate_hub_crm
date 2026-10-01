'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AuthLoadingScreen } from '../../components/AuthLoadingScreen';
import { BrandMark } from '../../components/BrandMark';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Spinner } from '../../components/ui/loading';

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
      router.replace('/');
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
      router.replace('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify credentials.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return <AuthLoadingScreen message="Checking your session..." />;
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 font-sans selection:bg-[#E02126] selection:text-white"
      style={{
        backgroundColor: '#F7F5F1',
        color: '#1C1917',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -10%, #FEE2E2 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, #F5F5F4 0%, transparent 50%)',
      }}
    >
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <BrandMark size="lg" className="mb-5" />
          <h1
            className="text-2xl font-extrabold uppercase tracking-tight font-mono"
            style={{ color: '#1C1917' }}
          >
            emirate hub
          </h1>
          <p className="mt-2 max-w-[16rem] text-sm leading-relaxed" style={{ color: '#78716C' }}>
            Sign in to your CRM
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errorMessage ? (
            <div
              className="flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm"
              style={{
                backgroundColor: '#FEE2E2',
                borderColor: '#FECACA',
                color: '#B91C1C',
              }}
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#E02126' }} />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold tracking-wide"
              style={{ color: '#57534E' }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: '#A8A29E' }}
              />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                autoFocus
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none transition-shadow focus:ring-2 disabled:opacity-60"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E7E5E4',
                  color: '#1C1917',
                  boxShadow: '0 0 0 0 transparent',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#E02126';
                  e.currentTarget.style.boxShadow = '0 0 0 3px #FEE2E2';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E7E5E4';
                  e.currentTarget.style.boxShadow = '0 0 0 0 transparent';
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold tracking-wide"
              style={{ color: '#57534E' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: '#A8A29E' }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border py-3 pl-10 pr-11 text-sm outline-none transition-shadow focus:ring-2 disabled:opacity-60"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E7E5E4',
                  color: '#1C1917',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#E02126';
                  e.currentTarget.style.boxShadow = '0 0 0 3px #FEE2E2';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E7E5E4';
                  e.currentTarget.style.boxShadow = '0 0 0 0 transparent';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 transition-opacity hover:opacity-70"
                style={{ color: '#A8A29E' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-wide text-white transition-opacity hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: '#E02126' }}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" color="#FFFFFF" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: '#A8A29E' }}>
          Emirate Hub CRM
        </p>
      </div>
    </div>
  );
}
