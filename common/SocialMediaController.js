



angularTraveloggia.controller('SocialMediaController', function ($scope, $location, $window, $routeParams, SharedStateService) {

    $scope.selectedMapID = $routeParams.mapID;
    $scope.selectedSiteID = $routeParams.siteID;
    $scope.selectedPhotoID = $routeParams.photoID;
    $scope.selectedPage = $location.path().toString().split("/")[1];
    $scope.selectedState.linkSelected = false;
   

    $scope.constructShareUrl = function () {

        const selectedMapID = $routeParams.mapID;
        const selectedSiteID = $routeParams.siteID;
        const selectedPhotoID = $routeParams.photoID;
        const selectedJournalID = $routeParams.journalID;
        const selectedPage = $location.path().toString().split("/")[1];
        let shareURL = "https://traveloggia.pro/#/" + selectedPage + "/" + selectedMapID;
        if (typeof selectedSiteID !== "undefined")
            shareURL += "/" + selectedSiteID;
        if (typeof selectedPhotoID !== "undefined")
            shareURL += "/" + selectedPhotoID;
        if (typeof selectedJournalID !== "undefined")
            shareURL += "/" + selectedJournalID;

        return shareURL;

    };




    $scope.shareUrl = $scope.constructShareUrl();

     getPreviewPhoto = function (photo) {
        var pic = photo;
        var photoURL = "http://www.traveloggia.pro/image/compass.gif";
        var rawURI = "";
        var imageServer1 = "https://s3-us-west-2.amazonaws.com";
        var imageServer2 = "http://www.traveloggia.net";
        var mapID = $routeParams.mapID;
        if (pic != null) {
            var imagePath = SharedStateService.getAuthenticatedMemberID() + "/" + mapID + "/";
            if (pic.StorageURL != null) {
                rawURI = "/traveloggia-guests/" + imagePath + pic.FileName;
                photoURL = imageServer1 + rawURI;
            }
            else {
                rawURI = "/upload/" + imagePath + pic.FileName;
                photoURL = imageServer2 + rawURI;
            }
        }
        return photoURL;
    },



    $scope.facebook = function () {

            let link = $scope.constructShareUrl();
            var photo = SharedStateService.getSelectedPhoto($routeParams.photoID);
            let imageUrl = getPreviewPhoto(photo);
            let mapName = SharedStateService.Repository.get("Map").MapName;
            let site = SharedStateService.getSelectedSite($routeParams.siteID);

            FB.ui({
                method: 'share_open_graph',
                action_type: 'og.likes',
                action_properties: JSON.stringify({
                    object: {
                        'og:url': link,
                        'og:title': mapName + ", " + site.Name,
                        'og:description': "see where on Traveloggia",
                        'og:image': imageUrl
                    }
                })
            },
                function (response) {
                    if (response != null) {
                        $scope.$apply(function () {
                            $scope.systemMessage.text = "Thank you for sharing an image from Traveloggia on facebook! ";
                            $scope.systemMessage.activate();
                        });
                    }
                });
        
    };

    

    $scope.pinterest = function () {
        let link = $scope.constructShareUrl();
        var photo = SharedStateService.getSelectedPhoto($routeParams.photoID);
        let imageUrl = getPreviewPhoto(photo);
        var x = PDK.pin(imageUrl, "from Traveloggia ", link);
        $scope.systemMessage.text = "Thank you for sharing an image from Traveloggia on pinterest! ";
        $scope.systemMessage.activate();
        
    };

    $scope.twitter = function () {
        
        let url = "https://twitter.com/intent/tweet?via=Traveloggia&text=";
        var photo = SharedStateService.getSelectedPhoto($routeParams.photoID);
        let imageUrl = getPreviewPhoto(photo);

        if ($routeParams.journalID != null) {
            var journalToShare = SharedStateService.getJournal($routeParams.journalID);
            var journalText = journalToShare.Text.replace(/(<([^>]+)>)/ig, "");
            journalText = journalText.substring(0, 140);
            text = encodeURIComponent(journalText);
            url += text;
            if (journalToShare.KeyWords != null)
                url += "&hashtags=" + journalToShare.KeyWords;
        }
        else {
            text = encodeURIComponent("Sharing a map on Traveloggia");
            url += text;
        }
        let link = $scope.constructShareUrl();
        url += "&url=" + encodeURIComponent(link);
        $window.location.href = url;
    };


    $scope.sendEmail = function () {
        let mapName = SharedStateService.Repository.get("Map").MapName;

        let mapPath = $scope.constructShareUrl();

        let encoded = encodeURIComponent(mapPath);

        var url = "mailto:?subject=Traveloggia Map&body=Sharing a map from Traveloggia: " + '%0A' + mapName + '%0A' + encoded +  '%0A' ;
        $window.open(url);
    };


    $scope.toggleLink = function () {
        $scope.shareUrl = $scope.constructShareUrl();
        $scope.selectedState.linkSelected = $scope.selectedState.linkSelected === true ? false : true;
    };

});