require.config({
	paths: {
		jquery: "../jquery-1.11.3",
		jqueryui: "../jquery-ui.min",
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

require(['jquery', 'jqueryui','flatui', 'songModel', 'views/popup', 'playlist', 'player', 'database'], 
	function($, $$, $_, Song, PopupView, Playlist, Player, Database){
	
		var MainView = new PopupView();

		jQuery(function($) {
		 
		  
			// /////
			// CLEARABLE INPUT
			function tog(v){return v?'addClass':'removeClass';} 
			$(document).on('input', '.clearable', function(){
			  	$(this)[tog(this.value)]('x');
			  	}).on('mousemove', '.x', function( e ){
			    	$(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX');   
			  	}).on('touchstart click', '.onX', function( ev ){
			    	ev.preventDefault();
			    	$(this).removeClass('x onX').val('').change();
			});
		  
		  
		});

	}
);