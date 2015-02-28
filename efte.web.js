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
            var env = {
                "dpid": "-3677724576286974906",
                "cityid": "1",
                "network": "wifi",
                "token": "",
                "latitude": "31.21587",
                "version": "6.9",
                "longitude": "121.4191",
                "query": {}
            };
            try {
                env.query = JSON.parse(window.localStorage.efteQuery);
            } catch (ignore) {};
            callback && callback(env);
        },

        loadImage: function(imageurl, callback) {
            callback(imageurl);
        }
    };
    module.exports = WebEfte;
})();

