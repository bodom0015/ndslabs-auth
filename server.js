const path = require('path');
const http = require('http');
const request = require('request');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Our ExpressJS app
const app = express();
const port = 3000;

// Build up a Workbench API URL
const apiProtocol = 'http:'
const apiHost = process.env.NDSLABS_APISERVER_SERVICE_HOST || 'localhost';
const apiPort = 30001;  //process.env.NDSLABS_APISERVER_SERVICE_PORT || '30001';
const apiPath = '/api'; //process.env.NDSLABS_APISERVER_SERVICE_PATH || '/api';
let apiUrl = apiProtocol + '//' + apiHost;
if (apiPort) { apiUrl += ':' + apiPort }
if (apiPath) { apiUrl += '/' + apiPath }

// Parse cookies into helpful structures for manipulation
app.use(cookieParser());

// Parse request body
app.use(bodyParser.json());

// Simple auth endpoint
app.post('/login', function (req, res) {
    // Pull username/password from POST body
    let postData = { 
        username: req.body.username, 
        password: req.body.password 
    };
    
    // Configure our POST target
    let postOptions = { 
        url: 'http://10.0.0.116:30001/api/authenticate', 
        method: 'POST', 
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json'
        }
    };
     
    // Generic error handler for this request
    req.on('error', function (err) {
        console.log('ERROR: failed to send login request -', err);
    });
    
    // Send login request
    request(postOptions, function (error, response, responseBody) {
        let status = response && response.statusCode ? response.statusCode : 500;
        
        if (error || status >= 400) {
            console.log('ERROR: failed to login -', status); // Print the error if one occurred 
            res.status(status);
            res.send("Login failed.\n");
        } else {
            let body = JSON.parse(responseBody);
            
            if (body.token) {
                // Attach token to response as a cookie
                let cookieOpts = { domain: 'ndslabs.org' };
                res.cookie('token', body.token, cookieOpts);
                res.status(status);
                res.send("OK\n");
            } else {
                res.status(500);
                res.send("No token was provided.");
            }
        }
    });
});

// Serve our static login page
app.get('/sign_in', function (req, res) {
  //res.status(501);
  res.sendFile(path.join(__dirname + '/index.html'));
});

// Clear session info
app.get('/logout', function (req, res) {
  res.status(501);
  res.send('STUB: Session deleted!')
});

// Serve static files from ./static/ on disk
app.use(express.static(path.join(__dirname, 'static')));

// Start up our server
app.listen(port, function () {
  console.log('Workbench Login API listening on port', port)
});