// Server.js

const express = require('express');
const app = express();
const port = 3000;
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://fabiansandoval406:rHlHleJLvzCbkvdP@cluster0.zjvzgwa.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);
let cardsCollection;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/cards', async (req, res) => {
  const newCard = req.body;
  try {
    const result = await cardsCollection.insertOne(newCard);
    res.json({ message: 'Carta registrada exitosamente', cardId: result.insertedId });
  } catch (error) {
    console.error('Error al agregar la carta', error);
    res.status(500).json({ message: 'Error al agregar la carta' });
  }
});

app.get('/api/cards', async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const cards = await cardsCollection.find({}).skip(offset).limit(limit).toArray();
    res.json(cards);
  } catch (error) {
    console.error('Error al obtener las cartas', error);
    res.status(500).json({ message: 'Error al obtener las cartas' });
  }
});

app.put('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;
  const updatedCard = req.body;
  try {
    await cardsCollection.updateOne({ _id: new ObjectId(cardId) }, { $set: updatedCard });
    res.json({ message: 'Carta actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar la carta', error);
    res.status(500).json({ message: 'Error al actualizar la carta' });
  }
});

app.get('/api/cards/search', async (req, res) => {
  const searchTerm = req.query.term;
  try {
    const searchResult = await cardsCollection.find({
      $or: [
        { cardName: { $regex: searchTerm, $options: 'i' } },
        { cardType: { $regex: searchTerm, $options: 'i' } }
      ]
    }).toArray();
    res.json(searchResult);
  } catch (error) {
    console.error('Error al buscar cartas', error);
    res.status(500).json({ message: 'Error al buscar cartas' });
  }
});

app.get('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;
  try {
    const card = await cardsCollection.findOne({ _id: new ObjectId(cardId) });
    res.json(card);
  } catch (error) {
    console.error('Error al obtener la carta', error);
    res.status(500).json({ message: 'Error al obtener la carta' });
  }
});

app.delete('/api/cards/:id', async (req, res) => {
  const cardId = req.params.id;
  try {
    await cardsCollection.deleteOne({ _id: new ObjectId(cardId) });
    res.json({ message: 'Carta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la carta', error);
    res.status(500).json({ message: 'Error al eliminar la carta' });
  }
});

(async () => {
  try {
    await client.connect();
    console.log('Conexión a MongoDB Atlas establecida');
    const db = client.db('mydatabase'); 
    cardsCollection = db.collection('cards'); 
    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error al conectar con MongoDB Atlas', error);
  }
})();
