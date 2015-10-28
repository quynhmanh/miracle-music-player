define([
	'backbone',
	'song',
	'text!/templates/background_template.html',
	'jquery',
	'underscore'
], function(Backbone, Song, Html, $, _){
	var View = Backbone.View.extend({
		initialize: function(){
			
		},
		
		el: "#main-container",
		
		render: function(song){
//			var template = _.template( Html, song );
//			this.$el.html(template);
//			var audio = document.getElementById('audio-player'); // $('#audio-player');
			
			var audio = new Audio();
			audio.src = song.UrlJunDownload;
			window.a = audio;
			audio.play();
			
		}
	});
	
	return View;
});