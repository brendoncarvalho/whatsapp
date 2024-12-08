const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios'); // Biblioteca para requisições HTTP

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

// Listening to all incoming messages
client.on('message_create', async (message) => {
    console.log('Received message:', message.body);

    // Prepare payload for webhook
    const payload = {
        from: message.from, // Número do remetente
        to: message.to,     // Número do destinatário
        body: message.body, // Conteúdo da mensagem
        timestamp: message.timestamp, // Timestamp da mensagem
        type: message.type, // Tipo da mensagem
    };

    try {
        // Send message to webhook
        const response = await axios.post(
            'https://n8n.brendon.dev.br/webhook-test/4953fb61-ba5b-4038-8d35-664c4a8ccbab',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json', // Define o formato da requisição
                },
            }
        );

        console.log('Webhook response:', response.status, response.data);
    } catch (error) {
        console.error('Error sending message to webhook:', error.message);
    }
});
