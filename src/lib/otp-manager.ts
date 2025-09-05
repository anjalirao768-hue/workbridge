// OTP management utility with database-backed storage
import { supabase } from '@/app/lib/supabase';

interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

class OTPManager {
  private readonly EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
  private readonly MAX_ATTEMPTS = 3;

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeOTP(email: string): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.EXPIRATION_TIME;

    try {
      // Delete any existing OTP for this email
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', email);

      // Insert new OTP
      const { error } = await supabase
        .from('otp_codes')
        .insert([
          {
            email,
            otp,
            expires_at: new Date(expiresAt).toISOString(),
            attempts: 0,
            max_attempts: this.MAX_ATTEMPTS,
          },
        ]);

      if (error) {
        console.error('Error storing OTP:', error);
        throw new Error('Failed to store OTP');
      }

      // Clean up expired OTPs periodically
      await this.cleanupExpired();

      return otp;
    } catch (error) {
      console.error('Failed to store OTP:', error);
      throw error;
    }
  }

  async verifyOTP(email: string, providedOTP: string): Promise<boolean> {
    try {
      const { data: otpData, error } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !otpData) {
        return false;
      }

      // Check if OTP has expired
      const expiresAt = new Date(otpData.expires_at).getTime();
      if (Date.now() > expiresAt) {
        await supabase.from('otp_codes').delete().eq('email', email);
        return false;
      }

      // Check attempt limit
      if (otpData.attempts >= otpData.max_attempts) {
        await supabase.from('otp_codes').delete().eq('email', email);
        return false;
      }

      // Verify OTP
      if (otpData.otp === providedOTP) {
        // Delete OTP after successful verification
        await supabase.from('otp_codes').delete().eq('email', email);
        return true;
      } else {
        // Increment attempts
        await supabase
          .from('otp_codes')
          .update({ attempts: otpData.attempts + 1 })
          .eq('email', email);
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  async hasOTP(email: string): Promise<boolean> {
    try {
      const { data: otpData, error } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !otpData) return false;

      // Check if expired
      const expiresAt = new Date(otpData.expires_at).getTime();
      if (Date.now() > expiresAt) {
        await supabase.from('otp_codes').delete().eq('email', email);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking OTP:', error);
      return false;
    }
  }

  async getRemainingAttempts(email: string): Promise<number> {
    try {
      const { data: otpData, error } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !otpData) return 0;

      return Math.max(0, otpData.max_attempts - otpData.attempts);
    } catch (error) {
      console.error('Error getting remaining attempts:', error);
      return 0;
    }
  }

  private async cleanupExpired(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await supabase
        .from('otp_codes')
        .delete()
        .lt('expires_at', now);
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

export const otpManager = new OTPManager();