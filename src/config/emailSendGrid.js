import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587, // you can also use 465 for SSL
  secure: false, // use true if you use port 465
  auth: {
    user: "apikey", // literally the string "apikey"
    pass: process.env.SENDGRID_API_KEY, // your actual SendGrid API Key
  },
});

