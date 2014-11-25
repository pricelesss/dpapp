var models = require('./model');
var _ = require('underscore');

function translate(obj) {
    if (_.isArray(obj)) {
        for (var ind in obj) {
            obj[ind] = translate(obj[ind]);
        }
    } else if (_.isObject(obj)) {
        if (models[obj['__name']]) {
            var model = models[obj['__name']];
            obj['__name'] = model['__name'];
            for (var key in obj) {
                if (key != '__name' && model[key]) {
                    obj[model[key]] = translate(obj[key]);
                    delete obj[key];
                }
            }
        }
    } 
    return obj;
}

module.exports = translate;
