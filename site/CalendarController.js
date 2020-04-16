


angularTraveloggia.controller('CalendarController', function ($scope, $compile, $timeout, SharedStateService, DataTransportService, uiCalendarConfig,$location ) {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        $scope.stateMachine = {
            state: SharedStateService.getAuthorizationState()
        }

    var loadSites = function () {
        var cachedScheduledSites = SharedStateService.Repository.get('Sites');
        var events = [];
        if (cachedScheduledSites != null && cachedScheduledSites.length > 0) {

            cachedScheduledSites.forEach(function (siteElement) {
                if (siteElement.Arrival != null) {
                    siteElement.start = siteElement.Arrival;
                    siteElement.title = siteElement.Name;
                    siteElement.allDay = false;
                    if (siteElement.Arrival != null)
                        siteElement.end = siteElement.Departure;
                    events.push(siteElement);
                }

            });
            $scope.timedSites = events;
        }
        else {

            var selectedMapID = SharedStateService.getMapID();
            if (selectedMapID != null) {
                DataTransportService.getSites(selectedMapID)
                    .then(function (result) {
                        result.data.forEach(function (siteElement) {
                            if (siteElement.Arrival != null) {
                                siteElement.start = siteElement.Arrival;
                                siteElement.title = siteElement.Name;
                                siteElement.allDay = false;
                                if (siteElement.Arrival != null)
                                    siteElement.end = siteElement.Departure;
                                events.push(siteElement);
                            }

                        });
                        $scope.timedSites = events;
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            }
        }

    };

         loadSites();
         $scope.eventSources = [$scope.timedSites];

     
        /* alert on eventClick */
        $scope.alertOnEventClick = function (eventData, jsEvent, view) {
            SharedStateService.Selected["Site"] =  eventData;
            $scope.selectSite(eventData);
         
        };
        /* alert on Drop */
        $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
        };
        /* alert on Resize */
        $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };
     
        /* add custom event*/
        $scope.addEvent = function () {
            $scope.events.push({
                title: 'Open Sesame',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                className: ['openSesame']
            });
        };
        /* remove event */
        $scope.remove = function (index) {
            $scope.events.splice(index, 1);
        };
        /* Change View */
        $scope.changeView = function (view, calendar) {
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        };
        /* Change View */
        $scope.renderCalendar = function (calendar) {
            $timeout(function () {
                if (uiCalendarConfig.calendars[calendar]) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('render');
                }
            });
        };
        /* Render Tooltip */
        $scope.eventRender = function (event, element, view) {
            element.attr({
                'tooltip': event.title,
                'tooltip-append-to-body': true
            });
            $compile(element)($scope);
        };
        /* config object */
        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: true,
                header: {
                    left: 'title',
                    center: '',
                    right: 'today prev,next'
                },
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize,
                eventRender: $scope.eventRender
            }
        };


    });


        ///* event source that calls a function on every view switch */
        //$scope.eventsF = function (start, end, timezone, callback) {
        //    var s = new Date(start).getTime() / 1000;
        //    var e = new Date(end).getTime() / 1000;
        //    var m = new Date(start).getMonth();
        //    var events = [{ title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed'] }];
        //    callback(events);
        //};

        //$scope.changeLang = function () {
        //    if ($scope.changeTo === 'Hungarian') {
        //        $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
        //        $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
        //        $scope.changeTo = 'English';
        //    } else {
        //        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        //        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        //        $scope.changeTo = 'Hungarian';
        //    }
        //};
        /* event sources array*/
      //  $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
     //   $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];
        //$scope.calEventsExt = {
        //    color: '#f00',
        //    textColor: 'yellow',
        //    events: [
        //        { type: 'party', title: 'Lunch', start: new Date(y, m, d, 12, 0), end: new Date(y, m, d, 14, 0), allDay: false },
        //        { type: 'party', title: 'Lunch 2', start: new Date(y, m, d, 12, 0), end: new Date(y, m, d, 14, 0), allDay: false },
        //        { type: 'party', title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/' }
        //    ]
        //};

        /* add and removes an event source of choice */
        //$scope.addRemoveEventSource = function (sources, source) {
        //    var canAdd = 0;
        //    angular.forEach(sources, function (value, key) {
        //        if (sources[key] === source) {
        //            sources.splice(key, 1);
        //            canAdd = 1;
        //        }
        //    });
        //    if (canAdd === 0) {
        //        sources.push(source);
        //    }
        //};

      //  $scope.changeTo = 'Hungarian';
     // event source that pulls from google.com
      //  that contains custom events on the scope
      



