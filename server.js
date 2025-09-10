require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5013;

// --- Allow CORS from anywhere for testing ---
app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Nodemailer setup ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Function to send email ---
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

// --- Receipt endpoint ---
app.post("/receipt", async (req, res) => {
  console.log("POST /receipt called");
  console.log("Request body:", req.body);

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

  const htmlContent = `
    <div style="max-width:600px; margin:auto; padding:20px; font-family:Arial;">
      <h2>Receipt Confirmation</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Address:</strong> ${street}, ${city}, ${state} ${postalCode}</p>
      <p>Thank you for your submission!</p>
    </div>
  `;

  const result = await sendEmail(email, name, htmlContent);

  if (!result.success) {
    return res.status(500).json({ error: "Failed to send email" });
  }

  return res
    .status(200)
    .json({ message: "Receipt generated and sent to email" });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Microservice-A Server running on port ${PORT}`);
});
