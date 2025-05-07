# autodelve
A simple AI-powered Discord bot using Google Gemini 2.0 Flash to answer questions based on a set of documents.

**View the demo here: [Twitter/X Demo](https://x.com/0xSamHogan/status/1894937763717550272)**

TODO: Better documentation

## Setup

```bash
bun install
```

### Create a `.env` file

```bash
cp .env.example .env
```

Edit the `.env` file with your own values. You will need:
*   `GEMINI_API_KEY`: Your API key from Google AI Studio.
*   Discord bot credentials (`DISCORD_BOT_TOKEN`, etc.).

### Index a website

```bash
bun run index.ts download https://docs.inference.net
```

This command will download the website, convert the HTML to Markdown, and save the content to the `content` directory.

Once a website has been indexed, you can ask questions to the AI (powered by Google Gemini) by running:

```bash
bun run index.ts ask "How can I get started with inference.net?"
```

The response will be streamed to the console.

### Run in Discord

1. Create a Discord bot on the [Discord Developer Portal](https://discord.com/developers/applications). Make sure to add your secret values in the `.env` file.

2. Install the bot on your server

3. Run the bot with:

```bash
bun index.ts
```
