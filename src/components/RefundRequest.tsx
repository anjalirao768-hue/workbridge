"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RefundRequestProps {
  projectId: string;
  projectTitle: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const refundReasons = [
  'Work not delivered',
  'Quality issues',
  'Project cancelled',
  'No longer required',
  'Freelancer not responding'
];

export default function RefundRequest({ 
  projectId, 
  projectTitle, 
  amount, 
  onClose, 
  onSuccess 
}: RefundRequestProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/refund-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          reason,
          description,
          amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to submit refund request');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Request Refund
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </CardTitle>
          <CardDescription>
            Submit a refund request for: <strong>{projectTitle}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount
              </label>
              <div className="text-2xl font-bold text-green-600">
                ₹{amount.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select a reason</option>
                {refundReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
                placeholder="Provide any additional details about your refund request..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Refund Policy
              </h4>
              <p className="text-xs text-yellow-700">
                Refund requests are processed within 7 days. Approved refunds will be credited to your original payment method within 5-7 business days.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !reason}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Submitting...' : 'Submit Refund Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}