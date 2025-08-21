// src/emails/WelcomeEmail.tsx
export default function WelcomeEmail({ name }: { name: string }) {
    return (
      <div>
        <h1>Welcome, {name}! 🎉</h1>
        <p>We’re so glad you joined Workbridge.</p>
      </div>
    );
  }
  