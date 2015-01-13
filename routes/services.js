var express = require('express');
var requests = express.Router();
var Request = require('../models/request');

// provide a list of acceptable 311 service request types and their associated service codes. 
requests.get('/', function(req, res) {
	
});

module.exports = requests;

// Example:
// {
//     "service_code":001,
//     "service_name":"Cans left out 24x7",
//     "description":"Garbage or recycling cans that have been left out for more than 24 hours after collection. Violators will be cited.",
//     "metadata":true,
//     "type":"realtime",
//     "keywords":"lorem, ipsum, dolor",
//     "group":"sanitation"
// }