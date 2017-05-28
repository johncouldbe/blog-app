const mongoose = require('mongoose');

const { TEST_DATABASE_URL } = require('../config');
const { BlogPost } = require('../models');
const { app, runServer, closeServer } = require('../server');

const faker = require('faker');

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

function seedData() {
  console.log('Creating database...');
  let posts = [];
  for (i = 0; i < 10; i ++) {
    posts.push(createPost());
  }
  return BlogPost.insertMany(posts);
}

function createPost() {
  return {
    title: `${faker.company.bsAdjective()} ${faker.company.bsNoun()}`,
    content: faker.lorem.paragraphs(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    created: faker.date.past()
  }
}

function disposeOfData() {
  console.log('Deleting database...');
  return mongoose.connection.dropDatabase();
}



describe('BlogPost API Resource', function(){

  const reqFields = ['id', 'title', 'content', 'author', 'created'];

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function(){
    return closeServer();
  });

  beforeEach(function() {
    return seedData();
  });

  afterEach(function() {
    return disposeOfData();
  });

  describe('GET BlogPosts', function(){

    it('Should return all items in the database on GET.', function(){
      let res;
      return chai.request(app)
      .get('/blog-posts')
      .then(function(_res){
        res = _res;

        res.should.have.status(200);
        res.should.be.an('object');
        res.should.be.json;
        res.body.blogposts.should.be.an('array');
        res.body.blogposts.length.should.be.at.least(10);
        res.body.blogposts[0].should.be.an('object');

        return BlogPost.count();
      })
      .then(function(count) {
        count.should.be.equal(res.body.blogposts.length);
      });
    });

    it('Should return item with the correct fields', function(){
      let post;
      return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        post = res.body.blogposts[0];

        post.should.have.all.keys(reqFields);
        post.author.should.not.contain.keys(['firstName', 'lastName']);

        return BlogPost.findById(post.id);
      })
      .then(function(dbPost) {
        dbPost.author.should.contain.keys(['firstName', 'lastName']);
        post.id.should.equal(dbPost.id);
        post.title.should.equal(dbPost.title);
        post.content.should.equal(dbPost.content);
        post.created.should.equal(dbPost.created);
      });
    });

  })

  describe('Post', function(){
    const newPost = createPost();

    it('Should create and add a new blog post on POST', function(){
      let res;
      let post;

      return chai.request(app)
      .post('/blog-posts')
      .send(newPost)
      .then(function(_res){
        res = _res;
        post = res.body;
        res.should.be.json;
        post.should.have.all.keys(reqFields);
        post.should.be.an('object');
        post.title.should.equal(newPost.title);
        post.content.should.equal(newPost.content);
        post.author.should.contain(newPost.author.firstName, newPost.author.lastName);

        return BlogPost.findById(post.id);
      })
      .then(function(blogpost) {
        post.id.should.equal(blogpost.id);
        post.title.should.equal(blogpost.title);
        post.author.should.contain(blogpost.author.firstName, blogpost.author.lastName);
        post.content.should.equal(blogpost.content);
        post.created.should.equal(blogpost.created);
      });
    });

  });

  describe('PUT', function() {

    it('Should update a post on PUT.', function() {
      let updateTo = {
        title: 'Constipated but I love it.',
        content: 'Stardate: 47634.44'
      };
      return BlogPost
      .findOne()
      .exec()
      .then(function(blogpost) {
        updateTo.id = blogpost.id;

        return chai.request(app)
        .put(`/blog-posts/${blogpost.id}`)
        .send(updateTo)
        .then(function(res) {
          res.should.have.status(201);
          res.should.not.contain(reqFields);

          return BlogPost.findById(updateTo.id)
        }).then(function(blogpost) {
          blogpost.title.should.equal(updateTo.title);
          blogpost.content.should.equal(updateTo.content);
        })
      })

    });

  });

  describe('DELETE', function() {

    it('Should remove from database on DELETE', function() {
      BlogPost
      .findOne()
      .exec()
      .then(function(blogpost) {
        return chai.request(app)
        .delete(`/blog-posts/${blogpost.id}`)
        .then(function(res) {
          res.should.have.status(200);
          res.body.should.contain(`Post with id: ${blogpost.id}, removed from database.`);

          return BlogPost.findById(blogpost.id).exec();
        })
        .then(function(blogpost) {
          should.not.exist(blogpost);
        });
      });
    })

  });

});
