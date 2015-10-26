define(['underscore', 
		'backbone',
		'text!/templates/popup_template.html',
		'jquery',
		'player',
		'songModel'
], function(_, Backbone, Html, $, Player, Song){
	var PopupView = Backbone.View.extend({
		popupTemplate: _.template(Html),
		
		el: '#main-container',
		
		render: function(){
			this.$el.html(this.popupTemplate());
		},
		
		events: {
			"click .fui-play" : "playCurrentSong",
			"click .fui-pause" : "pauseCurrentSong"
		},
		
		initialize: function(){
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			window.context = new window.AudioContext();
			
			this.render();
			
			
			this.audioContext = new (window.AudioContext = window.AudioContext || window.webkitAudioContext)()
			
			this.player = new Player({
				slider: $('#slider', this.el)
			});
			
			//render slider
			this.player.get('slider').slider({
				min: 0,
				max: 100,
				value: 50,
				range: "min"
			});
			
			var URL = 'http://mp3.zing.vn/download/song/An-Nut-Nho-Tha-Giac-Mo-Son-Tung-M-TP/ZHJHykHNQBDShSZyZbxyvmLG';
			
			var a = new Song({
				url: URL
			});
			
			this.player.set('currentSong', a);
		},
		
		playCurrentSong: function(){
			var song = this.player.get('currentSong');
			this.source = context.createBufferSource();
			if (!song.get('buffer')) return;
			this.source.buffer = song.get('buffer');
			this.source.connect(context.destination);
			this.source.start();
			
			this.duration = this.source.buffer.duration;
			
			window.counter = 0;
			var self = this;
			
			window.interval = setInterval(function(){
				window.counter+=1;
				self.player.get('slider').slider({
					value: window.counter * 100 / self.duration
				});
				if (counter > self.duration) 
					clearInterval(interval);
			}, 1000);
			
			$('#btn-play', this.el)
				.removeClass('fui-play')
				.addClass('fui-pause');
		},
		
		pauseCurrentSong: function(){
			clearInterval(interval);
			$('#btn-play', this.el)
				.removeClass('fui-pause')
				.addClass('fui-play');
			this.source.stop();
		}
	});
	return PopupView;
});