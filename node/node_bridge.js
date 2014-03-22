var app     = require('express')();
    _       = require('underscore');
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server),
    yaml    = require('js-yaml'),
    moment  = require('moment'),
    redis   = require('redis'),
    // uuid    = require('node-uuid');
    fs      = require('fs');
var log = function(msg)
{
  var time = moment().format('h:mm:ss a');
  console.log('['+time+'] '+msg);
};


var redis_conf = yaml.safeLoad(fs.readFileSync('./redis.yml', 'utf8'));
var node_env = process.env.NODE_ENV || 'development';
var redis = require('redis').createClient(redis_conf[node_env]['port'] || 6379, redis_conf[node_env]['host'] || 'localhost');
redis.on('error', function (err) {
  log('La connection à la bdd a échoué: ' + err);
});
redis.on('connect', function () {
  log('La connection à la bdd a réussie.');
});
redis.on('ready', function () {
  log('La bdd est prête à recevoir les urls des profiles.');
});
redis.on('end', function () {
  log('La connection à la bdd a été coupé.');
});
//DATABASE UTILITIES
var saveProfile = function($email, $profile) {
  var key = "profiles."+$email;
  var field = $profile.id;
  // log('redis.hsetnx('+key+', '+field+', {url:'+$profile.url+', checked:false});');
  var entryIsNew = redis.hsetnx(key, field, {url:$profile.url, checked:false});
  if (entryIsNew)
    redis.publish(key, {url:$profile.url});
};
server.listen(8889, 'localhost');


io.sockets.on('connection', function (socket) {
  socket.on('register', function ($data) {
    saveProfile($data.email, $data.profile);
  });
});






