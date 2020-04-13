angularTraveloggia.controller('SiteController', function ($scope, $location, $routeParams, SharedStateService, DataTransportService, $window, moment) {

    var VM = this;
    VM.siteDirty = false;

    // when we navigate with toolbar or window pane, we will have the routeparam
    var id = $routeParams.siteID;
    if (typeof id !== "undefined") {
        if (id === "0") {
            VM.Site = SharedStateService.Selected["Site"];
          // half baked site with only location data from geo search or geo locate
          // passed through shared storage from the map component
          // would rather use storage for reusable and communication for shuffling footballs
        }
        else
        VM.Site = SharedStateService.getSelectedSite(id);
    }
       
    $scope.$on("clearSite", function (event, data) {
        VM.Site = null;
    });


    // this is when toolbar list is used to select location
    // url params dont update
    $scope.$on("listSelect", function (event, data) {
        VM.Site = data;
        makeDates(data);
    });

    // this is when mouseover site on map page
    // url params dont update
    $scope.$on("rolloverSelect", function (event, data) {
        if ($routeParams.siteID !== "0") {
            if (data != null) {
                VM.Site = data;
                makeDates(data);

            }
          


        }
        
    });

    //// the point of this is auto save edits, since the save button is 
    //// at the bottom of the page and users are incredibly stupid and lazy
    //$scope.$on('$locationChangeStart', function (event, next, current) {

    //    if (current.indexOf("/Site") > -1) {
    //        if (VM.Site != null && VM.siteDirty === true || SharedStateService.Selected["Site"].SiteID === 0) {
    //             event.preventDefault();
    //             $scope.systemMessage.text = "please use the save or cancel button at the bottom of the page";
    //             $scope.systemMessage.activate();
              
    //       }
    //    }
    //});



    VM.setDirty = function () {
        VM.siteDirty = true;
    };

    $window.dropIt = function (ctrl) {
        if ($("#" + ctrl)[0]._flatpickr == null)
            $("#" + ctrl).flatpickr(
                {
                    enableTime: true,
                    allowInput: false,
                    // dateFormat: 'M j Y  h:i',
                    dateFormat: 'm /d /Y  h:i',
                    onChange: function (selectedDates, dateStr, instance) {
                        setDateTime(dateStr, ctrl)
                    }
                });

        $("#" + ctrl)[0]._flatpickr.toggle();

    };

    // sorry this is so hideous but angular monster digests the control
    // entirely directives wont help
    $window.setDateTime = function (strDate, prop) {
        if (VM.Site) {
            $scope.$apply(function () {
                switch (prop) {
                    case "Arrival":
                        VM.Site.Arrival = strDate;
                        break;
                    case "Departure":
                        VM.Site.Departure = strDate;
                        break;
                }
            });
        }
    };


    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    };


    $scope.updateModel = function (event) {
        var el = event.target;
    };


    function makeDates(site) {
        if (site.Arrival)
            site.Arrival = new Date(site.Arrival);
        if (site.Departure)
            site.Departure = new Date(site.Departure);
    }




    VM.saveSite = function () {
        if ($routeParams.siteID === "0")
            VM.addSite();
        else
            VM.updateSite();
    };


    VM.addSite = function () {
        if (VM.Site.Name == null)
            VM.Site.Name = VM.Site.Address;
        if ($scope.Capabilities.currentDevice.deviceType === "mobile" )
            VM.Site.Arrival = moment().format('M/D/YYYY h:m a');
        DataTransportService.addSite(VM.Site).then(
            function (result) {
                var cachedSites = SharedStateService.Repository.get('Sites');
                cachedSites.push(result.data);
                SharedStateService.Repository.put("Sites", cachedSites);
                SharedStateService.Selected["Site"] = result.data;
                // invalidate cache of child records
                SharedStateService.Repository.put('Photos', []);
                SharedStateService.Repository.put('Journals', []);
                VM.Site = result.data;
                VM.siteDirty = false;
                $scope.systemMessage.text = "Location saved successfully";
                $scope.systemMessage.activate();
                $scope.goAlbum();
            },
            function (error) {
                $scope.systemMessage.text = "Error saving location";
                $scope.systemMessage.activate();
            }
        );
    };


    VM.updateSite = function (nextLocation) {
        if (VM.Site.Name == "" || VM.Site.Name == null)
            VM.Site.Name = VM.Site.Address;
        DataTransportService.updateSite(VM.Site).then(
            function (result) {
                $scope.systemMessage.text = "Location edits saved successfully";
                $scope.systemMessage.activate();
                VM.siteDirty = false;
                if (nextLocation != null)
                    $location.path(nextLocation);
            },
            function (error) {
                $scope.systemMessage.text = "Error saving location";
                $scope.systemMessage.activate();
                //to do log error
            }
        );
    };


    var deleteSite = function () {
        $scope.ConfirmCancel.isShowing = false;
        VM.Site.IsDeleted = true;
        DataTransportService.updateSite(VM.Site).then(
            function (result) {
                SharedStateService.deleteFromCache("Sites", "SiteID", VM.Site.SiteID);
                SharedStateService.Selected["Site"] = null;
                $scope.systemMessage.text = "Location deleted successfully";
                $scope.systemMessage.activate();
                $location.path("/Map/" + $routeParams.mapID);
            },
            function (error) {
                $scope.systemMessage.text = "Error deleteing location";
                $scope.systemMessage.activate();
            }
        );
    };

    var cancelChanges = function () {
        $scope.ConfirmCancel.isShowing = false;
        if (VM.Site.SiteID == 0) {
            SharedStateService.Selected["Site"] = null;
            $scope.systemMessage.text = "Location deleted successfully";
            $scope.systemMessage.activate();
            $location.path("/Map/" + $routeParams.mapID);
        }
       
    };
    //ConfirmCancel Handlers
    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    };

    VM.confirmDeleteSite = function () {
        $scope.ConfirmCancel.isShowing = true;
    };
    VM.confirmCancelChanges = function () {
        $scope.ConfirmCancel.question = "Cancel Changes ?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = cancelChanges();
        $scope.ConfirmCancel.isShowing = true;
    };

    if ($location.path().indexOf("/Site") > -1) {
        $scope.ConfirmCancel.question = "Delete Selected Location ?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = deleteSite;
    }



    VM.openURL = function () {
        if (VM.Site != null && VM.Site.URL != null)
            $window.open(VM.Site.URL);
    };

    VM.sendEmail = function () {
        $window.open('mailto:' + VM.Site.Email);
    };



});