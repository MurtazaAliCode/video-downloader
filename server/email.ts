import nodemailer from "nodemailer";

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a notification email to the site administrator.
 */
export async function sendAdminNotification(data: { name: string; email: string; subject: string; message: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP credentials not found. Admin notification skipped.");
    return;
  }

  const mailOptions = {
    from: `"VidDonloader System" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
    subject: `New Contact Submission: ${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #2563eb; margin-top: 0;">New message from ${data.name}</h2>
        <p><strong>From:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">${data.message}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">This message was sent from the VidDonloader contact form.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Admin notification email sent successfully.");
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
    throw error;
  }
}

/**
 * Sends a confirmation email to the user who submitted the form.
 */
export async function sendUserConfirmation(data: { name: string; email: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return;
  }

  const mailOptions = {
    from: `"VidDonloader Team" <${process.env.SMTP_USER}>`,
    to: data.email,
    subject: "We've received your message!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #2563eb; margin-top: 0;">Hi ${data.name},</h2>
        <p>Thank you for reaching out to us. We've received your message and our team will get back to you shortly (usually within 12 hours).</p>
        <p>We appreciate your patience and for being part of the VidDonloader community.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>VidDonloader Team</strong></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">If you didn't send a message on our website, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ User confirmation email sent successfully.");
  } catch (error) {
    console.error("❌ Error sending user confirmation:", error);
    // We don't throw here to avoid failing the whole request if only confirmation fails
  }
}
