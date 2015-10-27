define(['backbone'], function(Backbone){
	var Song = Backbone.Model.extend({
		initialize: function(){
			this.toBuffer(this.get('UrlJunDownload'));
		},
		
		toBuffer: function(url){
			var self = this;
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function(){
				context.decodeAudioData(xhr.response, function(buffer){
					self.set('buffer', buffer);
					console.log("done");
				})
			};
			xhr.send();
		}
	});
	return Song;
});