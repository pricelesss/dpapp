var translate = require('./translate');
var $ = require('zepto');
var _ = require('underscore');

(function () {

    var callbacksCount = 1;
    var callbacks = {};

    window.DPApp = window.Efte = {
        NVCacheTypeDisabled: 0,
        NVCacheTypeNormal: 1,
        NVCacheTypePersistent: 2,
        NVCacheTypeCritical: 3,
        NVCacheTypeDaily: 4,

        send_message: function (method, args, callback) {
            // console.log('send_message', arguments);
            var hasCallback = callback && typeof callback == 'function';
            var callbackId = hasCallback ? callbacksCount++ : 0;
            if (hasCallback) callbacks[callbackId] = callback;
            args['callbackId'] = callbackId;
            args = (typeof args === 'object') ? JSON.stringify(args) : args + '';
            var ifr = document.createElement('iframe');
            ifr.style.display = 'none';
            document.body.appendChild(ifr);
            ifr.contentWindow.location.href = 'js://_?method=' + method + '&args=' + encodeURIComponent(args) + '&callbackId=' + callbackId;
            // ifr.parentNode.removeChild(ifr);
            setTimeout(function () {
                ifr.parentNode.removeChild(ifr);
            }, 0);
        },

        callback:function(callbackId, retValue) {
            var callback = callbacks[callbackId];
            if (!callback) {
                return;
            }
            setTimeout(function () {
                callback.apply(null, [retValue]);
            },0);
        },

        setModel: function (model) {
            translate.setModel(model);
            return window.Efte;
        },

        share: function (shareConfig, callback) {
            console.log('share active');
            Efte.send_message('share', shareConfig, function (result) {
                callback(result);
            });
        },

        ga: function (category, action, label, value, extra) {
            // console.log('send ga js',43);
            Efte.send_message('ga', {
                category: category + '',
                action: action + '',
                label: (label || '') + '',
                value: (value || 0) + '',
                extra: extra || {}
            }, function () {});
        },

        ajax: function(opts) {
            var url = opts.url;
            var data = opts.data || {};
            var success = opts.success || function () {};
            var fail = opts.fail || function () {};

            var params = [];
            if (!opts.method || opts.method != 'POST') {
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
            } else {
                opts.data = data;
            }

            Efte.send_message('ajax', opts, function(data) {
                var errMsg = '';
               // console.log(data);
                if (data.code == 0) {
                    var oldJson, newJson;
                    if (data.responseText && data.responseText.length > 0) {
                        try {
                            oldJson = JSON.parse(data.responseText);
                        } catch (ignore) {}
                    }
                    if (data.hashJson && data.hashJson.length > 0) {
                        try {
                            newJson = JSON.parse(data.hashJson);
                        } catch (ignore) {}
                    }

                    oldJson = oldJson || {};
                    newJson = newJson || {};

                    $.extend(true, newJson, oldJson);
                    newJson = translate(newJson);
                    console.log(newJson);
                    success(newJson);
                } else {
                    fail(data.code, data.message);
                }
            });
        },

        /**
        * 鎵撳紑鏂扮獥鍙�
        * @param  {[String]} unit     [description]
        * @param  {[String]} path     [description]
        * @param  {[Object]} query    [description]
        * @param  {[Boolean]} modal    [description]
        * @param  {[Boolean]} animated [description]
        */
        action: {
            open: function(unit, path, query, modal, animated) {
                var opt = {
                    unit: unit,
                    path: path,
                    query: {}
                };

                if (Object.prototype.toString.call(query) === '[object Object]') {
                    opt.query = query;
                }

                if (modal != null) {
                    opt.modal = !!modal;
                }

                // opt.animated = animated != null ? !!animated : Efte.getPlatform() !== 'android';

                var cid = Efte.send_message('actionOpen', opt, function() {
                    delete callbacks[cid];
                });
            },

            back: function(animated) {
                if (animated === undefined) {
                    animated = true;
                }

                var cid = Efte.send_message('actionBack', {
                    animated: animated
                }, function() {
                    delete callbacks[cid];
                });
            },
            openScheme: function (url) {
                Efte.send_message('actionScheme', {url: url}, function (result) {
                });

                Efte.send_message('actionscheme', {url: url}, function (result) {
                });
            }
        },

        getEnv: function(callback) {
            Efte.send_message('getEnv', {}, function (env) {
                callback && callback(env);
            });
        },

        startRefresh: function () {
            // override this method plz
        },

        onApplicationDidBecomeActive: function(){

        },

        stopRefresh: function () {
            Efte.send_message('stopRefresh', {}, function() {});
        },
        monitorScrollTop: function(pos, callback) {
            Efte.send_message('monitorScrollTop', {pos: pos}, function (result) {
                callback(result.direction);
            });
        },
        loadImage: function(imageurl, callback) {
            Efte.send_message('loadImage', {imageurl: imageurl}, function (result) {
                callback(result.img);
            });
        },
        setTitle: function (title) {
            Efte.send_message('setTitle', {title: title}, function () {});
        },
        toHashObject: function (object) {
            return new HashObject(object);
        },
        login: function () {
            Efte.getEnv(function (env) {
                var url = ["http://m.dianping.com/login/app?",
                    "&version=" + env.version,
                    "&dpid=" + env.dpid,
                    "&lng=" + env.longitude,
                    "&lat=" + env.latitude,
                    "&gasource=ac_login",
                    "&product=dpapp"].join('');
                window.open('dianping://loginweb?url=' + encodeURIComponent(url));
            });
        },
        getCX: function (business, callback) {
            Efte.send_message('cx', {business: business}, function (result) {
                callback && callback(result.cx);
            });
        },

        pay: function (opts) {
            var success = opts.success || function () {};
            var fail = opts.fail || function () {};

            Efte.send_message('pay', opts, function(data) {
                if (data.payresult) {
                    success(data);
                } else {
                    fail(data);
                }
            });
        },

        getWXTicket: function(callback) {
            Efte.send_message('wechat_snsticket', {}, function (result) {
                _.isFunction(callback) && callback(result.ticket);
            });
        },

        getWXAuthCode: function (callback) {
            Efte.send_message('wechat_get_auth_code', {}, function (result) {
                _.isFunction(callback) && callback(result.code);
            });
        },

        addToWeiXinCard: function (opts) {
            var success = opts.success || function () {};
            var fail = opts.fail || function () {};

            Efte.send_message('addtoweixincard', opts, function(data) {
                if (data.addtoweixinresult) {
                    success(data);
                } else {
                    fail(data);
                }
            });
        }
    };
})();

if (window.location.protocol == 'http:' && !Efte._adapted) {
    var WebEfte = require('./efte.web');
    Efte._adapted = true;
    var nativeGetEnv = Efte.getEnv;
    Efte.getEnv = function (callback) {
        var timer = setTimeout(function () {
            // native getEnv not invoke, in web browser mode
            console.log('in web');
            Efte.getEnv = WebEfte.getEnv;
            Efte.ajax = WebEfte.ajax;
            WebEfte.getEnv(callback);

            // add qrcode for device debug
            window.qrcode = function () {
                var w = $(window).width();
                var div = $('<div />');
                div.css({
                    width: w + 'px',
                    height: w + 'px',
                    position: 'fixed',
                    top: '10px',
                    left: '10px',
                    'z-index': 9999
                });
                var QRCode = require('./qrcode');
                new QRCode(div.get(0), 'dianping://efte?url=' + encodeURIComponent(window.location.href));
                $('body').append(div);
            }
        }, 1000);
        nativeGetEnv(function (env) {
            callback(env);
            Efte.getEnv = function (callback) {
                nativeGetEnv(function (env) {
                    try {
                        var q = JSON.parse(window.localStorage.efteQuery);
                        env.query = q;
                    } catch (ignore) {};
                    callback(env);
                });
            }
            clearTimeout(timer);
        });
    };
    Efte.loadImage = WebEfte.loadImage;
    Efte.action = WebEfte.action;

    Efte.getEnv(function () {});
}

module.exports = window.Efte;
