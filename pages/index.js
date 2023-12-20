const protocol = window.location.protocol.includes('https') ? 'wss://' : 'ws://';
const wsEndpoint = protocol + window.location.host + '/baby';

const ws = new WebSocket(wsEndpoint);


let id = null;
let col = null;

ws.onopen = function() {
  console.log("Connection opened");
  id = Math.random().toString(36).substring(8);
  ws.send(`register_player_${id}`)
};

ws.onerror = function(error) {
  console.error("WebSocket Error: " + error);
};

ws.onclose = function() {
  console.log("Connection closed");
};

ws.onmessage = function(event) {
  console.log("Message received: " + event.data);
  if (event.data.startsWith('color')) {
    const _id = event.data.split('_')[1];
    if (_id === id) {
      col = event.data.split('_')[2];
      document.getElementById('content').style.backgroundColor = col;
      console.log('color', col);
    }
  }
}

const up = document.getElementById('up');
const down = document.getElementById('down');
const left = document.getElementById('left');
const right = document.getElementById('right');
const rotate = document.getElementById('rotate');

up.addEventListener('click', () => {
  ws.send(`swipe_up_${id}`);
});

down.addEventListener('click', () => {
  ws.send(`swipe_down_${id}`);
});

left.addEventListener('click', () => {
  ws.send(`swipe_left_${id}`);
});

right.addEventListener('click', () => {
  ws.send(`swipe_right_${id}`);
});

rotate.addEventListener('click', () => {
  ws.send(`rotate_${id}`);
});

document.ondblclick = function(e) {
  e.preventDefault();
}


// const initBot = () => {
//   setInterval(() => {
//     const actions = [
//       `swipe_up_${id}`,
//       `swipe_down_${id}`,
//       `swipe_left_${id}`,
//       `swipe_right_${id}`,
//       `rotate_${id}`,
//     ]
//     const randomAction = actions[Math.floor(Math.random() * actions.length)];
//     console.log('randomAction', randomAction);
//     ws.send(randomAction);
//   }, 800);
// }

// initBot();

// circle.addEventListener('touchstart', (event) => {
//   startX = event.touches[0].clientX;
//   startY = event.touches[0].clientY;
// });

// circle.addEventListener('touchend', (event) => {
//   const endX = event.changedTouches[0].clientX;
//   const endY = event.changedTouches[0].clientY;

//   const deltaX = endX - startX;
//   const deltaY = endY - startY;

//   if (Math.abs(deltaX) > Math.abs(deltaY)) {
//     if (deltaX > 0) {
//       console.log('Swipe right');
//       ws.send(`swipe_right_${id}`);
//     } else {
//       console.log('Swipe left');
//       ws.send(`swipe_left_${id}`);
//     }
//   } else {
//     if (deltaY > 0) {
//       console.log('Swipe down');
//       ws.send(`swipe_down_${id}`);
//     } else {
//       console.log('Swipe up');
//       ws.send(`swipe_up_${id}`);
//     }
//   }
// });

