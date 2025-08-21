// src/types/db.ts
export type DBUser = {
    id: string;
    email: string;
    password_hash: string;
    cover_letter?: string;
    experiences?: string;
    age?: number;
    skills?: string[];
    created_at?: string;
  };
  