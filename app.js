var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var db = require('./db');

var ObjectID = mongoose.Types.ObjectId;
var port = process.env.PORT || 8000;
var server;
var io;
var SOCKET_LIST = [];

console.log(port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname +  '/static'));

app.get('/', function(req,res,next) {
	var data;
	db.get().collection('questions').find().toArray(function(err,docs) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}
		data = docs;
	});
	res.sendFile(__dirname + "/index.html");
	io.on('connection', function (socket) {
	  	socket.emit('news', { hello: data });

	  	socket.id = this.id;
	  	SOCKET_LIST.push(socket);

	  	socket.on('disconnect', function() {
	        delete SOCKET_LIST[this.id];
	    });
	});
});

app.get('/addQuestion', function(req,res) {
	res.sendFile(__dirname + "/additingQuestion.html");
});

app.post("/addQuestion", function (req, res) {
    if(!req.body) return res.sendStatus(400);

    var question = {
		name: req.body.name,
		answ1: req.body.answ1,
		answ2: req.body.answ2,
		answ3: req.body.answ3,
		answ4: req.body.answ4,
		answr: req.body.answr,
		type: req.body.types
	};

	db.get().collection('questions').insert(question, function(err, result) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}
		return res.redirect('/');
	})
});

db.connect("mongodb://admin:qwerty123@ds251894.mlab.com:51894/questionstempl", function(err) {
	if (err) {
		return console.log(err);
	}
	server = app.listen(port, function() {
		console.log('API Started');
	});

	io = require('socket.io').listen(server);
});

