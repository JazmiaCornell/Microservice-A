require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5013;

const allowedOrigins = [
  "https://microservicesproject-production.up.railway.app",
  "http://localhost:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email
async function sendEmail(email, name, html) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Receipt Confirmation for ${name}`,
      text: `Receipt for ${name}`,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: err };
  }
}

// Receipt route
app.post("/receipt", async (req, res) => {
  const { name, email, amount, category, street, city, state, postalCode } =
    req.body;

  if (
    !name ||
    !email ||
    !amount ||
    !category ||
    !street ||
    !city ||
    !state ||
    !postalCode
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  console.log(`Receipt for ${name} (${email}): $${amount} for ${category}`);
  console.log(`Address: ${street}, ${city}, ${state}, ${postalCode}`);

  const htmlContent = `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="text-align: center; color: #333;">Receipt Confirmation</h2>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Address:</strong> ${street}, ${city}, ${state} ${postalCode}</p>
        <hr>
        <p style="text-align: center; font-size: 14px; color: #aaa;">Thank you for your submission!</p>
    </div>
  `;

  const result = await sendEmail(email, name, htmlContent);

  if (!result.success) {
    return res.status(500).json({ error: "Failed to send email" });
  }

  res.status(200).json({ message: "Receipt generated and sent to email" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Microservice-A Server is running on port ${PORT}`);
});
