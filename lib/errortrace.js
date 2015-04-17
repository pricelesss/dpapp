var _err = window.onerror;
var url = "http://114.80.165.63/broker-service/api/js";
window.onerror = function(err, file, line, col, error){
  var e = encodeURIComponent;
  var time = Date.now();
  (new Image).src = url
    + "?error=" + e(err)
    + "&v=1"
    + '&data=' + e(error.stack ? error.stack : "")
    + "&url=" + e(location.href)
    + "&file=" + e(file)
    + "&line=" + e(line)
    + "&col=" + e(col)
    + "&timestamp=" + time;
  _err && _err(err, file, line, col, error);
}