import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/resend-client';
import { otpManager } from '@/lib/otp-manager';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists or create new user record
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let userId = existingUser?.id;

    if (!existingUser) {
      // Create new user record
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: 'OTP_AUTH', // Placeholder for OTP-based authentication
            email_verified: false,
            kyc_status: 'pending', // Use existing valid value
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        console.error('Error details:', JSON.stringify(createError, null, 2));
        return NextResponse.json(
          { success: false, error: 'Failed to create user record' },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // Generate and store OTP
    const otp = otpManager.storeOTP(email);

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data: { email, userId },
    });
  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}