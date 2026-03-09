const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOverdueReminder = async (userEmail, userName, bookTitle, dueDate) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: `Reminder: Book "${bookTitle}" is overdue`,
    html: `
      <h2>Overdue Book Reminder</h2>
      <p>Dear ${userName},</p>
      <p>Your book <strong>"${bookTitle}"</strong> was due on <strong>${new Date(dueDate).toLocaleDateString()}</strong>.</p>
      <p>Please return it as soon as possible to avoid additional fines.</p>
      <p>Best regards,<br/>Library Management System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Overdue reminder sent to:', userEmail);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

const sendFineNotification = async (userEmail, userName, fineAmount) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: 'Fine Generated - Library Management',
    html: `
      <h2>Fine Notification</h2>
      <p>Dear ${userName},</p>
      <p>A fine of Rs.<strong>${fineAmount}</strong> has been generated on your account.</p>
      <p>Please log in to your account to pay the fine and view details.</p>
      <p>Best regards,<br/>Library Management System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

const sendReservationApproved = async (userEmail, userName, bookTitle) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: 'Your reservation is ready',
    html: `
      <h2>Reservation Ready</h2>
      <p>Dear ${userName},</p>
      <p>Your reservation for <strong>"${bookTitle}"</strong> is now ready for pickup.</p>
      <p>Please collect it from the library within 3 days.</p>
      <p>Best regards,<br/>Library Management System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

module.exports = {
  sendOverdueReminder,
  sendFineNotification,
  sendReservationApproved
};
