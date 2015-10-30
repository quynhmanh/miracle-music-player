define([
	'backbone',
	'song',
	'text!/templates/background_template.html',
	'jquery',
	'underscore',
	'../background/Views/invisible_view'
], function(Backbone, Song, Html, $, _, inviView){
	
	var Player = Backbone.Model.extend({
		defaults: {
			currentSong: null,
			state: false,
			time: 0
		},
		
		initialize: function(){
		},
		
		selectSong: function(data){
			var song = new Song(data);
			this.set('currentSong', song);
			this.audio = new Audio();
			this.audio.src = data.UrlJunDownload;
			return this;
		},
		
		playCurrentSong: function(){
			var self = this;
			this.set('state', true);
			this.audio.play();
			var currentTime = self.audio.currentTime;
			interval = setInterval(function(){
				++currentTime;
				self.set('time', self.audio.currentTime);
			}, 1000);
		},
		
		pauseCurrentSong: function(){
			if (this.audio) this.audio.pause();
			this.set('state', false);
		}
	});
	
	return Player;
});