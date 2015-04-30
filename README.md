# City Issue Tracker

[![Build Status](https://travis-ci.org/byu-osl/city-issue-server.svg?branch=master)](https://travis-ci.org/byu-osl/city-issue-server)

* [Introduction](#introduction)
	- [Features](#features)
* [Installation and workflow](#installation-and-workflow)
* [Contributing](#contributing)
* [Overview](#overview)
	- [Backend](#backend)
	- [Frontend](#frontend)
* [Troubleshooting](#troubleshooting)

## Introduction

The City Issue Tracker provides a way for citizens to submit issues (e.g. graffiti, a streetlight is out) and receive status updates from the city. It is written in <a href="https://nodejs.org/" target="_blank">Node</a> using [Express](http://expressjs.com/), [Mongoose](http://mongoosejs.com/index.html), and [React](http://facebook.github.io/react/). It implements (and will augment) the [Open311 specification](http://wiki.open311.org/GeoReport_v2/), and is under the direction of [Daniel Zappala](https://github.com/zappala) of BYU. 

This readme assumes you know very little about Node, React, etc.

### Features

[Todo list](#todo-list) below.

- issue reporting
	+ Geolocation
- Node JSON API

## Installation and workflow

Install [Node.js](https://nodejs.org/) and [MongoDB](http://docs.mongodb.org/manual/installation/) (make sure it is running: run `mongo` in the terminal, and then `version()`. If Mongo is running, you will get a version number). After that, run this in your terminal:

<code>git clone https://github.com/byu-osl/city-issue-server.git && cd city-issue-server</code>

*All terminal commands should be from the city-issue-server directory from now on*. Install your dependencies using npm (this may take a minute or two, and may require using sudo):

<code>npm install</code>

<code>sudo npm install **-g** gulp</code>

<code>sudo npm install **-g** supervisor</code>

Start the server:

<code>npm start</code>

`npm start` uses node-supervisor to watch your files. This is optional, but really nice: it restarts the server on every change so you don't have to. After a little bit, you should see a line that says `Listening on port 3000`. You can now hit the homepage at [http://localhost:3000/](http://localhost:3000/). Your server will be running from that terminal window, so you will have to open a new terminal tab or window for further commands. After the server is running, populate the database with a few dummy items:

<code>node load-database.js</code>

 **Note**: you won't see anything on the homepage besides the navigation until you run Gulp; that will be covered in the next section.

#### Frontend workflow

The entry point of the application is [app.js](client-side/js/app.js). That file depends on a couple other modules, indicated by <code>require(*file (including path) without extension*)</code> towards the beginning of the file. Gulp manages those dependencies (via Browserify) and rebuilds everything into build.js whenever you make a change. To get started with Gulp:

<code>cd client-side</code>

<code>gulp</code>

Gulp is now watching your files. Whenever you make a change in a JavaScript/JSX file, it will resolve all of the dependencies and throw everything into dist/build.js. Now, [http://localhost:3000/](http://localhost:3000/) should look something like this:

![Issue tracker screenshot](https://raw.github.com/byu-osl/city-issue-server/master/screenshot.png)

## Contributing

If you would like help getting a high-level understanding of the application, you can read the [overview](#overview).

You can look at the todo list below for ideas of how to contribute. After you've finished your feature, write a test for it (in [test.js](test/test.js), and test your code using `npm test` from the root directory. 

This project also uses [JSXHint](https://github.com/STRML/JSXHint). Every JS/JSX file should pass JSXHint.

After that, [submit a pull request](https://help.github.com/articles/using-pull-requests/). Thanks for helping out! Feel free to [submit an issue](https://github.com/byu-osl/city-issue-server/issues/new) for any confusion you might have.

### Todo list

Ranked by priority:
- [ ] authentication
- [ ] administrative section for city employees
- [ ] endpoints:
	+ [ ] POST service type
- [ ] email notifications for status updates
- [ ] optional account creation at issue submission
- [ ] form validation
- [ ] submit issue by picture
- [ ] Flux architecture
- [ ] set up frontend testing
- [ ] rename the two app.js files
- [ ] production concatenation/minifcation
- [ ] detect if a port is in use - use a different one if necessary
- [ ] create GitHub issues for each of these todo items
- [ ] code coverage
- [ ] pre-commit hooks for jsxhint
- [ ] push notifications?
- [ ] ES6 integration: frontend and backend

## Overview

The intent of this section is to give you some intuition about how the application fits together. Here's what happens when a user submits an issue request (not to be confused with an HTTP request):

* the client-side code packs up all of the user input into a POST request, and [sends it to the server](https://github.com/byu-osl/city-issue-server/blob/91d028777761815ce4814f8ec081179809a9cfdb/client-side/js/app.js#L25).
* the first file it hits is [app.js](app.js), where the meat of the server code is. The server itself is initialized in [server.js](server.js).
* The request is [routed](https://github.com/byu-osl/city-issue-server/blob/91d028777761815ce4814f8ec081179809a9cfdb/app.js#L27) according to its URL.
* The request and response pass through a bunch of *middleware*. Middleware are a series of functions that the request and response objects pass through. The server modifies the request and response objects until it finally sends the response back to the client.

### File structure

<pre>
city-issue-server                  // main directory
├── 311spec.txt                    // kept sort of as a todo list from the
│									    Open311 spec (http://wiki.open311.org/GeoReport_v2/)
├── app.js                         // main server file
├── client-side                    // public files for the client
│   ├── css                        // css
│   ├── dist                       // where Gulp sends built files
│   ├── gulpfile.js                // Gulp configuration
│   ├── index.html                 // main html file
│   ├── js                         // js
│   │   ├── app.js                 // main client-side file
│   │   ├── CategorySection.js     // issue request form React component
│   │   ├── DescriptionSection.js  // issue request form React component
│   │   ├── LocationSection.js     // issue request form React component
│   │   ├── navbar.js              // 
│   │   ├── reactdemo.jsx          // temporary React demo for reference
│   │   └── server-api.js          // Object that interacts with the server
│   └── vendor                     // directory containing 3rd-party files
├── load-database.js               // use this to load dummy data in the DB
├── models                         // Mongoose models - issue request, service, user
├── node_modules                   // don't modify: npm manages this
├── package.json                   // npm project configuration
├── README.md                      // this document (inception)
├── routes                         // handlers for the different API endpoints
├── server.js                      // entry point for the server
├── start.sh                       // used by npm start: starts the server
├── test                           // server-side tests
└── utility                        // custom extras for the server
</pre>

### Backend

#### Node.js, Express.js

Node is a platform typically used to build server-side applications in JavaScript. Here's a short example from [Node's website](https://nodejs.org/):

```javascript
	var http = require('http');
	http.createServer(function (req, res) {
	  res.writeHead(200, {'Content-Type': 'text/plain'});
	  res.end('Hello World\n');
	}).listen(1337, '127.0.0.1');
	console.log('Server running at http://127.0.0.1:1337/');
```

Express is used to organize your server code. If you look in [app.js](app.js), you'll see <code>app.use(*path*, *middleware*)</code> all over. `app.use` accepts a callback which takes two parameters: `req` and `res`. <code>[req](http://expressjs.com/4x/api.html#request)</code> is the request object and <code>[res](http://expressjs.com/4x/api.html#response)</code> is the response object. Routers (like [these handlers](https://github.com/byu-osl/city-issue-server/blob/df461f5672b59b7f06b44cecfddd924d3f5045cc/app.js#L27-29)) are where the meat of your application is.

#### Mongoose and MongoDB

[Mongoose](http://mongoosejs.com/docs/guide.html) is the *M* in MVC. You use it to interact with the database: saving issue requests, searching, deleting, etc. We use several Mongoose [models](models) to represent objects in the application. You instantiate those models in the [routes directory files](routes) and work with them there.

#### Testing

Testing is done using Mocha and a few different libraries. The main test file is [test.js](test/test.js). Right now, the only tests that are written send GET and POST requests to the different endpoints and verify that the right information came back. Tests should be written for additional endpoints.

### Frontend

#### React

[React](http://facebook.github.io/react/) is a library to help you organize your frontend. It encourages you to separate your application into different components composed of JS *and* HTML in a language called JSX. We use a JSX transformer that transforms JSX into JS in the browser. This will change when the app is used in production. 

#### Bootstrap

[Bootstrap](http://getbootstrap.com/) is an extremely popular, responsive HTML/CSS framework. It has a series of components and layouts you can use; you might say its API is a series of CSS classes. Use Bootstrap classes and components before writing your own HTML/CSS from scratch.

### Testing

No front end tests are set up at the moment. Feel free to recommend testing strategies; Facebook uses something called [Jest](https://facebook.github.io/jest/) to test React apps, so that's probably what we'll go with.

### Example: implementing a new feature

Here is a overview of how you might add a field to the issue request form. Starting server-side:

- For this feature, you need to make changes in [requestsHandler.js](routes/requestsHandler.js), and [the request model](models/request.js).
- Add the field you want to the issue request [schema](https://github.com/byu-osl/city-issue-server/blob/17d05d5950880dcbfe5b02b887665b6ccc983896/models/request.js#L3).
- Add any validation logic in [saveRequest()](https://github.com/byu-osl/city-issue-server/blob/17d05d5950880dcbfe5b02b887665b6ccc983896/routes/requestsHandler.js#L68).
- Write a React component for that portion of the form. This is where your HTML will go.
	+ Create a new file, and follow the pattern of the other components of the form. Make sure to write a getter to expose state to the parent component (avoid using jQuery to interact with the DOM as much as possible).
- Head over to the client-side [app.js](client-side/js/app.js). The entry point for the request form is here. `require` the component you made at the top of the file, and add a reference to it in the `render` function of the form.
- In RequestForm's `submitForm`, get the new field, and add it to the POST request.

## Troubleshooting

If you need help, [submit an issue](https://github.com/byu-osl/city-issue-server/issues/new).

The biggest problem I've seen is when `npm install` explodes. I think you'll typically see something like this in the error message:

	npm ERR! code EACCES

To fix this, prepend sudo to your command: <code>*sudo* npm install</code> and that should take care of it.

