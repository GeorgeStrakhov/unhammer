"use strict";var astorage=window.astorage,$=window.$,_=window._,Tabletop=window.Tabletop,ctb=window.ctb={},beginningOfTime=Date.now();ctb.publicSpreadsheetUrl="https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=1bkacyt-qeVHtCET6UHqUluvThjogYO4NACZXMDEu5Jg&output=html",ctb.visitedBefore=astorage.get("visitedBefore"),ctb.visitedBefore||astorage.set("visitedBefore",!0),ctb.lastVisitTime=astorage.get("lastVisitTimestamp"),astorage.set("lastVisitTimestamp",Date.now()),$(document).ready(function(){console.log("от винта!"),ctb.init()}),ctb.init=function(){Tabletop.init({key:ctb.publicSpreadsheetUrl,prettyColumnNames:!1,postProcess:ctb.processItem,callback:ctb.activate,simpleSheet:!0})},ctb.toolTypeToTag=function(t){var e=t.toLowerCase();return e},ctb.processItem=function(t){t.timestamp=Date.parse(t.timestamp),t.keywordList=_.map(t.keywords.split(","),_.trim);var e=ctb.toolTypeToTag(t.usedfor);e&&t.keywordList.unshift(e),t.keywordList=_.uniq(t.keywordList),t.alltags=_(t.keywordList).map(function(t){return"#"+t}).join(" ")},ctb.activate=function(t,e){ctb.populateHtml(t,e,function(){window.tabletop=e,ctb.activateList();var t=3e3,a=Date.now()-beginningOfTime,i=a>t?0:t-a;setTimeout(function(){$(".ctb-loading").hide(),$(".ctb-main").show();var t=ctb.getUrlParam("s");t&&ctb.reSearch(t),ctb.visitedBefore||$("#welcomeModal").modal("show"),ctb.bindListeners()},i)})},ctb.activateList=function(){var t={valueNames:["name","functionality",{attr:"data-keywords",name:"keywords"}],plugins:[]};ctb.list=new List("ctb-content",t)},ctb.populateHtml=function(t,e,a){var i=e.data();_.reverse(i),ctb.data=_.uniqBy(i,"url");var c=$("#ctb-all-items-template").html(),o=Handlebars.compile(c);Handlebars.registerPartial("ctbSingleItem",$("#ctb-single-item-template").html()),$("#ctb-content").append(o(ctb.data)),_.defer(function(){a.call()})},ctb.reSearch=function(t){ctb.list.search(t),$(".ctb-input").val(t)},ctb.bindListeners=function(){ctb.list.on("searchComplete",_.debounce(ctb.reactToFilter,50)),$(".ctb-category-name").on("click",function(t){t.preventDefault();var e=$(this).attr("data-category");ctb.reSearch("#"+e)}),$("#ctb-logo").on("click",function(){ctb.reSearch("")}),$(".ctb-single-keyword").on("click",function(t){t.preventDefault();var e=$(this).attr("data-keywordname");ctb.reSearch("#"+e)}),$(".ctb-item-icon-wrapper").on("click",function(t){t.preventDefault();var e=$(this).attr("data-usedfor");ctb.reSearch("#"+e.toLowerCase())})},ctb.reactToFilter=function(){var t=ctb.list.visibleItems.length;1>t?$(".ctb-no-results").show():$(".ctb-no-results").hide();var e=$(".ctb-input").val();ctb.setUrlParam("s",e)},ctb.setUrlParam=function(t,e){window.location.hash="/?"+t+"="+e},ctb.getUrlParam=function(t){var e=window.location.hash;if(!e)return 0;var a=new RegExp("[?&]"+t+"=([^&]*)").exec(e);return null===a?null:a[1]||0};