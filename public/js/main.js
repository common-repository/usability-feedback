var _realTimeFeedback = (function () {
    'use strict';

    var startRealTimeFeedbackEnabled = true;

    function disableRealTimeFeedback() {
        startRealTimeFeedbackEnabled = false;
    }

    function processCSS(cssObj) {
        var css = '';

        Object.keys(cssObj).forEach(function (key) {
            css += key + ' {';

            Object.keys(cssObj[key]).forEach(function (key2) {
                css += key2 + ': ' + cssObj[key][key2] + ';';
            });

            css += '}';
        });

        return css;
    }

    // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript?answertab=votes#tab-top
    function randomId() {
        var token = Date.now().toString(36) + performance.now().toString(36).replace('.', '');

        token = token.substr(0, 18);

        // keep randomId to have exactly 24 characters
        for (var i = 0, len = 24 - token.length; i < len; i += 1) {
            token += Math.floor(Math.random() * 36).toString(36);
        }

        return token;
    }

    function addEvent(event, elems, callback) {
        for (var i = elems.length; i--;) {
            elems[i].addEventListener(event, callback, false);
        }
    }

    function removeEvent(event, elems, callback) {
        for (var i = elems.length; i--;) {
            elems[i].removeEventListener(event, callback);
        }
    }

    function templateEngine(template, data) {
        var re = /\${(.*?)}/g;
        var match = void 0;

        while (match = re.exec(template)) {
            template = template.replace(match[0], data[match[1]]);
        }

        return template;
    }

    // Calculate a string representation of a node's DOM path.
    // https://stackoverflow.com/questions/11547672/how-to-stringify-event-object
    // https://davecardwell.co.uk/javascript/jquery/plugins/jquery-getpath/jquery-getpath.js
    // http://jsfiddle.net/gaby/zhnr198y/
    function htmlPath(node) {
        if (!node || !node.outerHTML) {
            return '';
        }

        var path = [];
        var firstElement = true;

        while (node.parentNode) {
            var name = node.nodeName;

            if (!name) {
                break;
            }

            var obj = {
                name: name.toLowerCase(),
                cls: node.getAttribute('class') || '',
                id: node.getAttribute('id') || '',
                nthChild: 0
            };

            if (firstElement) {
                obj.text = node.textContent.trim().substr(0, 30);
                obj.nameAttribute = node.getAttribute('name') || '';
                firstElement = false;
            }

            // get nth-child
            var parent = node.parentNode;
            if (parent.children && parent.children.length > 0) {
                for (var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i] === node) {
                        obj.nthChild = i + 1;
                    }
                }
            }

            path.push(obj);

            node = parent;
        }

        if (path.length === 0) {
            return '';
        }

        var pathSelector = '';

        path.forEach(function (_ref, index) {
            var name = _ref.name;

            if (name === 'html') return;
            pathSelector = index === 0 ? name : name + ' > ' + pathSelector;
        });

        var cls = path[0].cls.trim();
        pathSelector += cls ? '. ' + cls.split(' ').filter(Boolean).join('.') : '';

        var id = path[0].id.trim();
        pathSelector += id ? '#' + id : '';

        var text = path[0].text.trim();
        pathSelector += text ? '|' + text : '';

        return pathSelector;
    }

    function getPage() {
        return window.location.href.replace(window.location.origin, '');
    }

    var userAgent = {
        get browser() {
            if (this.browserCache) {
                return this.browserCache;
            }

            var browser = [{
                name: 'Aol',
                rule: /AOLShield\/([0-9\._]+)/
            }, {
                name: 'Edge',
                rule: /Edge\/([0-9\._]+)/
            }, {
                name: 'Yandexbrowser',
                rule: /YaBrowser\/([0-9\._]+)/
            }, {
                name: 'Vivaldi',
                rule: /Vivaldi\/([0-9\.]+)/
            }, {
                name: 'Kakaotalk',
                rule: /KAKAOTALK\s([0-9\.]+)/
            }, {
                name: 'Samsung',
                rule: /SamsungBrowser\/([0-9\.]+)/
            }, {
                name: 'Chrome',
                rule: /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/
            }, {
                name: 'Phantomjs',
                rule: /PhantomJS\/([0-9\.]+)(:?\s|$)/
            }, {
                name: 'Crios',
                rule: /CriOS\/([0-9\.]+)(:?\s|$)/
            }, {
                name: 'Firefox',
                rule: /Firefox\/([0-9\.]+)(?:\s|$)/
            }, {
                name: 'Fxios',
                rule: /FxiOS\/([0-9\.]+)/
            }, {
                name: 'Opera',
                rule: /Opera\/([0-9\.]+)(?:\s|$)/
            }, {
                name: 'Opera',
                rule: /OPR\/([0-9\.]+)(:?\s|$)$/
            }, {
                name: 'IE',
                rule: /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/
            }, {
                name: 'IE',
                rule: /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/
            }, {
                name: 'IE',
                rule: /MSIE\s(7\.0)/
            }, {
                name: 'BB10',
                rule: /BB10;\sTouch.*Version\/([0-9\.]+)/
            }, {
                name: 'Android',
                rule: /Android\s([0-9\.]+)/
            }, {
                name: 'iOS',
                rule: /Version\/([0-9\._]+).*Mobile.*Safari.*/
            }, {
                name: 'Safari',
                rule: /Version\/([0-9\._]+).*Safari/
            }, {
                name: 'Facebook',
                rule: /FBAV\/([0-9\.]+)/
            }, {
                name: 'Instagram',
                rule: /Instagram\ ([0-9\.]+)/
            }, {
                name: 'iOS-webview',
                rule: /AppleWebKit\/([0-9\.]+).*Mobile/
            }];
            var userAgentString = window.navigator.userAgent;
            for (var i = 0; i < browser.length; i++) {
                var match = browser[i].rule.exec(userAgentString);

                if (match) {
                    var version = parseInt(match[1], 10);

                    this.browserCache = '' + browser[i].name + (version ? ' ' + version : '');

                    return this.browserCache;
                }
            }

            this.browserCache = 'Unknown';

            return this.browserCache;
        },

        get os() {
            if (this.osCache) {
                return this.osCache;
            }

            var os = [{
                name: 'iOS',
                rule: /iP(hone|od|ad)/
            }, {
                name: 'Android OS',
                rule: /Android/
            }, {
                name: 'BlackBerry OS',
                rule: /BlackBerry|BB10/
            }, {
                name: 'Windows Mobile',
                rule: /IEMobile/
            }, {
                name: 'Amazon OS',
                rule: /Kindle/
            }, {
                name: 'Windows 3.11',
                rule: /Win16/
            }, {
                name: 'Windows 95',
                rule: /(Windows 95)|(Win95)|(Windows_95)/
            }, {
                name: 'Windows 98',
                rule: /(Windows 98)|(Win98)/
            }, {
                name: 'Windows 2000',
                rule: /(Windows NT 5.0)|(Windows 2000)/
            }, {
                name: 'Windows XP',
                rule: /(Windows NT 5.1)|(Windows XP)/
            }, {
                name: 'Windows Server 2003',
                rule: /(Windows NT 5.2)/
            }, {
                name: 'Windows Vista',
                rule: /(Windows NT 6.0)/
            }, {
                name: 'Windows 7',
                rule: /(Windows NT 6.1)/
            }, {
                name: 'Windows 8',
                rule: /(Windows NT 6.2)/
            }, {
                name: 'Windows 8.1',
                rule: /(Windows NT 6.3)/
            }, {
                name: 'Windows 10',
                rule: /(Windows NT 10.0)/
            }, {
                name: 'Windows ME',
                rule: /Windows ME/
            }, {
                name: 'Open BSD',
                rule: /OpenBSD/
            }, {
                name: 'Sun OS',
                rule: /SunOS/
            }, {
                name: 'Linux',
                rule: /(Linux)|(X11)/
            }, {
                name: 'Mac OS',
                rule: /(Mac_PowerPC)|(Macintosh)/
            }, {
                name: 'QNX',
                rule: /QNX/
            }, {
                name: 'BeOS',
                rule: /BeOS/
            }, {
                name: 'OS/2',
                rule: /OS\/2/
            }];

            var userAgentString = window.navigator.userAgent;
            for (var i = 0; i < os.length; i++) {
                if (os[i].rule.test(userAgentString)) {
                    this.osCache = os[i].name;

                    return this.osCache;
                }
            }

            this.osCache = 'Unknown';

            return this.osCache;
        },

        get resolution() {
            return window.screen.width + 'x' + window.screen.height;
        }
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    var slicedToArray = function () {
      function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);

            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"]) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }

        return _arr;
      }

      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr;
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i);
        } else {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
      };
    }();

    if (Object.prototype.toString.call(window._realTimeFeedback) === '[object Object]') {
        throw new Error('--> realTimeFeedback script is already included on this page.');
    }

    // check if localStorage is available
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Feature-detecting_localStorage
    try {
        var storage = window.localStorage;

        if (!storage.getItem('realTimeFeedback')) {
            var x = '_realTimeFeedback_test_';
            storage.setItem(x, x);
            storage.removeItem(x);
        }
    } catch (err) {
        disableRealTimeFeedback();
    }

    /** this will remove
      *     - ie < 10
      *     - android < 4.4
      *     - ios < 7.0
      */
    if (!window.requestAnimationFrame) {
        disableRealTimeFeedback();
    }

    // @todo - don't pollute the global space
    // https://github.com/taylorhakes/promise-polyfill
    if (!window.Promise) {
        var noop = function noop() {};

        // Polyfill for Function.prototype.bind


        var bind = function bind(fn, thisArg) {
            return function () {
                fn.apply(thisArg, arguments);
            };
        };

        var _Promise = function _Promise(fn) {
            if (_typeof(this) !== 'object') throw new TypeError('Promises must be constructed via new');
            if (typeof fn !== 'function') throw new TypeError('not a function');
            this._state = 0;
            this._handled = false;
            this._value = undefined;
            this._deferreds = [];

            doResolve(fn, this);
        };

        var handle = function handle(self, deferred) {
            while (self._state === 3) {
                self = self._value;
            }
            if (self._state === 0) {
                self._deferreds.push(deferred);
                return;
            }
            self._handled = true;
            _Promise._immediateFn(function () {
                var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
                if (cb === null) {
                    (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                    return;
                }
                var ret;
                try {
                    ret = cb(self._value);
                } catch (e) {
                    reject(deferred.promise, e);
                    return;
                }
                resolve(deferred.promise, ret);
            });
        };

        var resolve = function resolve(self, newValue) {
            try {
                // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
                if (newValue && ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) === 'object' || typeof newValue === 'function')) {
                    var then = newValue.then;
                    if (newValue instanceof _Promise) {
                        self._state = 3;
                        self._value = newValue;
                        finale(self);
                        return;
                    } else if (typeof then === 'function') {
                        doResolve(bind(then, newValue), self);
                        return;
                    }
                }
                self._state = 1;
                self._value = newValue;
                finale(self);
            } catch (e) {
                reject(self, e);
            }
        };

        var reject = function reject(self, newValue) {
            self._state = 2;
            self._value = newValue;
            finale(self);
        };

        var finale = function finale(self) {
            if (self._state === 2 && self._deferreds.length === 0) {
                _Promise._immediateFn(function () {
                    if (!self._handled) {
                        _Promise._unhandledRejectionFn(self._value);
                    }
                });
            }

            for (var i = 0, len = self._deferreds.length; i < len; i++) {
                handle(self, self._deferreds[i]);
            }
            self._deferreds = null;
        };

        var Handler = function Handler(onFulfilled, onRejected, promise) {
            this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
            this.onRejected = typeof onRejected === 'function' ? onRejected : null;
            this.promise = promise;
        };

        /**
             * Take a potentially misbehaving resolver function and make sure
             * onFulfilled and onRejected are only called once.
             *
             * Makes no guarantees about asynchrony.
             */


        var doResolve = function doResolve(fn, self) {
            var done = false;
            try {
                fn(function (value) {
                    if (done) return;
                    done = true;
                    resolve(self, value);
                }, function (reason) {
                    if (done) return;
                    done = true;
                    reject(self, reason);
                });
            } catch (ex) {
                if (done) return;
                done = true;
                reject(self, ex);
            }
        };

        // Store setTimeout reference so promise-polyfill will be unaffected by
        // other code modifying setTimeout (like sinon.useFakeTimers())
        var setTimeoutFunc = setTimeout;

        _Promise.prototype['catch'] = function (onRejected) {
            return this.then(null, onRejected);
        };

        _Promise.prototype.then = function (onFulfilled, onRejected) {
            var prom = new this.constructor(noop);

            handle(this, new Handler(onFulfilled, onRejected, prom));
            return prom;
        };

        _Promise.all = function (arr) {
            var args = Array.prototype.slice.call(arr);

            return new _Promise(function (resolve, reject) {
                if (args.length === 0) return resolve([]);
                var remaining = args.length;

                function res(i, val) {
                    try {
                        if (val && ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                                then.call(val, function (val) {
                                    res(i, val);
                                }, reject);
                                return;
                            }
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    } catch (ex) {
                        reject(ex);
                    }
                }

                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        };

        _Promise.resolve = function (value) {
            if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === _Promise) {
                return value;
            }

            return new _Promise(function (resolve) {
                resolve(value);
            });
        };

        _Promise.reject = function (value) {
            return new _Promise(function (resolve, reject) {
                reject(value);
            });
        };

        _Promise.race = function (values) {
            return new _Promise(function (resolve, reject) {
                for (var i = 0, len = values.length; i < len; i++) {
                    values[i].then(resolve, reject);
                }
            });
        };

        // Use polyfill for setImmediate for performance gains
        _Promise._immediateFn = typeof setImmediate === 'function' && function (fn) {
            setImmediate(fn);
        } || function (fn) {
            setTimeoutFunc(fn, 0);
        };

        _Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
            if (typeof console !== 'undefined' && console) {
                console.log('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
            }
        };

        /**
             * Set the immediate function to execute callbacks
             * @param fn {function} Function to execute
             * @deprecated
             */
        _Promise._setImmediateFn = function _setImmediateFn(fn) {
            _Promise._immediateFn = fn;
        };

        /**
             * Change the function to execute on unhandled rejection
             * @param {function} fn Function to execute on unhandled rejection
             * @deprecated
             */
        _Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
            _Promise._unhandledRejectionFn = fn;
        };

        window.Promise = _Promise;
    }

    // http://stackoverflow.com/a/37458029
    if (!Object.entries) {
        Object.entries = function (x) {
            return Object.keys(x).reduce(function (y, z) {
                return y.push([z, x[z]]) && y;
            }, []);
        };
    }

    // https://stackoverflow.com/questions/7306669/how-to-get-all-properties-values-of-a-javascript-object-without-knowing-the-key
    if (!Object.values) {
        Object.values = function (obj) {
            return Object.keys(obj).map(function (key) {
                return obj[key];
            });
        };
    }

    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, 'includes', {
            value: function value(searchElement, fromIndex) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If len is 0, return false.
                if (len === 0) {
                    return false;
                }

                // 4. Let n be ? ToInteger(fromIndex).
                //    (If fromIndex is undefined, this step produces the value 0.)
                var n = fromIndex | 0;

                // 5. If n ≥ 0, then
                //  a. Let k be n.
                // 6. Else n < 0,
                //  a. Let k be len + n.
                //  b. If k < 0, let k be 0.
                var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

                function sameValueZero(x, y) {
                    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
                }

                // 7. Repeat, while k < len
                while (k < len) {
                    // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                    // b. If SameValueZero(searchElement, elementK) is true, return true.
                    // c. Increase k by 1.
                    if (sameValueZero(o[k], searchElement)) {
                        return true;
                    }
                    k++;
                }

                // 8. Return false
                return false;
            }
        });
    }

    // https://developer.mozilla.org/ro/docs/Web/API/Element/matches
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    if (!window.performance) {
        window.performance = {
            offset: Date.now(),
            now: function now() {
                return Date.now() - this.offset;
            }
        };
    }

    // fallback to requestAnimationFrame if requestIdleCallback doesn't exists
    window.requestIdleCallback = window.requestIdleCallback || window.requestAnimationFrame;

    // fix IE11 doesn't want to sync localStorage between tabs/windows
    // https://stackoverflow.com/questions/24077117/localstorage-in-win8-1-ie11-does-not-synchronize
    window.onstorage = function () {};

    var css = (function () {
        var cssElement = document.createElement('style');
        cssElement.type = 'text/css';
        cssElement.id = 'realTimeFeedback-custom-css';
        cssElement.innerHTML = '.realTimeFeedback,.realTimeFeedback *{box-sizing:border-box}.realTimeFeedback :focus{outline:none}.realTimeFeedback{will-change:transform, opacity}.realTimeFeedback-position-bottom{bottom:0}.realTimeFeedback-position-top{top:0}.realTimeFeedback-position-bottom-left{bottom:0;left:175px}.realTimeFeedback-position-bottom-right{bottom:0;right:175px}@media screen and (max-width: 700px){.realTimeFeedback-position-bottom-right{right:calc(50% - 175px)}.realTimeFeedback-position-bottom-left{left:calc(50% - 175px)}}@media screen and (max-width: 350px){.realTimeFeedback-position-bottom-right{right:0}.realTimeFeedback-position-bottom-left{left:0}}.realTimeFeedback-animation-fadeIn{-webkit-animation:realTimeFeedback-keyframes-fadeIn .7s ease-in-out both;animation:realTimeFeedback-keyframes-fadeIn .7s ease-in-out both}@-webkit-keyframes realTimeFeedback-keyframes-fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes realTimeFeedback-keyframes-fadeIn{0%{opacity:0}100%{opacity:1}}.realTimeFeedback-animation-slideUp{-webkit-animation:realTimeFeedback-keyframes-slideUp .7s ease-in-out both;animation:realTimeFeedback-keyframes-slideUp .7s ease-in-out both}@-webkit-keyframes realTimeFeedback-keyframes-slideUp{0%{-webkit-transform:translateY(150%)}100%{-webkit-transform:translateY(0)}}@keyframes realTimeFeedback-keyframes-slideUp{0%{transform:translateY(150%)}100%{transform:translateY(0)}}';
        document.head.appendChild(cssElement);
    });

    var events = {};

    function registerEvent(name, callback) {
        var oneTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (!events[name]) {
            events[name] = [];
        }

        // substract 1 to use for cancelEvent
        return events[name].push({ callback: callback, oneTime: oneTime }) - 1;
    }

    function cancelEvent(name, index) {
        if (!events[name] || index === undefined) {
            return;
        }

        events[name][index] = null;
    }

    function triggerEvent(name, param) {
        if (!events[name]) {
            return;
        }

        events[name].forEach(function (event, index) {
            if (event) {
                if (event.oneTime) {
                    cancelEvent(name, index);
                }

                event.callback.call(null, param);
            }
        });
    }

    var tabToken = new Date().toISOString() + ' - ' + performance.now();
    var storage$1 = void 0;

    function currentTab() {
        if (localStorage.getItem('realTimeFeedbackTab') !== tabToken) {
            triggerEvent('pauseWidget');
            return false;
        }

        return true;
    }

    // @todo - because I have multiple sources from where I can trigger saveStorage
    // I must combine them into one request as much as I can.
    function saveStorage() {
        if (!currentTab()) {
            return;
        }

        localStorage.setItem('realTimeFeedback', JSON.stringify(storage$1));
    }

    function storageReady() {
        if (!localStorage.getItem('realTimeFeedback')) {
            storage$1 = {
                version: 1,
                user: randomId(),
                workflows: {}
            };

            localStorage.setItem('realTimeFeedback', JSON.stringify(storage$1));
        } else {
            storage$1 = JSON.parse(localStorage.getItem('realTimeFeedback'));

            var storageVersion = parseInt(storage$1.version, 10);

            // deprecate area
            if (storageVersion !== 1) {
                storage$1.version = 1;
            }
        }

        // after the widget is stopped I set the new token on this tab
        localStorage.setItem('realTimeFeedbackTab', tabToken);
    }

    function saveToDB() {
        if (!currentTab()) {
            return;
        }

        var logs = [];

        var _storage = storage$1,
            workflows = _storage.workflows;


        Object.entries(workflows).forEach(function (_ref) {
            var _ref2 = slicedToArray(_ref, 2),
                workflow = _ref2[0],
                item = _ref2[1];

            item.forEach(function (data) {
                var log = {};

                if (data.done === 1) {
                    log.browser = userAgent.browser;
                    log.os = userAgent.os;
                    log.resolution = userAgent.resolution;
                    log.startData = data.start.data;

                    if (data.end) {
                        log.endData = data.end.data;
                    }

                    log.page = data.page;

                    log.target = data.target || '';

                    logs.push(log);

                    data.done = 2;
                }
            });
        });

        if (logs.length === 0) {
            return;
        }

        jQuery.post(window.ajaxurl, {
            action: 'savePoll',
            nonce: window._realTimeFeedbackAjax,
            data: logs
        });

        saveStorage();
    }

    var poll = function poll(_ref, storageData, event) {
        var html = _ref.html,
            css = _ref.css,
            data = _ref.data;

        var _this = this;

        classCallCheck(this, poll);

        console.log('\t poll - start');

        var node = storageData[event];

        if (!node) {
            storageData[event] = {
                done: 0,
                data: {
                    name: 'poll'
                }
            };

            node = storageData[event];

            saveStorage();
        }

        // verify if this node is finished
        if (node.done > 0) {
            console.log('\t poll - end from done');
            this.promise = null;

            return;
        }

        this.promise = new Promise(function (resolve, reject) {
            // insert CSS
            var cssElement = document.createElement('style');
            cssElement.type = 'text/css';
            cssElement.innerHTML = processCSS(css);

            document.head.appendChild(cssElement);

            var fragment = document.createElement('div');
            fragment.insertAdjacentHTML('beforeend', templateEngine(html, data));
            var poll = fragment.firstElementChild;

            // insert HTML when the browser is idle and animation can run smoothly
            requestIdleCallback(function () {
                document.body.appendChild(poll);
            }, { timeout: 2000 });

            var actions = poll.querySelectorAll('[data-realTimeFeedback-action]');
            addEvent('click', actions, closepoll);

            var textarea = poll.querySelector('.realTimeFeedback-poll-textarea');
            textarea.addEventListener('keyup', textareaChange, false);

            var sendButton = poll.querySelector('.realTimeFeedback-poll-button');

            sendButton.addEventListener('click', saveMessage, false);

            function closepoll(_ref2) {
                var currentTarget = _ref2.currentTarget;

                console.log('\t poll - end from promise');

                removeEvent('click', actions, closepoll);
                textarea.removeEventListener('keyup', textareaChange);

                var action = currentTarget.getAttribute('data-realTimeFeedback-action');

                node.done = 1;
                node.data.action = action;
                node.data.msg = textarea.value;
                node.data.email = poll.querySelector('.realTimeFeedback-poll-input').value;
                storageData.page = getPage();

                if (action === 'close') {
                    removePoll();
                }

                saveStorage();
                resolve();
            }

            function removePoll() {
                document.body.removeChild(poll);
                document.head.removeChild(cssElement);
            }

            function textareaChange() {
                if (textarea.value.length > 2) {
                    sendButton.classList.add('realTimeFeedback-poll-button--active');
                } else {
                    sendButton.classList.remove('realTimeFeedback-poll-button--active');
                }
            }

            var step2 = poll.querySelector('.realTimeFeedback-poll-step2');

            function saveMessage() {
                if (!sendButton.classList.contains('realTimeFeedback-poll-button--active')) {
                    return;
                }

                sendButton.removeEventListener('click', saveMessage);

                poll.querySelector('.realTimeFeedback-poll-step1').style.display = 'none';
                poll.querySelector('.realTimeFeedback-poll-close').style.display = 'none';
                step2.style.display = 'flex';

                step2.click();

                step2.querySelector('.realTimeFeedback-poll-button-close').addEventListener('click', function () {
                    return removePoll();
                }, false);
            }

            _this.cancel = function () {
                console.log('\t poll - cancel');

                removeEvent('click', actions, closepoll);

                document.body.removeChild(poll);
                document.head.removeChild(cssElement);

                delete storageData[event];

                saveStorage();
                reject();
            };
        });
    };

    var frustration = function frustration(_ref, storageData, event) {
        var name = _ref.name;

        var _this = this;

        classCallCheck(this, frustration);

        console.log('\t frustration - start');

        var node = storageData[event];

        if (!node) {
            storageData[event] = node = {
                done: 0,
                data: {
                    name: 'frustration'
                }
            };

            saveStorage();
        }

        // verify if this node is finished
        if (node.done > 0) {
            console.log('\t frustration - end from done');
            this.promise = null;

            return;
        }

        this.promise = new Promise(function (resolve, reject) {
            _this.cancel = function () {
                console.log('\t frustration - cancel');

                cancelEvent('scroll', eventIndex);

                delete storageData[event];

                saveStorage();
                reject();
            };

            var scrolls = [];
            var position = [];
            var edge = 0;

            var eventIndex = registerEvent('scroll', function (_ref2) {
                var time = _ref2.time,
                    pageYOffset = _ref2.pageYOffset;

                var _ref3 = position[0] || {},
                    _ref3$lastTime = _ref3.lastTime,
                    lastTime = _ref3$lastTime === undefined ? 0 : _ref3$lastTime,
                    _ref3$y = _ref3.y,
                    y = _ref3$y === undefined ? 0 : _ref3$y,
                    _ref3$direction = _ref3.direction,
                    direction = _ref3$direction === undefined ? '' : _ref3$direction;

                if (time - lastTime > 1000) {
                    console.log('%c \t reset from time', 'color: red; font-weight: bold;');

                    position = [{
                        lastTime: time,
                        y: pageYOffset,
                        direction: ''
                    }];

                    edge = 0;

                    scrolls = [];

                    return;
                }

                if (!direction) {
                    position.unshift({ lastTime: time, y: pageYOffset, direction: pageYOffset > y ? 'down' : 'up' });

                    return;
                }

                if (direction === 'down') {
                    if (pageYOffset < y) {
                        if (position.length > 3) {
                            edge++;
                            scrolls.push(position);
                        } else {
                            edge = 0;
                            scrolls = [];
                        }

                        position = [{
                            lastTime: time,
                            y: pageYOffset,
                            direction: 'up'
                        }];

                        console.log('%c \t reset from down || edge: ' + edge, 'color: red; font-weight: bold;');

                        return;
                    }

                    position.unshift({ lastTime: time, y: pageYOffset, direction: 'down' });
                } else if (direction === 'up') {
                    if (pageYOffset > y) {
                        if (position.length > 3) {
                            edge++;
                            scrolls.push(position);
                        } else {
                            edge = 0;
                            scrolls = [];
                        }

                        position = [{
                            lastTime: time,
                            y: pageYOffset,
                            direction: 'down'
                        }];

                        console.log('%c \t reset from up || edge: ' + edge, 'color: red; font-weight: bold;');

                        return;
                    }

                    position.unshift({ lastTime: time, y: pageYOffset, direction: 'up' });
                }

                if (edge === 5) {
                    console.log('\t frustration - end from promise');

                    cancelEvent('scroll', eventIndex);

                    node.done = 1;
                    storageData.page = getPage();

                    resolve();
                }
            });
        });
    };

    var rage = function rage(obj, storageData, event) {
        var _this = this;

        classCallCheck(this, rage);

        console.log('\t rage - start');

        var node = storageData[event];

        if (!node) {
            storageData[event] = node = {
                done: 0,
                data: {
                    name: 'rage'
                }
            };

            saveStorage();
        }

        // verify if this node is finished
        if (node.done > 0) {
            console.log('\t rage - end from done');
            this.promise = null;

            return;
        }

        this.promise = new Promise(function (resolve, reject) {
            _this.cancel = function () {
                console.log('\t rage - cancel');

                cancelEvent('bodyClick', eventIndex);

                delete storageData[event];

                saveStorage();
                reject();
            };

            var clicks = [{
                time: 0
            }, {
                time: 0
            }, {
                time: 0
            }];

            var stop = false;

            var eventIndex = registerEvent('bodyClick', function (_ref) {
                var time = _ref.time,
                    target = _ref.target,
                    pageX = _ref.pageX,
                    pageY = _ref.pageY;

                clicks.push({
                    time: time,
                    pageX: pageX,
                    pageY: pageY
                });

                // `stop` variable is used for analytics this behavior
                if (stop) {
                    return;
                }

                clicks.shift();

                var diffTime = clicks[clicks.length - 1].time - clicks[0].time;

                // threshold of 700ms
                if (diffTime < 700) {
                    console.log('\t rage (' + diffTime + ', ' + target + ') - end from promise');

                    node.done = 1;
                    storageData.page = getPage();
                    storageData.target = htmlPath(target);

                    stop = true;

                    // keep storing info for 10s for analytics
                    setTimeout(function () {
                        cancelEvent('bodyClick', eventIndex);
                    }, 10000);

                    resolve();
                }
            });
        });
    };

    var wastedClick = function wastedClick(obj, storageData, event) {
        var _this = this;

        classCallCheck(this, wastedClick);

        console.log('\t wastedClick - start');

        var node = storageData[event];

        if (!node) {
            storageData[event] = node = {
                done: 0,
                data: {
                    name: 'wastedClick',
                    wastedPages: []
                }
            };

            saveStorage();
        }

        // verify if this node is finished
        if (node.done > 0) {
            console.log('\t wastedClick - end from done');
            this.promise = null;

            return;
        }

        this.promise = new Promise(function (resolve, reject) {
            _this.cancel = function () {
                console.log('\t wastedClick - cancel');

                delete storageData[event];

                saveStorage();
                reject();
            };

            node.data.wastedPages.push({
                time: Date.now(),
                page: getPage()
                // @todo - add target for second page
            });

            if (node.data.wastedPages.length >= 3) {
                node.data.wastedPages = node.data.wastedPages.slice(-3);

                var _node$data$wastedPage = slicedToArray(node.data.wastedPages, 3),
                    x = _node$data$wastedPage[0],
                    y = _node$data$wastedPage[1],
                    z = _node$data$wastedPage[2];

                if (x.page !== y.page && x.page === z.page && z.time - x.time < 10000) {
                    console.log('\t wastedClick - end from promise');

                    node.done = 1;
                    storageData.page = getPage();

                    resolve();
                }
            }

            saveStorage();
        });
    };

    // hack to include all events because treeshake doesn't include the files without reference
    // remove this in future to have svelte builds for every user
    var nodesObj = {
        poll: poll,
        frustration: frustration,
        rage: rage,
        wastedClick: wastedClick
    };

    var pollData = {
        html: '<div class="realTimeFeedback realTimeFeedback-poll realTimeFeedback-animation-${animation} realTimeFeedback-position-${position}">\n            <div class="realTimeFeedback-poll-body">\n                <div class="realTimeFeedback-poll-step1">\n                    <div class="realTimeFeedback-poll-title">${title}</div>\n                    <textarea class="realTimeFeedback-poll-textarea" rows="5" placeholder="Type here your message..."></textarea>\n                    <input type="email" class="realTimeFeedback-poll-input" placeholder="Enter email for a response (optional)" />\n                    <div class="realTimeFeedback-button realTimeFeedback-poll-button">${actionText}</div>\n                </div>\n                <div class="realTimeFeedback-poll-step2" data-realTimeFeedback-action="next">\n                    <div class="realTimeFeedback-poll-title">${thanks}</div>\n                    <div class="realTimeFeedback-button realTimeFeedback-poll-button-close">${thanksButton}</div>\n                </div>\n            </div>\n            <div class="realTimeFeedback-poll-close" data-realTimeFeedback-action="close">\n                <svg height="11" width="11" xmlns="http://www.w3.org/2000/svg">\n                    <line x1="0" y1="11" x2="11" y2="0" stroke-width="2"/>\n                    <line x1="0" y1="0" x2="11" y2="11" stroke-width="2"/>\n                </svg>\n            </div>\n        </div>',
        css: {
            '.realTimeFeedback-poll': {
                'border-radius': '4px 5px 0 0',
                'z-index': 2147483647,
                background: 'rgb(60, 60, 60)',
                position: 'fixed',
                'max-width': '350px',
                width: '100%',
                'box-shadow': '0 0 14px 3px rgba(0, 0, 0, 0.38)',
                'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
                'font-weight': 400,
                'line-height': 1.4,
                color: 'rgb(255, 255, 255)'
            },
            '.realTimeFeedback-poll-body': {
                margin: '18px 13px 18px 13px'
            },
            '.realTimeFeedback-poll-step1': {
                display: 'flex',
                'flex-direction': 'column'
            },
            '.realTimeFeedback-poll-title': {
                'max-width': '100%',
                'text-align': 'center',
                margin: '0 0 12px',
                padding: '0 20px',
                'font-size': '15px',
                'align-self': 'center'
            },
            '.realTimeFeedback-poll textarea.realTimeFeedback-poll-textarea': {
                color: '#585858',
                background: '#fff',
                'font-family': 'inherit',
                'font-size': '13px',
                'line-height': 'inherit',
                'font-weight': 'inherit',
                padding: '9px 10px',
                resize: 'none',
                width: '100%',
                border: '1px solid #3c3c3c',
                'border-radius': '4px'
            },
            '.realTimeFeedback-poll input.realTimeFeedback-poll-input': {
                color: '#585858',
                background: '#fff',
                width: '100%',
                padding: '0 10px',
                margin: '5px 0 0 0',
                border: '1px solid #3c3c3c',
                'font-family': 'inherit',
                'font-size': '13px',
                'line-height': 'inherit',
                'font-weight': 'inherit',
                height: '36px',
                'border-radius': '4px'
            },
            '.realTimeFeedback-poll-button': {
                '-webkit-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                'user-select': 'none',
                'text-align': 'center',
                cursor: 'default',
                color: 'rgba(255, 255, 255, 0.25)',
                padding: '10px 18px',
                background: '#545454',
                'border-radius': '4px',
                'font-size': '13px',
                margin: '18px 1px 0 0',
                transition: 'background .3s, color .3s',
                'align-self': 'flex-end'
            },
            '.realTimeFeedback-poll-button--active': {
                cursor: 'pointer',
                color: '#fff',
                background: '#2b882b'
            },
            '.realTimeFeedback-poll-step2': {
                display: 'none',
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center',
                padding: '12px 0 6px'
            },
            '.realTimeFeedback-poll-button-close': {
                cursor: 'pointer',
                padding: '10px 18px',
                background: '#616161',
                color: '#fff',
                'border-radius': '4px',
                'font-size': '13px',
                margin: '5px 0 0 0'
            },
            '.realTimeFeedback-poll-button-close:hover': {
                opacity: 0.9
            },
            '.realTimeFeedback-poll-button--active:hover': {
                opacity: 0.9
            },
            '.realTimeFeedback-poll-close': {
                display: 'flex',
                position: 'absolute',
                right: '8px',
                top: '8px',
                padding: '5px',
                cursor: 'pointer',
                stroke: '#888'
            },
            '.realTimeFeedback-poll-close:hover': {
                stroke: '#ccc'
            }
        },
        data: {
            position: 'bottom-left',
            animation: 'slideUp',
            title: 'Would love to hear your feedback!',
            actionText: 'Send Message',
            thanks: 'Thank you for answering this poll. Your feedback is appreciated!',
            thanksButton: 'Close'
        },
        name: 'poll'
    };

    var options = {
        workflows: {
            'rageclicks-poll': {
                start: {
                    name: 'rage'
                },
                end: pollData
            },
            'wastedClick-poll': {
                start: {
                    name: 'wastedClick'
                },
                end: pollData
            },
            'frustration-poll': {
                start: {
                    name: 'frustration'
                },
                end: pollData
            }
        }
    };

    function editPoll(_ref) {
        var position = _ref.position,
            animation = _ref.animation,
            title = _ref.title,
            actionText = _ref.actionText,
            thanks = _ref.thanks,
            thanksButton = _ref.thanksButton,
            background = _ref.background,
            font = _ref.font,
            color = _ref.color;

        pollData.data.position = position;
        pollData.data.animation = animation;
        pollData.data.title = title;
        pollData.data.actionText = actionText;
        pollData.data.thanks = thanks;
        pollData.data.thanksButton = thanksButton;
        pollData.css['.realTimeFeedback-poll'].background = background;
        pollData.css['.realTimeFeedback-poll']['font-family'] = font;
        pollData.css['.realTimeFeedback-poll'].color = color;
    }

    var Workflow = function () {
        function Workflow(id, opts) {
            classCallCheck(this, Workflow);

            console.log('workflow - start [' + id + ']');

            this.id = id;
            this.opts = opts;

            if (!opts.start.name && !opts.end.name) {
                console.log('workflow - finished with no trigger and action');
                return;
            }

            this.storageWorkflow = storage$1.workflows[id];

            if (!this.storageWorkflow) {
                this.storageWorkflow = storage$1.workflows[id] = [{
                    done: 0
                }];

                saveStorage();
            }

            this.run();
        }

        createClass(Workflow, [{
            key: 'run',
            value: function run() {
                var _this = this;

                this.storageData = this.storageWorkflow[this.storageWorkflow.length - 1];

                Promise.resolve(this.processEvent('start')).then(this.processEvent.bind(this, 'end')).then(function () {
                    // put it to null so is save for stop fn to run safetly
                    _this.nodeInstance = null;

                    _this.storageData.done = 1;

                    console.log('workflow - end');

                    _this.storageWorkflow.push({
                        done: 0
                    });

                    saveToDB();

                    saveStorage();

                    _this.run();
                }).catch(function (err) {
                    _this.stop();

                    // put it to null so is ok for stop fn to run safetly
                    _this.nodeInstance = null;

                    console.log('catch run', err);
                });
            }
        }, {
            key: 'processEvent',
            value: function processEvent(event) {
                var optionsEvent = this.opts[event];

                if (optionsEvent.name) {
                    this.nodeInstance = new nodesObj[optionsEvent.name](optionsEvent, this.storageData, event);

                    return this.nodeInstance.promise;
                }
            }
        }, {
            key: 'stop',
            value: function stop() {
                // basically, if nodeInstance is truthy, there is a cancel method on it
                if (this.nodeInstance) {
                    this.nodeInstance.cancel();
                }
            }
        }]);
        return Workflow;
    }();

    var workflows = [];

    function startWorkflow() {
        console.log('workflows - start');
        Object.entries(options.workflows).forEach(function (_ref) {
            var _ref2 = slicedToArray(_ref, 2),
                id = _ref2[0],
                opts = _ref2[1];

            workflows.push(new Workflow(id, opts));
        });
    }

    function stopWorkflow() {
        console.log('workflows - stop');

        workflows.forEach(function (workflow) {
            workflow.stop();
        });

        workflows = [];
    }

    var stopStart = false;
    var body = document.body;
    var documentElement = document.documentElement;

    function startListener() {
        if (stopStart) {
            return;
        }

        // add global click event for all widget
        body.addEventListener('click', function (e) {
            var target = e.target;
            var parent = target.parentNode;
            var grandParent = parent ? parent.parentNode : null;

            triggerEvent('bodyClick', {
                e: e,
                target: target,
                parent: parent,
                grandParent: grandParent,
                time: Date.now(),
                pageX: e.pageX,
                pageY: e.pageY
            });

            saveStorage();
        });

        var ticking = false;
        window.addEventListener('scroll', function (e) {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    // @todo - add resize event to update scrollHeight & clientHeight only on demand
                    triggerEvent('scroll', {
                        e: e,
                        time: Date.now(),
                        pageYOffset: window.pageYOffset,
                        scrollHeight: body.scrollHeight,
                        clientHeight: documentElement.clientHeight
                    });

                    saveStorage();

                    ticking = false;
                });

                ticking = true;
            }
        });
    }

    function stopListener() {
        stopStart = true;
    }

    function push(_ref) {
        var _ref2 = slicedToArray(_ref, 2),
            type = _ref2[0],
            param = _ref2[1];

        if (type === 'poll-data') {
            editPoll(param);
        }
    }

    function addFocusEvent() {
        window.addEventListener('focus', function () {
            console.log('tab got focus 1');

            if (currentTab()) {
                return;
            }

            console.log('tab got focus 2');

            // @todo - on ios / macos the focus is possible to be triggered two times in a row
            // verify if everything works fine with that
            // also check on android for this issue

            // @todo - don't tear down all of the nodes I've done so far from the start event,
            // but create a resume state for nodes. there is a bug (poll and notifiction most visible)
            // when I go from
            // first tab to the second tab and I focus with a click on the x button (from poll or notification) the all node
            // is recreate and the click on that button doesn't count because first I have to stop everything
            // and then I have to start again the node
            // eslint-disable-next-line
            runReady();
        });
    }

    function runReady() {
        var addFocus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        storageReady();

        // add focus event after the storage is ready
        if (addFocus) {
            addFocusEvent();
        }

        registerEvent('pauseWidget', function () {
            stopWorkflow();
            stopListener();
        }, true);

        startWorkflow();
        startListener();
    }

    if (startRealTimeFeedbackEnabled) {
        // @todo - run css only when I have workflows available
        css();

        if (Array.isArray(window._realTimeFeedback)) {
            window._realTimeFeedback.forEach(function (arr) {
                push(arr);
            });
        }

        // https://stackoverflow.com/questions/29331979/difference-between-document-hidden-vs-document-hasfocus
        if (document.hasFocus()) {
            console.log('tab is focused');
            runReady(true);
        } else {
            console.log('tab is NOT focused');
            addFocusEvent();
        }
    }

    var core = {
        push: push
    };

    return core;

}());
