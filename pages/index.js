const playerColors = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#800000', // Maroon
  '#808000', // Olive
  '#008000', // Dark Green
  '#800080', // Purple
  '#008080', // Teal
  '#000080', // Navy
  '#FFA500', // Orange
  '#A52A2A', // Brown
  '#FFC0CB', // Pink
  '#A9A9A9'  // Dark Gray
];

let playerColor = '';
const getRandomColor = () => {
  const len = playerColors.length;
  const rand = Math.floor(Math.random() * len);
  playerColor = playerColors[rand];
  return playerColor;
}

const content = document.getElementById('content');
content.style.backgroundColor = getRandomColor();

const wsEndpoint = 'wss://' + window.location.host + '/ws';

const ws = new WebSocket(wsEndpoint);
ws.onopen = function(event) {
    console.log("Connection opened");
};

ws.onmessage = function(event) {
    console.log("Received message: " + event.data);
};

ws.onerror = function(error) {
    console.error("WebSocket Error: " + error);
};

ws.onclose = function(event) {
    console.log("Connection closed");
};

content.addEventListener('pointerup', () => {
  ws.send('!hot')
});

const devPos = [0, 0, 0];
window.addEventListener("devicemotion", (event) => {
  devPos[0] = event.acceleration.x / 10
  devPos[1] = event.acceleration.y / 10
  devPos[2] = event.acceleration.z / 10
  ws.send(JSON.stringify({
    playerColor,
    playerPos: devPos,
  }))
});
