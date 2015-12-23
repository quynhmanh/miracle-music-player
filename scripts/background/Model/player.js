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
			list: null,
			state: false,
			ns: false,
			time: 0,
			i: 0
		},
		
		initialize: function(){

		},

		playlist: function(i, list, b){
			console.log(list);
			console.log(b);
			if (b === false){
				var _list = this.get('list');
				console.log(_list);
				if (!_list){
					console.log(list);
					this.set('list', list);
					this.set('i', 0);
					return;
				}
				var song = _list[this.get('i')];
				// console.log(song);
				console.log(list);
				var deleteCurrentSong = false;
				for (var j = 0; j < list.length; ++j)
					if (list[j]['Id'] === song['Id']){
						console.log(j);
						deleteCurrentSong = true;
						this.set('i', j);
					}
				this.set('list', list);
				if (deleteCurrentSong === false){
					this.set('state', false);
					this.audio.currentTime = 0;
					this.pauseCurrentSong();
				}
				return;
			}
			console.log(i);
			console.log(list);
			this.set('i', i);
			this.set('list', list);
			this.selectSong(list[i]).playCurrentSong();
		},
		
		selectSong: function(data){
			var song = new Song(data);
			console.log(song);
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
				if (self.audio.ended){
					self.set('ns', true);
					self.nextSong();
				}
			}, 1000);
		},
		
		pauseCurrentSong: function(){
			console.log("Pause current song");
			if (this.audio) this.audio.pause();
			this.set('state', false);
		},

		nextSong: function(){
			this.set('ns', true);
			this.pauseCurrentSong();
			console.log("Next song");
			var i = this.get('i');
			var list = this.get('list');
			++i;
			if (list.length == i)
				i = 0;
			this.set('i', i);
			this.selectSong(list[i]).playCurrentSong();
		},

		prevSong: function(){
			this.set('ns', true);
			this.pauseCurrentSong();
			console.log("Prev song");
			var i = this.get('i');
			var list = this.get('list');
			--i;
			if (i == -1)
				i = list.length - 1;
			this.set('i', i);
			this.selectSong(list[i]).playCurrentSong();	
		}
	});
	
	return Player;
});