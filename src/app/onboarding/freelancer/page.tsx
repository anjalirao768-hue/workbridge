"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FreelancerOnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState("");
  const router = useRouter();

  async function handleComplete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role: "freelancer",
          skills: skills.split(",").map(s => s.trim()).filter(s => s.length > 0)
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/home");
      } else {
        setError(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error('Role update error:', error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome, Freelancer!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Let&apos;s set up your profile to start finding projects
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Freelancer Profile Setup</CardTitle>
            <CardDescription>
              Tell us about your skills and experience to match you with the right projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                placeholder="e.g. Full-Stack Developer, UI/UX Designer, Content Writer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Technologies</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Python, Figma, WordPress"
              />
              <p className="text-xs text-gray-500">Separate skills with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Select experience level</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10-plus">10+ years</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="rate"
                  type="number"
                  placeholder="50"
                  className="pl-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/hour</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio/Website (Optional)</Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://your-portfolio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell clients about your experience, specializations, and what makes you unique..."
                rows={4}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={() => router.push("/home")}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            You can always update your profile later from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}