require.config({
	paths: {
		jquery: "../jquery-2.1.4.min",
		//jqueryui: "../jquery-ui.min",
		flatui: "../flat-ui.min",
		underscore: "../underscore-min",
		backbone: "../backbone-min",
		text: "../text",
		songModel: "../common/song",
		playlist: "module/playlist",
		player: "module/player",
		moment: "../moment.min"
	}
});

require(['jquery', 'flatui', 'songModel', 'views/popup', 'playlist', 'player'], function($, $_, Song, PopupView, Playlist, Player){
	
	var Counter = Backbone.Model.extend({
		time: 0
	});
	var MainView = new PopupView({model: new Counter({ time: 0 })});
});