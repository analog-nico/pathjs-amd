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

                path.map('#AMD').to(function () {
                    done();
                });

                path.listen();

                location.hash = '#AMD';

            });

        });

    });

    it('should allow using a Webpack bundle', function (done) {

        $.getScript('/base/test/fixtures/webpack/bundle.js', function () {

            expect(!!window.PathWP).toBe(true);

            window.PathWP.map('#WP').to(function () {
                done();
            });

            window.PathWP.listen();

            location.hash = '#WP';

        });

    });

});
