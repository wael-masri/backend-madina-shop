const nodemailer = require("nodemailer");

const sendEmailContact = async (options) => {
  //1) create transporter houweh service la nb3ate email like gmail mailgun sendgrid
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  //2) define email options (like from to subject)
   const mailOptions = {
    from: `Madina_Shop App <${options.email}>`,
    to: 'masriii121212@gmail.com',
    subject: options.subject,
    text: options.text
   }
  //3) send email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmailContact;
