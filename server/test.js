import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('GET / was called');
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));