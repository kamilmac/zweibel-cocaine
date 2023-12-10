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
  '#A9A9A9',  // Dark Gray
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

const protocol = window.location.protocol.includes('https') ? 'wss://' : 'ws://';
const wsEndpoint = protocol + window.location.host + '/baby';

const ws = new WebSocket(wsEndpoint);

ws.onopen = function (event) {
  console.log("Connection opened");
};

ws.onerror = function (error) {
  console.error("WebSocket Error: " + error);
};

ws.onclose = function (event) {
  console.log("Connection closed");
};

let isTouching = false;
content.addEventListener('pointerdown', () => {
  isTouching = true;
});

content.addEventListener('pointerup', () => {
  isTouching = false;
});

let rotationRate = [0, 0, 0];
let acceleration = [0, 0, 0];
let eulerRotation = [0, 0, 0];

const id = String(Math.random() * 100000000000000000);

const SAMPLE_RATE = 2;
let counter = 0

window.addEventListener("deviceorientation", (event) => {
  eulerRotation[0] = event.alpha
  eulerRotation[1] = event.beta
  eulerRotation[2] = event.gamma
})

window.addEventListener("devicemotion", (event) => {
  acceleration[0] = event.acceleration.x
  acceleration[1] = event.acceleration.y
  acceleration[2] = event.acceleration.z
  rotationRate[0] = event.rotationRate.alpha
  rotationRate[1] = event.rotationRate.beta
  rotationRate[2] = event.rotationRate.gamma
  ws.send(JSON.stringify({
    id,
    int: event.interval,
    on: isTouching,
    col: playerColor,
    acc: acceleration,
    rot: rotationRate,
    eur: eulerRotation,
  }))
});

window.setTimeout(() => {
  ws.send('hello daddy')
}, 1000)
