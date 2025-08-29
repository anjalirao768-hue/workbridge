// Application system types for WorkBridge platform

export interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'hired' | 'rejected';
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration: string;
  viewedByClient: boolean;
  viewedDate?: string;
  clientFeedback?: string;
  freelancerRating: number;
  freelancerExperience: string[];
  freelancerSkills: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  budget: number;
  requiredSkills: string[];
  duration: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  postedDate: string;
  applicationDeadline: string;
  status: 'open' | 'in-review' | 'hired' | 'closed';
  applicationsCount: number;
  viewsCount: number;
  category: string;
}

export interface ClientReview {
  id: string;
  clientId: string;
  projectId: string;
  applicationId: string;
  reviewedDate: string;
  timeSpent: number; // in minutes
  action: 'viewed' | 'shortlisted' | 'hired' | 'rejected';
  notes?: string;
}

export interface ApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  shortlistedApplications: number;
  hiredApplications: number;
  rejectedApplications: number;
  averageResponseTime: number; // in hours
  topSkills: Array<{skill: string, count: number}>;
}