const chat = document.getElementById('chat');
const msgs = document.getElementById('msgs');
const presence = document.getElementById('presence-indicator');

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener('submit', function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = '';
});

async function postNewMsg(user, text) {
  await fetch('/msgs', {
    method: 'POST',
    body: JSON.stringify({
      user,
      text,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function getNewMsgs() {
  console.log('getNewMsgs()');
  let reader;
  const utf8Decoder = new TextDecoder('utf-8');
  try {
    const res = await fetch('/msgs');
    reader = res.body.getReader();
  } catch (e) {
    console.log('connection error', e);
  }
  let done;
  presence.innerText = '🟢';
  do {
    console.log('inside do-while loop');
    let readerResponse;
    try {
      readerResponse = await reader.read();
    } catch (e) {
      console.error('reader failed', e);
      presence.innerText = '🔴';
      return;
    }
    done = readerResponse.done;
    const chunk = utf8Decoder.decode(readerResponse.value, { stream: true });
    if (chunk) {
      try {
        const json = JSON.parse(chunk);
        allChat = json.msg;
        render();
      } catch (e) {
        console.error('parse error', e);
      }
    }
    console.log('done', done);
  } while (!done);

  presence.innerText = '🔴';
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join('\n');
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
