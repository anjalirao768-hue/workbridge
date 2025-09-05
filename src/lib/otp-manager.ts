// OTP management utility
interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

class OTPManager {
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
  private readonly MAX_ATTEMPTS = 3;

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeOTP(email: string): string {
    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.EXPIRATION_TIME;

    this.otpStorage.set(email, {
      otp,
      expiresAt,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
    });

    // Clean up expired OTPs periodically
    this.cleanupExpired();

    return otp;
  }

  verifyOTP(email: string, providedOTP: string): boolean {
    const otpData = this.otpStorage.get(email);

    if (!otpData) {
      return false;
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      this.otpStorage.delete(email);
      return false;
    }

    // Check attempt limit
    if (otpData.attempts >= otpData.maxAttempts) {
      this.otpStorage.delete(email);
      return false;
    }

    // Verify OTP
    if (otpData.otp === providedOTP) {
      this.otpStorage.delete(email);
      return true;
    } else {
      otpData.attempts += 1;
      return false;
    }
  }

  hasOTP(email: string): boolean {
    const otpData = this.otpStorage.get(email);
    if (!otpData) return false;

    // Check if expired
    if (Date.now() > otpData.expiresAt) {
      this.otpStorage.delete(email);
      return false;
    }

    return true;
  }

  getRemainingAttempts(email: string): number {
    const otpData = this.otpStorage.get(email);
    if (!otpData) return 0;

    return Math.max(0, otpData.maxAttempts - otpData.attempts);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [email, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(email);
      }
    }
  }
}

export const otpManager = new OTPManager();