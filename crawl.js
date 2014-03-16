// Whole-script strict mode syntax
"use strict";

var email = 'c29waGllcmV2ZXVzZUB5YWhvby5jb20=';
var pwd = 'VGVzdDMzMzM=';
var sParProfile = 60;
var maxDelayPerRequest = 15;

var page    = require('webpage').create(),
    system  = require('system'),
    args    = require('minimist')(system.args.slice(1)),
    moment  = require('moment'),
    redis   = require("redis"),
    uuid    = require('node-uuid');
    //clearing minimist memory from the pwd and email
    require('minimist')(['stuff', 'nuff', 'nop', 'top', 'nutch', 'fetch', 'ornot']);








//
// UTILITY
//
var total = 0;
var subtotal = 0;
var current = 0;
var urlLoaded = null;
var log = function(msg)
{
  var time = moment().format('h:mm:ss a');
  console.log('['+time+'] '+msg);
};
var click = function(selector, fakeMode)
{
  if (fakeMode === true)
  {
    page.evaluate(function(selector) {
      return $(selector).trigger('click');
    }, selector);
  }
  else
  {
    var position = page.evaluate(function(selector) {
      return $(selector).offset();
    }, selector);
    page.sendEvent("click", position.left, position.top, 'left');
  }
};
var fillAndsubmit = function(form, names) {
  page.evaluate(function(form, names)
  {
    for (var i = names.length - 1; i >= 0; i--)
    {
      selector = form+' [name='+names[i][0]+']';
      if ($(selector).is('select'))
        $(selector+" option").filter(function() {
          return $.trim($(this).text()) === $.trim(names[i][1]);
        }).prop('selected', true);
      else if ($(selector).is('input'))
        $(selector).val(names[i][1]);
    };
    $(form).submit();
  }, form, names);
};
var printScreen = function(name)
{
  page.render(name+'.jpeg', {format: 'jpeg', quality: '100'});
};
var currentUrl = function() {
  return page.evaluate(function(){return window.location.href;});
};
var waittil = function(urlToWaitFor, delay, then) {
  urlLoaded = null;
  var start = moment();
  var urls = ( (Array.isArray(urlToWaitFor)) ? (urlToWaitFor) : ([urlToWaitFor]) );
  var intervalID = window.setInterval(function()
  {
    if ((moment().diff(start, 'seconds') > delay) ||
      (urls.indexOf(urlLoaded) > -1)/* ||
      (urls.indexOf(currentUrl()) > -1)*/)
    {
      clearInterval(intervalID);
      var found = ((urls.indexOf(urlLoaded) > -1)/* || ((urls.indexOf(currentUrl())) > -1) */);
      urlLoaded = null;
      then(found);
    }
  },
  200);
};
page.onLoadFinished = function(status) {
  urlLoaded = currentUrl();
};
var hasClass = function(el, classToCheck) {
  return page.evaluate(function(el, classToCheck) {
    return $(el).hasClass(classToCheck);
  }, el, classToCheck);
};
var hasDiv = function(selector) {
  var res = page.evaluate(function(selector) {
    return $(selector).length > 1;
  }, selector);
  return res;
};
var exit = function() {
  log('Fin.');
  redis.quit()
  phantom.exit();
};

// page.onUrlChanged = function(targetUrl) {
//   console.log('New URL: ' + targetUrl);
// };
// page.onNavigationRequested = function(url, type, willNavigate, main) {
//   console.log('Trying to navigate to: ' + url);
//   console.log('Caused by: ' + type);
//   console.log('Will actually navigate: ' + willNavigate);
//   console.log('Sent from the page\'s main frame: ' + main);
// };
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  // console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};
//
//
//
var getPageResult = function()
{
  return page.evaluate(function() {
    var profiles = [];
    $("#grid-container > .person.large").each(function(index, element) {
      profiles.push({ id: $(element).attr('data-id'),
                      url: $(element).find('a').attr('href')
                    });
    });
    return profiles;
  });
};
var getGuyInfo = function()
{
  return JSON.stringify({
    name: $('#profile-infos .title').text(),
    age: $('#profile-infos .age').text(),
    city: $('#profile-infos .city').text()
  });
};
var getPaging = function()
{
  return page.evaluate(function() {
    return {  nbResults: $('#charms strong:first').text(),
              totalResults: $('#charms strong.pager-total:first').text()
            };
  });
};














// if (((args.password == undefined) && (args.p == undefined)) ||
//     ((args.email == undefined) && (args.e == undefined)))
// {
//   console.log('Usage: crawl.js --password secret --email you@email.com');
//   console.log('       crawl.js -p secret -e you@email.com');
//   exit();
// }
// email = btoa((args.email != undefined)?(args.email):(args.e));
// pwd = btoa((args.password != undefined)?(args.password):(args.p));

//Clearing args parameter from memory and freezing it, since we won't use it anymore.
args.email = 'nothingtoseeherejustclearing1thistobesurenoonereaditinmemory';
args.e = 'nothingtoseeherejustclearingthis2tobesurenoonereaditinmemory';
args.password = 'nothingtoseeherejustclear3ingthistobesurenoonereaditinmemory';
args.p = 'nothingtoseeherejustclearingthis4tobesurenoonereaditinmemory';
Object.freeze(args);

















//
// INIT DATABASE
//
redis = redis.createClient();
redis.on('error', function (err) {
  log('La connection à la bdd a échoué: ' + err);
  exit();
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
var saveProfile = function(profile) {
  var key = "profiles."+email;
  var field = profile.id;
  log('redis.hsetnx('+key+', '+field+', {url:'+profile.url+', checked:false});');
  // var entryIsNew = redis.hsetnx(key, field, {url:profile.url, checked:false});
  // if (entryIsNew)
  //   redis.publish(key, {url:profile.url});
};











//
// Algo
//
var visitProfiles = function()
{
  var paging = getPaging();
  log('Affichage des profiles '+paging.nbResults+' sur '+paging.totalResults+'.');
  var profiles = getPageResult();
  log('length:'+profiles.length.toString());
  log('profiles:'+profiles);

  for (var i = profiles.length - 1; i >= 0; i--) {
    saveProfile(profiles[i]);
  };

  if (hasClass('#charms .nav-pager a.pager-next span.pager-right', 'off'))
  {
    log('Tous les resultats ont été récupéré.');
    exit();
  }

  var curl = currentUrl();
  var nurl = curl.split('=')[0]+'='+(parseInt(curl.split('=')[1]) + 1);
  click('#charms .nav-pager a.pager-next', true);
  waittil(nurl, maxDelayPerRequest, function(loaded)
  {
    if (loaded || (currentUrl() === nurl))
    {
      visitProfiles();
    }
    else
    {
      log("Impossible de charger la page suivante des profiles. :'(");
      exit();
    }
  });
}
var getSearchResults = function()
{
  log('Récupération de la liste des profiles.');
  // If there is no results displayed
  if (!hasDiv('section#charms'))
    fillAndsubmit('form#search-form',[]); //launch a new research
  waittil('http://www.adopteunmec.com/mySearch/?page=1', maxDelayPerRequest, function(loaded)
  {
    if (loaded)
    {
      visitProfiles();
    }
    else
    {
      log("Impossible de charger la liste des profiles. :'(");
      exit();
    }
  });
}
var goToSearchPage = function()
{
  log('Affichage de la page de recherche.');
  click('#search a');//Clicking on the search link
  waittil(['http://www.adopteunmec.com/mySearch/?page=1', 'http://www.adopteunmec.com/mySearch'], maxDelayPerRequest, function(loaded)
  {
    if (loaded)
    {
      getSearchResults();
    }
    else
    {
      log('Impossible de charger la page de recherche. :\'(');
      exit();
    }
  });
}
var signIn = function()
{
  // initDb();
  // while(dbNotReady);
  log('Connexion en tant que '+atob(email)+'.');
  fillAndsubmit('form#login',
    [['username', atob(email)],
     ['password', atob(pwd)]
    ]);
  waittil('http://www.adopteunmec.com/index', maxDelayPerRequest, function()
  {
    if (hasClass('body', 'logged'))
    {
      log('Connexion réussie ! :D');
      printScreen('home');
      goToSearchPage();
    }
    else
    {
      log('Connexion échouée. :\'(');
      exit();
    }
  });
}

page.open(atob('aHR0cDovL3d3dy5hZG9wdGV1bm1lYy5jb20v'),signIn);
