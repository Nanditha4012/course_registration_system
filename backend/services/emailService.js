import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 6-digit OTP
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTPEmail = async (email, otp, purpose = 'registration') => {
  const subject = purpose === 'registration'
    ? 'Verify your email - Course Portal'
    : 'Login OTP - Course Portal';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2>Email Verification</h2>
      <p>Your OTP for ${purpose} is:</p>
      <div style="background:#f6f6f6;padding:16px;text-align:center;font-size:32px;letter-spacing:8px;font-weight:700">
        ${otp}
      </div>
      <p style="color:#666">This OTP expires in 10 minutes.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html
  });
};
