// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { config } from 'dotenv';
import * as path from 'path';
import express from 'express';
import * as http from 'http';

import { INodeSocket } from 'botframework-streaming';

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {
    CloudAdapter,
    ConfigurationBotFrameworkAuthentication,
    ConfigurationBotFrameworkAuthenticationOptions
} from 'botbuilder';

// This bot's main dialog.
import { EchoBot } from './bot';

const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

// Create HTTP server.
const app = express();
const port = process.env.port || process.env.PORT || 3978;
const server = http.createServer(app);

app.use(express.json());

server.listen(port, () => {
    console.log(`\nServer listening on port ${port}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// @ts-ignore
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env as ConfigurationBotFrameworkAuthenticationOptions);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the main dialog.
const conversationReferences = {};
const myBot = new EchoBot(conversationReferences);

// Listen for incoming requests.
app.post('/api/messages', async (req, res) => {
    // Route received a request to adapter for processing
    await adapter.process(req, res, async (context) => await myBot.run(context));
});

// Listen for Upgrade requests for Streaming.
(server as any).on('upgrade', async (req: any, socket: any, head: any) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);

    // Set onTurnError for the CloudAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;

    await streamingAdapter.process(req, socket as unknown as INodeSocket, head, (context) => myBot.run(context));
});

// Listen for incoming notifications and send proactive messages to users.
app.get('/api/notify', (req, res, next) => {
    for (const conversationReference of Object.values(conversationReferences)) {
        adapter.continueConversationAsync(process.env.MicrosoftAppId, conversationReference, async (context) => {
            await context.sendActivity('proactive hello');
        });
    }
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.write('<html><body><h1>Proactive messages have been sent.</h1></body></html>');
    res.end();
});

// Listen for incoming custom notifications and send proactive messages to users.
app.post('/api/notify', (req, res, next) => {
    for (const msg of req.body) {
        for (const conversationReference of Object.values(conversationReferences)) {
            adapter.continueConversationAsync(process.env.MicrosoftAppId, conversationReference, async (turnContext) => {
                await turnContext.sendActivity(msg);
            });
        }
    }
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.write('Proactive messages have been sent.');
    res.end();
});
