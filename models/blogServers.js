var bcrypt = require('bcrypt-nodejs');
var debug = require('debug')('blog:manager');

function checkformat(username)
{
  error=[];
  if(!username.match( /[a-zA-Z][a-zA-Z0-9_]{5,17}/))
    error.push("用户名6~18位英文字母、数字或下划线，必须以英文字母开头");
  return error;
}


module.exports = function (db) {
  var users = db.collection('users');
  var posts = db.collection('posts');
  var numOfPost = 0;

  posts.stats(function (err, stats) {
    if (stats) {
      numOfPost = stats.count;
    }
    debug('There are ' + numOfPost + ' post in database');
  });


  function checkUser1(username)
  {
    var error=checkformat(username);
    return new Promise(function(resolve, reject){
      if (error==[])
        reject(error);
      else
        resolve(username);
    }).then(function(username){
      debug('check user unique.');
      return users.findOne({username: username}).then(function(curUser){
        return curUser ? Promise.reject("User isn't unique"):Promise.resolve();
      });
    });
  }

  function createUser1(user) 
  {
    return new Promise(function (resolve, reject){
      bcrypt.hash(user.password, null, null, function(err, result){
        user.password = result;
        return users.insert(user).then(function(){
          return resolve();
        });
      });
    });
  }

  function checkPassword1(user) 
  {
    console.log(2222);
    return users.findOne({username: user.username}).then(function (ans) {
      if(!ans)
        return Promise.reject("user doesn't exist");
      return new Promise(function (resolve, reject) {
        console.log(user.password);
        bcrypt.compare(user.password, ans.password, function (err, res) {
          debug('password check is : ', res);
          return res ? resolve() : reject("user's password is wrong.");
        });
      });
    });
  }

  function addPost1(post) 
  {
    // 增加唯一标识
    post.id = numOfPost++;
    //debug('a post add', post);
    return posts.insert(post);
  }

  function findPostById1(id) 
  {
    id = parseInt(id);
    return posts.findOne({'id': id}).then(function (post) {
      return post ? Promise.resolve(post) : Promise.reject();
    });
  }  

  function listPost1()
  {
    return posts.find().toArray().then(function (ans) {
      debug('The post in database', ans);
      return Promise.resolve();
    });
  }

  function editPostById1(id, newPost) 
  {
    id = parseInt(id);
    return posts.findOne({'id': id}).then(function (post) {
      newPost._id = post._id;
      debug('the new one is ', newPost);
      return posts.save(newPost);//save
    });
  }

  function getAllPosts1() 
  {
    return posts.find().toArray().then(function (allpost) {
      allpost.forEach(function (post) {
        delete post._id;
      });
      debug('All post is ', allpost);
      return Promise.resolve(allpost);
    });
  }

  function deletePostById1(id)
  {
    id = parseInt(id);
    return posts.deleteOne({'id': id});
  }

  function addComment1(id, comment) 
  {
    id = parseInt(id);
    return posts.updateOne({'id': id}, {$push: {'comments': comment}});//push
  }

  function togglePost1(id, status) 
  {
    id = parseInt(id);
    return posts.updateOne({'id': id}, {$set: {show: !status}});
  }

  return {
    checkUser: checkUser1,
    createUser: createUser1,
    checkPassword: checkPassword1,
    addPost: addPost1,
    findPostById: findPostById1,
    listPost: listPost1,
    editPostById: editPostById1,
    getAllPosts: getAllPosts1,
    deletePostById: deletePostById1,
    addComment: addComment1,
    togglePost: togglePost1
  };
};
