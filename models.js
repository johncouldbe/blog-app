const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  },
  created: String
});

blogPostSchema.virtual('nameString', function(){
  return `${this.author.firstname} ${this.author.lastname}`;
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
