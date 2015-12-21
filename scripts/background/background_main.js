require.config({
	paths: {
		jquery: "../jquery-2.1.4.min",
		underscore: "../underscore-min",
		backbone: "../backbone-min",
		player: "model/player",
		database: "model/database",
		song: "../common/song",
		text: "../text"
	}
});

require([
	'jquery',
	'player',
	'song',
	'database'
], function($, Player, Song, Database){
	
	
	window.player = new Player();
		
	window.addEventListener('online', function(){
		chrome.runtime.reload();
		return;
	});
	
	
	console.log(new Database());
});