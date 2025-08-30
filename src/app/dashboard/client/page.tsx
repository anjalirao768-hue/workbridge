"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { projectsStore } from "@/lib/projects-store";

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

  // Load projects from shared store and add some mock completed projects
  useEffect(() => {
    // Get projects from store for current client
    const currentClientId = 'current_client_id'; // In real app, get from auth context
    const storeProjects = projectsStore.getProjectsByClient(currentClientId);
    
    // Convert store projects to client project format
    const clientProjects = storeProjects.map(project => ({
      id: project.id,
      title: project.title,
      freelancer: project.status === 'open' ? undefined : 'Assigned Freelancer', // In real app, get from applications
      budget: project.budget,
      status: project.status === 'open' ? 'Open' : 'In Progress',
      createdDate: project.postedDate,
      dueDate: project.applicationDeadline || '2024-02-15',
      progress: project.status === 'open' ? 0 : 25
    }));

    // Add some historical completed projects for demonstration
    const historicalProjects = [
      { id: 'hist_1', title: 'Previous E-commerce Site', freelancer: 'Alice Smith', budget: 415000, status: 'Completed', createdDate: '2023-10-01', dueDate: '2023-11-15', progress: 100 },
      { id: 'hist_2', title: 'Mobile App Design', freelancer: 'Sarah Wilson', budget: 207500, status: 'In Progress', createdDate: '2023-11-28', dueDate: '2023-12-20', progress: 85 },
    ];

    setMyProjects([...clientProjects, ...historicalProjects]);

    // Mock Transactions Data for current client
    setMyTransactions([
      { id: '1', type: 'Project Payment', amount: 124500, project: 'E-commerce Website', date: '2023-12-08', status: 'Completed' },
      { id: '2', type: 'Project Advance', amount: 207500, project: 'Mobile App Design', date: '2023-11-28', status: 'Processing' },
      { id: '3', type: 'Milestone Payment', amount: 66400, project: 'API Integration', date: '2023-12-07', status: 'Processing' },
      { id: '4', type: 'Refund', amount: 74700, project: 'API Integration', date: '2023-12-06', status: 'Approved' },
      { id: '5', type: 'Final Payment', amount: 373500, project: 'Dashboard Development', date: '2023-11-30', status: 'Completed' },
      { id: '6', type: 'Initial Payment', amount: 49800, project: 'SEO Optimization', date: '2023-12-05', status: 'Completed' },
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

    // Mock Applications Data for current client's projects
    setProjectApplications([
      {
        id: '1',
        projectId: '1',
        projectTitle: 'E-commerce Website',
        freelancerName: 'Priya Sharma',
        freelancerEmail: 'priya@example.com',
        appliedDate: '2023-12-08',
        status: 'pending',
        coverLetter: 'I have 5+ years of experience building e-commerce platforms with React and Node.js. I can deliver a modern, scalable solution within your timeline.',
        proposedBudget: 380000,
        estimatedDuration: '6-8 weeks',
        freelancerRating: 4.9,
        freelancerExperience: ['E-commerce Development', 'React/Next.js', 'Node.js', 'Payment Integration'],
        freelancerSkills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
        viewedByClient: false
      },
      {
        id: '2',
        projectId: '1',
        projectTitle: 'E-commerce Website',
        freelancerName: 'Rahul Kumar',
        freelancerEmail: 'rahul@example.com',
        appliedDate: '2023-12-07',
        status: 'shortlisted',
        coverLetter: 'Full-stack developer with expertise in building scalable e-commerce solutions. I can provide end-to-end development with modern tech stack.',
        proposedBudget: 415000,
        estimatedDuration: '7-9 weeks',
        freelancerRating: 5.0,
        freelancerExperience: ['E-commerce Platforms', 'Full-stack Development', 'Database Design', 'API Development'],
        freelancerSkills: ['React', 'TypeScript', 'PostgreSQL', 'Docker', 'GraphQL'],
        viewedByClient: true
      },
      {
        id: '3',
        projectId: '2',
        projectTitle: 'Mobile App Design',
        freelancerName: 'Sneha Patel',
        freelancerEmail: 'sneha@example.com',
        appliedDate: '2023-12-06',
        status: 'reviewed',
        coverLetter: 'UI/UX designer specializing in mobile app interfaces. I create user-centered designs that drive engagement and conversions.',
        proposedBudget: 190000,
        estimatedDuration: '4-5 weeks',
        freelancerRating: 4.8,
        freelancerExperience: ['Mobile UI Design', 'User Research', 'Prototyping', 'Design Systems'],
        freelancerSkills: ['Figma', 'Adobe XD', 'Principle', 'User Research', 'Wireframing'],
        viewedByClient: true
      },
      {
        id: '4',
        projectId: '4',
        projectTitle: 'Website Redesign',
        freelancerName: 'Aisha Khan',
        freelancerEmail: 'aisha@example.com',
        appliedDate: '2023-12-09',
        status: 'pending',
        coverLetter: 'Content writer and web designer with focus on user experience and SEO optimization. I can help redesign your website for better performance.',
        proposedBudget: 240000,
        estimatedDuration: '5-6 weeks',
        freelancerRating: 4.9,
        freelancerExperience: ['Web Design', 'Content Strategy', 'SEO Optimization', 'Conversion Optimization'],
        freelancerSkills: ['WordPress', 'Content Writing', 'SEO', 'Google Analytics', 'Figma'],
        viewedByClient: false
      },
      {
        id: '5',
        projectId: '2',
        projectTitle: 'Mobile App Design',
        freelancerName: 'Vikram Singh',
        freelancerEmail: 'vikram@example.com',
        appliedDate: '2023-12-08',
        status: 'rejected',
        coverLetter: 'Financial consultant with experience in fintech app design. I understand the regulatory requirements and user needs for financial applications.',
        proposedBudget: 280000,
        estimatedDuration: '6-7 weeks',
        freelancerRating: 4.6,
        freelancerExperience: ['Fintech Design', 'Financial Modeling', 'Compliance', 'Data Visualization'],
        freelancerSkills: ['Financial Analysis', 'Excel', 'PowerBI', 'Risk Assessment', 'Compliance'],
        viewedByClient: true
      }
    ]);
  }, []);

  // Function to refresh projects from store
  const refreshProjects = useCallback(() => {
    const currentClientId = 'current_client_id'; // In real app, get from auth context
    const storeProjects = projectsStore.getProjectsByClient(currentClientId);
    
    const clientProjects = storeProjects.map(project => ({
      id: project.id,
      title: project.title,
      freelancer: project.status === 'open' ? undefined : 'Assigned Freelancer',
      budget: project.budget,
      status: project.status === 'open' ? 'Open' : 'In Progress',
      createdDate: project.postedDate,
      dueDate: project.applicationDeadline || '2024-02-15',
      progress: project.status === 'open' ? 0 : 25
    }));

    const historicalProjects = [
      { id: 'hist_1', title: 'Previous E-commerce Site', freelancer: 'Alice Smith', budget: 415000, status: 'Completed', createdDate: '2023-10-01', dueDate: '2023-11-15', progress: 100 },
      { id: 'hist_2', title: 'Mobile App Design', freelancer: 'Sarah Wilson', budget: 207500, status: 'In Progress', createdDate: '2023-11-28', dueDate: '2023-12-20', progress: 85 },
    ];

    setMyProjects([...clientProjects, ...historicalProjects]);
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Refresh projects when component mounts and when user returns to this page
  useEffect(() => {
    refreshProjects();
    
    // Set up an interval to refresh projects periodically
    const interval = setInterval(refreshProjects, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [refreshProjects]);

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
          <Button asChild>
            <Link href="/dashboard/client/post-project">+ New Project</Link>
          </Button>
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
                    project.status === 'Review' ? 'outline' :
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
              ₹{myTransactions.filter(t => t.status === 'Processing').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Processing</p>
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

  const renderApplicationsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Project Applications</h3>
          <p className="text-gray-600">Review and manage freelancer applications for your projects</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{projectApplications.length}</div>
            <p className="text-sm text-gray-500">Total Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{projectApplications.filter(a => !a.viewedByClient).length}</div>
            <p className="text-sm text-gray-500">New Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{projectApplications.filter(a => a.status === 'shortlisted').length}</div>
            <p className="text-sm text-gray-500">Shortlisted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ₹{Math.round(projectApplications.reduce((sum, a) => sum + a.proposedBudget, 0) / projectApplications.length).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Avg Proposal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications for Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {projectApplications.map((application) => (
              <div key={application.id} className={`p-6 border rounded-lg ${!application.viewedByClient ? 'border-blue-200 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {application.freelancerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{application.freelancerName}</h4>
                        <p className="text-gray-600">{application.freelancerEmail}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-medium">{application.freelancerRating}</span>
                          <span className="text-gray-500 text-sm">rating</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-900 mb-1">Project: {application.projectTitle}</h5>
                      <p className="text-gray-600 text-sm leading-relaxed">{application.coverLetter}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-500">Proposed Budget</p>
                        <p className="font-semibold text-green-600">₹{application.proposedBudget.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-500">Estimated Duration</p>
                        <p className="font-semibold">{application.estimatedDuration}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-500">Applied Date</p>
                        <p className="font-semibold">{application.appliedDate}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Skills & Experience:</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {application.freelancerSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {application.freelancerExperience.map((exp, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <Badge variant={
                      application.status === 'shortlisted' ? 'default' :
                      application.status === 'hired' ? 'secondary' :
                      application.status === 'rejected' ? 'destructive' :
                      application.status === 'reviewed' ? 'outline' :
                      'outline'
                    }>
                      {application.status}
                    </Badge>
                    
                    {!application.viewedByClient && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        New
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  {application.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => {
                        setProjectApplications(apps => 
                          apps.map(app => 
                            app.id === application.id 
                              ? {...app, status: 'shortlisted', viewedByClient: true}
                              : app
                          )
                        );
                      }}>
                        Shortlist
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setProjectApplications(apps => 
                          apps.map(app => 
                            app.id === application.id 
                              ? {...app, status: 'reviewed', viewedByClient: true}
                              : app
                          )
                        );
                      }}>
                        Mark as Reviewed
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => {
                        setProjectApplications(apps => 
                          apps.map(app => 
                            app.id === application.id 
                              ? {...app, status: 'rejected', viewedByClient: true}
                              : app
                          )
                        );
                      }}>
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {application.status === 'shortlisted' && (
                    <>
                      <Button size="sm" onClick={() => {
                        setProjectApplications(apps => 
                          apps.map(app => 
                            app.id === application.id 
                              ? {...app, status: 'hired'}
                              : app
                          )
                        );
                      }}>
                        Hire Freelancer
                      </Button>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </>
                  )}

                  {application.status === 'reviewed' && (
                    <>
                      <Button size="sm" onClick={() => {
                        setProjectApplications(apps => 
                          apps.map(app => 
                            app.id === application.id 
                              ? {...app, status: 'shortlisted'}
                              : app
                          )
                        );
                      }}>
                        Move to Shortlist
                      </Button>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </>
                  )}

                  {(application.status === 'hired' || application.status === 'rejected') && (
                    <Button size="sm" variant="ghost" disabled>
                      {application.status === 'hired' ? 'Hired' : 'Rejected'}
                    </Button>
                  )}

                  <Button size="sm" variant="ghost">
                    View Full Profile
                  </Button>
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

  if (activeView === 'applications') return (
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
        {renderApplicationsView()}
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
                <CardTitle className="text-lg">Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{myTransactions.filter(t => t.status === 'Processing').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Payments being processed</p>
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
                  <Button size="sm" asChild>
                    <Link href="/dashboard/client/post-project">+ New Project</Link>
                  </Button>
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
                        <span>Budget: ₹{project.budget.toLocaleString()}</span>
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
                        <span>Amount: ₹{transaction.amount.toLocaleString()}</span>
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
            {/* Applications Section */}
            <Card>
              <CardHeader>
                <CardTitle>Project Applications</CardTitle>
                <CardDescription>Freelancers applying to your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{projectApplications.length}</div>
                      <p className="text-xs text-gray-500">Total Applications</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{projectApplications.filter(a => !a.viewedByClient).length}</div>
                      <p className="text-xs text-gray-500">New Applications</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {projectApplications.filter(a => !a.viewedByClient).slice(0, 2).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                        <div>
                          <h4 className="font-medium text-sm">{app.freelancerName}</h4>
                          <p className="text-xs text-gray-600">{app.projectTitle}</p>
                          <p className="text-xs text-green-600 font-medium">₹{app.proposedBudget.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs mb-1">
                            New
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500 text-xs">⭐</span>
                            <span className="text-xs">{app.freelancerRating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('applications')}>
                    Review All Applications
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                  <Link href="/dashboard/client/post-project">
                    <div className="text-2xl">📊</div>
                    <span className="text-sm">Create Project</span>
                  </Link>
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