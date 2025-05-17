const express = require('express');

app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 5013;

let router = express.Router();

/*
req = {
    body: {
        "name": "John Doe",
        "email": "tuskedlion@gmail.com"
        "amount": 100,
        "category": "food",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        }
*/

// This is the route for the receipt generation
// The receipt will be sent to the user via email
router.post('/receipt', (req, res) => {
    const { name, email, amount, category, street, city, state, postalCode } = req.body;

    if (!name || !email || !amount || !category || !street || !city || !state || !postalCode) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    console.log(`Receipt for ${name} (${email}): $${amount} for ${category}`);
    console.log(`Address: ${street}, ${city}, ${state}, ${postalCode}`);

    res.status(200).json({ message: 'Receipt generated and sent to email' });
});

app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

