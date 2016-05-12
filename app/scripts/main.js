//vendors
var astorage = window.astorage;
var $ = window.$;
var _ = window._;
var Tabletop = window.Tabletop;

//globals
var ctb = window.ctb = {}; //ctb stands for creative tool box
var beginningOfTime = Date.now();

//data
ctb.publicSpreadsheetUrl = 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=1bkacyt-qeVHtCET6UHqUluvThjogYO4NACZXMDEu5Jg&output=html'

//localdata get & set (implemented via localStorage via astorage)
ctb.visitedBefore = astorage.get('visitedBefore');
if(!ctb.visitedBefore) {
  astorage.set('visitedBefore', true);
};
ctb.lastVisitTime = astorage.get('lastVisitTimestamp');
astorage.set('lastVisitTimestamp', Date.now());

//kick off
$(document).ready(function(){
  console.log('от винта!');
  ctb.init();
});

//init
ctb.init = function() {
	Tabletop.init( { key: ctb.publicSpreadsheetUrl,
    prettyColumnNames: false, //why oh why oh why? this works the other way around. it defaults to true and then does nothing FIXME
    postProcess: ctb.processItem,
		callback: ctb.activate,
		simpleSheet: true });
};

//translate tool type to tag
ctb.toolTypeToTag = function(toolType) {
  var tag = toolType.toLowerCase();
  return tag;
};

//process items
ctb.processItem = function(element) {
  element.timestamp = Date.parse(element.timestamp); //parse timestamp
  element.keywordList = _.map(element.keywords.split(','), _.trim);
  //add tool type (usedFor) to taglist as the first tag
  var toolTag = ctb.toolTypeToTag(element.usedfor);
  if(toolTag) {
    element.keywordList.unshift(toolTag); 
  }
  element.keywordList = _.uniq(element.keywordList); //eliminate tag duplicates
  element.alltags = _(element.keywordList).map(function(el){return '#'+el}).join(' ');
};

//activate
ctb.activate = function(data, tabletop) {
  //populate HTML
  ctb.populateHtml(data, tabletop, function() {
    window.tabletop = tabletop;
    //then activate list.js
    ctb.activateList();
    //finally hide loading and show everything and focus on the input field, but make sure that at least 3 secconds passed
    var minTimeOut = 3000;
    var timeLeft = Date.now() - beginningOfTime;
    var timeoutLeft = (timeLeft > minTimeOut) ? 0 : (minTimeOut - timeLeft);
    setTimeout(function(){
      $('.ctb-loading').hide();
      $('.ctb-main').show();
      //if there is a search term in the url - apply it
      var searchTerm = ctb.getUrlParam('s');
      if(searchTerm) {
        ctb.reSearch(searchTerm);
      }
      //if first visit - show about content
      if(!ctb.visitedBefore) {
        $('#welcomeModal').modal('show');
      }
      ctb.bindListeners();
    },timeoutLeft);
  });
};


//activate list
ctb.activateList = function() {
  var options = {
    valueNames: [
      'name',
      'functionality',
      { attr: 'data-keywords', name: 'keywords' }
    ], 
    plugins: [
      //ListFuzzySearch(fuzzyOptions) //fuzzy does strange things e.g. doesn't find an exact match with #fonts. disable it for now
    ] 
  };
  ctb.list = new List('ctb-content', options);
};

//populate html
ctb.populateHtml = function(data, tabletop, callback) {
  var d = tabletop.data(); //for some weird reason 'data' is not always in sync with tabletop.data(); this tabletop thing is a bit funky FIXME
  _.reverse(d); //reverse so that newset entries show up at the top
  ctb.data = _.uniqBy(d, 'url'); //simple stupid solution to eliminate duplicates
  var sourceAll   = $('#ctb-all-items-template').html();
  //all items compiled template
  var templateAll = Handlebars.compile(sourceAll);
  //single item partial
  Handlebars.registerPartial('ctbSingleItem', $('#ctb-single-item-template').html());
  //render
  $('#ctb-content').append(templateAll(ctb.data));
  //we are done; call what's next
  _.defer(function(){
    callback.call();
  });
};

//re activate search for a new term:
//1) search
//2) update input
//3) update URL hash
ctb.reSearch = function(term) {
  ctb.list.search(term);
  //ctb.list.fuzzySearch.search(term);
  $('.ctb-input').val(term);
};

//bind event listeners
ctb.bindListeners = function() {
  //do stuff after user input
  ctb.list.on('searchComplete', _.debounce(ctb.reactToFilter, 50));
  //on category clik: do search
  $('.ctb-category-name').on('click', function(e) {
    e.preventDefault();
    var cat = $(this).attr('data-category');
    ctb.reSearch('#'+cat);
  });
  //on logo click: reset all searches
  $('#ctb-logo').on('click', function(){ctb.reSearch('')});
  //on tag (keyword) click - research accordingly
  $('.ctb-single-keyword').on('click', function(e) {
    e.preventDefault();
    var kw = $(this).attr('data-keywordname');
    ctb.reSearch('#'+kw);
  });
  //on category icon click - do the right search
  $('.ctb-item-icon-wrapper').on('click', function(e) {
    e.preventDefault();
    var cat = $(this).attr('data-usedfor');
    ctb.reSearch('#'+cat.toLowerCase());
  });
};

//react to filter: 
//1)check if any results and if no - display "add" button
//2)update url string
ctb.reactToFilter = function() {
  var numResults = ctb.list.visibleItems.length;
  if(numResults < 1) {
    $('.ctb-no-results').show();
  } else {
    $('.ctb-no-results').hide();
  }
  var currentSearchTerm = $('.ctb-input').val();
  ctb.setUrlParam('s', currentSearchTerm);
};

// general helpers
ctb.setUrlParam = function(name, val) {
  window.location.hash = '/?'+name+'='+val;
};

ctb.getUrlParam = function(name) {
  var hash = window.location.hash;
  if(!hash) {
    return 0;
  }
  var results = new RegExp('[\?&]' + name + '=([^&]*)').exec(hash);
  if (results === null){
    return null;
  }
  else{
    return results[1] || 0;
  }
};
