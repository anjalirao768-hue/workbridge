import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const aadhaarFile = formData.get('aadhaar') as File;
    const aadhaarNumber = formData.get('aadhaarNumber') as string;

    if (!aadhaarFile || !aadhaarNumber) {
      return NextResponse.json(
        { success: false, error: 'Aadhaar card image and number are required' },
        { status: 400 }
      );
    }

    // Validate Aadhaar number format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Aadhaar number format' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(aadhaarFile.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG, PNG, and PDF files are allowed' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (aadhaarFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await aadhaarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileName = `kyc/${user.userId}/${Date.now()}-aadhaar.${aadhaarFile.name.split('.').pop()}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, buffer, {
        contentType: aadhaarFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload document' },
        { status: 500 }
      );
    }

    // Save KYC data to database
    const { data: kycData, error: dbError } = await supabase
      .from('kyc_verifications')
      .insert([
        {
          user_id: user.userId,
          document_type: 'aadhaar',
          document_number: aadhaarNumber,
          document_url: uploadData.path,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error saving KYC data:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to save KYC information' },
        { status: 500 }
      );
    }

    // Update user KYC status
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ kyc_status: 'pending' })
      .eq('id', user.userId);

    if (userUpdateError) {
      console.error('Error updating user KYC status:', userUpdateError);
    }

    return NextResponse.json({
      success: true,
      message: 'KYC documents submitted successfully',
      data: {
        id: kycData.id,
        status: kycData.status,
        submitted_at: kycData.submitted_at,
      },
    });
  } catch (error) {
    console.error('Error in KYC upload API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's KYC status
    const { data: kycData, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching KYC data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch KYC status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kycData || { status: 'not_submitted' },
    });
  } catch (error) {
    console.error('Error in get KYC status API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}