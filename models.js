const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  },
  created: String
});

blogPostSchema.virtual('nameString').get(function(){
  return `${this.author.firstName} ${this.author.lastName}`
});

blogPostSchema.methods.apiRepr = function(){
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.nameString,
    created: this.created || new Date()
  };
}

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};
