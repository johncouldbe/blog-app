const express = require('express');
const app = express();

const {PORT, DATABASE_URL} = require('./config');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const blogRouter = require('./blog-router');

app.use('/blog-posts', blogRouter);
app.use('*', function(req, res){
  res.status(404).json({message: "Not Found"});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT){
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err){
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log(`You're listening on port ${port}`);
      });

      resolve();
    });
  });
}

function closeServer(){
  mongoose.disconnect().then(() => {
    return new Promise ((resolve, reject) => {
      server.close(err => {
        if(err){
          reject(err);
        }
        resolve();
      });
    });
  });
}

if(require.main === module){
  runServer().catch(err => console.log(err));
}
