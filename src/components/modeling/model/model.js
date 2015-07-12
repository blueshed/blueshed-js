
 define(
	["jquery",
	 "knockout",
	 "./attr"],
	function (jquery, ko, Attr) {
	
		function Model(name){
			this.name = ko.observable(name);
			this.attrs = ko.observableArray();
		}


		Model.prototype.add_attr = function(name, type, options) {
			var attr = new Attr(name, type, options);
			this.attrs.push(attr);
			return attr;
		};

		Model.prototype.remove_attr = function(attr) {
			this.attrs.remove(attr);
		};


		return Model;
	}
);