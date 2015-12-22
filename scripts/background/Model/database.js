define(['backbone'], function(Backbone){
	var Database = Backbone.Model.extend({
		initialize: function() {
			var self = this;
			window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			this.request = window.indexedDB.open("newDatabase", 1);
			//prefixes of window.IDB objects
			window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
			window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

			const customerData = [
				{ id: "00-01", name: "Bill", age: 35, email: "bill@company.com" },
			 	{ id: "00-02", name: "Donna", age: 32, email: "donna@home.org" }
			];

			console.log(this.request);

			this.request.onerror = function(event) {
			  	console.log("error: ");
			};
			 
			this.request.onsuccess = function(event) {
			  	this.db = request.result;
			};

			this.request.onupgradeneeded = function(event) {
		        var db = event.target.result;
		        var objectStore = self.db.createObjectStore("customers", {keyPath: "id"});
		        for (var i in customerData) {
		                objectStore.add(customerData[i]);      
		        }
			}

		},

		read: function(){
			var transaction = this.db.transaction(["customers"]);
	        var objectStore = transaction.objectStore("customers");
	        var request = objectStore.get("00-03");
	        request.onerror = function(event) {
	          	alert("Unable to retrieve daa from database!");
	        };
	        request.onsuccess = function(event) {
	          	// Do something with the request.result!
	          	if(request.result) {
	                alert("Name: " + request.result.name + ", Age: " + request.result.age + ", Email: " + request.result.email);
	          	} else {
	                alert("Kenny couldn't be found in your database!"); 
	          	}
	        };

		},

		readAll: function(){
			var objectStore = this.db.transaction("customers").objectStore("customers");
  
	        objectStore.openCursor().onsuccess = function(event) {
	          	var cursor = event.target.result;
	          	if (cursor) {
	                alert("Name for id " + cursor.key + " is " + cursor.value.name + ", Age: " + cursor.value.age + ", Email: " + cursor.value.email);
	                cursor.continue();
	          	}
	          	else {
	                alert("No more entries!");
	          	}
	        };     
		},

		add: function(){
			var request = this.db.transaction(["customers"], "readwrite")
		        .objectStore("customers")
		        .add({ id: "00-03", name: "Kenny", age: 19, email: "kenny@planet.org" });
		                                 
		    request.onsuccess = function(event) {
		        alert("Kenny has been added to your database.");
		    };
		         
		    request.onerror = function(event) {
		        alert("Unable to add data\r\nKenny is aready exist in your database! ");       
		    }

		},

		remove: function(){
			var request = this.db.transaction(["customers"], "readwrite")
                .objectStore("customers")
                .delete("00-03");
	        request.onsuccess = function(event) {
	          alert("Kenny's entry has been removed from your database.");
	        };
		}
	});
	return Database;
});