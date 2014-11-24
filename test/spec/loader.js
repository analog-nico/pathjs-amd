/* globals $:true */
describe('The UMD wrapper', function () {
    'use strict';

    var autoLoadedPath;

    beforeEach(function () {
        autoLoadedPath = window.Path;
        delete window.Path;
    });

    afterEach(function () {
        window.Path = autoLoadedPath;
    });

    it('should allow AMD loading', function (done) {

        $.getScript('/base/bower_components/requirejs/require.js', function () {

            expect(!!window.require).toBe(true);
            expect(!!window.define).toBe(true);

            require(['base/src/path'], function (path) {
                expect(!!path).toBe(true);
                done();
            });

        });

    });

});
