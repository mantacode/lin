var Querystring = require('querystring'),
    PersonAPI = require('./peopleAPI');

var UPDATE_RESOURCE = "updates";
var STANDARD_UPDATE_FIELDS = "timestamp,update-key,update-type,update-content:(person:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance,connections,current-share,main-address,twitter-accounts,im-accounts,phone-numbers,date-of-birth,member-groups)),updated-fields,is-commentable,update-comments,is-likable,is-liked,num-likes";


/**
  Updates:
  Get network updates for a user
  *  types:  comma-separated list of desired update types, eg: "CONN,PICT,PRFU,JGRP,JOBS,RECU,PRFX,SHAR"
  *  options:
  -  id: retrieve updates for this user 
        note: if not same as logged in user, must set scope to self -- can only view "mefeed" of other users
        if not present, use "~" to indicate self/logged-in-user
  -  start: 0,
  -  count:10,
  -  scope='self'          // if you want MeFeed -- updates that "this user" has sent (not received)
  -  after=1302552225000,  // optional time filters
  -  before=1303247798098, // optional time filters
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','updatesAPI','updates',{count:10});
*/
function updates(types, options) {
  if (!types) return undefined;
  
  if (!options) options = {};
  var url = ["people/"];
  url.push(options.id || "~");
  url.push("/network/updates");
  url.push(options.fields || ":(" + STANDARD_UPDATE_FIELDS + ")");
  var params = types ? types.split(',').map(function(elem) { return("type="+elem);}) : [];
  ['start','count','scope','before','after'].forEach(function(key) {if (options[key]) params.push(key+"="+options[key])});
  if (params.length > 0) {
    url.push("?");
    url.push(params.join('&'));
  }
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:UPDATE_RESOURCE};
}


/**
  Likes:
  Get likes for this update
  *  id: network update id
  *  options:
    -  start
    -  count
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','updatesAPI','likes',"UNIU-15003820-5563047074699685888-SHARE",{count:5});
*/
function likes(id, options) {
  if (!id) return undefined;
  
  var url = ["people/~/network/updates/key=" + id + "/likes"];
  url.push(options.fields || ":(person:(" + PersonAPI.standardPersonFields() + "))");
  var params = [];
  ['start','count'].forEach(function(key) {if (options && options[key]) params.push(key+"="+options[key])});
  if (params.length > 0) {
    url.push("?");
    url.push(params.join('&'));
  }
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:UPDATE_RESOURCE};
}

/**
  Comments:
  Get comments for this update
  *  id: network update id
  *  options:
    -  start
    -  count
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','updatesAPI','comments',"UNIU-15003820-5563047074699685888-SHARE",{count:5});
*/
function comments(id, options) {
  if (!id) return undefined;
  
  var url = ["people/~/network/updates/key=" + id + "/update-comments"];
  url.push(options.fields || ":(id,sequence-number,comment,timestamp,person:(" + PersonAPI.standardPersonFields() + ",api-standard-profile-request))");
  var params = [];
  ['start','count'].forEach(function(key) {if (options && options[key]) params.push(key+"="+options[key])});
  if (params.length > 0) {
    url.push("?");
    url.push(params.join('&'));
  }
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:UPDATE_RESOURCE};
}


function htmlEscape(str) {
  return str.replace(/&/g,'&amp;').
       replace(/</g,'&lt;').
       replace(/>/g,'&gt;').
       replace(/"/g,'&quot;').
       replace(/'/g,'&#039;').
       replace(/&amp;#187;/g,'&#187;');
}


/**
  Like:
  Like this network update
  *  id: id of network update
  *  doLike:  true (or undefined) if liking, false if unliking
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','updatesAPI','like',"UNIU-15003820-5563047074699685888-SHARE");
  
*/
function like(id, doLike) {
  if (!id) return undefined;
  var body = ((typeof doLike == 'undefined') || (doLike.toString() === "true")) ? "true" : "false";
  
  return {method:'PUT', 
          path:"people/~/network/updates/key=" + id + "/is-liked", 
          body: body,
          headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          resource:UPDATE_RESOURCE};
}


/**
  Comment:
  Comment on this network update
  *  id: id of network update
  *  comment:  comment
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','updatesAPI','comment',"UNIU-15003820-5563047074699685888-SHARE", "This is so cool!");
*/
function comment(id, comment) {
  if (!id || !comment) return undefined;
  
  return {method:'POST', 
          path:"people/~/network/updates/key=" + id + "/update-comments", 
          body: JSON.stringify({comment:comment}),
          headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          resource:UPDATE_RESOURCE};
}


// This strips off the media.linkedin.com portion of an image url if it exists to return the original unescapedurl.
function conditionImageUrl(imageUrl) {
  result = imageUrl;
  var match = imageUrl.match(/media\.linkedin\.com.+?url=(.+)/);
  if (match) {
    result = Querystring.unescape(match[1]);
  }
  return result;
}


/**
  Share:
  Create a SHAR update:  share content and/or comment to update stream.
  *  options:
    -  twitter:  if true, additionally post to twitter stream
    -  visibility "connections" or "anyone" (by default)
    -  comment
    -  contentTitle
    -  contentUrl
    -  contentImage
    -  contentId (if re-share, instead of title/url/image)
  
  example:
  var Lin = require('lin');
  var api = Lin.api('v1','updatesAPI','share',{comment:"simple status update"});
  var api = Lin.api('v1','updatesAPI','share',{contentTitle:"What You Can Learn", contentUrl:"http://www.linkedin.com/today/article?articleID=5562792952759058434&trk=tod-home-art", comment:"set your alarm clocks"});
*/
function share(options) {
  // must at least have comment, title/url, or contentId
  var hasContent = (options && (options.comment || (options.contentTitle && options.contentUrl) || options.contentId));
  if (!hasContent) return undefined;
  
  var url = ["people/~/shares"];
  if (options && options.twitter && (options.twitter.toString() === "true")) {
    url.push("?twitter-post=true");
  }
  
  var vis = (options.visibility === 'connections') ? "connections-only" : "anyone";
  var share = {visibility:{code:vis}};
  if (options.comment) share.comment = options.comment;
  if (options.contentTitle && options.contentUrl) {
    share.content = {title:options.contentTitle, "submitted-url":options.contentUrl};
    if (options.contentImage) share.content['submitted-image-url'] = conditionImageUrl(options.contentImage);
  	if (options.description) share.content['description'] = options.description;
  } else if (options.contentId) {
    share.attribution = {share:{id:options.contentId}};
  } else if (options.articleId) {
    share.content = {"article-id":options.articleId};
  }
  
  return {method:'POST',
          path:url.join(''),
          body:JSON.stringify(share),
          headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          resource:UPDATE_RESOURCE};
}


// ====== PUBLIC ==============================================================
var interface = {
  updates: updates,
  likes: likes, 
  comments: comments,
  like: like, 
  comment: comment,
  share: share
};
module.exports = interface;
