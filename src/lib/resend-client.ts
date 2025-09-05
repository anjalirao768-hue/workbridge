// Resend client configuration for OTP emails
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_3pxM3Lew_EL1B24BijqQtVTSWNBqV6TH3';

export const resendClient = new Resend(resendApiKey);

export const sendOTPEmail = async (to: string, otp: string) => {
  try {
    const { data, error } = await resendClient.emails.send({
      from: 'WorkBridge <noreply@workbridge.live>',
      to: [to],
      subject: 'Your WorkBridge Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Your Verification Code</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px;
                }
                .container { 
                    background-color: #f9f9f9; 
                    border-radius: 8px; 
                    padding: 30px; 
                    text-align: center;
                }
                .logo { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #7c3aed; 
                    margin-bottom: 20px;
                }
                .otp-code { 
                    font-size: 36px; 
                    font-weight: bold; 
                    background: linear-gradient(135deg, #7c3aed, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    letter-spacing: 8px;
                    border: 2px dashed #7c3aed;
                }
                .footer { 
                    margin-top: 30px; 
                    font-size: 14px; 
                    color: #666; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">WorkBridge</div>
                <h2>Email Verification</h2>
                <p>Please use the following code to verify your email address:</p>
                <div class="otp-code">${otp}</div>
                <p><strong>This code expires in 10 minutes</strong></p>
                <p>If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                    <p>This is an automated message from WorkBridge.<br/>
                    Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending OTP email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error: 'Failed to send email' };
  }
};