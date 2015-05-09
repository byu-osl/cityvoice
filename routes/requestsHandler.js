'use strict';

var express = require('express');
var router  = express.Router();
var Request = require('../models/request');
var Service = require('../models/service');
var historyHandler = require('./historyHandler');

router.get('/:requestID.json', queryStatus);
router.get('/', findRequests);
router.post('/', validatePOSTParameters, saveRequest);
router.post('/update', updateRequest);
router.use('/addHistoryEntry', historyHandler);

function queryStatus(req, res){
    var requestID = req.params.requestID;
	if (!validObjectID(requestID)) {
		res.send400('Invalid request ID format.');
		return;
	}
	Request.find({_id : requestID}, function (error, result){
		if (error) {
			res.send500('There was an error querying the request status.');
		} else if (result.length === 0) {
			res.send404('Could not find the request you were looking for.');
		} else {
			res.send(cleanUpGetResponse(result));
		}
	});
}

function findRequests(req, res) {
	Request.findRequests(req.body, function (err, results) {
        if (err) {
            res.send500('There was an error while searching for your request.');
        } else {
            res.send(results.slice(0,999).map(cleanUpGetResponse));
        }
    });
}

function validatePOSTParameters(req, res, next) {
	var serviceCode = req.body.service_code;

	if (isUndefined(serviceCode)) {
		res.send400('A service code was not defined.');
		return;
	}
	if (!hasLocationInfo(req.body)) {
		res.send400('Your request must have one of the following: latitude and longitude, address_string, or address_id.');
		return;
	}

	// TODO: replace with Service.count
	Service.checkExistence(serviceCode, function (err, serviceExists){
		if (err) {
			res.send500('Something went wrong while trying to see if you had a valid service code.');
			return;
		}
		if (!serviceExists){
			res.send404('Couldn\'t find a service of that type. Wrong service code.');
			return;
		} 
		next();
	});
}

function saveRequest(req, res) {
	var request = new Request(req.body);
	request.requested_datetime = new Date().toISOString();
	request.status = 'open';
	request.history.push({
		date: request.requested_datetime,
		description: 'Issue submitted.'
	})

	request.save(function requestSaved(error, request, numberAffected){
		if (error) {
			res.send500('There was an error in saving your request.');
		} else if (numberAffected > 0) {
			// TODO: spec says service_request_id shouldn't be returned if a token is returned
			res.send([{
				service_request_id: request._id
			}]);
		} else {
			res.send('Request not saved.');
		}
	});
}

function updateRequest (req, res) {
	Request.findByIdAndUpdate (req.body.requestID, {$set:req.body} , function(error, request) {
		if (error) {
			res.send500('Something went wrong while finding the matching request');
		} else if (!request) {
			res.send404('Request not found.');
		} else {
			res.send(request);
		}
	});
}


//////////////////////////////////
//////////////////////////////////
//////////////////////////////////


//  required for requests
function hasLocationInfo(params) {
	return ((!isUndefined(params.lat) && 
			 !isUndefined(params.long)) ||  
	   	    (!isUndefined(params.address_string)) ||
	        (!isUndefined(params.address_id));
}

// Takes a request JSON object
// Returns a JSON object with parts filtered out
function cleanUpGetResponse(request) {
	var fieldsToDelete = [
		'status_notes',
		'agency_responsible',
		'service_notice',
		'expected_datetime'
	];
	fieldsToDelete.forEach(function deleteField(field){
		delete request[field];
	});
	return request;
}

function validObjectID(id) {
	// 24 characters, a-f, 0-9
	return /([a-f]|\d){24}/.test(id);
}

module.exports = router;