define([
		"knockout",
		"blueshed/bindings/ko-dirty"
	],
	function(ko){

		function Editor(options, meta){
			options = options || {};
			this.meta = meta;
			this.type = meta.type;
			this.id = options.id === undefined ? this.next_id() : options.id;

			this.model = {};
			this.options = options;
			this.meta.fields.map(function(field){
				this.model[field.name] = ko.observable(ko.unwrap(options[field.name]) || field.default_value)
										   .extend(field.validation || {});
			},this);

			this.valid = ko.validatedObservable(this.model);
			this.dirty = ko.dirtyFlag(this.model);
			this.can_save = ko.pureComputed(function(){
				return this.valid.isValid() && this.dirty.isDirty();
			},this);
		}

		Editor.prototype.save = function(){
			var result = {
				_type: this.type,
				id: this.id
			};
			this.meta.fields.map(function(field){
				if(field.read_only != true){
					result[field.name] = ko.unwrap(this.model[field.name]);
				}
			},this);
			return result;
		};

		Editor.prototype.update = function(options){
			this.meta.fields.map(function(field){
				if(options[field.name] !== undefined){
					this.model[field.name](ko.unwrap(options[field.name]) || field.default_value);
				}
			},this);
			if(options.id !== undefined){
				this.id = options.id;
			}
		};

		Editor.prototype.id_seed = 0;
		
		Editor.prototype.next_id = function() {
			Editor.prototype.id_seed = Editor.prototype.id_seed + 1;
			return Editor.prototype.id_seed;
		};

		return Editor;
	}
);