"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Signup() {
  const [step, setStep] = useState<'email' | 'otp' | 'role' | 'existing-user'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
      } else {
        if (data.isExistingUser) {
          // Show existing user message with login redirect
          setError('');
          setStep('existing-user');
        } else {
          setError(data.error || 'Failed to send OTP');
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // Check if this is a new user who needs role selection
        if (data.data?.isNewUser || !data.data?.user?.role) {
          setStep('role');
        } else {
          // Existing user with role - redirect to appropriate dashboard
          const userRole = data.data.user.role;
          if (userRole === 'client') {
            router.push('/dashboard/client');
          } else if (userRole === 'freelancer') {
            router.push('/dashboard/freelancer');
          } else if (userRole === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        setError(data.error || 'Invalid OTP');
        setRemainingAttempts(data.remainingAttempts || 0);
        
        if (data.remainingAttempts === 0) {
          setStep('email'); // Reset to email step
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (selectedRole: 'client' | 'freelancer') => {
    setRole(selectedRole);
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to appropriate dashboard after role update
        if (selectedRole === 'client') {
          router.push('/dashboard/client');
        } else if (selectedRole === 'freelancer') {
          router.push('/dashboard/freelancer');
        }
      } else {
        setError(data.error || 'Failed to update role');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        setRemainingAttempts(3);
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">WorkBridge</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Join WorkBridge</h2>
          <p className="mt-2 text-gray-600">Create your account to get started</p>
        </div>

        {/* Email Step */}
        {step === 'email' && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Email</CardTitle>
              <CardDescription>We&apos;ll send you a verification code</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                  {remainingAttempts > 0 && (
                    <p className="text-sm mt-1">Remaining attempts: {remainingAttempts}</p>
                  )}
                </div>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-purple-600 hover:text-purple-700 underline text-sm"
                >
                  Resend Code
                </button>
                <span className="mx-2 text-gray-400">•</span>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-gray-600 hover:text-gray-700 underline text-sm"
                >
                  Change Email
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing User Step */}
        {step === 'existing-user' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-blue-600 text-2xl">ℹ️</span>
                <span>Account Already Exists</span>
              </CardTitle>
              <CardDescription>
                The email <strong>{email}</strong> is already registered with WorkBridge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-blue-800 font-medium mb-2">Account Found</h4>
                <p className="text-blue-700 text-sm">
                  This email address is already associated with a WorkBridge account. 
                  Please use the login page to access your existing account.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('email')}
                  className="flex-1"
                >
                  Try Different Email
                </Button>
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                >
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Selection Step */}
        {step === 'role' && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Role</CardTitle>
              <CardDescription>
                Select how you want to use WorkBridge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Option */}
                <div 
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                    role === 'client' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setRole('client')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-2xl">🏢</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      I&apos;m a Client
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      I want to hire freelancers and manage projects
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Post projects and job listings
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Manage payments and milestones
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Chat with freelancers
                    </li>
                  </ul>
                </div>

                {/* Freelancer Option */}
                <div 
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                    role === 'freelancer' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setRole('freelancer')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-2xl">💼</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      I&apos;m a Freelancer
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      I want to find work and showcase my skills
                    </p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Browse and apply to projects
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Manage your portfolio
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Track earnings and KYC
                    </li>
                  </ul>
                </div>
              </div>

              {role && (
                <div className="mt-6">
                  <Button
                    onClick={() => handleRoleSelection(role)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  >
                    {loading ? 'Setting up your account...' : `Continue as ${role === 'client' ? 'Client' : 'Freelancer'}`}
                  </Button>
                </div>
              )}

              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Don&apos;t worry, you can change your role later in settings
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
