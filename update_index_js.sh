#!/bin/bash

# Function to update index.js file
update_index_js() {
    local sample_dir="$1"
    local index_file="$sample_dir/index.js"
    
    if [ ! -f "$index_file" ]; then
        echo "❌ index.js not found for $(basename $sample_dir)"
        return
    fi
    
    echo "Updating $(basename $sample_dir)/index.js..."
    
    # Create backup
    cp "$index_file" "$index_file.backup"
    
    # Replace restify imports with express
    sed -i "s/const restify = require('restify');/const express = require('express');/g" "$index_file"
    
    # Update dotenv require pattern
    sed -i "s/require('dotenv').config({ path: ENV_FILE });/const dotenv = require('dotenv');\n\/\/ Import required bot configuration.\nconst ENV_FILE = path.join(__dirname, '.env');\ndotenv.config({ path: ENV_FILE });/g" "$index_file"
    
    # Update server creation
    sed -i "s/const server = restify.createServer();/const server = express();/g" "$index_file"
    sed -i "s/server.use(restify.plugins.bodyParser());/server.use(express.json());/g" "$index_file"
    
    # Update server listen callback
    sed -i "s/server.listen(process.env.port || process.env.PORT || 3978, function() {/server.listen(process.env.port || process.env.PORT || 3978, () => {/g" "$index_file"
    sed -i "s/console.log(\`\\\\n\${ server.name } listening to \${ server.url }\`);/console.log(\`\\\\n\${ server.name } listening to \${ 3978 }\`);/g" "$index_file"
    sed -i "s/console.log(\`\\\\n\${ server.name } listening to \${ server.url }.\`);/console.log(\`\\\\n\${ server.name } listening to \${ 3978 }\`);/g" "$index_file"
    
    # Add @ts-ignore before botFrameworkAuthentication
    sed -i "/const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication/i // @ts-ignore" "$index_file"
    
    # Update error handler pattern
    sed -i "s/adapter.onTurnError = async (context, error) => {/const onTurnErrorHandler = async (context, error) => {/g" "$index_file"
    sed -i "/};$/a \\n\/\/ Set the onTurnError for the singleton CloudAdapter.\\nadapter.onTurnError = onTurnErrorHandler;" "$index_file"
    
    echo "✅ Updated $(basename $sample_dir)/index.js"
}

# List of samples to update 
samples=(
    "03.welcome-users"
    "08.suggested-actions" 
    "12.customQABot"
    "15.handling-attachments"
    "16.proactive-messages"
    "17.multilingual-bot"
    "18.bot-authentication"
    "19.custom-dialogs"
    "23.facebook-events"
    "24.bot-authentication-msgraph"
    "40.timex-resolution"
    "43.complex-dialog"
    "44.prompt-for-user-input"
    "45.state-management"
    "47.inspection"
    "48.customQABot-all-features"
    "49.echo-proxy-bot"
    "84.bot-authentication-certificate"
    "85.bot-authentication-sni"
    "86.bot-authentication-fic"
)

base_dir="/workspaces/BotBuilder-Samples/samples/javascript_nodejs"

echo "Updating index.js files for all samples..."

for sample in "${samples[@]}"; do
    update_index_js "$base_dir/$sample"
done

echo "All index.js files updated!"
