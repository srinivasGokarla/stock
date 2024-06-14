const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const tradesFilePath = path.join(__dirname, 'trades.json');

app.use(bodyParser.json());
app.use(morgan(':method :url :status :response-time ms - :date[iso]'));

const readTrades = () => {
    const data = fs.readFileSync(tradesFilePath);
    return JSON.parse(data);
};

const writeTrades = (trades) => {
    fs.writeFileSync(tradesFilePath, JSON.stringify(trades, null, 2));
};

app.get('/test', (req, res) => {
    res.status(200).json("successfully Tested")
}
)

app.post('/trades', (req, res) => {
    const newTrade = req.body;
    if (!newTrade.type || !newTrade.user_id || !newTrade.symbol || !newTrade.shares || !newTrade.price) {
        return res.status(400).send('Invalid trade data');
    }
    if (newTrade.shares < 10 || newTrade.shares > 30) {
        return res.status(400).send('Shares must be between 10 and 30');
    }
    const trades = readTrades();
    const newId = trades.length > 0 ? trades[trades.length - 1].id + 1 : 1;
    const trade = { id: newId, ...newTrade };
    trades.push(trade);
    writeTrades(trades);
    res.status(201).json(trade);
});


app.get('/trades', (req, res) => {
    const trades = readTrades();
    res.status(200).json({ trades });
});

app.get('/trades/:id', (req, res) => {
    const tradeId = parseInt(req.params.id);
    const trades = readTrades();
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) {
        return res.status(404).send('ID not found');
    }
    res.status(200).json(trade);
});


app.patch('/trades/:id', (req, res) => {
    const tradeId = parseInt(req.params.id);
    const newPrice = req.body.price;
    if (!newPrice) {
        return res.status(400).send('Invalid trade data');
    }
    const trades = readTrades();
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) {
        return res.status(404).send('ID not found');
    }
    trade.price = newPrice;
    writeTrades(trades);
    res.status(200).json(trade);
});

app.delete('/trades/:id', (req, res) => {
    const tradeId = parseInt(req.params.id);
    let trades = readTrades();
    const tradeIndex = trades.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) {
        return res.status(404).send('ID not found');
    }
    trades = trades.filter(t => t.id !== tradeId);
    writeTrades(trades);
    res.status(200).send('Trade deleted successfully');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
