require.config({
	paths: {
		jquery: "../jquery-1.11.3",
//		jqueryui: "../jquery-ui.min",
		flatui: "../flat-ui",
		underscore: "../underscore-min",
		backbone: "../backbone-min",
		text: "../text",
		songModel: "../common/song",
		database: "module/database",
		playlist: "module/playlist",
		player: "module/player",
		moment: "../moment.min"
	}
});

require(['jquery', 'flatui', 'songModel', 'views/popup', 'playlist', 'player', 'database'], 
	function($, $_, Song, PopupView, Playlist, Player, Database){
	
		var MainView = new PopupView();

	}
);