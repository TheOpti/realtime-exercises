# realtime-exercises

This is a series of exercises done from Complete Intro to Real-Time course
from [frontendmasters.com](frontendmasters.com).

This repo contains notes related to different things around realtime ecosystem.

# Notes

Here are my notes from this course.

## Long polling

Long polling is the simplest way of having persistent connection with server, 
that does not use any specific protocol like WebSocket or Server Side Events.

The situation when the browser sent a request and has a pending connection with 
the server, is standard for this method. Only when a message is delivered, 
the connection is reestablished.

The flow:
1. A request is sent to the server.
1. The server doesn’t close the connection until it has a message to send.
1. When a message appears – the server responds to the request with it.
1. The browser makes a new request immediately.

Advantages:
- implemented with `XMLHTTPRequest`, so there’s usually little need to support further fallback layers
- basic polling still can be of limited use 

Disadvantages:
- more resource intensive on the server than a WebSocket connection
- can come with a latency overhead because it requires several hops between servers and devices
- reliable message ordering can be an issue
- confirmation of message receipt by one client instance may also cause another client instance to never receive an expected message at all

## Polling methods

- setTimeout
- requestAnimationFrame
- backoff & retry

### setTimeout

```javascript
async function getNewMsgs() {
  let json;
  try {
    const res = await fetch('/poll');
    json = await res.json();
  } catch (e) {
    // back off code would go here
    console.error('Error', e);
  }
  allChat = json.msg;
  render();
  
  setTimeout(getNewMsgs, INTERVAL);
}

getNewMsgs();
```

### requestAnimationFrame

`requestAnimationFrame` runs only when the main JS thread is idle, 
guaranteeing you're not interrupting any repaints. 

`setInterval` and `setTimeout` are hammers: they run and will 
absolutely interrupt any code execution and paints that happening.

```
let timeToMakeNextRequest = 0;
async function rafTimer(time) {
  if (timeToMakeNextRequest <= time) {
    await getNewMsgs();
    timeToMakeNextRequest = time + INTERVAL;
  }
  requestAnimationFrame(rafTimer);
}

requestAnimationFrame(rafTimer);
```

### backoff & retry

A backoff algorithm makes sure that when a target system can
not serve a request it is not flooded with subsequent retries. 

It achieves this by introducing a waiting period between the 
retries to give the target a chance to recover.

```javascript
async function getNewMsgs() {
  try {
    const res = await fetch('/poll');
    const json = await res.json();

    if (res.status >= 400) {
      throw new Error('Error ' + res.status);
    }

    allChat = json.msg;
    render();
    failedTries = 0;
  } catch (e) {
    failedTries++;
  }
}

const BACKOFF = 5000;
let timeToMakeNextRequest = 0;
let failedTries = 0;
async function rafTimer(time) {
  if (timeToMakeNextRequest <= time) {
    await getNewMsgs();
    timeToMakeNextRequest = time + INTERVAL + failedTries * BACKOFF;
  }
  requestAnimationFrame(rafTimer);
}

requestAnimationFrame(rafTimer);
```

## HTTP2

HTTP/2 does not work without HTTPS because all the browsers enforce that it must be a secure connection.
Thus, before working with examples from http2, we need to create ssl certificate:

```
openssl req -new -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
```

HTTP2 introduces new binary framing mechanism which changes how the data is exchanged between the client and server.

- Stream: A bidirectional flow of bytes within an established connection, which may carry one or more messages.
- Message: A complete sequence of frames that map to a logical request or response message.
- Frame: The smallest unit of communication in HTTP/2, each containing a frame header, which at a minimum identifies the stream to which the frame belongs.

