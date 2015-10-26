require.config({
	paths: {
		jquery: "../jquery-2.1.4.min",
		underscore: "../underscore-min",
		backbone: "../backbone-min",
		player: "model/player",
		song: "../common/song"
	}
});

require([
	'player',
	'song'
], function(Player, Song){
	
	var url = 'http://mp3.zing.vn/download/song/An-Nut-Nho-Tha-Giac-Mo-Son-Tung-M-TP/ZHJHykHNQBDShSZyZbxyvmLG';
	
	var song = new Song({url: url});
	var player = new Player({currentSong: song});
	
	console.log(player);
});