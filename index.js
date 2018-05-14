const express = require('express');
const app = express();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const whiskers = require('whiskers');
const chars = 'abcdefghijklmnopqrstuvwxyz13579';
const config = require('./config');

const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ links: []}).write()

app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(__dirname + '/favicon.ico'));
app.use('/', express.static(__dirname + '/public'));
app.engine('.html', whiskers.__express);
app.set('views', __dirname+'/views');

app.get('/', function(req, res) {
	var count = db.get('links').value().length;
	res.render('index.html', {count: count, title: config.site_name, version: config.v});
});

app.post('/', function(req, res) {
	if(req.body.pass == 'ayana') {
		var link = req.body.link;
		var id = '';
		for (var i = 6; i > 0; --i) id += chars[Math.floor(Math.random() * chars.length)];
		if(link.substring(0,4) == 'http') {
			exists = db.get('links').find({url: link}).value();
			if (exists) {
				res.render('exists.html', {id: exists.id, site: config.site});
			} else {
				// sanity check for duplicate ids
				status = db.get('links').find({id: id}).value();
				if(status == null) {
					db.get('links').push({url: link, id: id}).write();
					res.render('ready.html', {id: id, site: config.site});
				} else {
					res.send('Error');
				}
			}
		}
	} else {
		res.send('nope.avi')
	}
});

app.get('/:id', function(req, res) {
	id = req.params.id;
	link = db.get('links').find({id: id}).value();
	if(link == null) 
		res.status(404).send('404 not found');
	else
		res.redirect(link.url);
});

app.listen(config.port, function() {
	console.log(`*:${config.port}`);
});