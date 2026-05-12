import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (email, otp) => {
  await resend.emails.send({
    from: 'SisaBisa <onboarding@resend.dev>',
    to: email,
    subject: 'Kode OTP Registrasi SisaBisa',
    html: `<p>Kode OTP kamu adalah <b>${otp}</b>. Kode ini berlaku selama 10 menit.</p>`,
  });
};