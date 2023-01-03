# realtime-exercises

This is a series of exercises done from Complete Intro to Real-Time course
from [frontendmasters.com](frontendmasters.com).

This repo contains notes related to different things around realtime ecosystem.

# Notes

Here are my notes from this course.

## Long polling

Long polling is the simplest way of having persistent connection with server, 
that doesn’t use any specific protocol like WebSocket or Server Side Events.

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
