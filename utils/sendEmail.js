const nodemailer = require("nodemailer");
require('dotenv').config();


module.exports = async (userEmail, subject, htmlTemplate) => {
  console.log(userEmail)
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sarahibrahimabdelhamid@gmail.com",
        pass: "btxo fvuk gwpf jjcq",
      },
      tls: {
        rejectUnauthorized: false
    }
    });

    const mailOptions = {
      from: "sarahibrahimabdelhamid@gmail.com",
      to: userEmail,
      subject: subject,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email Sent: " + info.response);
  } catch (error) {
    console.log(error);
    throw new Error("Internal Server Error (nodemailer)");
  }
};
