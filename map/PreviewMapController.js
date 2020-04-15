
angularTraveloggia.controller("PreviewMapController", function ($routeParams,$scope, $timeout, $window, SharedStateService, $route, $location, readOnly) {

    $scope.$on("softIsHere", function (event, data) {
        afterLoaded();
    });

    var preparePreviewMap = function () {
        try {
            var mapEl = $window.document.getElementById("bingPreviewMap");
            var mapType = "a";
            if ($scope.Capabilities.currentDevice.deviceType === "mobile")
                mapType = "r";

            if (Microsoft != null && Microsoft.Maps != null && mapEl != null) {
                $scope.previewMap = new Microsoft.Maps.Map(mapEl, {
                    credentials: 'AnDSviAN7mqxZu-Dv4y0qbzrlfPvgO9A-MblI08xWO80vQTWw3c6Y6zfuSr_-nxw',
                    mapTypeId: mapType,
                    liteMode: true,
                    showDashboard: false,
                    showLocateMeButton: false,
                    showTermsLink: false,
                    enableClickableLogo: false,
                    disableZooming: true,
                    disablePanning: true,
                    disableMapTypeSelectorMouseOver: true,
                    disableStreetsideAutoCoverage: true,
                    showScalebar: false
                });

                if ($scope.previewMap != null)// of course its not, just checking
                    loadMap();
            }
            else {
                console.log("calling prepare previewbecause microsoft is null waiting 3000");
                $timeout(function () {
                    preparePreviewMap();
                }, 3000);
            }// end bing is loaded yet
        } catch (error) {
            console.log("error in prepare preview map" + error.message);
        }
    };

    var pushPin = function (pin) {
        var map = $scope.previewMap;
        if (map) {
            if (map.entities) {
                map.entities.push(pin);
            } else {
                console.log("map.entities is null waiting 100");
                $timeout(function () {
                    pushPin(pin);
                }, 300);
            }

        } else {
            console.log("map instance is null");
            return;
        }

    };

    var drawPreviewSite = function (site) {
        var map = $scope.previewMap;
        if ($scope.previewMap == null)
            preparePreviewMap();
        var selectedSite = site;
        if (selectedSite) {
            var loc = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude);
            var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false, title: selectedSite.Name, subTitle: selectedSite.Address });
            pushPin(pin);
            map.setView({ center: loc, zoom: 17 });
        }
        //else
           // alert("no selected site");

    };



    // called by toolbar when list select
    // url params dont update
    $scope.$on("listSelect", function (event, data) {
        removePins();
        var site = data;
      //  if (site !== null)// if they havent loaded into repo yet - will catch on selected site
            drawPreviewSite(site);
    });


    $scope.previewMap = null;


    var waitAndReload = function () {
        try {
            if (Microsoft)
                afterLoaded();
        }
        catch (error) {
            $timeout(waitAndReload, 1000);
        }
    };


    var loadSelectedMap = function (mapID) {

        $scope.systemMessage.loadComplete = false;
        SharedStateService.getMap(mapID)
            .then(function (map) {
                  $scope.$emit("sitesLoaded");
                  $scope.$apply(function () {
                    $scope.systemMessage.loadComplete = true;
                   // if ($routeParams.siteID !== "0")
                    //else
                      //  $scope.broadcastClearSite();
                });
            
                    var site = SharedStateService.Selected["Site"] != null ? SharedStateService.Selected["Site"] : SharedStateService.Repository.get("Sites")[0];
                    drawPreviewSite(site);
            })
            .catch(function (error) {
                $scope.systemMessage.loadComplete = true;
                $scope.systemMessage.text = "error loading selected map";
                $scope.systemMessage.activate();
            });

    };


    // the map and hence the repository and sites
    // is loaded by the map controller - only
    // if its not the map page, and you resize - you reload
    // meaning its up to the preview map controller to get the ball 
    // rolling - we arent loading sites without the map ( although we could )
    // and there is the problem of the map name - we need that for the 
    // legacy image paths, ( although since the old apps were destroyed by arvixe those shit heads - and nobody else, they would
    // still be working)
    
    var loadMap = function () {
        var mapID = $routeParams.mapID;
        loadSelectedMap(mapID);
    };

   

    var afterLoaded = function () {
        try {
            if ($scope.previewMap === null)
                preparePreviewMap();
        } catch (error) {
            console.log("msft bing map v8 was null waiting 400");
            $timeout(waitAndReload, 1000);
        }
    };




    var removePins = function () {
        var map = null;
        map = $scope.previewMap;
        if (map != null && map.entities != null) {
            var max = map.entities.getLength() - 1;
            for (var i = max; i > -1; i--) {
                var pushpin = map.entities.get(i);
                if (pushpin instanceof Microsoft.Maps.Pushpin) {
                    map.entities.removeAt(i);
                }
            }
        }
        else {
            console.log("map or entities is null removing pins ??? waiting 800");
            $timeout(function () { removePins(); }, 800);
        }
    };




    if (typeof Microsoft !== "undefined")
        afterLoaded();


});

