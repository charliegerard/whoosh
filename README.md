# HVBRD (v2 with web sockets)

Interactive hoverboard experiment using a mobile phone and web sockets.

**The original version of this project was built using a Daydream controller.
To make it accessible to more people, I've changed it to use a mobile phone to connect to the browser via web sockets.**

## Demo

![demo gif](hvbrd.gif)

Try it live here: [http://bit.ly/hvbrd](http://bit.ly/hvbrd)

## Resources:

* [Medium blog post](https://medium.com/@devdevcharlie/hvbrd-c6266ee31461)

* [Dev.to post](http://bit.ly/hvbrd-post)

* Code also available on [CodeSandbox](https://codesandbox.io/s/hvbrd-sockets-ln0mi)

## Tech stack

* HTML / CSS
* (Vanilla) JavaScript
* DeviceOrientation Web API
* Three.js
* Node.js w/ socket.io

## Current commands

After opening the link on mobile, place the phone on a skateboard and start tilting it from left to right to avoid obstacles.

There is no particular goal or point system at the moment.

## Running locally

After cloning this repo, run `node server.js`, open your browser and visit `localhost:3000`.

To be able to visit the mobile page, you'll probably need something like [ngrok](https://ngrok.com/).

Once you have ngrok installed, you'll need to run `./ngrok http 3000` and, using the urls it will give you, visit `/mobile`.





