angularTraveloggia.controller("MapListController", function (SharedStateService, $scope, $location,$routeParams, DataTransportService, $window, $http) {

    //initialize
    $scope.selectedState = {
        addSelected: false,
        editSelected: false,
        deleteSelected: false,
       
    };

    $scope.selectedMapID = $routeParams.mapID;
    $scope.selectedMap = SharedStateService.Repository.get("Map");

    $scope.switchMap = function (map) {
        SharedStateService.clearMap();
        $scope.selectedMap = map;
       
    };


    $scope.switchAndGo = function (map) {
        $scope.switchMap(map);
        $scope.goMapFirstTime(map);
    };


    var loadMapList = function () {
        var cachedMapList = SharedStateService.Repository.get("MapList");
        var currentUserId = SharedStateService.getAuthenticatedMemberID();
        console.log("map list fetching for user ", currentUserId)
        if (cachedMapList == null || cachedMapList.length < 1 || cachedMapList[0].MemberID !=currentUserId ) {
            DataTransportService.getMapList(currentUserId).then(
                function (result) {
                    $scope.MapList = result.data;
                    SharedStateService.Repository.put("MapList", result.data);
                },
                function (error) {
                    $scope.systemMessage.text = "error loading maps";
                    $scope.systemMessage.activate();
                }
            )// end then
        }
        else {
            $scope.MapList = SharedStateService.Repository.get('MapList');
        }
    };


    $scope.showMapEditWindow = function (action) {
        var authState = SharedStateService.getAuthorizationState();
        if (authState === "READ_ONLY") {
            $scope.systemMessage.text = "sign in or create an account to create maps";
            $scope.systemMessage.activate();
        }
        else {
            if (action === "add") {
                $scope.selectedState.addSelected = true;
                createMap();
            }
            else if (action === "edit")
                $scope.selectedState.editSelected = true;
        }
    };


    $scope.editMap = function () {

        var authState = SharedStateService.getAuthorizationState();
        if (authState === "READ_ONLY") {
            $scope.systemMessage.text = "sign in or create an account to edit maps";
            $scope.systemMessage.activate();
        }
        else {
            if (parseInt($routeParams.mapID ) <= 6088) {
                $scope.systemMessage.text = "map name may not be edited";
                $scope.systemMessage.activate();
            }
            else
                $scope.showMapEditWindow("edit");

        }
    };


    var createMap = function () {
        var anotherMap = new Map();
        anotherMap.MemberID = SharedStateService.getAuthenticatedMemberID();
        $scope.selectedMap = anotherMap;
       
    };


    $scope.confirmDelete = function () {
        var authState = SharedStateService.getAuthorizationState();
        if (authState == "READ_ONLY") {
            $scope.systemMessage.text = "sign in or create an account to delete maps";
            $scope.systemMessage.activate();
        }
        else {
            $scope.ConfirmCancel.question = "Delete " + $scope.selectedMap.MapName + " ?";
            $scope.ConfirmCancel.ccConfirm = $scope.deleteMap;
            $scope.ConfirmCancel.ccCancel = $scope.dismiss;
            $scope.ConfirmCancel.isShowing = true;
        }
    };


    $scope.dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    };


    $scope.deleteMap = function () {
        $scope.ConfirmCancel.isShowing = false;
        if ($scope.selectedMap.MapID === SharedStateService.Repository.get("Map").MapID) {
            SharedStateService.clearMap();
            $scope.rolloverSite(null); 
        }

        DataTransportService.deleteMap($scope.selectedMap.MapID).then(
            function (result) {
                SharedStateService.deleteFromCache("MapList", "MapID", $scope.selectedMap.MapID);
                $scope.MapList = SharedStateService.Repository.get("MapList");
                if ($scope.MapList.length > 0) {
                    SharedStateService.Repository.put("Map", $scope.MapList[0]);
                    $scope.goMapList($scope.MapList[0].MapID);
                }
                else {
                    alert("all out of maps");
                }
                    
                $scope.systemMessage.text = "map deleted successfully";
                $scope.systemMessage.activate();
            },
            function (error) {
                $scope.systemMessage.text = "error deleting map";
                $scope.systemMessage.activate();

            });

    };


    $scope.saveMapEdit = function () {
        if ($scope.selectedMap.MapID == null) {
            $scope.selectedState.addSelected = false;
            DataTransportService.addMap($scope.selectedMap).then(
                function (result) {
                    // to do make a shared util method to add to the cache as we are doing for delete
                    var maplist = SharedStateService.Repository.get("MapList");
                    maplist.push(result.data);
                    $scope.MapList = maplist;
                    SharedStateService.clearMap();
                    SharedStateService.Repository.put("Map", result.data);
                    $scope.selectedMapID = result.data.MapID;
                    $scope.selectedMap = result.data;
                    $scope.systemMessage.text = "map was added successfully";
                    $scope.systemMessage.activate();
                    $scope.goMapFirstTime(result.data);
                },
                function (error) {
                    $scope.systemMessage.text = "error adding map";
                    $scope.systemMessage.activate();
                });
        }
        else if ($scope.selectedMap.MapID != null) {
            $scope.selectedState.editSelected = false;
            DataTransportService.updateMap($scope.selectedMap).then(
                function (result) {
                    SharedStateService.Repository.put("Map", result.data);
                    SharedStateService.updateCache("MapList", "MapID", $routeParams.mapID, mapToEdit);
                    $scope.MapList = SharedStateService.Repository.get("MapList");
                    $scope.systemMessage.text = "map was updated successfully";
                    $scope.systemMessage.activate();
                },
                function (error) {
                    $scope.systemMessage.text = "error updating map";
                    $scope.systemMessage.activate();
                });
        }
    };


    $scope.cancelMapEdit = function () {
        $scope.selectedState.addSelected = false;
        $scope.selectedState.editSelected = false;
        if (SharedStateService.Selected["Map"] != null)
            $scope.selectedMap = {
                MapID: SharedStateService.Selected["Map"].MapID,
                MapName: SharedStateService.Selected["Map"].MapName()
            };
    };

    

        // the kickoff
        loadMapList();

    });