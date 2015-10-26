define([
	'backbone'
], function(Backbone){
	
	var Player = Backbone.Model.extend({
		defaults: {
			slider: null,
			currentSong: null,
			duration: 0,
			state: false,
			source: null
		},
		
		initialize: function(){
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			window.context = new window.AudioContext();
			window.player = this;			
		},
		
		playCurrentSong: function(time){
			var self = this;
			
			var song = this.get('currentSong');
			var source = window.context.createBufferSource();
			if (!song.get('buffer')) 
				return;
			source.buffer = song.get('buffer');
			this.set('duration', source.buffer.duration);
			source.connect(context.destination);
			self.set('state', true);
			self.set('source', source);
			source.start(context.currentTime, time);
		},
		
		pauseCurrentSong: function(){
			this.get('source').stop();
		}
	});
	
	return Player;
});