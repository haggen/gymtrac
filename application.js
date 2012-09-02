var _, express, http, mongofoo;

_ = require('underscore');
express = require('express');
mongofoo = require('mongofoo');

require('buildjs')(__dirname);

http = express();
http.use(express.static(__dirname + '/public'));
http.use(express.bodyParser());
http.use(express.logger());
http.listen(process.env.PORT);

mongofoo.connect(process.env.DATABASE_URL);
mongofoo.mount(http);

mongofoo.resource('users');
mongofoo.resource('entries');
