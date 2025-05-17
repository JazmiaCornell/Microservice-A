import { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    category: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5013/receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    alert(result.message || result.error);
  };

  return (
    <div>
      <h1>Form for Receipt</h1>
      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key}>{key[0].toUpperCase() + key.slice(1)}:</label>
            <input
              type={key === 'amount' ? 'number' : 'text'}
              id={key}
              name={key}
              value={value}
              onChange={handleChange}
              required
            />
            <br />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
      <p>
        Edit <code>src/App.jsx</code> and save to test HMR
      </p>
    </div>
  );
}

export default App;
