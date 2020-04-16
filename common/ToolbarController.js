angularTraveloggia.controller('ToolbarController', function ($routeParams, SharedStateService, $scope, $location, $window) {

 // LISTENERS AND WATCHERS

 $scope.$on("sitesLoaded", function (event, data) {
      console.log("sites are loaded ")
        loadSites();
    });

    $scope.$on("toggleJournalEdit", function (event, data) {
        $scope.toolbarState.editingJournal = data;
    });

    // this re-orders the preview panes - with a more advanced routing tool...
    $scope.$on(
        "$routeChangeSuccess",
        function handleRouteChangeEvent(event) {
            // only for urls shared on fb - 
            var urlParams = new URLSearchParams($window.location.search);
            //?fb_action_ids=10156427568808772&fb_action_types=og.shares&fbclid=IwAR15gLsoDnu1MQ-n1xQ1_2crBveWuxYYnEF4-LeZFWKTFAErg4HSzV6hbdg
            if (urlParams.get('fb_action_ids')) {
                let hash = $window.location.hash;
                let page = hash.split("/")[1];
                var mapID = $routeParams.mapID;
                var siteID = $routeParams.siteID;
                var photoID = $routeParams.photoID;
                var journalID = $routeParams.journalID;
                var hashyPath = "/" + page + "/" + mapID;
                if (siteID !== "undefined")
                    hashyPath += "/" + siteID;
                if (photoID !== "undefined")
                    hashyPath += "/" + photoID;
                   $window.location = "https://Traveloggia.pro/#" + hashyPath;
            }


            //$scope.splashVisible = $routeParams.mapID == null ? true : false;
            // show search on map page
        //     if ($location.path() === "/" || $location.path().indexOf("/Map") > -1)
        //         $scope.Swap.Map = true;
        //     else
        //         $scope.Swap.Map = false;

        //     if ($location.path().indexOf("/SiteList") > -1)
        //         $scope.Swap.SiteList = true;
        //     else
        //         $scope.Swap.SiteList = false;

            if ($window.innerWidth <= 768) {
                $scope.preview.windowOne = "";
                $scope.preview.windowTwo = "";
                $scope.preview.windowThree = "";
            }
            else {
                switch ($location.path().split('/')[1]) {

                    case "Map":
                        $scope.preview.windowOne = "site/SitePreview.html";
                        $scope.preview.windowTwo = "album/AlbumPreview.html";
                        $scope.preview.windowThree = "journal/JournalPreview.html";
                        break;

                    case "MapList":
                    case "SiteList":
                        $scope.Swap.Map = false;
                        $scope.preview.windowOne = "map/MapPreview.html";
                        $scope.preview.windowTwo = "album/AlbumPreview.html";
                        $scope.preview.windowThree = "journal/JournalPreview.html";
                        break;

                    case "Album":
                    case "Photo":
                        $scope.Swap.Map = false;
                        $scope.preview.windowOne = "map/MapPreview.html";
                        $scope.preview.windowTwo = "site/SitePreview.html";
                        $scope.preview.windowThree = "journal/JournalPreview.html";
                        break;
                    case "Site":
                        $scope.Swap.Map = false;
                        $scope.preview.windowOne = "map/MapPreview.html";
                        $scope.preview.windowTwo = "album/AlbumPreview.html";
                        $scope.preview.windowThree = "journal/JournalPreview.html";
                        break;
                    case "Journal":
                        $scope.Swap.Map = false;
                        $scope.preview.windowOne = "map/MapPreview.html";
                        $scope.preview.windowTwo = "album/AlbumPreview.html";
                        $scope.preview.windowThree = "site/SitePreview.html";
                        break;

                    default:
                        $scope.preview.windowOne = "site/SitePreview.html",
                            $scope.preview.windowTwo = "album/AlbumPreview.html",
                            $scope.preview.windowThree = "journal/JournalPreview.html";
                }

            }


        }
    );

    // used by drop down list to style the selected item -
    $scope.selectedSite = null;
    $scope.SiteList = [];
    $scope.AllSites = [{Name:"Bunnies"}, {Name:"Chocolates"}, {Name:"Kisses"}];
    $scope.preview = {
        windowOne: "",
        windowTwo: "",
        windowThree: ""
    };

    $scope.Swap = {
        Map: true,
        SiteList: false
    };

    $scope.rootUrl = $window.location.href.replace("Index.html", "");

    // added when we moved the edit buttons to the tool bar 
    // not so crazy about this idea but realestate wise its... 
    $scope.toolbarState = {
        editingJournal: false,
        editingMap: false,
        hasEditPermission: SharedStateService.getAuthorizationState()
    };



    // LOADER

    var loadSites = function () {
        var cachedSites = SharedStateService.Repository.get('Sites');
        $scope.AllSites = cachedSites;
       console.log("all sites length is ", $scope.AllSites.length)
        if (typeof $routeParams.siteID === "undefined")
            $scope.rolloverSite(cachedSites[0]);
        else {
            var site = SharedStateService.getSelectedSite($routeParams.siteID);
            $scope.rolloverSite(site);
        }

    };

    $scope.broadcastClearSite = function () {
        $scope.$broadcast("clearSite");
    };


    /***WATCH SITE ID*****/
    $scope.$watch(
        function (scope) {
            var x = $routeParams.siteID;
            //if (typeof x !== "undefined")
            return x;
        },
        function (newValue, oldValue) {
            if (typeof newValue === "undefined") {
                var site = SharedStateService.getSelectedSite(newValue);
                // if( site !== null && newValue !== 0)
                $scope.$broadcast("rolloverSelect", site);
            }
        });

    // HANDLERS


    $scope.selectSite = function (site) {
        $scope.selectedSite = site;
        SharedStateService.Selected["Site"] = site;
        var currentRoute = $location.path();
        var routeArray = currentRoute.split("/");
        var page = currentRoute.length > 1 ? routeArray[1] : "Map";
        if (page === "SiteList" || page === "Calendar")
            page = "Site";
        var mapID = SharedStateService.Repository.get("Map").MapID;
        var paramRoute = "/" + page + "/" + mapID + "/" + site.SiteID;
        $location.path(paramRoute);
        $scope.$broadcast("listSelect", site);
    };

    $scope.rolloverSite = function (site) {
       $scope.selectedSite = site;
        SharedStateService.Selected["Site"] = site;
        $scope.$broadcast("rolloverSelect", site);
    };

    $scope.editJournal = function () {
        $scope.$broadcast("requestEditJournal");
        $scope.toolbarState.editingJournal = true;
    };

    $scope.editMap = function () {
        $scope.$broadcast("requestEditMap");
        $scope.editingMap = true;
    };


    /*****Navigation handlers********/

    // go Site
    $scope.goSite = function (justCreatedSiteID) {
        var mapID = justCreatedSiteID? justCreatedSiteID:$routeParams.mapID? $routeParams.mapID:SharedStateService.Repository.get("Map").MapID;
        var siteID = $routeParams.siteID  ? $routeParams.siteID:justCreatedSiteID != null ? justCreatedSiteID : $scope.selectedSite? $scope.selectedSite:SharedStateService.getSiteID();
       // var photoID = $routeParams.photoID;
        var destination = "/Site/" + mapID + "/" + siteID;
        //if (photoID)
        //    destination += "/" + photoID;
        $location.path(destination);

    };

    //// goAlbum
    $scope.goAlbum = function (mapID, siteID) {
        mapID = mapID? mapID:$routeParams.mapID? $routeParams.mapID:SharedStateService.Repository.get("Map").MapID;
        siteID = siteID? siteID:$routeParams.siteID  ? $routeParams.siteID:SharedStateService.getSiteID();
        $location.path("/Album/" + mapID + "/" + siteID);

    };

    // go Journal
    $scope.goJournal = function () {
        var mapID = $routeParams.mapID? $routeParams.mapID:SharedStateService.Repository.get("Map").MapID;
        var siteID = $routeParams.siteID? $routeParams.siteID:SharedStateService.getSiteID();
        var journal = SharedStateService.Selected["Journal"];
        if (journal != null)
            var journalID = journal.JournalID;
        // var photoID = $routeParams.photoID;
        var destination = "/Journal/" + mapID + "/" + siteID;
        if (typeof journalID !== "undefined")
            destination += "/" + journalID;
        //if (photoID)
        //    destination += "/" + photoID;
        $location.path(destination);
    };

    $scope.goMap = function (id) {

        var mapID = $routeParams.mapID? $routeParams.mapID:SharedStateService.Repository.get("Map").MapID;
        var siteID = $routeParams.siteID? $routeParams.siteID:SharedStateService.getSiteID();
       // var photoID = $routeParams.photoID;
        var destination = "/Map/" + mapID + "/" + siteID;
        //if (photoID)
        //    destination += "/" + photoID;
        $location.path(destination);
    };

    $scope.goMapList = function (mapID) {
        if (typeof mapID === "undefined")
            mapID = SharedStateService.Repository.get("Map").MapID;
            siteID = SharedStateService.getSiteID();
        $location.path("/MapList/" + mapID + "/" + siteID);
    };
   
//     $scope.goMonitor = function () {
//         $location.path("/Monitor").search({});
//     };

    $scope.openSearch = function () {
        $scope.$broadcast("searchClicked");
    };

    $scope.goMapFirstTime = function (map) {
        $location.path("/Map/" + map.MapID);
    };

//     $scope.goSiteList = function () {
//         mapID = SharedStateService.Repository.get("Map").MapID;
//         let strPath = "/SiteList/" + mapID;
//         $location.path(strPath);
//     };

    $scope.goCalendar = function () {
        mapID = $routeParams.mapID? $routeParams.mapID:SharedStateService.Repository.get("Map").MapID;
        let strPath = "/Calendar/" + mapID;
        $location.path(strPath);
    };

});