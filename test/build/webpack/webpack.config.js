var path = require('path');

module.exports = {
    entry: path.join(__dirname, './entry.js'),
    output: {
        path: __dirname,
        filename: '../../fixtures/webpack/bundle.js'
    }
};
