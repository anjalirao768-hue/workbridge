"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  title: string;
  freelancer?: string;
  budget: number;
  status: string;
  createdDate: string;
  dueDate: string;
  progress: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  project: string;
  date: string;
  status: string;
}

interface Milestone {
  id: string;
  title: string;
  project: string;
  amount: number;
  status: string;
  submittedDate?: string;
}

interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerName: string;
  freelancerEmail: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'hired' | 'rejected';
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration: string;
  freelancerRating: number;
  freelancerExperience: string[];
  freelancerSkills: string[];
  viewedByClient: boolean;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [myMilestones, setMyMilestones] = useState<Milestone[]>([]);
  const [projectApplications, setProjectApplications] = useState<Application[]>([]);
  const router = useRouter();

  const fetchUserInfo = useCallback(async () => {
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
  }, [router]);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Mock Projects Data for current client
    setMyProjects([
      { id: '1', title: 'E-commerce Website', freelancer: 'Alice Smith', budget: 415000, status: 'In Progress', createdDate: '2023-12-01', dueDate: '2024-01-15', progress: 65 },
      { id: '2', title: 'Mobile App Design', freelancer: 'Sarah Wilson', budget: 207500, status: 'Review', createdDate: '2023-11-28', dueDate: '2023-12-20', progress: 90 },
      { id: '3', title: 'API Integration', freelancer: 'Mike Johnson', budget: 149400, status: 'Disputed', createdDate: '2023-11-25', dueDate: '2023-12-15', progress: 45 },
      { id: '4', title: 'Website Redesign', budget: 265600, status: 'Open', createdDate: '2023-12-08', dueDate: '2024-01-10', progress: 0 },
      { id: '5', title: 'Dashboard Development', freelancer: 'David Lee', budget: 373500, status: 'Completed', createdDate: '2023-10-15', dueDate: '2023-11-30', progress: 100 },
      { id: '6', title: 'SEO Optimization', freelancer: 'Emma Brown', budget: 99600, status: 'Active', createdDate: '2023-12-05', dueDate: '2024-01-05', progress: 30 },
    ]);

    // Mock Transactions Data for current client
    setMyTransactions([
      { id: '1', type: 'Project Payment', amount: 124500, project: 'E-commerce Website', date: '2023-12-08', status: 'Completed' },
      { id: '2', type: 'Escrow Deposit', amount: 207500, project: 'Mobile App Design', date: '2023-11-28', status: 'Held' },
      { id: '3', type: 'Milestone Payment', amount: 66400, project: 'API Integration', date: '2023-12-07', status: 'Processing' },
      { id: '4', type: 'Refund', amount: 74700, project: 'API Integration', date: '2023-12-06', status: 'Approved' },
      { id: '5', type: 'Final Payment', amount: 373500, project: 'Dashboard Development', date: '2023-11-30', status: 'Completed' },
      { id: '6', type: 'Initial Deposit', amount: 49800, project: 'SEO Optimization', date: '2023-12-05', status: 'Completed' },
      { id: '7', type: 'Platform Fee', amount: 18675, project: 'Dashboard Development', date: '2023-11-30', status: 'Completed' },
    ]);

    // Mock Milestones Data for current client
    setMyMilestones([
      { id: '1', title: 'Frontend Implementation', project: 'E-commerce Website', amount: 149400, status: 'Pending Review', submittedDate: '2023-12-08' },
      { id: '2', title: 'Database Design', project: 'API Integration', amount: 74700, status: 'Revision Requested', submittedDate: '2023-12-05' },
      { id: '3', title: 'UI/UX Mockups', project: 'Mobile App Design', amount: 99600, status: 'Approved', submittedDate: '2023-12-01' },
      { id: '4', title: 'SEO Analysis', project: 'SEO Optimization', amount: 33200, status: 'In Progress' },
      { id: '5', title: 'Website Architecture', project: 'Website Redesign', amount: 132800, status: 'Not Started' },
    ]);
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  const renderProjectsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">My Projects</h3>
          <p className="text-gray-600">Manage all your freelance projects</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
          <Button>+ New Project</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{myProjects.length}</div>
            <p className="text-sm text-gray-500">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{myProjects.filter(p => p.status === 'In Progress' || p.status === 'Active').length}</div>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{myProjects.filter(p => p.status === 'Completed').length}</div>
            <p className="text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ₹{myProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Budget</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myProjects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{project.title}</h4>
                    {project.freelancer && <p className="text-gray-600">Freelancer: {project.freelancer}</p>}
                    <p className="text-gray-600">Budget: ₹{project.budget.toLocaleString()}</p>
                  </div>
                  <Badge variant={
                    project.status === 'In Progress' || project.status === 'Active' ? 'default' :
                    project.status === 'Completed' ? 'secondary' :
                    project.status === 'Disputed' ? 'destructive' :
                    'outline'
                  }>
                    {project.status}
                  </Badge>
                </div>
                
                {project.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                  <div>Created: <span className="font-medium text-gray-900">{project.createdDate}</span></div>
                  <div>Due: <span className="font-medium text-gray-900">{project.dueDate}</span></div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="ghost">Manage</Button>
                  {project.status === 'Review' && <Button size="sm">Approve Work</Button>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactionsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">My Transactions</h3>
          <p className="text-gray-600">Complete payment and spending history</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{myTransactions.length}</div>
            <p className="text-sm text-gray-500">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ₹{myTransactions.reduce((sum, t) => sum + (t.type !== 'Refund' ? t.amount : 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              ₹{myTransactions.filter(t => t.status === 'Held').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">In Escrow</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              ₹{myTransactions.filter(t => t.type === 'Refund').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Refunded</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-medium">{transaction.type}</h4>
                  <p className="text-sm text-gray-600">{transaction.project}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'Refund' ? 'text-green-600' :
                    transaction.type === 'Platform Fee' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {transaction.type === 'Refund' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </p>
                  <Badge variant={transaction.status === 'Completed' ? 'default' : transaction.status === 'Processing' ? 'secondary' : 'outline'} className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMilestonesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Project Milestones</h3>
          <p className="text-gray-600">Track and approve milestone deliverables</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{myMilestones.filter(m => m.status === 'Pending Review').length}</div>
            <p className="text-sm text-gray-500">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{myMilestones.filter(m => m.status === 'Approved').length}</div>
            <p className="text-sm text-gray-500">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{myMilestones.filter(m => m.status === 'In Progress').length}</div>
            <p className="text-sm text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{myMilestones.filter(m => m.status === 'Revision Requested').length}</div>
            <p className="text-sm text-gray-500">Need Revision</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestone Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myMilestones.map((milestone) => (
              <div key={milestone.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <p className="text-gray-600">{milestone.project}</p>
                    <p className="text-sm text-gray-500">Amount: ₹{milestone.amount.toLocaleString()}</p>
                    {milestone.submittedDate && (
                      <p className="text-xs text-gray-500">Submitted: {milestone.submittedDate}</p>
                    )}
                  </div>
                  <Badge variant={
                    milestone.status === 'Approved' ? 'default' :
                    milestone.status === 'Pending Review' ? 'secondary' :
                    milestone.status === 'Revision Requested' ? 'destructive' :
                    'outline'
                  }>
                    {milestone.status}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  {milestone.status === 'Pending Review' && (
                    <>
                      <Button size="sm">Approve & Release</Button>
                      <Button size="sm" variant="outline">Request Revision</Button>
                    </>
                  )}
                  {milestone.status === 'In Progress' && (
                    <Button size="sm" variant="outline" disabled>Waiting for Delivery</Button>
                  )}
                  {milestone.status === 'Approved' && (
                    <Button size="sm" variant="ghost">View Details</Button>
                  )}
                  {milestone.status === 'Revision Requested' && (
                    <Button size="sm" variant="outline">Follow Up</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

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

  // Render different views based on activeView state
  if (activeView === 'projects') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Client Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">Home</Button>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderProjectsView()}
      </main>
    </div>
  );

  if (activeView === 'transactions') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Client Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">Home</Button>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderTransactionsView()}
      </main>
    </div>
  );

  if (activeView === 'milestones') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Client Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">Home</Button>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderMilestonesView()}
      </main>
    </div>
  );

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
                <div className="text-2xl font-bold text-blue-600">{myProjects.filter(p => p.status === 'In Progress' || p.status === 'Active').length}</div>
                <p className="text-xs text-gray-500">Projects in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{myTransactions.reduce((sum, t) => sum + (t.type !== 'Refund' ? t.amount : 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Lifetime spending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">In Escrow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{myTransactions.filter(t => t.status === 'Held').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Funds held in escrow</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{myProjects.filter(p => p.status === 'Completed').length}</div>
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
                  {myProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{project.title}</h4>
                        <Badge variant={project.status === 'In Progress' || project.status === 'Active' ? 'default' : project.status === 'Completed' ? 'secondary' : 'outline'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{project.freelancer ? `Freelancer: ${project.freelancer}` : 'Looking for freelancer'}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Budget: ${project.budget.toLocaleString()}</span>
                        <span>Due: {project.dueDate}</span>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('projects')}>View All Projects</Button>
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
                  {myTransactions.filter(t => t.status === 'Held' || t.status === 'Processing').slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{transaction.type}</h4>
                        <Badge variant={transaction.status === 'Held' ? 'outline' : 'default'}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{transaction.project}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Amount: ${transaction.amount.toLocaleString()}</span>
                        <span>{transaction.date}</span>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('transactions')}>View All Transactions</Button>
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
                  {myMilestones.filter(m => m.status === 'Pending Review').slice(0, 2).map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-gray-500">{milestone.project}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="ghost" className="w-full" onClick={() => setActiveView('milestones')}>View All Milestones</Button>
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
                  {myProjects.filter(p => p.status === 'Disputed').length > 0 ? (
                    myProjects.filter(p => p.status === 'Disputed').map((project) => (
                      <div key={project.id} className="p-3 border rounded-lg border-red-200 bg-red-50">
                        <h4 className="font-medium text-red-900">{project.title}</h4>
                        <p className="text-sm text-red-700">Dispute in progress</p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm">Resolve</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No active disputes</p>
                      <p className="text-xs text-gray-400 mt-1">Great! All your projects are running smoothly</p>
                    </div>
                  )}
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
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                  <Link href="/explore">
                    <div className="text-2xl">👥</div>
                    <span className="text-sm">Find Freelancers</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setActiveView('transactions')}>
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