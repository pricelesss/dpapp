var queue = module.exports = function(worker){
	var currentData = null;
	var currentCallback = null;
	var q = {
		timeout: null,
		running : false,
		tasks: [],
		push: function(data, cb){
			var callback = cb || function(data){}
			q.tasks.push({
				data: data,
				callback: callback
			});
			setTimeout(function(){
				q.process();
			}, 0);
		},
		dequeue: function(){
			currentCallback && currentCallback();
		},
		process: function(){
			if(q.tasks.length && !q.running){
				var task = q.tasks.shift();
				q.running = true;
				currentCallback = function(){
					q.running = false;
					task.callback(task.data);
					q.process();
				};
				currentData = task.data;
				worker(task.data, currentCallback);
			}
		}
	}
	return q;
};