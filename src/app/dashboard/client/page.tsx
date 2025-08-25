"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

export default function ClientDashboard() {
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
        // Ensure user is a client
        if (userData.role !== 'client') {
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
          <p>Loading dashboard...</p>
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
              <Badge variant="secondary">Client Dashboard</Badge>
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
            <h2 className="text-3xl font-bold text-gray-900">Client Dashboard</h2>
            <p className="mt-2 text-gray-600">Manage your projects and collaborate with freelancers</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">3</div>
                <p className="text-xs text-gray-500">Projects in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$12,450</div>
                <p className="text-xs text-gray-500">Lifetime spending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">In Escrow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">$2,800</div>
                <p className="text-xs text-gray-500">Funds held in escrow</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">8</div>
                <p className="text-xs text-gray-500">Finished projects</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Projects Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Projects</CardTitle>
                    <CardDescription>Overview of your current projects</CardDescription>
                  </div>
                  <Button size="sm">+ New Project</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">E-commerce Website</h4>
                      <Badge variant="default">In Progress</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Full-stack e-commerce solution with payment integration</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Budget: $5,000</span>
                      <span>Due: Jan 15, 2024</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Mobile App Design</h4>
                      <Badge variant="secondary">Review</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">UI/UX design for iOS and Android mobile application</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Budget: $2,500</span>
                      <span>Due: Dec 20, 2023</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">View All Projects</Button>
                </div>
              </CardContent>
            </Card>

            {/* Escrows Section */}
            <Card>
              <CardHeader>
                <CardTitle>Escrow Management</CardTitle>
                <CardDescription>Track your secured payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Project Setup Milestone</h4>
                      <Badge variant="outline">Funded</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Initial development setup and architecture</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Amount: $1,500</span>
                      <span>Funded: Dec 1, 2023</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">UI Development</h4>
                      <Badge variant="default">Pending Release</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Frontend implementation and styling</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Amount: $1,300</span>
                      <span>Submitted: Dec 8, 2023</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">View All Escrows</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Milestones Section */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Milestones</CardTitle>
                <CardDescription>Milestones awaiting your review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Database Integration</h4>
                      <p className="text-sm text-gray-500">E-commerce Website</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Review</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Wireframe Completion</h4>
                      <p className="text-sm text-gray-500">Mobile App Design</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Review</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full">View All Milestones</Button>
                </div>
              </CardContent>
            </Card>

            {/* Disputes Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active Disputes</CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No active disputes</p>
                    <p className="text-xs text-gray-400 mt-1">Great! All your projects are running smoothly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">📊</div>
                  <span className="text-sm">Create Project</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">👥</div>
                  <span className="text-sm">Find Freelancers</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">💰</div>
                  <span className="text-sm">View Transactions</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">⚙️</div>
                  <span className="text-sm">Account Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}