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
// Token expire date
// ====================================
// 60 segs
// 60 mins
// 24 hours
// 30 days
process.env.TOKEN_EXPIRES_IN = '24h';

// ====================================
// Authentication Seed
// ====================================
process.env.SEED = process.env.SEED || 'this-is-the-development-seed';

// ====================================
// Database
// ====================================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/coffee';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;