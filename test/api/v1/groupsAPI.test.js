var Assert = require('assert'),
    GroupAPI = require('../../../lib/api/v1/groupsAPI');

module.exports = {
  'Test group list default': function() {
    var palRequest = GroupAPI.list();
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"groups",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/group-memberships:(group:(id,name,num-members,counts-by-category,small-logo-url,posts:(id,title,relation-to-viewer:(is-liked),creator:(id,first-name,last-name,headline,picture-url,auth-token,distance),creation-timestamp,likes,comments)))?membership-state=member"});
  },
  'Test group list': function() {
    var palRequest = GroupAPI.list({membership:["owner","member","manager"],
                                    fields:":(group:(id,name,counts-by-category,visibility,large-logo-url,num-members))",
                                    start:3,
                                    count:25});
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"groups",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/group-memberships:(group:(id,name,counts-by-category,visibility,large-logo-url,num-members))?membership-state=owner&membership-state=member&membership-state=manager&start=3&count=25"});
  },
  'Test recommended group default': function() {
    var palRequest = GroupAPI.recommended({fields:":(id,name,is-open-to-non-members,counts-by-category)",
                                           start:3,
                                           count:25});
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"groups",
                                  headers:{"x-li-format":"json"},
                                  path:"people/~/suggestions/groups:(id,name,is-open-to-non-members,counts-by-category)?start=3&count=25"});
  },
  'Test show': function() {
    var palRequest = GroupAPI.show("groupId");
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"groups",
                                  headers:{"x-li-format":"json"},
                                  path:"groups/groupId:(id,name,num-members,large-logo-url,is-open-to-non-members,relation-to-viewer:(membership-state))"});
  },
  'Test posts': function() {
    var palRequest = GroupAPI.posts("groupId");
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"groups",
                                  headers:{"x-li-format":"json"},
                                  path:"groups/groupId/posts:(id,title,site-group-post-url,attachment,attachments,relation-to-viewer:(is-liked),summary,creator:(id,first-name,last-name,headline,picture-url,auth-token,distance),creation-timestamp,likes:(person:(id,first-name,last-name,headline,picture-url,auth-token,distance),timestamp),comments:(id,creator:(id,first-name,last-name,headline,picture-url,auth-token,distance),creation-timestamp,text))?category=discussion"});
  },
  'Test show post': function() {
    var palRequest = GroupAPI.showPost("postId", {fields:":(id,title)"});
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"groups",
                                  headers:{"x-li-format":"json"},
                                  path:"posts/postId:(id,title)"});
  },
  'Test post comments': function() {
    var palRequest = GroupAPI.postComments("postId", {start:3, count:20});
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"groups",
                                  headers:{"x-li-format":"json"},
                                  path:"posts/postId/comments:(id,creator:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance),creation-timestamp,text)?start=3&count=20"});
  },
  'Test post likes': function() {
    var palRequest = GroupAPI.postLikes("postId", {start:3, count:20});
    Assert.deepEqual(palRequest, {method:'GET', 
                                  resource:"groups",
                                  headers:{"x-li-format":"json"},
                                  path:"posts/postId/likes:(person:(id,first-name,last-name,formatted-name,headline,picture-url,auth-token,distance),timestamp)?start=3&count=20"});
  },
  'Test join group': function() {
    var palRequest = GroupAPI.joinGroup("groupId");
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  path:"people/~/group-memberships/groupId",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  body:"{\"membership-state\":{\"code\":\"member\"}}",
                                  resource:"groups"});
  },
  'Test like post default': function() {
    var palRequest = GroupAPI.likePost("postId");
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  path:"posts/postId/relation-to-viewer/is-liked",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  body:"true",
                                  resource:"groups"});
  },
  'Test like post "true"': function() {
    var palRequest = GroupAPI.likePost("postId", "true");
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  path:"posts/postId/relation-to-viewer/is-liked",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  body:"true",
                                  resource:"groups"});
  },
  'Test like post true': function() {
    var palRequest = GroupAPI.likePost("postId", true);
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  path:"posts/postId/relation-to-viewer/is-liked",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  body:"true",
                                  resource:"groups"});
  },
  'Test like post "false"': function() {
    var palRequest = GroupAPI.likePost("postId", "false");
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  path:"posts/postId/relation-to-viewer/is-liked",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  body:"false",
                                  resource:"groups"});
  },
  'Test like post false': function() {
    var palRequest = GroupAPI.likePost("postId", false);
    Assert.deepEqual(palRequest, {method:'PUT', 
                                  path:"posts/postId/relation-to-viewer/is-liked",
                                  headers:{"x-li-format":"json","Content-Type":"application/json;charset=UTF-8"},
                                  body:"false",
                                  resource:"groups"});
  },
  'Test post to group': function() {
    var palRequest = GroupAPI.postToGroup("groupId", "MyPostTitle","MyPostSummary");
    Assert.deepEqual(palRequest, {method:'POST', 
                                  path:"groups/groupId/posts",
                                  headers:{"x-li-format":"xml","Content-Type":"text/xml;charset=UTF-8"},
                                  body:"<post><title>MyPostTitle</title><summary>MyPostSummary</summary></post>",
                                  resource:"groups"});
  },
  'Test comment on post': function() {
    var palRequest = GroupAPI.commentOnPost("groupId", "Hello World");
    Assert.deepEqual(palRequest, {method:'POST', 
                                  path:"posts/groupId/comments",
                                  headers:{"x-li-format":"xml","Content-Type":"text/xml;charset=UTF-8"},
                                  body:"<comment><text>Hello World</text></comment>",
                                  resource:"groups"});
  },
}