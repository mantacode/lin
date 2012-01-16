var PersonAPI = require('./peopleAPI');

var GROUPS_RESOURCE = "groups";


/**
  List:
  Get list of groups.
  *  options:
    -  fields, eg: ":(group:(id,name,counts-by-category,visibility,large-logo-url,num-members))"
    -  membership: array of ["owner","member","manager"]; default ["member"]
    -  start
    -  count
    
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','list',{membership:['member'], count:25});
*/

function list(options) {
  var fields = (options && options.fields) ? options.fields : ":(group:(id,name,num-members,counts-by-category,small-logo-url,posts:(id,title,relation-to-viewer:(is-liked),creator:(" + PersonAPI.basicPersonFields() + "),creation-timestamp,likes,comments)))";
  
  var url = ["people/~/group-memberships" + fields + "?"];
  var params = [];
  var membership = (options && options.membership) ? options.membership : ["member"];
  membership.forEach(function(m) { params.push('membership-state=' + m)});
  if (options) {
    ['start','count'].forEach(function(key) {if (typeof options[key] !== 'undefined') params.push(key+"="+options[key])});
  }
  url.push(params.join('&'));
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:GROUPS_RESOURCE};
}

/**
  Recommended:
  Get a list of recommended groups.
  *  options:
    -  fields, eg: ":(id,name,is-open-to-non-members,counts-by-category)"
    -  start
    -  count
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','recommended',{count:5});
*/
function recommended(options) {
  var fields = (options && options.fields) ? options.fields : ":(id,name,counts-by-category,is-open-to-non-members,large-logo-url,num-members)";
  var url = ["people/~/suggestions/groups" + fields];
  if (options) {
    var params = [];
    ['start','count'].forEach(function(key) {if (typeof options[key] !== 'undefined') params.push(key+"="+options[key])});
    url.push("?" + params.join('&'));
  }
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:GROUPS_RESOURCE};
}

/**
  Show:
  Retrieve details for a group
  *  id: group id
  *  options:
    -  fields, or ":(id,name)" default
    
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','show', 547033, {fields:":(id,name)"});
*/
function show(groupId, options) {
  if (!groupId) return undefined;
  var fields = (options && options.fields) ? options.fields : ":(id,name,num-members,large-logo-url,is-open-to-non-members,relation-to-viewer:(membership-state))";
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:"groups/" + groupId + fields, headers:headers, resource:GROUPS_RESOURCE};
}


/**
  Posts:
  View posts for a given group.
  *  id: group id
  *  options:
    -  fields
    -  order (default: recency)
    -  after (timestamp, such as 1323726382)  milliseconds 
    -  start
    -  count
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','posts', 547033, {after:1323726382, count:10});
*/
function posts(groupId, options) {
  if (!groupId) return undefined;
  
  var fields = (options && options.fields) ? 
    options.fields : 
    ":(id,title,site-group-post-url,attachment,attachments,relation-to-viewer:(is-liked),summary,creator:(" + PersonAPI.basicPersonFields() + "),creation-timestamp,likes:(person:(" + PersonAPI.basicPersonFields() + "),timestamp),comments:(id,creator:(" + PersonAPI.basicPersonFields() + "),creation-timestamp,text))";
  var url = ["groups/" + groupId + "/posts" + fields + "?"];
  
  var params = [];
  if (options) {
    ['start','count','order'].forEach(function(key) {if (typeof options[key] !== 'undefined') params.push(key+"="+options[key])});
  }
  if (options && options.after) {
    params.push('modified-since=' + options.after);
  }
  params.push('category=discussion');
  url.push(params.join('&'));
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:GROUPS_RESOURCE};
}


/**
  Join group:
  Become a member of this group.
  *  id: group id
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','joinGroup', 547033);
*/
function joinGroup(groupId) {
  if (!groupId) return undefined;
  
  var body = {"membership-state": {"code": "member"}};
  return {method:'PUT',
          path:'people/~/group-memberships/' + groupId,
          body: JSON.stringify(body),
          headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          resource:GROUPS_RESOURCE};
}

/**
  Leave group:
  Revoke membership and leave a group.
  *  id: group id
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','leaveGroup', 547033);
*/
function leaveGroup(groupId) {
  if (!groupId) return undefined;

  return {method:'DELETE',
          path:'people/~/group-memberships/' + groupId,
          headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          resource:GROUPS_RESOURCE};
}

/**
  Create Group:
  Create a group
  * options
  - body: hash containing name, category, shortDescription, description, contactEmail, visibility, and isOpenToNonMembers
  
  example:
  var Lini = require('lini');
  var group = {name:"myGroup",
              category:?,
              description:"blah blah blah", 
              shortDescription:"blah", 
              contactEmail:"me@linkedin.com",
              visibility:?,
              isOpenToNonMembers:true};
  var api = Lini.api('v1','groupsAPI','createGroup', {body:groups});
*/
function createGroup(options) {
  var fields = ['name', 'category', 'shortDescription', 'description', 'contactEmail', 'visibility', 'isOpenToNonMembers'];
  var body = {visibility:{code:'hidden'}, isOpenToNonMembers:false, category:{code:'network'}};
  _.each(fields, function(field) {
    if (options.body[field]) {
      body[field] = options.body[field];
    }
    if (!body[field]) return false;
  });

  return {method:'POST',
          path:'groups',
          body:JSON.stringify(body),
          headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          resource:GROUPS_RESOURCE};
}

/**
  Post to group:
  Post a discussion to a group
  *  groupId: group to post to
  *  title: title of the post
  *  summary: content of the post
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','postToGroup', 547033, "Check this out...", "Really really interesting comment goes here.");
*/
function postToGroup(groupId, title, summary) {
  if (!groupId || !title || !summary) return undefined;
  
  return {method:'POST',
          path:'groups/' + groupId + '/posts',
          // body:JSON.stringify({"title": title, "summary": summary}),
          // headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          body:'<post><title>' + title + '</title><summary>' + summary + '</summary></post>',
          headers:{"x-li-format":"xml", "Content-Type":"text/xml;charset=UTF-8"},
          resource:GROUPS_RESOURCE};
}


// === POSTS ======================================================================================

/**
  Show Post:
  A Comment made to a group is called a "post".  This method retrieves a posting for viewing.
  *  postId: post id
  *  options
    -  fields
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','showPost', 'g-1793367-S-4994574', {fields:":(id,title)"});
*/
function showPost(postId, options) {
  if (!postId) return undefined;
  
  var fields = (options && options.fields) ? options.fields : ":(id,title,site-group-post-url,attachment,relation-to-viewer:(is-liked),summary,creator:(" + PersonAPI.basicPersonFields() + "),creation-timestamp,likes:(person:(" + PersonAPI.basicPersonFields() + "),timestamp),comments:(id,creator:(" + PersonAPI.basicPersonFields() + "),creation-timestamp,text))"
  var url = ["posts/" + postId + fields];
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:GROUPS_RESOURCE};
}

/**
  Post Comments:
  Retrieve comments for a given group posting.
  *  postId: post id
  *  options:
    -  start
    -  count
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','postComments', 'g-1793367-S-4994574', {count:10});
*/
function postComments(postId, options) {
  if (!postId) return undefined;
  
  var fields = (options && options.fields) ? options.fields : ":(id,creator:(" + PersonAPI.standardPersonFields() + "),creation-timestamp,text)";
  var url = ['posts/' + postId + '/comments' + fields];
  
  if (options) {
    var params = [];
    ['start','count'].forEach(function(key) {if (typeof options[key] !== 'undefined') params.push(key+"="+options[key])});  
    url.push("?" + params.join('&')); 
  }
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:GROUPS_RESOURCE};
}

/**
  Post Likes:
  Retrieve list of likes (a list of people who have liked) for a given group posting.
  *  postId: post id
  *  options:
    -  start
    -  count
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','postLikes', 'g-1793367-S-4994574', {count:10});
*/
function postLikes(postId, options) {
  if (!postId) return undefined;
  
  var fields = (options && options.fields) ? options.fields : ":(person:(" + PersonAPI.standardPersonFields() + "),timestamp)";
  var url = ['posts/' + postId + '/likes' + fields];
  
  if (options) {
    var params = [];
    ['start','count'].forEach(function(key) {if (typeof options[key] !== 'undefined') params.push(key+"="+options[key])});  
    url.push("?" + params.join('&')); 
  }
  var headers = (options && options.headers) ? options.headers : {"x-li-format":"json"};
  
  return {method:'GET', path:url.join(''), headers:headers, resource:GROUPS_RESOURCE};
}


/**
  Like Post:
  Either like or unlike a given group posting
  *  postId: post id
  *  doLike: "true" or "false" (true by default)
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','likePost', 'g-1793367-S-4994574');
*/
function likePost(postId, doLike) {
  var body = ((typeof doLike == 'undefined') || (doLike.toString() === "true")) ? "true" : "false";
  
  return {method:'PUT', 
          path:'posts/' + postId + '/relation-to-viewer/is-liked',
          body:body,
          headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          resource:GROUPS_RESOURCE};
}

/**
  Comment On Post:
  Submit a comment for this group posting.
  *  postId: post id
  *  comment
  
  example:
  var Lini = require('lini');
  var api = Lini.api('v1','groupsAPI','commentOnPost', 'g-1793367-S-4994574'), "I really like this idea!  Ship it.";
*/
function commentOnPost(postId, comment) {
  if (!postId || !comment) return undefined;
  
  return {method:'POST', 
          path:'posts/' + postId + '/comments',
          body:'<comment><text>' + comment + '</text></comment>',
          headers:{"x-li-format":"xml", "Content-Type":"text/xml;charset=UTF-8"},
          // body:JSON.stringify({text:comment}),
          // headers:{"x-li-format":"json", "Content-Type":"application/json;charset=UTF-8"},
          resource:GROUPS_RESOURCE};
}


// ====== PUBLIC ==============================================================
var interface = {
  list: list,
  recommended: recommended,
  show: show,
  posts: posts,
  showPost: showPost,
  postComments: postComments,
  postLikes: postLikes,
  joinGroup: joinGroup,
  leaveGroup: leaveGroup,
  likePost: likePost,
  createGroup: createGroup,
  postToGroup: postToGroup,
  commentOnPost: commentOnPost
};
module.exports = interface;
