function A(){
	throw new Error("ooo");
}

function B(){
	A();
}

setTimeout(function(){
	B();
}, 100);