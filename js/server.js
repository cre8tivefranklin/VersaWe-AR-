const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: 'api.env' });
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root 'Web' directory
// Serve static files from the root 'Web' directory
app.use(express.static(path.join(__dirname, '..')));

// Serve index.html when the user navigates to the root path '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'public', 'index.html'));
});

// Serve app.html when the user navigates to '/app'
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'public', 'app.html'));
});

console.log(process.env.OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Access the API key from .env
});




// Example: Create a simple API endpoint to get a completion from OpenAI
app.post('/api/openai/completion', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Or your desired model
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150, // Adjust as needed
    });

    const text = completion.choices[0].message.content;
    res.json({ completion: text });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({ error: 'Failed to generate completion' });
  }
});

// Example: Another endpoint (you can add more as needed)
app.get('/api/hello', (req, res) => {
  res.send('Hello from the server!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});