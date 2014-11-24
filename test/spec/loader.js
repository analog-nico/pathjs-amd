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

    it('should allow using a Webpack bundle', function (done) {

        expect(!!window.PathWP).toBe(true);

        window.PathWP.map('#WP').to(function () {
            done();
        });

        window.PathWP.listen();

        location.hash = '#WP';

    });

    it('should allow using a Browserify bundle', function (done) {

        expect(!!window.PathBFY).toBe(true);

        window.PathBFY.map('#BFY').to(function () {
            done();
        });

        window.PathBFY.listen();

        location.hash = '#BFY';

    });

});
