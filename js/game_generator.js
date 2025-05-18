async function generateGame() {
  const prompt = document.getElementById('game-prompt').value;
  if (!prompt) return;

  const response = await fetch('/generate_game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({prompt})
  });

  const data = await response.json();
  const container = document.getElementById('game-container');
  if (data.game_html) {
    container.innerHTML = data.game_html;
  } else if (data.error) {
    container.innerText = data.error;
  } else {
    container.innerText = 'Unexpected error';
  }
}
