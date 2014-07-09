/* global Path */
describe('The pushState routes', function () {
    'use strict';

    xit('should work according to the original test suite', function (done) {

        var hrefs = [
            "/A",
            "/B",
            "/C",
            "/D1",
            "/D2",
            "/E/params/1/parse",
            "/E/params/2/parse",
            "/E/params/3/check",
            "/F",
            "/G",
            "/H",
            "/H/10",
            "/H/10/20"
        ];

        var index = 0;
        var timer = null;

        var result = '';

        function update(str) {
            result += ((result === "") ? "" : "::") + str;
        }

        function run_route() {
            if (index <= hrefs.length) {
                if (index === hrefs.length) {
                    window.history.go(-1);
                } else {
                    Path.history.pushState({}, "", hrefs[index]);
                }
                index += 1;
            } else {

                clearInterval(timer);

                expect(result).toEqual('A[enter]::A[action]::A[exit]::B[enter]::B[action]::C[action]::C[exit]::RESCUE::RESCUE::E[enter](parse)::E[action](parse id=1)::E[enter](parse)::E[action](parse id=2)::E[action](check id=3)::E[exit](check)::F[enter]::F[action]::G[enter 1]::G[enter 2]::G[enter 3]::G[enter 4]::H(one=N/A, two=N/A)::H(one=10, two=N/A)::H(one=10, two=20)::H(one=10, two=N/A)');

                done();

            }
        }

        function define_routes() {
            Path.map("/A").enter(function () {
                update("A[enter]");
            }).to(function () {
                    update("A[action]");
                }).exit(function () {
                    update("A[exit]");
                });

            Path.map("/B").to(function () {
                update("B[action]");
            });

            Path.map("/B").enter(function () {
                update("B[enter]");
            });

            Path.map("/C").to(function () {
                update("C[action]");
            }).exit(function () {
                    update("C[exit]");
                });

            // No map for /D1 or /D2.  This checks that our rescue method works, and works multiple times in succession.

            Path.map("/E/params/:id/parse").to(function () {
                update("E[action](parse id=" + this.params['id'] + ")");
            });

            Path.map("/E/params/:id/parse").enter(function () {
                update("E[enter](parse)");
            });

            Path.map("/E/params/:id/check").to(function () {
                update("E[action](check id=" + this.params['id'] + ")");
            });

            Path.map("/E/params/:id/check").exit(function () {
                update("E[exit](check)");
            });

            Path.map("/F").enter(function () {
                update("F[enter]");
            }).to(function () {
                    update("F[action]");
                });

            Path.map("/G").enter(function () {
                update("G[enter 1]");
            }).enter(function () {
                    update("G[enter 2]");
                }).enter([
                    function () {
                        update("G[enter 3]");
                    },
                    function () {
                        update("G[enter 4]");
                        return false;
                    }
                ]).to(function () {
                    update("G[action - NOT HIT]");
                });

            Path.map("/H(/:id_one)(/:id_two)").to(function () {
                var id_one = this.params["id_one"] || "N/A";
                var id_two = this.params["id_two"] || "N/A";
                update("H(one=" + id_one + ", two=" + id_two + ")");
            });

            Path.rescue(function () {
                update("RESCUE");
            });

            Path.history.listen();

            timer = setInterval(run_route, 100);
        }

        define_routes();

    });

});