
 define(
	["knockout","./attr"],
	function (ko, Attr) {
	
		function Model(options){
			this.name = ko.observable(options && options.name || "untitled");
			this.attrs = ko.observableArray();
			if(options && options.attrs){
				options.attrs.map(this.add_attr,this);
			}
		}


		Model.prototype.add_attr = function(options) {
			var attr = new Attr(options || {});
			this.attrs.push(attr);
			return attr;
		};

		Model.prototype.remove_attr = function(attr) {
			this.attrs.remove(attr);
		};


		return Model;
	}
);