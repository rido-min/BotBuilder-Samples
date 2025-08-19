#!/bin/bash

# List of samples to update (excluding already updated ones)
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
    "80.skills-simple-bot-to-bot"
    "81.skills-skilldialog"
    "82.skills-sso-cloudadapter"
    "83.named-pipe-sample"
    "84.bot-authentication-certificate"
    "85.bot-authentication-sni"
    "86.bot-authentication-fic"
)

base_dir="/workspaces/BotBuilder-Samples/samples/javascript_nodejs"

echo "Updating package.json files for all samples..."

for sample in "${samples[@]}"; do
    package_file="$base_dir/$sample/package.json"
    if [ -f "$package_file" ]; then
        echo "Updating $sample/package.json..."
        
        # Update botbuilder version and replace restify with express
        sed -i 's/"botbuilder": "~4\.23\.0"/"botbuilder": "~4.23.3-dev"/g' "$package_file"
        sed -i 's/"botbuilder-dialogs": "~4\.23\.0"/"botbuilder-dialogs": "~4.23.3-dev"/g' "$package_file"
        sed -i 's/"restify": "~10\.0\.0"/"express": "~5.0.1"/g' "$package_file"
        
        # Remove path dependency if it exists
        sed -i '/"path": "\^0\.12\.7",/d' "$package_file"
        
        echo "✅ Updated $sample/package.json"
    else
        echo "❌ Package.json not found for $sample"
    fi
done

echo "All package.json files updated!"
