
angularTraveloggia.controller('PhotoController', function ($scope, $location, $routeParams, DataTransportService, SharedStateService) {

 

    var deletePhoto = function () {
        $scope.ConfirmCancel.isShowing = false;
        var photoID = $routeParams.photoID;
        DataTransportService.deletePhoto(photoID).then(
            function (result) {
                var cachedPhotos = SharedStateService.Repository.get('Photos');
                for (var i = 0; i < cachedPhotos.length; i++) {
                    if (cachedPhotos[i].PhotoID === $scope.selectedPhoto.PhotoID) {
                        cachedPhotos.splice(i, 1);
                        break;
                    }
                }
                $scope.systemMessage.text = "selected photo has been deleted";
                $scope.systemMessage.activate();
                var siteID = $routeParams.siteID;
                var mapID = $routeParams.mapID;
                $location.path("/Album/"+mapID + "/" + siteID);
            },
            function (error) {
                $scope.systemMessage.text = "error deleting photo record";
                $scope.systemMessage.activate();
            }
        );
    };


    if ($location.path().indexOf("/Photo") > -1 ) {
        $scope.ConfirmCancel.question = "Delete Selected Image ?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = deletePhoto;
    }



    $scope.updatePhoto = function () {
        DataTransportService.updatePhoto($scope.selectedPhoto).then(
            function (result) {
                $scope.systemMessage.text = " photo updated successfully";
                $scope.systemMessage.activate();
            },
            function (error) {
                $scope.systemMessage.text = "error updating photo record";
                $scope.systemMessage.activate();
            }
        );

    };


    //******************single photo edit page 


    //ConfirmCancel Handlers
    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    };

    $scope.confirmDeletePhoto = function () {
        $scope.ConfirmCancel.isShowing = true;
    };




});