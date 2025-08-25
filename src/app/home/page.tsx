"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  async function fetchUserInfo() {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        
        // Auto-redirect based on role if they have a specific role
        if (userData.role === 'admin') {
          setTimeout(() => router.push('/dashboard/admin'), 1000);
        } else if (userData.role === 'client') {
          setTimeout(() => router.push('/dashboard/client'), 1000);
        } else if (userData.role === 'freelancer') {
          setTimeout(() => router.push('/dashboard/freelancer'), 1000);
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">Failed to load user information</p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show role selection/dashboard navigation for users with specific roles
  if (user.role !== 'user') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
                <Badge variant="secondary">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {user.role}!
            </h2>
            <p className="text-lg text-gray-600">
              Redirecting to your dashboard... or choose where to go:
            </p>
          </div>

          {/* Dashboard Navigation Cards */}
          <div className="space-y-6">
            {user.role === 'admin' && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <span>🛠️</span>
                    <span>Admin Dashboard</span>
                  </CardTitle>
                  <CardDescription>
                    Platform oversight, user management, and system administration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">• Manage users and projects</p>
                      <p className="text-sm text-gray-600">• Resolve disputes and issues</p>
                      <p className="text-sm text-gray-600">• View audit trails and analytics</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/admin')}>
                      Go to Admin Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === 'client' && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <span>🏢</span>
                    <span>Client Dashboard</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your projects, escrows, and collaborate with freelancers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">• Create and manage projects</p>
                      <p className="text-sm text-gray-600">• Handle escrow payments and milestones</p>
                      <p className="text-sm text-gray-600">• Review work and resolve disputes</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/client')}>
                      Go to Client Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === 'freelancer' && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <span>💻</span>
                    <span>Freelancer Dashboard</span>
                  </CardTitle>
                  <CardDescription>
                    Find projects, submit work, and manage your freelancing career
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">• Browse available projects</p>
                      <p className="text-sm text-gray-600">• Submit work and track earnings</p>
                      <p className="text-sm text-gray-600">• Complete KYC verification</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/freelancer')}>
                      Go to Freelancer Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Navigation Links */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">Quick navigation:</p>
            <div className="flex justify-center space-x-4">
              {user.role === 'admin' && (
                <Button onClick={() => router.push('/dashboard/admin')} variant="outline">
                  Admin Dashboard
                </Button>
              )}
              {user.role === 'client' && (
                <Button onClick={() => router.push('/dashboard/client')} variant="outline">
                  Client Dashboard
                </Button>
              )}
              {user.role === 'freelancer' && (
                <Button onClick={() => router.push('/dashboard/freelancer')} variant="outline">
                  Freelancer Dashboard
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Default dashboard for users who haven't selected a role yet
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary" className="ml-3">New User</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to WorkBridge</h2>
            <p className="mt-2 text-gray-600">Choose your role to get started with the platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/onboarding/client')}>
              <CardHeader>
                <CardTitle className="text-xl text-blue-600 flex items-center space-x-2">
                  <span>🏢</span>
                  <span>I'm a Client</span>
                </CardTitle>
                <CardDescription>I want to hire freelancers for my projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li>• Post projects and requirements</li>
                  <li>• Browse freelancer profiles</li>
                  <li>• Secure escrow payments</li>
                  <li>• Track project milestones</li>
                </ul>
                <Button className="w-full">Get Started as Client</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/onboarding/freelancer')}>
              <CardHeader>
                <CardTitle className="text-xl text-green-600 flex items-center space-x-2">
                  <span>💻</span>
                  <span>I'm a Freelancer</span>
                </CardTitle>
                <CardDescription>I want to find projects and work with clients</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li>• Browse available projects</li>
                  <li>• Submit proposals</li>
                  <li>• Get paid securely</li>
                  <li>• Build your reputation</li>
                </ul>
                <Button className="w-full">Get Started as Freelancer</Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center pt-8">
            <p className="text-sm text-gray-500">
              You can always change your role later in your account settings
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}