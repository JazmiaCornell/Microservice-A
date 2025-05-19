require('dotenv').config({path: "./process.env"});
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 5013;

const router = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// fucnction to send an email using nodemailer
async function sendEmail(email, name, html) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Receipt Confirmation for ${name}`,
            text: `Receipt for ${name}`, // Optional plain text
            html: html,
        });
        return { success: true };
    } catch (err) {
        console.error('Error sending email:', err);
        return { success: false, error: err };
    }
}

// route to be called to generate receipy
router.post('/receipt', async (req, res) => {
    const { name, email, amount, category, street, city, state, postalCode } = req.body;

    if (!name || !email || !amount || !category || !street || !city || !state || !postalCode) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    console.log(`Receipt for ${name} (${email}): $${amount} for ${category}`);
    console.log(`Address: ${street}, ${city}, ${state}, ${postalCode}`);

    const htmlContent = `
        <h2>Receipt Confirmation</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Address:</strong> ${street}, ${city}, ${state} ${postalCode}</p>
    `;

    const result = await sendEmail(email, name, htmlContent);

    if (!result.success) {
        return res.status(500).json({ error: 'Failed to send email', details: result.error });
    }

    res.status(200).json({ message: 'Receipt generated and sent to email' });
});

app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
