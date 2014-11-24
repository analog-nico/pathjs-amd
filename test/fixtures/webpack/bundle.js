/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	window.PathWP = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* global define */
	;(function (root, factory) {
	    'use strict';
	    if (true) {
	        // AMD
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (exports) {
	            factory(exports);
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === 'object') {
	        // CommonJS Modules/1.0
	        factory(exports);
	    } else {
	        // Global variable Path
	        factory((root.Path = {}));
	    }
	}(this, function (exports) {
	    'use strict';

	    var Path = exports;

	    Path.version = '0.9.1';

	    Path.map = function (path) {
	        if (Path.routes.defined.hasOwnProperty(path)) {
	            return Path.routes.defined[path];
	        } else {
	            return new Path.core.route(path);
	        }
	    };

	    Path.root = function (path) {
	        Path.routes.root = path;
	    };

	    Path.rescue = function (fn) {
	        Path.routes.rescue = fn;
	    };

	    Path.history = {
	        'initial': {}, // Empty container for "Initial Popstate" checking variables.
	        'pushState': function (state, title, path) {
	            if (Path.history.supported) {
	                if (Path.dispatch(path)) {
	                    history.pushState(state, title, path);
	                }
	            } else {
	                if (Path.history.fallback) {
	                    window.location.hash = "#" + path;
	                }
	            }
	        },
	        'popState': function (event) {
	            var initialPop = !Path.history.initial.popped && location.href === Path.history.initial.URL;
	            Path.history.initial.popped = true;
	            if (initialPop) {
	                return;
	            }
	            Path.dispatch(document.location.pathname);
	        },
	        'listen': function (fallback) {
	            Path.history.supported = !!(window.history && window.history.pushState);
	            Path.history.fallback = fallback;

	            if (Path.history.supported) {
	                Path.history.initial.popped = (('state' in window.history) ? true : false);
	                Path.history.initial.URL = location.href;
	                window.onpopstate = Path.history.popState;
	            } else {
	                if (Path.history.fallback) {
	                    for (var route in Path.routes.defined) {
	                        if (route.charAt(0) !== "#") {
	                            Path.routes.defined["#" + route] = Path.routes.defined[route];
	                            Path.routes.defined["#" + route].path = "#" + route;
	                        }
	                    }
	                    Path.listen();
	                }
	            }
	        }
	    };

	    Path.match = function (path, parameterize) {
	        var params = {}, route = null, possible_routes, slice, i, j, compare;
	        for (route in Path.routes.defined) {
	            if (route !== null && route !== undefined) {
	                route = Path.routes.defined[route];
	                possible_routes = route.partition();
	                for (j = 0; j < possible_routes.length; j+=1) {
	                    slice = possible_routes[j];
	                    compare = path;
	                    if (slice.search(/:/) > 0) {
	                        for (i = 0; i < slice.split("/").length; i+=1) {
	                            if ((i < compare.split("/").length) && (slice.split("/")[i].charAt(0) === ":")) {
	                                params[slice.split('/')[i].replace(/:/, '')] = compare.split("/")[i];
	                                compare = compare.replace(compare.split("/")[i], slice.split("/")[i]);
	                            }
	                        }
	                    }
	                    if (slice === compare) {
	                        if (parameterize) {
	                            route.params = params;
	                        }
	                        return route;
	                    }
	                }
	            }
	        }
	        return null;
	    };

	    Path.dispatch = function (passed_route) {
	        var previous_route, matched_route;
	        if (Path.routes.current !== passed_route) {
	            Path.routes.previous = Path.routes.current;
	            Path.routes.current = passed_route;
	            matched_route = Path.match(passed_route, true);

	            if (Path.routes.previous) {
	                previous_route = Path.match(Path.routes.previous);
	                if (previous_route !== null && previous_route.do_exit !== null) {
	                    previous_route.do_exit();
	                }
	            }

	            if (matched_route !== null) {
	                matched_route.run();
	                return true;
	            } else {
	                if (Path.routes.rescue !== null) {
	                    Path.routes.rescue();
	                }
	            }
	        }
	    };

	    Path.listen = function () {
	        var fn = function () {
	            Path.dispatch(location.hash);
	        };

	        if (location.hash === "") {
	            if (Path.routes.root !== null) {
	                location.hash = Path.routes.root;
	            }
	        }

	        // The 'document.documentMode' checks below ensure that PathJS fires the right events
	        // even in IE "Quirks Mode".
	        if ("onhashchange" in window && (!document.documentMode || document.documentMode >= 8)) {
	            window.onhashchange = fn;
	        } else {
	            setInterval(fn, 50);
	        }

	        if (location.hash !== "") {
	            Path.dispatch(location.hash);
	        }
	    };

	    Path.core = {
	        'route': function (path) {
	            this.path = path;
	            this.action = null;
	            this.do_enter = [];
	            this.do_exit = null;
	            this.params = {};
	            Path.routes.defined[path] = this;
	        }
	    };

	    Path.routes = {
	        'current': null,
	        'root': null,
	        'rescue': null,
	        'previous': null,
	        'defined': {}
	    };

	    Path.core.route.prototype = {
	        'to': function (fn) {
	            this.action = fn;
	            return this;
	        },
	        'enter': function (fns) {
	            if (fns instanceof Array) {
	                this.do_enter = this.do_enter.concat(fns);
	            } else {
	                this.do_enter.push(fns);
	            }
	            return this;
	        },
	        'exit': function (fn) {
	            this.do_exit = fn;
	            return this;
	        },
	        'partition': function () {
	            var parts = [], options = [], re = /\(([^}]+?)\)/g, text, i;
	            while ((text = re.exec(this.path))) {
	                parts.push(text[1]);
	            }
	            options.push(this.path.split("(")[0]);
	            for (i = 0; i < parts.length; i+=1) {
	                options.push(options[options.length - 1] + parts[i]);
	            }
	            return options;
	        },
	        'run': function () {
	            var halt_execution = false, i, result, previous;

	            if (Path.routes.defined[this.path].hasOwnProperty("do_enter")) {
	                if (Path.routes.defined[this.path].do_enter.length > 0) {
	                    for (i = 0; i < Path.routes.defined[this.path].do_enter.length; i+=1) {
	                        result = Path.routes.defined[this.path].do_enter[i].apply(this, null);
	                        if (result === false) {
	                            halt_execution = true;
	                            break;
	                        }
	                    }
	                }
	            }
	            if (!halt_execution) {
	                Path.routes.defined[this.path].action();
	            }
	        }
	    };

	}));


/***/ }
/******/ ])