// backend/api/utils/mailer.ts
import { render } from '@react-email/render';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { RecoveryEmail } from '../emailTemplates/RecoveryEmail';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // tu email de Gmail
    pass: process.env.GMAIL_APP_PASSWORD, // contraseña de aplicación
  },
});

export async function sendRecoveryEmail(to: string, code: string) {
  const html = await render(<RecoveryEmail verificationCode={code} />);

  const logoPath = path.resolve(__dirname, '../../../assets/images/logo.png'); // Ajustá si está en otra carpeta

  const info = await transporter.sendMail({
    from: `"Cooksy 🍽️" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Recuperación de contraseña - Cooksy',
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'cooksy-logo', // Este ID debe coincidir con el que usás en <Img src="cid:cooksy-logo" />
      },
    ],
  });

}
