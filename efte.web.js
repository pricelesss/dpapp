var $ = require('zepto');
var _ = require('underscore');
var translate = require('./translate');

(function () {
    var WebEfte = {
        ajax: function(opts) {
            var url = opts.url;
            var data = opts.data || {};
            var success = opts.success || function () {};
            var fail = opts.fail || function () {};

            var params = [];
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    params.push(p + '=' + encodeURIComponent(data[p]));
                }
            }

            if (params.length) {
                url += url.indexOf('?') == -1 ?  "?" : "&";
                url += params.join('&');
            }

            opts.url = url;

            var host = 'http://' + (window.location.host.split(':')[0]) + ':8001';
            $.ajax({
                url: host + '/proxy',
                data: {
                    url: opts.url
                },
                dataType: 'json',
                success: function (data) {
                    var translated_data = translate(data);
                    success(data);
                },
                error: function (xhr, type) {
                    console.log('ajax error');
                    fail(type);
                }
            });
        },

        action: {
            open: function(unit, path, query, modal, animated) {
                var opt = {
                    unit: unit,
                    path: path
                };

                if (Object.prototype.toString.call(query) === '[object Object]') {
                    opt.query = query;
                }

                if (modal != null) {
                    opt.modal = !!modal;
                }

                window.localStorage.efteQuery = JSON.stringify(query);

                var href = window.location.href;
                href = href.replace(/\/src\/.*$/, '/' + path);
                window.location.href = href;
                // window.location.href = '../' + path;
            },

            back: function(animated) {
                window.history.back();
            }
        },

        getEnv: function(callback) {
            callback = callback || function () {};
            var env = {}

            // get cityid from cookie
            try {
                var items = document.cookie.split(/;\s*/);
                items.forEach(function (item) {
                    var kv = item.split('=');
                    var k = (kv[0] || '');
                    var v = (kv[1] || '');
                    if (k == 'cityid') {
                        env.cityid = v;
                    }
                });
            } catch (ignore) {}
            
            try {
                env.query = JSON.parse(window.localStorage.efteQuery);
            } catch (ignore) {};
  
            var executed = false;
            window.navigator.geolocation.getCurrentPosition(function (location) {
                // console.log(location.coords.latitude, location.coords.longitude);
                env.latitude = location.coords.latitude;
                env.longitude = location.coords.longitude;
                !executed && callback(env);
                executed = true;
            }, function (error) {
                !executed && callback(env);
                executed = true;
            }, {
                timeout: 3000
            });
        },

        loadImage: function(imageurl, callback) {
            callback(imageurl);
        }
    };
    module.exports = WebEfte;
})();

