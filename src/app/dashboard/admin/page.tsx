"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        // Ensure user is an admin
        if (userData.role !== 'admin') {
          router.push('/home');
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
  }, [router]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="destructive">Admin Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">
                Home
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="mt-2 text-gray-600">Platform oversight, user management, and system administration</p>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <p className="text-xs text-gray-500">+18 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">89</div>
                <p className="text-xs text-gray-500">+5 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">$245K</div>
                <p className="text-xs text-gray-500">Platform transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Open Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-gray-500">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Users Management Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Oversee platform users and their activities</CardDescription>
                  </div>
                  <Button size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">JD</span>
                      </div>
                      <div>
                        <h4 className="font-medium">John Doe</h4>
                        <p className="text-sm text-gray-500">Client • Joined Dec 1</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">Active</Badge>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600">AS</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Alice Smith</h4>
                        <p className="text-sm text-gray-500">Freelancer • Joined Nov 28</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">Verified</Badge>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-orange-600">MB</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Mike Brown</h4>
                        <p className="text-sm text-gray-500">Client • Joined Dec 5</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="destructive">Pending KYC</Badge>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">Manage All Users</Button>
                </div>
              </CardContent>
            </Card>

            {/* Projects Overview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
                <CardDescription>Monitor platform projects and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">E-commerce Platform</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Full-stack development project</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Client: John Doe</span>
                      <span>Budget: $5,000</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Mobile App Design</h4>
                      <Badge variant="secondary">In Review</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">UI/UX design for mobile application</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Freelancer: Alice Smith</span>
                      <span>Budget: $2,500</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">API Integration</h4>
                      <Badge variant="outline">Disputed</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Third-party API integrations</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Requires attention</span>
                      <span>Budget: $1,800</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">View All Projects</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transactions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Platform financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Escrow Release</h4>
                      <p className="text-sm text-gray-500">Project: E-commerce Platform</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+$1,500</p>
                      <p className="text-xs text-gray-500">Dec 8, 2023</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Platform Fee</h4>
                      <p className="text-sm text-gray-500">5% commission</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">+$75</p>
                      <p className="text-xs text-gray-500">Dec 8, 2023</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Escrow Fund</h4>
                      <p className="text-sm text-gray-500">Project: Mobile App Design</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600">$800</p>
                      <p className="text-xs text-gray-500">Dec 7, 2023</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">View Transaction History</Button>
                </div>
              </CardContent>
            </Card>

            {/* Disputes Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active Disputes</CardTitle>
                <CardDescription>Issues requiring administrative action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-red-900">API Integration Dispute</h4>
                      <Badge variant="destructive">High Priority</Badge>
                    </div>
                    <p className="text-sm text-red-700 mb-2">Client claims work doesn&apos;t meet requirements</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-600">Raised: Dec 6, 2023</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-yellow-900">Payment Delay Issue</h4>
                      <Badge variant="secondary">Medium</Badge>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">Freelancer reports delayed payment release</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-yellow-600">Raised: Dec 7, 2023</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">View All Disputes</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Administrative Tools</CardTitle>
              <CardDescription>Platform management and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">👥</div>
                  <span className="text-sm">User Management</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">📊</div>
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">🔍</div>
                  <span className="text-sm">Audit Trail</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">⚙️</div>
                  <span className="text-sm">System Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}