"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {user.role === 'admin' && <AdminDashboard user={user} />}
        {user.role === 'client' && <ClientDashboard user={user} />}
        {user.role === 'freelancer' && <FreelancerDashboard user={user} />}
        {user.role === 'user' && <DefaultDashboard user={user} />}
      </main>
    </div>
  );
}

function AdminDashboard({ user }: { user: UserInfo }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-2 text-gray-600">Platform oversight and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>Manage all platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <p className="text-xs text-gray-500">Total registered users</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/projects')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projects</CardTitle>
            <CardDescription>Oversee all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">--</div>
            <p className="text-xs text-gray-500">Active projects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/escrows')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Escrows</CardTitle>
            <CardDescription>Monitor escrow accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$--</div>
            <p className="text-xs text-gray-500">Total escrowed funds</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/disputes')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Disputes</CardTitle>
            <CardDescription>Handle disputes & issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">--</div>
            <p className="text-xs text-gray-500">Open disputes</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Loading recent activities...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Administrative tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => router.push('/admin/audit')} variant="outline" className="w-full justify-start">
              📊 View Audit Trail
            </Button>
            <Button onClick={() => router.push('/admin/transactions')} variant="outline" className="w-full justify-start">
              💰 Transaction Ledger
            </Button>
            <Button onClick={() => router.push('/admin/settings')} variant="outline" className="w-full justify-start">
              ⚙️ Platform Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClientDashboard({ user }: { user: UserInfo }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Client Dashboard</h2>
        <p className="mt-2 text-gray-600">Manage your projects and find freelancers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/client/projects')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Projects</CardTitle>
            <CardDescription>View and manage your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <p className="text-xs text-gray-500">Active projects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/client/escrows')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Escrows</CardTitle>
            <CardDescription>Track your payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$--</div>
            <p className="text-xs text-gray-500">Funds in escrow</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/client/freelancers')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Find Freelancers</CardTitle>
            <CardDescription>Browse available talent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">--</div>
            <p className="text-xs text-gray-500">Available freelancers</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => router.push('/client/projects/new')} className="flex-1">
          + Create New Project
        </Button>
        <Button onClick={() => router.push('/client/transactions')} variant="outline">
          View Transactions
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest project activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Loading recent projects...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones Pending</CardTitle>
            <CardDescription>Awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">No pending milestones</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FreelancerDashboard({ user }: { user: UserInfo }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h2>
        <p className="mt-2 text-gray-600">Find projects and manage your work</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/freelancer/projects')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Projects</CardTitle>
            <CardDescription>Active and completed work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <p className="text-xs text-gray-500">Active projects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/freelancer/earnings')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Earnings</CardTitle>
            <CardDescription>Track your income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$--</div>
            <p className="text-xs text-gray-500">Total earned</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/freelancer/browse')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Browse Projects</CardTitle>
            <CardDescription>Find new opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">--</div>
            <p className="text-xs text-gray-500">Available projects</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => router.push('/freelancer/browse')} className="flex-1">
          Browse Available Projects
        </Button>
        <Button onClick={() => router.push('/freelancer/profile')} variant="outline">
          Update Profile
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Milestones</CardTitle>
            <CardDescription>Work in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Loading active milestones...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">No recent payments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DefaultDashboard({ user }: { user: UserInfo }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome to WorkBridge</h2>
        <p className="mt-2 text-gray-600">Choose your role to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/onboarding/client')}>
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">I'm a Client</CardTitle>
            <CardDescription>I want to hire freelancers for my projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Post projects and requirements</li>
              <li>• Browse freelancer profiles</li>
              <li>• Secure escrow payments</li>
              <li>• Track project milestones</li>
            </ul>
            <Button className="w-full mt-4">Get Started as Client</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/onboarding/freelancer')}>
          <CardHeader>
            <CardTitle className="text-xl text-green-600">I'm a Freelancer</CardTitle>
            <CardDescription>I want to find projects and work with clients</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Browse available projects</li>
              <li>• Submit proposals</li>
              <li>• Get paid securely</li>
              <li>• Build your reputation</li>
            </ul>
            <Button className="w-full mt-4">Get Started as Freelancer</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}