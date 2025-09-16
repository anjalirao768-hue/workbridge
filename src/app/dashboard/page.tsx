"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function GeneralDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Auto-redirect users with specific roles to their proper dashboards
          if (userData.role === 'client') {
            router.push('/dashboard/client');
            return;
          } else if (userData.role === 'freelancer') {
            router.push('/dashboard/freelancer');
            return;
          } else if (userData.role === 'admin') {
            router.push('/dashboard/admin');
            return;
          } else if (userData.role === 'support') {
            router.push('/support');
            return;
          }
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const updateRole = async (newRole: 'client' | 'freelancer') => {
    try {
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Redirect to appropriate dashboard after role update
        if (newRole === 'client') {
          router.push('/dashboard/client');
        } else {
          router.push('/dashboard/freelancer');
        }
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">WorkBridge</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.cookie = 'auth-token=; Max-Age=0; path=/';
                  router.push('/login');
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to WorkBridge
          </h1>
          <p className="text-lg text-gray-600">
            Complete your profile setup to get started
          </p>
        </div>

        {/* Role Selection Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose Your Role</CardTitle>
            <CardDescription>
              Select how you want to use WorkBridge to get access to your personalized dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Option */}
              <div className="border border-purple-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
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
                <ul className="space-y-2 mb-6">
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
                <Button
                  onClick={() => updateRole('client')}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                >
                  Continue as Client
                </Button>
              </div>

              {/* Freelancer Option */}
              <div className="border border-purple-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
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
                <ul className="space-y-2 mb-6">
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
                <Button
                  onClick={() => updateRole('freelancer')}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                >
                  Continue as Freelancer
                </Button>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Don&apos;t worry, you can always change your role later in settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Current role: <span className="font-medium">{user?.role || 'Not set'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}