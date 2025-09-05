import { NextRequest, NextResponse } from 'next/server';
import { otpManager } from '@/lib/otp-manager';
import { supabase } from '@/lib/supabase';
import { SignJWT } from 'jose';

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request: NextRequest) {
  try {
    const { email, otp, role, isLogin } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOTP = otpManager.verifyOTP(email, otp);

    if (!isValidOTP) {
      const remainingAttempts = otpManager.getRemainingAttempts(email);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired OTP',
          remainingAttempts 
        },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // For signup (new users), update role and verify email
    if (!isLogin && role) {
      if (!['client', 'freelancer'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Role must be either client or freelancer' },
          { status: 400 }
        );
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          role,
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update user record' },
          { status: 500 }
        );
      }

      user.role = updatedUser.role;
      user.email_verified = updatedUser.email_verified;
    } else if (isLogin) {
      // For login, just verify email if not already verified
      if (!user.email_verified) {
        const { error: verifyError } = await supabase
          .from('users')
          .update({
            email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (verifyError) {
          console.error('Error verifying email:', verifyError);
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Role is required for signup' },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(jwtSecret);

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: isLogin ? 'Login successful' : 'Email verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          email_verified: user.email_verified,
        },
        token,
      },
    });

    // Set httpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in verify-otp API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}