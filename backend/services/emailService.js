require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("Email service error:", error.message);
  } else {
    console.log("Email service ready");
  }
});

// Send booking confirmation
async function sendConfirmation(
  patientEmail,
  patientName,
  doctorName,
  date,
  time,
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: patientEmail,
    subject: "Appointment Confirmed - Family Clinic Management System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1976d2; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">🏥 Family Clinic</h1>
          <p style="color: #e3f2fd; margin: 8px 0 0;">Appointment Confirmation</p>
        </div>

        <div style="padding: 32px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello ${patientName},</h2>
          <p style="color: #555; font-size: 16px;">
            Your appointment has been confirmed. Here are your appointment details:
          </p>

          <div style="background: white; border-radius: 8px; padding: 24px;
                      border-left: 4px solid #1976d2; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px; width: 140px;">
                  Doctor
                </td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; font-size: 15px;">
                  ${doctorName}
                </td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Date</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; font-size: 15px;">
                  ${formatDate(date)}
                </td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Time</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold; font-size: 15px;">
                  ${time}
                </td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Status</td>
                <td style="padding: 10px 0;">
                  <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 12px;
                               border-radius: 20px; font-size: 13px; font-weight: bold;">
                    ✅ Confirmed
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <p style="color: #555;">
            Please arrive 10 minutes before your scheduled appointment time.
            If you need to cancel, please do so at least 2 hours in advance.
          </p>

          <div style="background: #fff3e0; border-radius: 8px; padding: 16px; margin-top: 20px;">
            <p style="color: #e65100; margin: 0; font-size: 14px;">
              📍 <strong>Location:</strong> Family Clinic, Main Branch<br>
              📞 <strong>Contact:</strong> 03001234567
            </p>
          </div>
        </div>

        <div style="background: #1976d2; padding: 16px; text-align: center;">
          <p style="color: #e3f2fd; margin: 0; font-size: 13px;">
            Family Clinic Management System
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Confirmation email sent to ${patientEmail}`);
}

// Send appointment reminder
async function sendReminder(patientEmail, patientName, doctorName, date, time) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: patientEmail,
    subject: "Appointment Reminder - Tomorrow at " + time,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f57c00; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔔 Appointment Reminder</h1>
          <p style="color: #fff3e0; margin: 8px 0 0;">Family Clinic Management System</p>
        </div>

        <div style="padding: 32px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello ${patientName},</h2>
          <p style="color: #555; font-size: 16px;">
            This is a reminder that you have an appointment <strong>tomorrow</strong>.
          </p>

          <div style="background: white; border-radius: 8px; padding: 24px;
                      border-left: 4px solid #f57c00; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px; width: 140px;">
                  Doctor
                </td>
                <td style="padding: 10px 0; color: #333; font-weight: bold;">
                  ${doctorName}
                </td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Date</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold;">
                  ${formatDate(date)}
                </td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Time</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold;">
                  ${time}
                </td>
              </tr>
            </table>
          </div>

          <p style="color: #555;">
            Please remember to bring any relevant medical documents.
            Arrive 10 minutes early to complete any paperwork.
          </p>
        </div>

        <div style="background: #f57c00; padding: 16px; text-align: center;">
          <p style="color: #fff3e0; margin: 0; font-size: 13px;">
            Family Clinic Management System
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Reminder email sent to ${patientEmail}`);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

module.exports = { sendConfirmation, sendReminder };
