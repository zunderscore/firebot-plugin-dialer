# Dialer Plugin for Firebot

This plugin adds two dialer effects to Firebot:
- **Dial Number**
- **Play Dial Tone**

These effects use built-in JavaScript APIs to generate the relevant DTMF tones.

Nobody should use this. Ever. This is a very stupid plugin.

## Prerequisites
- Firebot 5.65 or higher

## Setup

1. Copy the `firebot-dialer.js` file into your Firebot profile's `scripts` folder (e.g. `%appdata%\Firebot\v5\profiles\Main Profile\scripts`)
2. Go to Settings > Scripts in Firebot
3. Click on "Manage Startup Scripts"
4. Click "Add New Script"
5. Select the `firebot-dialer.js` file from the dropdown list
6. Click "Save"