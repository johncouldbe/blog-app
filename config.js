const {SECRET_URL} = require('./databaseUrl');

exports.PORT = process.env.PORT || 8080;
exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || SECRET_URL;
