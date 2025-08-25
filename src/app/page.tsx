import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Work<span className="text-blue-600">Bridge</span> 🚀
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The lean freelance collaboration platform with transparent project flows, 
            secure escrow payments, and built-in dispute resolution.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏢 For Clients
              </CardTitle>
              <CardDescription>
                Post projects and hire talented freelancers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Secure escrow payments</li>
                <li>• Milestone-based project tracking</li>
                <li>• Transparent pricing with 5% platform fee</li>
                <li>• Built-in dispute resolution</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💻 For Freelancers
              </CardTitle>
              <CardDescription>
                Find projects and get paid securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Browse quality projects</li>
                <li>• Guaranteed payments through escrow</li>
                <li>• Build your reputation</li>
                <li>• Fair dispute resolution</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚖️ Platform Features
              </CardTitle>
              <CardDescription>
                Built for transparency and trust
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Complete audit trail</li>
                <li>• Admin oversight panel</li>
                <li>• Automated workflows</li>
                <li>• Production-ready security</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Demo Credentials</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900">Admin Access</h3>
              <p className="text-sm text-red-700 mt-2">
                <strong>Email:</strong> admin@workbridge.com<br/>
                <strong>Password:</strong> password123
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Client Account</h3>
              <p className="text-sm text-blue-700 mt-2">
                <strong>Email:</strong> client1@test.com<br/>
                <strong>Password:</strong> password123
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">Freelancer Account</h3>
              <p className="text-sm text-green-700 mt-2">
                <strong>Email:</strong> freelancer1@test.com<br/>
                <strong>Password:</strong> password123
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            This is a demo environment with mock escrow functionality
          </p>
        </div>
      </div>
    </div>
  );
}
