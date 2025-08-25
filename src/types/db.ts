export interface DBUser {
  id: string;
  email: string;
  password_hash: string;
  cover_letter?: string;
  experiences?: string;
  age?: number;
  skills?: string[];
  role: 'client' | 'freelancer' | 'admin' | 'user';
  kyc_status?: 'pending' | 'verified' | 'rejected';
  kyc_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  client_id: string;
  freelancer_id?: string;
  title: string;
  description: string;
  budget?: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  skills_required?: string[];
  deadline?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid' | 'disputed';
  due_date?: string;
  submitted_at?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Escrow {
  id: string;
  milestone_id: string;
  amount: number;
  status: 'created' | 'funded' | 'released' | 'refunded' | 'disputed';
  external_escrow_id?: string;
  funded_at?: string;
  released_at?: string;
  refunded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  project_id?: string;
  milestone_id?: string;
  escrow_id?: string;
  type: 'escrow_fund' | 'escrow_release' | 'escrow_refund' | 'fee_deduction' | 'withdrawal';
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  external_transaction_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface Dispute {
  id: string;
  milestone_id: string;
  raised_by: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved_release' | 'resolved_refund' | 'closed';
  admin_notes?: string;
  resolution?: 'release_funds' | 'refund_client' | 'partial_release';
  resolved_by?: string;
  resolved_at?: string;
  auto_review_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditEvent {
  id: string;
  event_type: string;
  user_id?: string;
  project_id?: string;
  milestone_id?: string;
  escrow_id?: string;
  dispute_id?: string;
  data: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}