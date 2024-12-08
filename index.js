const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express'); // Para criar a API HTTP

const app = express();
const PORT = 3000;

// Middleware para parsing do body JSON
app.use(express.json());

// URLs dos webhooks
const PRIMARY_WEBHOOK = 'https://n8n.brendon.dev.br/webhook-test/4953fb61-ba5b-4038-8d35-664c4a8ccbab';
const FALLBACK_WEBHOOK = 'https://n8n.brendon.dev.br/webhook/4953fb61-ba5b-4038-8d35-664c4a8ccbab';

// Create a new client instance
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth({
        dataPath: 'whatsapp_sessions'
    })
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Client is ready!');
});

// When the client receives QR-Code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Start your client
client.initialize();

// Function to send message to webhook
const sendMessageToWebhook = async (url, payload) => {
    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(`Message successfully sent to: ${url}`);
        console.log('Response:', response.status, response.data);
        return true; // Envio bem-sucedido
    } catch (error) {
        console.error(`Failed to send message to: ${url}`, error.message);
        return false; // Envio falhou
    }
};

// Listening to all incoming messages
client.on('message_create', async (message) => {
    console.log('Received message:', message.body);

    const payload = {
        from: message.from,
        to: message.to,
        body: message.body,
        timestamp: message.timestamp,
        type: message.type,
    };

    // Tente o envio para o webhook primário
    const success = await sendMessageToWebhook(PRIMARY_WEBHOOK, payload);

    // Caso o envio falhe, tente o webhook de fallback
    if (!success) {
        console.log('Retrying with fallback webhook...');
        await sendMessageToWebhook(FALLBACK_WEBHOOK, payload);
    }
});

// Endpoint para enviar mensagens
app.post('/send-message', async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Os campos "to" e "message" são obrigatórios.' });
    }

    try {
        // Enviar mensagem
        const response = await client.sendMessage(to, message);
        console.log(`Mensagem enviada para ${to}:`, message);
        res.status(200).json({ success: true, response });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Inicia o servidor HTTP
app.listen(PORT, () => {
    console.log(`API HTTP rodando em http://localhost:${PORT}`);
});
