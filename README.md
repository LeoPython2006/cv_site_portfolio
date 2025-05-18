# Portfolio Site with AI Game Generator

This repository contains a simple portfolio website. A new feature allows generating small browser games using OpenAI's API.

## Running the site

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Set the `OPENAI_API_KEY` environment variable with your OpenAI API key.
3. Start the server:
   ```bash
   python server.py
   ```
4. Open `index.html` in your browser. Use the *Create a game with AI* section to request a game. The generated game will appear below the button.

Note: the OpenAI API key is required for generating games.
