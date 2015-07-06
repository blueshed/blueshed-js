define(
		["jquery","knockout"],

		function($,ko){
			'use strict';

			ko.bindingHandlers.datetimepicker = {
				init: function (element, valueAccessor, allBindings) {
					var options = {
							format: 'MM/DD/YYYY hh:mm A',
							defaultDate: ko.unwrap(valueAccessor())
					};

					ko.utils.extend(options, allBindings().dateTimePickerOptions);

					$(element).datetimepicker(options).on("dp.change", function (evntObj) {
						var observable = valueAccessor();
						if (evntObj.timeStamp !== undefined) {
							var picker = $(this).data("DateTimePicker");
							var d = picker.date();
							if(d){
								observable(d.format(options.format));
							}
							else{
								observable(null);
							}
						}
					});
				},
				update: function (element, valueAccessor) {
					var value = ko.unwrap(valueAccessor());
					$(element).datetimepicker('date', value || '').val(value || '');
				}
			};

		});