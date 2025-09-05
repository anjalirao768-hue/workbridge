"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KYCStatus {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  admin_notes?: string;
}

interface KYCVerificationProps {
  onClose?: () => void;
}

export default function KYCVerification({ onClose }: KYCVerificationProps) {
  const [kycStatus, setKycStatus] = useState<KYCStatus>({ status: 'not_submitted' });
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch('/api/kyc/upload');
      const data = await response.json();
      
      if (data.success) {
        setKycStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      setAadhaarFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!aadhaarFile || !aadhaarNumber) {
      setError('Please provide both Aadhaar number and document');
      setLoading(false);
      return;
    }

    // Validate Aadhaar number format
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setError('Aadhaar number must be 12 digits');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('aadhaar', aadhaarFile);
      formData.append('aadhaarNumber', aadhaarNumber);

      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('KYC documents submitted successfully! We will review your documents within 24-48 hours.');
        setKycStatus({ status: 'pending', submitted_at: data.data.submitted_at });
        setAadhaarNumber('');
        setAadhaarFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('aadhaar-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Failed to submit KYC documents');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">✗ Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  return (
    <div className={onClose ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" : ""}>
      <Card className={onClose ? "w-full max-w-lg" : "w-full max-w-2xl mx-auto"}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            KYC Verification
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            )}
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            Complete your KYC to unlock all platform features
            {getStatusBadge(kycStatus.status)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {kycStatus.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h4 className="text-green-800 font-medium">KYC Verification Complete</h4>
                  <p className="text-green-600 text-sm">Your identity has been verified successfully.</p>
                </div>
              </div>
            </div>
          )}

          {kycStatus.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600 text-xl">⏳</span>
                <div>
                  <h4 className="text-yellow-800 font-medium">Review in Progress</h4>
                  <p className="text-yellow-600 text-sm">
                    Submitted on {new Date(kycStatus.submitted_at!).toLocaleDateString()}. 
                    We'll review your documents within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {kycStatus.status === 'rejected' && kycStatus.admin_notes && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 text-xl">✗</span>
                <div>
                  <h4 className="text-red-800 font-medium">Verification Rejected</h4>
                  <p className="text-red-600 text-sm">{kycStatus.admin_notes}</p>
                  <p className="text-red-500 text-xs mt-1">Please resubmit with correct documents.</p>
                </div>
              </div>
            </div>
          )}

          {(kycStatus.status === 'not_submitted' || kycStatus.status === 'rejected') && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-800 font-medium mb-2">Required Documents</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center space-x-2">
                    <span>📄</span>
                    <span>Aadhaar Card (Front and Back) or Aadhaar PDF</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    Accepted formats: JPEG, PNG, PDF (Max 10MB)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 12-digit Aadhaar number (without spaces or hyphens)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Aadhaar Document *
                </label>
                <input
                  type="file"
                  id="aadhaar-file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
                {aadhaarFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {aadhaarFile.name}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Security Notice</h4>
                <p className="text-xs text-gray-600">
                  Your documents are encrypted and stored securely. We comply with Indian data protection regulations. 
                  Documents are only used for identity verification and are not shared with third parties.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading || !aadhaarFile || !aadhaarNumber}
                  className={`${onClose ? 'flex-1' : 'w-full'} bg-purple-600 hover:bg-purple-700 text-white`}
                >
                  {loading ? 'Uploading...' : 'Submit for Verification'}
                </Button>
              </div>
            </form>
          )}

          {kycStatus.status === 'pending' && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}