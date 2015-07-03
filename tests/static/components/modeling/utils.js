define(
   ["jquery",
    "knockout",
    "codemirror",
    "blueshed/utils/simpleUpload"],
   function (jquery, ko, CodeMirror) {

      var utils = {};
   
      String.prototype.toUnderscore = function(){
         var result = this.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
         if(result.charAt(0)==="_"){
            result = result.substring(1,result.length);
         }
         return result;
      };
   
      String.prototype.toTitleCase = function(){
         return this.charAt(0).toUpperCase() + this.substring(1,this.length).toLowerCase();
      };
   
   
      utils.default_options = function(options,name,default_value){
         if(options && options[name] !== undefined){
            return options[name];
         }
         return default_value;
      }
   
      ko.bindingHandlers.code_editor = {
   
         init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
   
            var value = valueAccessor(), allBindings = allBindingsAccessor();
      
            var valueUnwrapped = ko.utils.unwrapObservable(value);
      
            jquery(element).val(valueUnwrapped.body);
      
            var editor = CodeMirror.fromTextArea(element, {
               mode: {name: valueUnwrapped.type,
                     version: 2,
                     singleLineStringErrors: false},
               lineNumbers: true,
               indentUnit: 4,
               tabMode: "shift",
               matchBrackets: true 
             });
             editor.on("change",function(){
               //jquery(element).val(editor.getValue());
               editor.save();
            });
         },
         update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {}
      };

      var defaults = {
         mode: {
            name: "text/plain",
            version: 2,
            singleLineStringErrors: false
         },
         lineNumbers: true,
         indentUnit: 4,
         tabMode: "shift",
         matchBrackets: true,
         value: ''
      };
      ko.bindingHandlers.codemirror = {
          init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();
            var options = ko.utils.extend({},defaults);
            options = ko.utils.extend(options,ko.unwrap(value.options));
            options.value = ko.unwrap(value.value);
            // if (options.theme && !themes.available(options.theme) && typeof console === 'object' && console) {
            //   console.error(options.theme + ' may not be an available theme.');
            // }
            console.log(options);
            var editor = new CodeMirror(element, options);
            editor.on('change', function (cm) {
              var value = ko.unwrap(valueAccessor()).value;
              if (ko.isObservable(value)) {
                value(cm.getValue());
              } else {
                ko.unwrap(valueAccessor()).value = cm.getValue();
              }
            });
            var subscription;
            if (ko.isObservable(valueAccessor().value)) {
              subscription = valueAccessor().value.subscribe(function () {
                if (editor.getValue() !== valueAccessor().value())
                  editor.setValue(valueAccessor().value());
              });
            }

            var wrapperElement = $(editor.getWrapperElement());
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
              wrapperElement.remove();
              if (subscription) {
                subscription.dispose();
              }
            });
          }
        };

      return utils;
   }
);