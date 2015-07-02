define(
    ["jquery",
     "knockout",
     "../boot-panel",
     "fullcalendar"],
    function($,ko,Panel){
        'use strict';

        ko.bindingHandlers['calendar'] = {
            'init': function(element, valueAccessor) {
                var panel = ko.utils.unwrapObservable(valueAccessor());
                $(element).fullCalendar({
                    events: $.proxy(panel.load_events,panel),
                    eventClick: $.proxy(panel.eventClick,panel),
                    dayClick: $.proxy(panel.dayClick,panel),
                    header: {
                        left: 'title',
                        right: 'month,basicWeek today prev,next'
                    }
                });
            }
        };

        function CalendarPanel(appl){
            Panel.apply(this,appl);
        }
        
        CalendarPanel.prototype = new Panel();

        CalendarPanel.prototype.dayClick = function(date, jsEvent, view){};
        
        CalendarPanel.prototype.load_events = function(start, end, timezone, callback){};

        CalendarPanel.prototype.eventClick = function(event) {};

        return CalendarPanel;
    }
);