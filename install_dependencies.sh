#!/bin/bash

# Install dependencies for all updated samples
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

echo "Installing dependencies for updated samples..."

for sample in "${samples[@]}"; do
    sample_dir="$base_dir/$sample"
    if [ -d "$sample_dir" ] && [ -f "$sample_dir/package.json" ]; then
        echo "Installing dependencies for $sample..."
        cd "$sample_dir"
        npm install --silent > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ $sample dependencies installed"
        else
            echo "❌ Failed to install dependencies for $sample"
        fi
    else
        echo "❌ Directory or package.json not found for $sample"
    fi
done

echo "Dependency installation complete!"
