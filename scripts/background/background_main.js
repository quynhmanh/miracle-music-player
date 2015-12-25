require.config({
	paths: {
		jquery: "../jquery-2.1.4.min",
		underscore: "../underscore-min",
		backbone: "../backbone-min",
		player: "model/player",
		song: "../common/song",
		text: "../text"
	}
});

require([
	'jquery',
	'player',
	'song'
], function($, Player, Song){
	
	
	window.player = new Player();
		
	window.addEventListener('online', function(){
		chrome.runtime.reload();
		return;
	});
	
	
});