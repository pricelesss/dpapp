$(function(){
  var ipt_url = $("#test-url");
  function convert(value){
    var url = encodeURIComponent(value);
    $('#test-canvas').html('').qrcode({
        width: 200,
        height: 200,
        text: 'dianping://web?url=' + url
    });
  }
  ['blur', 'change', 'keyup', 'mouseup'].forEach(function(evt) {
      ipt_url.on(evt, function() {
          convert(this.value);
      });
  });
  convert(ipt_url.val());
});