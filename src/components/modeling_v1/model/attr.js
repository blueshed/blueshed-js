 define(
	["jquery",
	 "knockout",
	 "../utils",
	 "./default_types"],
	function (jquery, ko, utils, DEFAULT_TYPES) {

	
		function Attr(name, type, options){
			this.name = ko.observable(name);
			this.type = ko.observable(type);
			this.size = ko.observable(utils.default_options(options,'size',255));
			this.precision = ko.observable(utils.default_options(options,'precision',36));
			this.scale = ko.observable(utils.default_options(options,'scale', 12));
			this.values = ko.observable(utils.default_options(options,'values',null));
			this.backref = ko.observable(utils.default_options(options,'backref',null));
			this.m2m = ko.observable(utils.default_options(options,'m2m',false));
			this.nullable = ko.observable(utils.default_options(options,'nullable',true));
		
			this.is_m2m = ko.computed(function(){
				return this.m2m() === true && DEFAULT_TYPES.indexOf(this.type()) === -1;
			},this);
		}

		return Attr;

});
	