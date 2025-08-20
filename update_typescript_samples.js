const fs = require('fs');
const path = require('path');

const samples = [
    '03.welcome-users',
    '05.multi-turn-prompt',
    '06.using-cards',
    '16.proactive-messages'
];

const basePath = '/workspaces/BotBuilder-Samples/samples/typescript_nodejs';

samples.forEach(sample => {
    const indexPath = path.join(basePath, sample, 'src', 'index.ts');
    const packagePath = path.join(basePath, sample, 'package.json');
    
    if (fs.existsSync(indexPath)) {
        console.log(`Updating ${sample}/src/index.ts...`);
        let content = fs.readFileSync(indexPath, 'utf8');
        
        // Replace restify import with express
        content = content.replace(/import \* as restify from 'restify';?/g, "import express from 'express';");
        
        // Replace server creation
        content = content.replace(/const server = restify\.createServer\(\);?\s*server\.use\(restify\.plugins\.bodyParser\(\)\);?/g, 
            "const server = express();\nserver.use(express.json());");
        
        // Update server.url to port number
        content = content.replace(/server\.url/g, '3978');
        
        // Update server.on to (server as any).on for upgrade events
        content = content.replace(/server\.on\('upgrade', async \(req, socket, head\) =>/g, 
            "(server as any).on('upgrade', async (req: any, socket: any, head: any) =>");
        
        // Add @ts-ignore before botFrameworkAuthentication
        content = content.replace(/const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication/g,
            "// @ts-ignore\nconst botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication");
            
        // Fix async handler in server.post
        content = content.replace(/server\.post\('\/api\/messages', \(req, res, next\) => \{/g,
            "server.post('/api/messages', async (req, res) => {");
        content = content.replace(/adapter\.process\(req, res, async \(context\) => await/g,
            "await adapter.process(req, res, async (context) => await");
        
        fs.writeFileSync(indexPath, content);
    }
    
    if (fs.existsSync(packagePath)) {
        console.log(`Updating ${sample}/package.json...`);
        let packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        // Update dependencies
        if (packageJson.dependencies) {
            if (packageJson.dependencies.botbuilder) {
                packageJson.dependencies.botbuilder = "~4.23.3-dev";
            }
            if (packageJson.dependencies.restify) {
                delete packageJson.dependencies.restify;
                packageJson.dependencies.express = "~5.0.1";
            }
        }
        
        // Update devDependencies
        if (packageJson.devDependencies) {
            if (packageJson.devDependencies['@types/restify']) {
                delete packageJson.devDependencies['@types/restify'];
                packageJson.devDependencies['@types/express'] = "^4.17.17";
            }
            if (!packageJson.devDependencies['@types/node']) {
                packageJson.devDependencies['@types/node'] = "^18.15.0";
            }
        }
        
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));
    }
});

console.log('All TypeScript samples updated!');
