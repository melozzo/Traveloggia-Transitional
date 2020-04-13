
angularTraveloggia.controller('MapController', function ($scope, $location, $routeParams, $window, SharedStateService,  DataTransportService, $timeout) {
    
    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    };

    $scope.selectedState = {
        editSelected: false,
        searchSelected: false
    };

    $scope.$on("softIsHere", function (event, data) {
        afterLoaded();
      
    });

    $scope.$on("clearSite", function (event, data) {
        loadMap();
    });

    $scope.$on("searchClicked", function (event, data) {
        $scope.selectedState.searchSelected = true;
    });

    $scope.$on("listSelect", function (event, data) {
            var selectedSite = data;
            var selectedLocation = null;
            selectedLocation = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude);
            $scope.mapInstance.setView({ center: selectedLocation, zoom: 18 });
    });

   

    var mapClickHandler = null; 
    var pushpinCollection = null;
       
    //ConfirmCancel Handlers
    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    };

    var saveCurrentLocation = function () {
        $scope.ConfirmCancel.isShowing = false;
        $scope.goSite(0);
    };

    $scope.ConfirmCancel.question = "Save location permanently to map?";
    $scope.ConfirmCancel.ccCancel = dismiss;
    $scope.ConfirmCancel.ccConfirm = saveCurrentLocation;

    $scope.Search = {
        Address: null
    };

  
    // INIT SEQUENCE

    var clearSites = function () {
        if ($scope.MapRecord && SharedStateService.Repository.get("Sites").length === 0)
            return;
        removePins();
    };

  
    var removePins = function () {
        try {

            var map = null;
           
             map = $scope.mapInstance;
       
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
                $timeout(function () { removePins() }, 800);
            }

        } catch (error) {
            console.log(error.message);
        }
    };


    var drawSites = function () {
        var map = null;
        if ($scope.mapInstance != null)
            map = $scope.mapInstance;
        else
            return;

        var sites = SharedStateService.Repository.get("Sites");
        var arrayOfMsftLocs = [];
        var isDraggable = false; //for now (SharedStateService.getAuthorizationState() == "CAN_EDIT" && ( $scope.Capabilities.currentDevice.deviceType == null || $scope.Capabilities.currentDevice.deviceType=="tablet"))? true : false;

        for (var i = 0; i < sites.length; i++) {
            var loc = new Microsoft.Maps.Location(sites[i].Latitude, sites[i].Longitude);
            var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: isDraggable, title: sites[i].Name, subTitle: sites[i].Address });

            (function attachEventHandlers(site) {

                Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                    if (!$scope.selectedState.editSelected)
                    $scope.$apply(function () {
                        var mapID = $scope.MapRecord.MapID;
                        var siteID = site.SiteID;
                        $scope.goAlbum(mapID, siteID);
                    });
                });

                Microsoft.Maps.Events.addHandler(pin, 'mouseover', function () {
                    if( ! $scope.selectedState.editSelected)
                        $scope.rolloverSite(site);
                  
                });

                //if (isDraggable == true) {
                //    Microsoft.Maps.Events.addHandler(pin, 'dragend', function (e) {
                //        $scope.$apply(
                //        function () {
                //            SharedStateService.setSelected("Site", site);
                //            var loc = e.location;
                //            $scope.editLocation(loc, site)
                //        })
                //    });
                //}

            })(sites[i], $scope, $location);

            // used to calculate bounding rect
            arrayOfMsftLocs.push(loc);
            // adds location to the map
            pushPin(pin);
        }
        var selectedSite = null;
      
       
        if (typeof $routeParams.siteID !== "undefined")
            selectedSite = SharedStateService.getSelectedSite($routeParams.siteID);
        if ( selectedSite !== null ) {
            var l = new Microsoft.Maps.Location(selectedSite.Latitude, selectedSite.Longitude);
            if (map) // should not need this check
                map.setView({ center: l, zoom: 17 });
            else
                console.log("map is null inside draw sites trying to set view on selected site");

        } else {
            var viewRect = Microsoft.Maps.LocationRect.fromLocations(arrayOfMsftLocs);
            map.setView({ bounds: viewRect, padding: 20 });
            $timeout(
                function () {
                    map.setView({ bounds: viewRect, padding: 20 });
                }, 1000);
            // we want map all zoomed out  when first loaded, but now need to set default site
            // so preview panes wont be empty
           // SharedStateService.Selected["Site"] = sites[0];
        }
    };


    var pushPin = function (pin) {
        var map = $scope.mapInstance;
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

 
    var loadSelectedMap = function (mapID) {
        $scope.systemMessage.loadComplete = false;
        SharedStateService.getMap(mapID)
            .then(function (map) {
                $scope.$apply(function () {
                    $scope.systemMessage.loadComplete = true;
                    $scope.MapRecord = map;
                });
               $scope.$emit("sitesLoaded");
                if(SharedStateService.Repository.get("Sites").length > 0)
                    drawSites();
            })
            .catch(function (error) {
                $scope.systemMessage.loadComplete = true;
                $scope.systemMessage.text = "error loading selected map";
                $scope.systemMessage.activate();
            });

    };

    var loadMap = function () {
        var mapID = $routeParams.mapID;
        loadSelectedMap(mapID);
    };

    var prepareMainMap = function () {
        if ($scope.mapInstance == null) {
            var mapEl = null;
            var mapType = "a";
            if ($scope.Capabilities.currentDevice.deviceType === "mobile")
                mapType = "r";
            mapEl = $window.document.getElementById("bingMapRaw");
            if (Microsoft != null && Microsoft.Maps != null && mapEl != null) {
                $scope.mapInstance = new Microsoft.Maps.Map(mapEl, {
                    credentials: 'AnDSviAN7mqxZu-Dv4y0qbzrlfPvgO9A-MblI08xWO80vQTWw3c6Y6zfuSr_-nxw',
                    mapTypeId: mapType,
                    showLocateMeButton: false,
                    showTermsLink: false,
                    enableClickableLogo: false
                });

                if ($scope.mapInstance != null)// of course its not, just checking
                    loadMap();
            }
            else {
                console.log("calling prepare main map microsoft is null waiting 1000");
                $timeout(function () {
                    prepareMainMap();
                }, 1000);
            }// end bing is loaded yet


        }
    };


    var afterLoaded = function () {
     try {
            if ($scope.mapInstance)
                loadMap();
            else
                prepareMainMap();
           
     } catch (error) {
            console.log("msft bing map v8 was null waiting 400");
            $timeout(waitAndReload, 1000); 
     }
  };

    var waitAndReload = function () {
        try {
            if (Microsoft)
                afterLoaded();
        }
        catch (error) {
           $window.location.reload();
        }
    };




/******MAP EDITING ************************************************/

    $scope.toggleEdit = function () {
        // add crosshair cursor
        $scope.selectedState.editSelected = ($scope.selectedState.editSelected == false) ? true : false;
        // angular.element("#bingMapRaw").style.cursor = "crosshair";
        if ($scope.selectedState.editSelected == true) {
            mapClickHandler = Microsoft.Maps.Events.addHandler($scope.mapInstance, "click", function (e) {
                if (e.targetType === "map") {
                    // Mouse is over Map
                    var loc = e.location;
                    addLocation(loc)
                    $scope.toggleEdit();
                } else {
                    // Mouse is over Pushpin, Polyline, Polygon
                }
            });
        }
        else {
            Microsoft.Maps.Events.removeHandler(mapClickHandler);
        }
    };

    // CURRENT LOCATION
    $scope.getLocation = function () {

        var geo_options = {
            enableHighAccuracy: true,
            maximumAge: 3000,
            timeout: 8000
        };

        $scope.systemMessage.text = "working hard...";
        $scope.systemMessage.activate();
        navigator.geolocation.getCurrentPosition(function (pos) {
            $scope.systemMessage.dismiss();
            addLocation(pos.coords);
        },
            function (error) {

                if (error.code === 2) {
                    $scope.systemMessage.text = "reload and try again";
                    $scope.systemMessage.activate();
                    console.log("navigator geo loation not working" + error.message);
                }
                else {
                    $scope.$apply(function () {
                        $scope.systemMessage.text = error.message;
                    });
                    console.log(error.message);
                }

            },
            geo_options //safari is not burger king
        );
    };


// CREATE NEW LOCATION RECORD
    var createSiteRecord = function (lat, lng) {
        var site = new Site();
        site.SiteID = 0;
        site.MapID = $scope.MapRecord.MapID;
        site.MemberID = SharedStateService.getAuthenticatedMemberID();
        site.Latitude = lat;
        site.Longitude = lng;
        return site;
    };

    //CONFIRM SAVE NEW LOCATION
    // CALLED BY REVERSE GEOCODE ON NEW LOCS
    var confirmNewLocation = function (answer, userData) {
        var site = SharedStateService.Selected["Site"];
        site.Address = answer.address.formattedAddress;
      
        if (site.SiteID === 0) {  // its a new location
            $scope.rolloverSite(site);// tell children to clear out
            $scope.$apply(function () {
                if (SharedStateService.getAuthorizationState() === "CAN_EDIT")
                    $scope.ConfirmCancel.isShowing = true;
            });
        }else { // moved an existing location - disable for now
            DataTransportService.updateSite(site).then(
                function (result) {
                    SharedStateService.updateCache("Sites", "SiteID", result.data.SiteID, result.data);
                    $scope.systemMessage.text = "Location has been updated";
                    $scope.systemMessage.activate();
                    $scope.$apply();
                },
                function (error) {
                    $scope.systemMessage.text = "error loading map data";
                    $scope.systemMessage.activate();
                });
        }
    };


    // ATTEMPT TO LOOKUP ADDRESS OF NEWLY ADDED COORDINATE
    // SHOWS CONFIRM CANCEL

    var reverseGeocode = function (lat, long) {
        SharedStateService.getSearchManager().then(function () {
            var geocoder = new Microsoft.Maps.Search.SearchManager($scope.mapInstance);
            var reverseGeocodeRequestOptions = {
                location: new Microsoft.Maps.Location(lat, long),
                callback: confirmNewLocation
            };
            // make the call files are loaded
            geocoder.reverseGeocode(reverseGeocodeRequestOptions);
        });

    };



    // ADD NEW LOCATION TO THE MAP
    var addLocation = function (pos) {
            var siteRecord = createSiteRecord(pos.latitude, pos.longitude);
            SharedStateService.Selected["Site"] = siteRecord;
            var currentPosition = new Microsoft.Maps.Location(pos.latitude, pos.longitude);
            var marker = createMarker(pos.latitude, pos.longitude);
            if (pushpinCollection === null) {
                pushpinCollection = new Microsoft.Maps.Layer();
                $scope.mapInstance.layers.insert(pushpinCollection);
            }
        pushpinCollection.add(marker);
        $scope.$apply(function () {
            $scope.mapInstance.setView({ center: currentPosition, zoom: 16 });
        });
        reverseGeocode(pos.latitude, pos.longitude);
    };



    /***************EDIT LOCATION**********************/

    $scope.editLocation = function (pos, siteRecord) {
        siteRecord.Latitude = pos.latitude;
        siteRecord.Longitude = pos.longitude;
        reverseGeocode(pos.latitude, pos.longitude);
    };

  

    var createMarker = function (latitude, longitude) {
        var loc = new Microsoft.Maps.Location(latitude, longitude)
        var pin = new Microsoft.Maps.Pushpin(loc, { anchor: (17, 17), enableHoverStyle: true, draggable: false });
        return pin;
    };

  
/****SEARCH****************************************/
  

    $scope.geocodeAddress = function () {
        var geocoder = SharedStateService.getSearchManager().then(
            function (data) 
            {
                $scope.selectedState.searchSelected = false;
                var    searchManager = new Microsoft.Maps.Search.SearchManager($scope.mapInstance);
              
                var requestOptions = {
                    where: $scope.Search.Address,
                    callback: function (answer, userData) {
                        $scope.mapInstance.setView({ center: answer.results[0].location, zoom: 12 });
                        $scope.mapInstance.entities.push(new Microsoft.Maps.Pushpin(answer.results[0].location));
                        var thePlace = answer.results[0];
                        var lat = thePlace.location.latitude;
                        var lng = thePlace.location.longitude;
                        var siteRecord = createSiteRecord(lat, lng);
                        siteRecord.Address = thePlace.address.formattedAddress;
                        siteRecord.Name = thePlace.Name;
                        SharedStateService.Selected["Site"]=  siteRecord;
                        if (SharedStateService.getAuthorizationState() === 'CAN_EDIT')
                            $scope.ConfirmCancel.isShowing = true;
                        
                        $scope.Search.Address = null;
                        $scope.$apply();
                    }// end callback;

                }// end request options

                searchManager.geocode(requestOptions);

            },// end if the module loaded
            function (error) {
                $scope.systemMessage.text = "error enabling search";
                $scope.systemMessage.activate();

            } );

        };
       


    if (typeof Microsoft !== "undefined" )
        afterLoaded();
   

}); 