export interface DBUser {
    id: string;
    email: string;
    password_hash: string;
    cover_letter?: string;
    experiences?: string;
    age?: number;
    skills?: string[];
    role: string; // 👈 add this
  }
  