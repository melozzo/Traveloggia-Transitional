
function MomentFactory($window) {
    if (!$window.moment) {
        // If lodash is not available you can now provide a
        // mock service, try to load it from somewhere else,
        // redirect the user to a dedicated error page, ...
    }
    return $window.moment;
}

// Define dependencies
MomentFactory.$inject = ['$window'];

// Register factory
'use strict'; 

var angularTraveloggia = angular.module("AngularTraveloggia", ["ngRoute", 'ngCookies', 'ui.calendar', 'ui.bootstrap', 'textAngular', 'rt.debounce', 'angulartics', 'angulartics.google.analytics']);

angularTraveloggia.factory('moment', MomentFactory);  

// consider file path from the start page AngularMain.html
angularTraveloggia.config(['$routeProvider','$locationProvider' ,function ($routeProvider, $locationProvider) {
  

    $routeProvider
      

        .when('/Map/:mapID/:siteID/:photoID', {
            templateUrl: 'map/Map.html',
            controller: 'MapController'
        })

        .when('/Map/:mapID/:siteID', {
            templateUrl: 'map/Map.html',
            controller: 'MapController'
        })

        .when('/Map/:mapID', {
            templateUrl: 'map/Map.html',
            controller: 'MapController'
        })

        .when('/Map', {
            templateUrl: 'map/Map.html',
            controller: 'MapController'
        })
        .when('/', {
            templateUrl: 'map/Map.html',
            controller: 'MapController'
        })

        .when('/SignIn/:mapID/:siteID', {
            templateUrl: 'signin/SignIn.html'
        })

        .when('/CreateAccount', {
            templateUrl: 'signin/SignIn.html',
            isCreate: true
        })

        .when('/Site/:mapID/:siteID/:photoID', {
            templateUrl: 'site/Site.html',
            controller: 'SiteController'
        })

        .when('/Site/:mapID/:siteID', {
            templateUrl: 'site/Site.html',
            controller: 'SiteController'
        })

        .when('/Site', {
            templateUrl: 'site/Site.html',
            controller: 'SiteController'
        })

        .when('/Album/:mapID/:siteID', {
            templateUrl: 'album/Album.html',
            controller: 'AlbumController'
        })

        .when('/Album', {
            templateUrl: 'album/Album.html',
            controller: 'AlbumController'
        })

        .when('/Photo/:mapID/:siteID/:photoID', {
            templateUrl: 'album/Photo.html',
            controller: 'AlbumController'
        })

        .when('/Journal/:mapID/:siteID/:photoID/:journalID', {
            templateUrl: 'journal/Journal.html'
        })

        .when('/Journal/:mapID/:siteID/:journalID', {
            templateUrl: 'journal/Journal.html'
        })

        .when('/Journal/:mapID/:siteID', {
            templateUrl: 'journal/Journal.html'
        })

        .when('/JournalEdit', {
            templateUrl: 'journal/JournalEditCreate.html'
        })

     

        .when('/MapList/:mapID/:siteID', {
            templateUrl: 'map/MapList.html',
            controller: 'MapListController'
        })

        .when('/MapList/:mapID', {
            templateUrl: 'map/MapList.html',
            controller: 'MapListController'
        })

        .when('/SiteList/:mapID', {
            templateUrl: 'site/SiteList.html',
            controller: 'SiteListController'
        })

        .when('/Calendar/:mapID', {
            templateUrl: 'site/Calendar.html',
            controller: 'CalendarController'
        })

        .when('/Privacy', {
            templateUrl: 'signin/Privacy.html'
        })

        .when('/Monitor', {
            templateUrl: 'diagnostics/Monitor.html'
        })


/*
        THIS IS HOW TO GET RID OF THE STUPID HASH - DENOTING "INTERNAL LINKS"  BUT THEN NO ROUTE PARAMS IN IIS
        WITHOUT THE URL REWRITE INSTALL - REWRITE SERVICES IN NODE OR THAT FIRECRACKER SHIT OR WHATEVER ITS CALLED
 * */
    //$locationProvider.html5Mode(
    //    true
    //);

  }]);



angularTraveloggia.constant("readOnly", "READ_ONLY");
angularTraveloggia.constant("canEdit", "CAN_EDIT");
angularTraveloggia.constant("isEditing", "IS_EDITING");

angularTraveloggia.run(function ($rootScope) {
    $rootScope.$on('$locationChangeSuccess', function (event, url, oldUrl, state, oldState) {
            $rootScope.selectedState = {
                mapSelected: (url.lastIndexOf("/") == url.length - 1 || url.indexOf("/Map") > 0) ? true : false,
                albumSelected: url.indexOf("/Album") > 0 ? true : false,
                journalSelected: url.indexOf("/Journal") > 0 ? true : false,
                siteSelected: url.indexOf("/Site") > 0 ? true : false,
                mapListSelected: url.indexOf("/MapList") > 0 ? true : false,
                sitelistSelected: url.indexOf("/SiteList") > 0 ? true : false,
                signInSelected: url.indexOf("/SignIn") > 0 ? true : false,
                createSelected: url.indexOf("/CreateAccount") > 0 ? true : false
            };
      
       
    });
});


// used by the photos on load to determine size and orientation
angularTraveloggia.directive('onLoad', ['$parse', function ($parse) {
     return {
         restrict: 'A',
         link: function (scope, elem, attrs) {
             var fn = $parse(attrs.onLoad);
             elem.on('load', function (event) {
                 scope.$apply(function () {
                     fn(scope, { $event: event });
                 });
             });
         }
     };
 }]);

