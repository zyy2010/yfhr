// fis3 plugin for htmlmin

const _  = require( 'underscore' );
const hm = require( 'htmlmin' );

module.exports = function ( content, file, settings ) {

    var conf = _.extend(
        {
            jsmin: false,
            removeComments: true,
            collapseWhitespace: true
        },
        settings
    );

    return hm( content, conf );

};