const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPost} = require('./models');

router.use(jsonParser);

router.get('/', (req, res) => {
  BlogPost
  .find()
  .limit(10)
  .exec()
  .then(blogPosts => {
    res.json({
      blogPosts: blogPosts.map(
        (blogPost) => blogPost.apiRepr())
    }).status(200);
  })
  .catch(
  err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

router.get('/:id', (req, res) => {
  BlogPost
  .findById(req.params.id)
  .exec()
  .then((blogPost) => res.json(blogPost.apiRepr())
  );
});

router.post('/', (req, res) => {
  const requiredKeys = ["title", "content", "author"];
  for(i = 0; i < requiredKeys.length; i++){
    let field = requiredKeys[i];
    if(!(field in req.body)){
      const message = `Please enter the field "${field}".`;
      console.log(message);
      res.status(500).send(message);
    }
  }

  const requiredAuthorKeys = ["firstName", "lastName"];
  for(i = 0; i < requiredAuthorKeys.length; i++){
    let field = requiredAuthorKeys[i];
    if(!(field in req.body.author)){
      const message = `Please enter the field "${field}" in author.`;
      console.log(message);
      res.status(500).send(message);
    }
  }

  BlogPost
  .create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    created: req.body.created
  })
  .then(blogPost => res.json(blogPost.apiRepr()).status(201))
  .catch(err => {
    console.log(err);
    res.status(500).send('Internal Server Error');
  });
});

router.put('/:id', (req, res) => {
  if(!(req.body.id && req.params.id && req.body.id == req.params.id)){
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id})must be matching.`;
    console.log(message);
    res.send(message).status(500);
  }

  const toUpdate = {};
  const updateableFields = ["title", "content", "author", "created"];

  for(let i = 0; i < updateableFields.length; i++){
    let field = updateableFields[i];
    if(field in req.body){
      if(field == "author"){
        const reqAuthorFields = ["firstName", "lastName"];
        for(let i = 0; i < reqAuthorFields.length; i++){
          let field = reqAuthorFields[i];
          if(!(field in req.body.author)){
            const message = `Please enter the field "${field}" in author.`;
            console.log(message);
            res.status(500).send(message);
          }
        }
      }
      toUpdate[field] = req.body[field];
    }
  }


  BlogPost
  .findByIdAndUpdate(req.params.id, {$set: toUpdate})
  .exec()
  .then(blogPost => res.status(200).end())
  .catch(err => {
    console.log(err);
    res.status(500).send("Internal server Error.");
  });
});

router.delete('/:id', (req, res) => {
  BlogPost
  .findByIdAndRemove(req.params.id)
  .exec()
  .then(blogPost => res.status(200).send(`Post with id: ${req.params.id}, removed from database.`))
  .catch(err => {
    console.log(err);
    res.status(500).send('Internal server error.');
  })
});

module.exports = router;
