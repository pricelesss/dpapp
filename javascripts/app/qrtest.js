$(function(){function e(e){var t=encodeURIComponent(e);$("#test-canvas").html("").qrcode({width:200,height:200,text:"dianping://web?url="+t})}var t=$("#test-url");["blur","change","keyup","mouseup"].forEach(function(n){t.on(n,function(){e(this.value)})}),e(t.val())});