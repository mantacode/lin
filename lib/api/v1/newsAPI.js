var PersonAPI = require('./peopleAPI'),
    QueryString = require('querystring');

var NEWS_RESOURCE = "news";

function defaultTopicFields() {
  return ":(id,title,description,because-of,topic-stories:(topic-articles:(is-read,relevance-data:(global-share-count,in-topic-share-count),article-content,shared-in-network-count,trending-in-entities:(industries:(id,relation-to-viewer)),shared-by-people:(" + PersonAPI.standardPersonFields() + "))))";
}

function defaultArticleFields() {
  return  ":(is-read,when-saved,relevance-data,article-content,shared-in-network-count,trending-in-entities:(industries:(id,relation-to-viewer)),shared-by-people:(" + PersonAPI.standardPersonFields() + "))";
}

/*
  TopicPath:
  Retrieve list of topics based on key (where TopNews and Shared return a list of one topic)
  *  topicId:  "id=TOP_NEWS_TODAY" or "id=FIRST_DEGREE_NEWS_TODAY", or "type=FOLW", or actual topic id
  *  options
    -  fields: LinkedIn-formatted string describing which profile fields to retrieve.  see DEFAULT_TOPIC_FIELDS 
    -  start
    -  count
    -  masSharedByPeopleDegree
    -  maxSharedByPeopleC0ount      # limits the member list per article for members who have shared an article (default 1)
    -  maxArticles                  # max articles to return per story (default 1)
    -  maxStories                   # max stories to return per topic (default 100)
*/
function topicPath(topicId, options) {
  if (!options) options = {};
  var url = ["people/~/topics/"];
  url.push(topicId);
  url.push(options.fields || defaultTopicFields());
  url.push("?");
  
  var params = [];
  if (options.count) params.push("count=" + options.count);
  if (options.start) params.push("start=" + options.start);
  params.push("max-shared-by-people-degree=" + (options.maxSharedByPeopleDegree || 1));
  params.push("max-shared-by-people=" + (options.maxSharedByPeopleCount || 1));
  params.push("max-articles=" + (options.maxArticles || 0));
  params.push("max-stories=" + (options.maxStories|| 100));
  
  url.push(params.join('&'));
  return url.join('');
}


/**
  TopNews: 
  Retrieve top news topics/articles:
  *  options
    -  fields: LinkedIn-formatted string describing which profile fields to retrieve.  see DEFAULT_TOPIC_FIELDS 
    -  masSharedByPeopleDegree
    -  maxSharedByPeopleC0ount      # limits the member list per article for members who have shared an article (default 1)
    -  maxArticles                  # max articles to return per story (default 1)
    -  maxStories                   # max stories to return per topic (default 100)
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','newsAPI','topNews',{});
*/
function topNews(options) {
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  return {method:'GET', path:topicPath("id=TOP_NEWS_TODAY", options), headers:headers, resource:NEWS_RESOURCE};
}


/**
  SharedNews:
  Retrieve shared news topics/articles:
  *  options
    -  fields: LinkedIn-formatted string describing which profile fields to retrieve.  see DEFAULT_TOPIC_FIELDS 
    -  masSharedByPeopleDegree
    -  maxSharedByPeopleC0ount      # limits the member list per article for members who have shared an article (default 1)
    -  maxArticles                  # max articles to return per story (default 1)
    -  maxStories                   # max stories to return per topic (default 100)
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','newsAPI','sharedNews',{});
*/
function sharedNews(options) {
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  return {method:'GET', path:topicPath("id=FIRST_DEGREE_NEWS_TODAY", options), headers:headers, resource:NEWS_RESOURCE};
}

/**
  TopicNews: 
  Retrieve articles for topicId
  *  topicId
  *  options
    -  fields: LinkedIn-formatted string describing which profile fields to retrieve.  see DEFAULT_TOPIC_FIELDS 
    -  masSharedByPeopleDegree
    -  maxSharedByPeopleC0ount      # limits the member list per article for members who have shared an article (default 1)
    -  maxArticles                  # max articles to return per story (default 1)
    -  maxStories                   # max stories to return per topic (default 100)
    
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','newsAPI','topicNews','eyJicmVlZCI6IlRvcCIsImFsaWFzIjoiVE9QX1NMSUNFX05FV1NfVE9EQVkgMjgiLCJwZXJpb2QiOiJEYXkiLCJlbnRpdGllcyI6WyJJTkRZXzI4Il19', {});
*/
function topicNews(topicId, options) {
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  return {method:'GET', path:topicPath(QueryString.escape(topicId), options), headers:headers, resource:NEWS_RESOURCE};
}


/**
  FollowedTopics:
  Retrieve list of followed topics
  *  options
    -  start
    -  count
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','newsAPI','followedTopics', {count:10});
*/
function followedTopics(options) {
  var url = ["people/~/topics:(id,title,description,because-of)?type=FOLW"];
  if (options) {
    if (options.start) url.push("&start=" + options.start);
    if (options.count) url.push("&count=" + options.count);
  }
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  return {method:'GET', path:url.join(''), headers:headers, resource:NEWS_RESOURCE};
}


/**
  Article:
  Retrieve this article
  *  id:  article id
  *  options:
  -  fields
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','newsAPI','article', 5562792952759058434, {fields:":(is-read,when-saved,article-content)"});
*/
function article(id, options) {
  if (!id) return undefined;
  
  var fields = (options && options.fields) ? options.fields : defaultArticleFields();
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  return {method:'GET', path:"people/~/articles/" + id + fields, headers:headers, resource:NEWS_RESOURCE};
}


/**
  Shares:
  Retrieve this article's recent shares
  *  id:  article id
  *  options:
  -  count
  -  after (timestamp in ms)
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','newsAPI','shares', 5562792952759058434, {count:5});
*/
function shares(id, options) {
  if (!id) return undefined;
  
  var url = ["signal-search"];
  var params = ["facet=articleID," + id];
  ['count','after'].forEach(function(key) {if (options && options[key]) params.push(key+"="+options[key])});
  url.push("?");
  url.push(params.join('&'));
  
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  return {method:'GET', path:url.join(''), headers:headers, resource:NEWS_RESOURCE};
}


// ====== PUBLIC ==============================================================
var interface = {
  defaultTopicFields: defaultTopicFields,
  topNews: topNews,
  sharedNews: sharedNews,
  topicNews: topicNews,
  followedTopics: followedTopics,
  article: article,
  shares: shares
};
module.exports = interface;