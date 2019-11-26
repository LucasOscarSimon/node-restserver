const { url } = require('inspector');

// ====================================
// Port
// ====================================

process.env.PORT = process.env.PORT || 3000;

// ====================================
// Environment
// ====================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

// ====================================
// Database
// ====================================

let urlDB;

// if (process.env.NODE_ENV === 'dev') {
//     urlDB = 'mongodb://localhost:27017/coffee';
// } else {
urlDB = 'mongodb+srv://coffee-user:K15edX20@cluster0-epmsm.mongodb.net/test?retryWrites=true&w=majority';
// }

process.env.URLDB = urlDB;