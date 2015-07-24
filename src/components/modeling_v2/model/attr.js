 define(
	["knockout","./defaults","../utils"],
	function (ko, defaults, utils) {

		function Attr(options){
			this.name = ko.observable(options.name || 'untitled');
			this.type = ko.observable(options.type || defaults.DEFAULT_TYPES[0]);
			this.size = ko.observable(utils.default_options(options,'size',255));
			
			this.precision = ko.observable(utils.default_options(options,'precision',36));
			this.scale = ko.observable(utils.default_options(options,'scale', 12));
			
			this.values = ko.observable(utils.default_options(options,'values',null));
			this.nullable = ko.observable(utils.default_options(options,'nullable',true));
			this.unique = ko.observable(utils.default_options(options,'unique',false));

			this.backref = ko.observable(utils.default_options(options,'backref',null));
			this.m2m = ko.observable(utils.default_options(options,'m2m',false));
			this.cascade = ko.observable(utils.default_options(options,'cascade',false));
			
			this.doc = ko.observable(options.doc || '');

			this.is_scalar = ko.pureComputed(function(){
				return defaults.DEFAULT_TYPES.indexOf(this.type()) === -1;
			},this);
			this.is_m2m = ko.pureComputed(function(){
				return this.m2m() === true && this.is_scalar();
			},this);
			this.type.subscribe(function(value){
				if(!value || value == "────"){
					this.type(defaults.DEFAULT_TYPES[0]);
				}
			},this);
		}

		return Attr;

});
	