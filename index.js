const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

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
