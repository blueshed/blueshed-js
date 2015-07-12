define(["require",
        "jquery",
        "knockout",
        "dropzone",
		"aws-config",
        "text!./main-tmpl.html",
        "blueshed/utils/simpleUpload",
        "blueshed/bindings/ko-jqueryui",
        "jquery-form",
		"augment"],
	function(require,$,ko, DropZone, config, main_tmpl){

		DropZone.autoDiscover = false;
	
		var bucket = ko.observable();
		require(["aws-sdk"],function(AWS){
			AWS.config.update({accessKeyId: config.AWS_AccessKeyId, secretAccessKey: config.AWS_SecretAccessKey});
			AWS.config.region = config.AWS_Region;
			bucket(new AWS.S3({params: {Bucket: config.AWS_BucketName}}));
		});
		
		var Delimiter = '/';
		
		function prefix_to_label(prefix){
			if(prefix){
				var items = prefix.split(Delimiter);
				return items[items.length-2];
			}
			return prefix;
		}
		
		function path_to_label(path){
			if(path){
				var items = path.split(Delimiter);
				return items[items.length-1];
			}
			return path;
		}
	
		function Panel(options){
			this.appl = options.appl;
			this.error = ko.observable();
			this.busy = ko.observable(false);
			this.title = config.title;
			this.bucket = bucket;
			
			this.data = ko.observable();
			this.url_base = config.base_url;
			this.upload_url = config.upload_url;
			
			this.file = ko.observable();
			this.folder = ko.observable();
			

			this.drop_path = ko.observable();
			this.drop_zone = null;
			
			this.prefix = ko.observable(config.AWS_Prefix);
			this.path = ko.observableArray([{label:'Home',name:"Home",home:true}]);
			this.items = ko.observableArray();
			this.selected_item = ko.observable();
			this.selected_url = ko.computed(function(){
				if(this.selected_item()){
					return [ 
						this.url_base, 
						this.selected_item().name 
					].join(Delimiter);
				}
			},this);
			this.is_image = ko.computed(function(){
				if(this.selected_item()){
					return this.has_suffix(this.selected_item().name,[".jpeg",".jpg",".png",".gif"]);
				}
			},this);
		}
		
		Panel.prototype.init = function(){
			this.list();
			this.drop_zone = new DropZone("#mydropzone", { 
				url: this.upload_url,
				success: this.list.bind(this),
				sending: function(file, xhr, formData) {
					formData.append("prefix", ko.unwrap(this.drop_path) || '');
				}.bind(this),
				complete:function(file){
					this.drop_zone.removeFile(file);
				}.bind(this)
			});
		};
		
		Panel.prototype.show = function(){
		};
		
		Panel.prototype.dispose = function(){};
		
		Panel.prototype.open = function(item){
			if(item.type == 'folder'){
				this.path.push(item);
				item.home = this.prefix(),
				this.prefix(item.source.Prefix);
				this.list();
			} else {
				this.selected_item(item);
			}
		};
		
		Panel.prototype.go_back = function(item){
			if(item.home == true){
				this.path([item]);
				this.prefix(config.AWS_Prefix);
			} else {		
				var index = this.path.indexOf(item)+1;
				var len = this.path().length-index;
				this.path.splice(index,len);
				this.prefix(item.source.Prefix);
			}
			this.list();
		};
		
		Panel.prototype.has_suffix = function(elem, suffixes){
			var i,item,items = suffixes;
			for(i=0;i<items.length;i++){
				item = items[i];
				if(elem.indexOf(item, elem.length - item.length) !== -1){
					return true;
				}
			}
		};
		
		Panel.prototype.list = function(){
			this.busy(true);
			this.selected_item(null);
			this.bucket().listObjects({
					MaxKeys: config.AWS_MaxKeys, 
					Prefix : this.prefix(), 
					Delimiter : Delimiter 
				},
				function (err, data) {
					this.error(err || null);
					this.data(data || null);
					this.items(this.display_result(data));
					this.busy(false);
				}.bind(this));
		};
		
		Panel.prototype.display_result = function(data){
			var items = [], prefix = this.prefix();
			if(data.Contents){			
				data.Contents.map(function(line){
					items.push({
						label: path_to_label(line.Key),
						name: line.Key,
						type: 'file',
						root: line.Key == prefix,
						source: line
					});
				});
			}
			if(data.CommonPrefixes){			
				data.CommonPrefixes.map(function(line){
					items.push({
						label: prefix_to_label(line.Prefix),
						name: line.Prefix,
						type: 'folder',
						root: false,
						source: line
					});
				});
			}
			return items;
		};
		
		return {
			viewModel:Panel,
			template: main_tmpl
		}
	}
);