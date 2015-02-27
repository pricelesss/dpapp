(function (Host) {
  var Efte;

  var userAgent = Host.navigator.userAgent.toLowerCase();

  // Require different platform js base on userAgent.
  // Native part will inject the userAgent with string `efte`.
  Efte = require('./lib/native');

  // if (/efte\b/.test(userAgent)) {
    Efte = require('./lib/native');
  // Default web.js
  // } else {
  //   Efte = require('./lib/web');
  // }

  // Export Efte object, if support AMD, CMD, CommonJS.
  if (typeof module !== 'undefined') {
    module.exports = Efte;
  }

  // Export Efte object to Host
  if (typeof Host !== 'undefined') {
    Host.Efte = Host.DPApp = Efte;
  }
}(this));



// 7.0 之前没有