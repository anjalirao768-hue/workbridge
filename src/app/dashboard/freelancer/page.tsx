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

export default function FreelancerDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        // Ensure user is a freelancer
        if (userData.role !== 'freelancer') {
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
              <Badge variant="secondary">Freelancer Dashboard</Badge>
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
            <h2 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h2>
            <p className="mt-2 text-gray-600">Find projects, manage your work, and track your earnings</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">2</div>
                <p className="text-xs text-gray-500">Currently working on</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$8,750</div>
                <p className="text-xs text-gray-500">Lifetime earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Payout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">$1,200</div>
                <p className="text-xs text-gray-500">Awaiting release</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <p className="text-xs text-gray-500">Project completion</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Projects Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Available Projects</CardTitle>
                    <CardDescription>New opportunities matching your skills</CardDescription>
                  </div>
                  <Button size="sm">Browse All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">React Dashboard Development</h4>
                      <Badge variant="default">$3,500</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Build an admin dashboard with React and TypeScript</p>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="text-xs">React</Badge>
                        <Badge variant="outline" className="text-xs">TypeScript</Badge>
                        <Badge variant="outline" className="text-xs">Dashboard</Badge>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">API Integration Project</h4>
                      <Badge variant="default">$2,200</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Integrate third-party APIs with existing Node.js backend</p>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1">
                        <Badge variant="outline" className="text-xs">Node.js</Badge>
                        <Badge variant="outline" className="text-xs">API</Badge>
                        <Badge variant="outline" className="text-xs">Backend</Badge>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">View All Available Projects</Button>
                </div>
              </CardContent>
            </Card>

            {/* Submitted Work Section */}
            <Card>
              <CardHeader>
                <CardTitle>Submitted Work</CardTitle>
                <CardDescription>Milestones pending client review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Frontend Implementation</h4>
                      <Badge variant="secondary">Under Review</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">E-commerce Website - Phase 2</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Submitted: Dec 8, 2023</span>
                      <span>Value: $1,800</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Database Design</h4>
                      <Badge variant="outline">Feedback Received</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">CRM System - Database Schema</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Submitted: Dec 5, 2023</span>
                      <span>Value: $900</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">View All Submissions</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Work Section */}
            <Card>
              <CardHeader>
                <CardTitle>Current Projects</CardTitle>
                <CardDescription>Work in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">E-commerce Website</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Full-stack development with React and Node.js</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress: 65%</span>
                      <span>Due: Jan 15, 2024</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">CRM System Backend</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">API development and database optimization</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress: 30%</span>
                      <span>Due: Feb 1, 2024</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">View All Active Projects</Button>
                </div>
              </CardContent>
            </Card>

            {/* KYC Section */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>Complete your profile verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Email Verification</h4>
                        <p className="text-sm text-gray-500">Verified</p>
                      </div>
                    </div>
                    <Badge variant="default">✓</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Phone Verification</h4>
                        <p className="text-sm text-gray-500">Verified</p>
                      </div>
                    </div>
                    <Badge variant="default">✓</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Identity Verification</h4>
                        <p className="text-sm text-gray-500">Pending</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Complete</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Payment Setup</h4>
                        <p className="text-sm text-gray-500">Not started</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Setup</Button>
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
                  <div className="text-2xl">🔍</div>
                  <span className="text-sm">Browse Projects</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">📊</div>
                  <span className="text-sm">View Earnings</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">👤</div>
                  <span className="text-sm">Update Profile</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">💬</div>
                  <span className="text-sm">Messages</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}