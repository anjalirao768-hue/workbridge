// src/emails/WelcomeEmail.tsx
export default function WelcomeEmail({ name }: { name: string }) {
    return (
      <div>
        <h1>Welcome, {name} 🎉</h1>
        <p>Thanks for joining Workbridge!</p>
      </div>
    );
  }
  