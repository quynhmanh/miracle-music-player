define([
	'backbone',
	'song',
], function(Backbone, Song){
	
	var Player = Backbone.Model.extend({
		defaults: {
			slider: null,
			currentSong: null,
			duration: 0,
			state: false,
			source: null,
			time: 0
		},
		
		initialize: function(){
			var self = this;
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			window.context = new window.AudioContext();
		},
		
		selectSong: function(data){
			var self = this;
			var song = new Song(data);
			this.set('time', 0);
			this.set('currentSong', song);
			song.on('change', function(){
				self.set('duration', song.get('buffer').duration);
				self.playCurrentSong();
			});
		},
		
		playCurrentSong: function(){
			console.log(1);
			var self = this;
			var song = this.get('currentSong');
			var source = window.context.createBufferSource();
			var currentTime = this.get('time');
			if (!song.get('buffer')) 
				return;
			console.log(currentTime);
			source.buffer = song.get('buffer');
			this.set('duration', source.buffer.duration);
			source.connect(context.destination);
			self.set('state', true);
			self.set('source', source);
			source.start(context.currentTime, currentTime);
			interval = setInterval(function(){
				++currentTime;
				self.set('time', currentTime);
			}, 1000);
			
		},
		
		pauseCurrentSong: function(){
			if (!this.get('source')) return undefined;
			this.get('source').stop();
			this.set('state', false);
			clearInterval(interval);
			console.log(this.get('state'));
		}
	});
	
	return Player;
});