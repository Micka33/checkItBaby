var email = 'c29waGllcmV2ZXVzZUB5YWhvby5jb20=';
var pwd = 'VGVzdDMzMzM=';
var sParProfile = 60;


var casper  = require('casper').create({
                viewportSize: {width: 1224, height: 1000000},
                pageSettings: {loadImages:  true, loadPlugins: true, localToRemoteUrlAccessEnabled: true},
                // verbose: true,
                // logLevel: "debug"
              }),
    moment  = require('moment');

if (casper.cli.has('email'))
{
  email = btoa(casper.cli.get('email'));
  casper.cli.drop('email');
}
if (casper.cli.has('pwd'))
{
  pwd = btoa(casper.cli.get('pwd'));
  casper.cli.drop('pwd');
}

//
// UTILITY
//
var total = 0;
var subtotal = 0;
var current = 0;
var log = function(msg)
{
  var time = moment().format('h:mm:ss a');
  console.log('['+time+'] '+msg);
};
var getPageResult = function()
{
    var data = {profiles:[], total:0};
    $("#grid-container > .person.large").each(function(index, element)
    {
      data.profiles.push($(element).attr('data-id'));
    });
    data.total = $('.nav-pager .pager-total:first').text();
    return JSON.stringify(data);
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
    return JSON.stringify({
      pagging: $('#charms strong:first').text()+' sur '+$('#charms strong.pager-total:first').text()
    });
};


//
// Algo
//
var nextPage = function()
{
  var selector = '#charms .nav-pager a.pager-next';
  this.waitForSelector(selector, function()
  {
    this.click(selector);
    this.wait(6000, visitProfiles);
  });
}
var visit = function()
{
    current++;
    subtotal--;
    var guy = JSON.parse(this.evaluate(getGuyInfo));
    log('Visite de '+guy.name+' / '+guy.age+' / '+guy.city+' ('+this.getCurrentUrl()+')');
    this.captureSelector(current.toString()+'_'+guy.name.replace(/\/|\\/, '')+'.jpeg', '#content .content-wrapper', {format: 'jpeg', quality: 100});
}
var visitProfiles = function()
{
  log('Affichage des profiles '+JSON.parse(this.evaluate(getPaging)).pagging+'.');
  var ctx = this;
  var datas = JSON.parse(this.evaluate(getPageResult));
  total = datas.total;
  subtotal = datas.profiles.length;
  var i = 0;
  this.repeat(datas.profiles.length, function repeat()
  {
    var url = atob('aHR0cDovL3d3dy5hZG9wdGV1bm1lYy5jb20vcHJvZmlsZS8=')+datas.profiles[i].toString();
    this.thenOpen(url, visit);
    this.wait((sParProfile*1000), function()
    {
      this.back();
    });
    i++;
  });
  this.then(nextPage);  
}
var getSearchResults = function()
{
  log('Récupération de la liste des profiles.');
  var hasResults = this.evaluate(function(selector)
  {
    return $(selector).length == 1;
  }, 'section#charms');
  if (!hasResults)
    this.click('form#search-form button[type="submit"]');//Clicking on the search button
  this.wait(6000, visitProfiles);//waiting 6s
}
var goToSearchPage = function()
{
  log('Affichage de la page de recherche.');
  this.wait(6000, function()//waiting 6s
  {
    this.click('#search a');//Clicking on the search link
    this.then(getSearchResults);
  });
}
var signIn = function()
{
  log('Connexion en tant que '+atob(email)+'.');
  this.fill('form#login',
  {
      username: atob(email),
      password: atob(pwd)
  }, true); //Filling log in form and submiting
  this.then(goToSearchPage);
}

casper.start(atob('aHR0cDovL3d3dy5hZG9wdGV1bm1lYy5jb20v')).then(signIn);
casper.run(function()
{
  this.exit();
});





// age[min]    23
// age[max]    28
// age_step    1
// by  region
// country fr
// region  11
// bsmSelectnice-multiple0
// subregion[] 76
// distance[min]
// distance[max]   0
// distance_step   10
// pseudo
// university-text
// university
// sex 0
// size[min]   135
// size[max]   185
// size_step   5
// weight[min] 35
// weight[max] 55
// weight_step 5
// mandatory[] shape
// shape[] 1
// shape[] 2
// shape[] 3
// shape[] 4
// shape[] 5
// shape[] 6
// mandatory[] eyes_color
// eyes_color[]    1
// eyes_color[]    2
// eyes_color[]    3
// eyes_color[]    4
// eyes_color[]    5
// eyes_color[]    6
// mandatory[] origins
// origins[]   1
// origins[]   2
// origins[]   3
// origins[]   4
// origins[]   5
// origins[]   6
// origins[]   7
// origins[]   8
// mandatory[] body_hair
// body_hair[] 5
// body_hair[] 1
// body_hair[] 2
// body_hair[] 3
// body_hair[] 4
// body_hair[] 6
// mandatory[] hair_color
// hair_color[]    1
// hair_color[]    2
// hair_color[]    10
// hair_color[]    8
// hair_color[]    7
// hair_color[]    5
// hair_color[]    6
// hair_color[]    4
// hair_color[]    3
// hair_color[]    9
// mandatory[] hair_size
// hair_size[] 1
// hair_size[] 2
// hair_size[] 3
// hair_size[] 4
// mandatory[] hair_style
// hair_style[]    1
// hair_style[]    2
// hair_style[]    3
// hair_style[]    4
// hair_style[]    5
// hair_style[]    6
// hair_style[]    7
// hair_style[]    8
// mandatory[] styles
// styles[]    7
// styles[]    12
// styles[]    3
// styles[]    2
// styles[]    14
// styles[]    15
// styles[]    6
// styles[]    16
// styles[]    17
// styles[]    18
// styles[]    19
// styles[]    20
// styles[]    10
// styles[]    21
// styles[]    22
// styles[]    8
// styles[]    24
// styles[]    25
// styles[]    26
// styles[]    27
// styles[]    4
// styles[]    5
// styles[]    28
// styles[]    11
// styles[]    29
// styles[]    30
// styles[]    31
// styles[]    32
// styles[]    33
// styles[]    34
// styles[]    9
// styles[]    35
// styles[]    36
// styles[]    1
// mandatory[] features
// features[]  1
// features[]  2
// features[]  3
// features[]  4
// features[]  6
// features[]  7
// features[]  8
// features[]  5
// mandatory[] skills
// mandatory[] accessories
// mandatory[] transport
// mandatory[] diet
// diet[]  1
// diet[]  2
// diet[]  3
// diet[]  4
// diet[]  5
// mandatory[] favourite_food
// favourite_food[]    1
// favourite_food[]    2
// favourite_food[]    3
// favourite_food[]    4
// favourite_food[]    5
// favourite_food[]    6
// favourite_food[]    7
// favourite_food[]    8
// favourite_food[]    9
// favourite_food[]    10
// favourite_food[]    11
// favourite_food[]    12
// favourite_food[]    13
// favourite_food[]    14
// favourite_food[]    15
// favourite_food[]    16
// mandatory[] tobacco
// tobacco[]   1
// tobacco[]   2
// tobacco[]   3
// tobacco[]   5
// tobacco[]   4
// tobacco[]   6
// mandatory[] alcohol
// alcohol[]   1
// alcohol[]   2
// alcohol[]   5
// alcohol[]   3
// alcohol[]   4
// alcohol[]   6
