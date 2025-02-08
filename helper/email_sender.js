const nodemailer = require("nodemailer");

exports.sendMail = async (email, subject, body) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOprions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOprions, (error, info) => {
      if (error) {
        console.error("Error send email: ", error);
        reject(Error("خطا در ارسال ایمیل"));
      }
      console.log("Email Sent: ", info.response);

      resolve(
        "کد یک بار مصرف (OTP) جهت بازنشانی رمز عبور به ایمیلتان ارسال شد (:"
      );
    });
  });
};
