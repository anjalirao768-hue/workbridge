"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    cover_letter: "",
    experiences: "",
    age: "",
    skills: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: form.age ? parseInt(form.age, 10) : undefined,
          skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(s => s.length > 0) : [],
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus("✅ Signup successful! Redirecting...");
        setTimeout(() => {
          router.push("/home");
        }, 1000);
      } else {
        setStatus(`❌ ${data.error || "Something went wrong."}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setStatus("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join WorkBridge and start collaborating
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your WorkBridge account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_letter">Cover Letter (Optional)</Label>
                <Textarea
                  id="cover_letter"
                  name="cover_letter"
                  placeholder="Tell us about yourself and what you're looking for..."
                  value={form.cover_letter}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experiences">Experience (Optional)</Label>
                <Textarea
                  id="experiences"
                  name="experiences"
                  placeholder="Describe your past work experience..."
                  value={form.experiences}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age (Optional)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="25"
                  value={form.age}
                  onChange={handleChange}
                  min="16"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (Optional)</Label>
                <Input
                  id="skills"
                  name="skills"
                  type="text"
                  placeholder="React, Node.js, Python, Design..."
                  value={form.skills}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">Separate skills with commas</p>
              </div>

              {status && (
                <div className={`p-3 rounded-md text-sm ${
                  status.includes('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {status}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
