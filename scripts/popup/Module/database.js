define(['backbone'], function(Backbone){
	var Database = Backbone.Model.extend({
		initialize: function() {
			var self = this;
			this.request = window.indexedDB.open("mmp-v2", 1);
			window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 
			//prefixes of window.IDB objects
			window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
			window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

			this.request.onerror = function(event) {
			  	console.log("error: ");
			};
			
			this.request.onsuccess = function(event) {
			  	self.db = self.request.result;
			  	console.log("success: "+ self.db);
			};

			this.request.onupgradeneeded = function(event) {
				console.log("done");
		        var dbs = event.target.result;
		        var objectStore = dbs.createObjectStore("customers", { keyPath: "Id"});
			}

		},

		readAll: function(){
			var objectStore = this.db.transaction("customers").objectStore("customers");
  
	        objectStore.openCursor().onsuccess = function(event) {
	          	var cursor = event.target.result;
	          	if (cursor) {
	                console.log(cursor.value);
	                cursor.continue();
	          	}
	        };     
		},

		add: function(song){
			console.log(song);
			var request = this.request.result.transaction(["customers"], "readwrite")
		        .objectStore("customers")
		        .add(song);
		                                 
		    request.onsuccess = function(event) {
		    	console.log("Added");
		    };
		         
		    request.onerror = function(event) {
		    	console.log("Exist");
		    }

		},

		remove: function(){
			console.log(this.db);
			var objectStore = this.db.transaction("customers", "readwrite").objectStore("customers");
  			var request = objectStore.clear();
		},

		numberOfSong: function(){
			var objectStore = this.db.transaction("customers", "readwrite").objectStore("customers").count();
		},

		all: function(){
			console.log(this.db);
			var res = [];
			var objectStore = this.db.transaction("customers").objectStore("customers");
			objectStore.openCursor().onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor){
					res.push(cursor.value);
					cursor.continue();
				} 
			}
			console.log(objectStore.openCursor().onsuccess);
			setTimeout(objectStore.openCursor().onsuccess, 0);

			return res;
		},

		getInfoSong: function(Id){
			console.log(this.db);
		}
	});

	return Database;
});