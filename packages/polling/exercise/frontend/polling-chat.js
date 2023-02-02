const chat = document.getElementById('chat');
const msgs = document.getElementById('msgs');
const loader = document.getElementById('loader');

// let's store all current messages here
let allChat = [];

let timeToMakeNextReq = 0;

let failedRequests = 0;

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// backoff time
const BACKOFF = 4000;

// a submit listener on the form in the HTML
chat.addEventListener('submit', function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = '';
});

async function postNewMsg(user, text) {
  loader.style.visibility = 'visible';

  const result = await fetch('/poll', {
    method: 'POST',
    body: JSON.stringify({
      user,
      text,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const parsedResponse = result.json();
  loader.style.visibility = 'hidden';
  console.log('Response: ', parsedResponse);
}

async function getNewMsgs() {
  try {
    const result = await fetch('/poll');
    const { messages = [] } = await result.json();
    allChat = messages;
  } catch (error) {
    console.log('Error ', error);
    failedRequests++;
  }

  render();
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join('\n');
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;


async function rafTimer(time) {
  if (timeToMakeNextReq < time) {
    timeToMakeNextReq = timeToMakeNextReq + INTERVAL + failedRequests * BACKOFF;
    await getNewMsgs();
  }

  requestAnimationFrame(rafTimer);
}

requestAnimationFrame(rafTimer);
