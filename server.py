import os
from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/generate_game', methods=['POST'])
def generate_game():
    data = request.get_json()
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    if openai.api_key is None:
        return jsonify({'error': 'API key not configured'}), 500

    system_prompt = (
        "You are a game generator. Given a description, you produce a minimal HTML"\
        " and JavaScript game that can run in the browser. Keep the output short."\
        " Do not include code fences."
    )
    user_prompt = f"Create a simple browser game based on this description: {prompt}"
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        game_html = response.choices[0].message['content']
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'game_html': game_html})

if __name__ == '__main__':
    app.run(debug=True)
