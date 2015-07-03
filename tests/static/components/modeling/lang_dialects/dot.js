define(['../model/default_types'], function(default_types){
	/*
		Generates the DotLang representation on the model.
	*/

	function DotLang(){

	}
 
	DotLang.prototype.to_text = function(models){
		var indent = "\t";
		var result = [
			"digraph Model {",
			"",
			//indent + 'graph [nodesep=0.7, fontname="Helvetica Neue", overlap="scalexy"]',
			indent + 'graph [splines=ortho, nodesep=0.8, fontname="Helvetica Neue", rankdir="LR"]',
			indent + 'node [fontname="Helvetica Neue", fontsize=13, shape=box]',
			indent + 'edge [fontname="Helvetica Neue", fontsize=10]',
			""
		];
		var nodes = [""];
		for(var i=0; i < models.length; i++){
			var model = models[i];
			var label = [model.name];
			for(var k=0; k < model.attrs.length; k++){
				var attr = model.attrs[k];
				label.push(attr.name);
				if(default_types.indexOf(attr.type) == -1){
					if(attr.m2m === true){
						result.push(indent + model.name + " -> " + attr.type + '[label="' + attr.name + '", arrowhead="odiamond", arrowtail="odiamond", dir="both"];');
					} else {
						result.push(indent + model.name + " -> " + attr.type + '[label="' + attr.name + '", arrowhead="none", arrowtail="odiamond", dir="both"];');
					}
				}
			}
			
			//nodes.push(indent + model.name + ' [shape=record, label="' +  label.join("|") + '"];');		
		}
		result = result.concat(nodes)
		result.push("}");
		result = result.join("\n");
		return {
			body:result, 
			type:"ecl"
		};
	};

	return DotLang;

});