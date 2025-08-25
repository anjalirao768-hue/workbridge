"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ClientOnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleComplete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "client" }),
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome, Client!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Let&apos;s set up your client profile to start hiring freelancers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Profile Setup</CardTitle>
            <CardDescription>
              Tell us about your business and what kind of projects you need help with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company">Company/Business Name (Optional)</Label>
              <Input
                id="company"
                placeholder="e.g. Acme Corp, John's Startup"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                placeholder="e.g. E-commerce, SaaS, Healthcare"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-types">Types of Projects You Need Help With</Label>
              <Textarea
                id="project-types"
                placeholder="e.g. Web development, Mobile apps, Design, Content writing..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-range">Typical Project Budget Range</Label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Select budget range</option>
                <option value="under-1k">Under $1,000</option>
                <option value="1k-5k">$1,000 - $5,000</option>
                <option value="5k-10k">$5,000 - $10,000</option>
                <option value="10k-25k">$10,000 - $25,000</option>
                <option value="25k-plus">$25,000+</option>
              </select>
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