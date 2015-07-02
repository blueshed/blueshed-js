define(["jquery"], function($){
	
	$(function(){
		$(document).on('change', '.btn-file :file', function() {
			var input = $(this),
			numFiles = input.get(0).files ? input.get(0).files.length : 1,
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
			input.trigger('fileselect', [numFiles, label]);
			var display =  $(this).parents('.input-group').find(':text'),
				log = numFiles > 1 ? numFiles + ' files selected' : label;
			if( display.length ) {
				display.val(log);
			} else {
				if( log ) alert(log);
			}
		});
	});
	
	$.fn.simpleUpload = function(options){

		var def = {
			url          : null,
			change       : null,
			error        : null,
			types        : null,
			fields       : null,
			size         : 5120
		};

		return this.each(function(){

			var $this = $(this);
			if(!options) options = {};

			$.each(this.attributes, function(){
				if(this.specified) {
					if(this.name.indexOf('data-') > -1){
						var name = this.name.replace('data-','')
						options[name] = (typeof window[this.value] == 'function')? eval(this.value) : this.value;
					}
				}
			});

			var params = $.extend({}, def, options);

			if(typeof params.change == 'function') $this.change(function(){
				params.change($this[0].files);
			});

			if(params.trigger){
				$(params.trigger).click( send );
			}else{
				$this.change( send );
			}

			function send(){
				var name = $this.attr('name'),
					data = new FormData();

				for(var i in $this[0].files){
					if(typeof $this[0].files[i] == 'object'){

						var file = $this[0].files[i];
						if(!typeCheck(file.name)){
							if(typeof params.error == 'function') params.error({ type: 'fileType' });
							return false;
						}

						if((file.size/params.size) > params.size){
							if(typeof params.error == 'function') params.error({ type:'size' });
							return false;
						}

						data.append(name+'['+i+']', file);
					}
				}

				if(typeof params.fields == 'object'){
					for(var i in params.fields){
						if($.isArray(params.fields[i])){
							for(var k in params.fields[i]) data.append(i+'['+k+']', params.fields[i][k]);
						}else{
							data.append(i, params.fields[i]);
						}
					}
				}

				var ajax = {
					url         : params.url,
					data        : data,
					cache       : false,
					contentType : false,
					processData : false,
					type        : 'POST',
					complete: function(){
						$this.val('');
						if(params.complete) params.complete(arguments);
					}
				}

				if(params.error != null ) ajax.error         = params.error;
				if(params.success)        ajax.success       = params.success;
				if(params.async)          ajax.async         = params.async;
				if(params.beforeSend)     ajax.beforeSend    = params.beforeSend;
				if(params.global)         ajax.global        = params.global;
				if(params.dataType)       ajax.dataType      = params.dataType;
				if(params.contents)       ajax.contents      = params.contents;
				if(params.jsonp)          ajax.jsonp         = params.jsonp;
				if(params.jsonpCallback)  ajax.jsonpCallback = params.jsonpCallback;
				if(params.password)       ajax.password      = params.password;
				if(params.username)       ajax.username      = params.username;
				if(params.statusCode)     ajax.statusCode    = params.statusCode;

				$.ajax(ajax);
			};

			function typeCheck(name){
				if($.isArray(params.types)){
					if(params.types.indexOf($.getExt(name)) > -1) return true;
					return false;
				}
				return true;
			}
		});
	};

	$.extend(true,{
		getExt: function(name){
			return name.substr(name.lastIndexOf(".") + 1);
		}
	});
});