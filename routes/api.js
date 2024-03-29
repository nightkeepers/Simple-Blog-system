/*
 * Serve JSON to our AngularJS client
 */

var express = require('express');
var router = express.Router();
var debug = require('debug')('blog:api');

// GET

module.exports = function (db) {
  var blogManager = require('../models/blogServers')(db);

  // GET
  router.get('/posts', function (req, res) {
    blogManager.getAllPosts()
        .then(function (posts) {
          res.send(posts);
        })
        .catch(function () {
          debug('fail to get all post');
          res.json(false);
        });
  });

  router.get('/post/:id', function (req, res) {
    var id = req.params.id;

    blogManager.findPostById(id)
        .then(function (post) {
          res.send(post);
        })
        .catch(function () {
          debug('fail to get post ' + id);
        });
  });

  router.post('/checkUnique', function (req, res) {
    var user = req.body;
    blogManager.checkUser(user.username)
        .then(function () {
          res.send({isUnique: true});
        })
        .catch(function (error) {
          console.log(22222);
          res.send({isUnique: false});
        });
  });

  router.get('/hasLogin', function (req, res) {
    var data = {};
    data.isLogin = (req.session && req.session.user);
    if (data.isLogin)
      data.username = req.session.user.username;
    res.send(data);
  });

  // POST
  router.post('/post', function (req, res) {
    var post = req.body;
    post.comments = [];
    post.author = req.session.user.username;
    blogManager.addPost(post)
        .then(function () {
          res.json(req.body);
        })
        .catch(function (error) {
          debug('error in add post', error);
        });
  });

  router.post('/regist', function (req, res) {
    var user = req.body;
    debug('about to regist', user);

    blogManager.createUser(user)
        .then(function () {
          req.session.user = user;
          res.send({});
        })
        .catch(function (error) {
          debug('Error occurs in regist');
          res.send({});
        });
  });

  router.post('/login', function (req, res) {
    var user = req.body;
    debug(user, ' about to login');
    console.log(user);
    blogManager.checkPassword(user)
        .then(function () {
          req.session.user = user;
          res.send({passwordError: false});
        })
        .catch(function (error) {
          debug(error);
          res.send({passwordError: true});
        });
  });

  router.post('/logout', function (req, res) {
    req.session.destroy(function(err){
      if(err){
        return;
      }
      res.clearCookie('skey');
      res.send(true);
    });
  });

  router.post('/addComment/:id', function (req, res) {
    var id = req.params.id;
    var comment = req.body;
    comment.author = req.session.user.username;

    debug('comment is ', comment);
    blogManager.addComment(id, comment)
        .then(function () {
          res.json(true);
        })
        .catch(function () {
          debug('fail to add comment');
          res.json(false);
        });
  });

  router.post('/togglePost/:id', function (req, res) {
    var id = req.params.id;
    var status = req.body.curStatus;

    blogManager.togglePost(id, status)
        .then(function () {
          res.json(true);
        })
        .catch(function () {
          debug('fail to toggle post');
          res.json(false);
        });
  });

  // PUT
  router.put('/post/:id', function (req, res) {
    var id = req.params.id,
        newPost = req.body;

    blogManager.editPostById(id, newPost)
        .then(function () {
          res.json(true);
        })
        .catch(function () {
          debug('fail to update post');
          res.json(false);
        });
  });

  // DELETE
  router.delete('/post/:id', function (req, res) {
    var id = req.params.id;

    blogManager.deletePostById(id)
        .then(function () {
          res.json(true);
        })
        .catch(function () {
          debug('fail to delete post ' + id);
          res.json(false);
        });
  });

  return router;
};
