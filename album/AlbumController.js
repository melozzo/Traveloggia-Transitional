

angularTraveloggia.controller('AlbumController', function ($scope, $location, $routeParams, DataTransportService, SharedStateService, $window) {

    $scope.PhotoList = [];
    $scope.imageServer;
    $scope.oldImagePath;
    $scope.imagePath;

    var initializePaths = function () {
        if (SharedStateService.Repository.get("Map") == null)
            return;
        $scope.imageServer = "https://s3-us-west-2.amazonaws.com/traveloggia-guests/";
        $scope.oldImagePath = "http://www.traveloggia.net/upload/" + SharedStateService.getAuthenticatedMemberID() + "/" + SharedStateService.Repository.get("Map").MapName + "/";
        $scope.imagePath = SharedStateService.getAuthenticatedMemberID() + "/" + SharedStateService.Repository.get("Map").MapID + "/";
    };


    var loadPhotos = function (id) {
        // its a new site with no photos yet and no site id 
        if (id === "0") {
            $scope.$apply(function () {
                $scope.PhotoList = [];
            });
            return;
        }
            
        initializePaths();

        SharedStateService.getPhotos(id)
            .then(function (photos) {
                $scope.$apply(function () {
                    var photoID = $routeParams.photoID;
                    $scope.PhotoList = photos;
                    $scope.selectedPhoto = SharedStateService.getSelectedPhoto(photoID);
                });
               
            })
            .catch(function (error) {
                $scope.systemMessage.text = "error loading photos";
                $scope.systemMessage.activate();
            });
    };




   var siteID = $routeParams.siteID;
    if (typeof siteID !== "undefined")
        loadPhotos(siteID);


    $scope.$on("updatePhotoList", function () {
        $scope.PhotoList = SharedStateService.Repository.get("Photos");
    });

     // this is when toolbar list is used to select location
    // url params dont update
    $scope.$on("listSelect", function (event, data) {
        var selectedSite = data;
        $scope.PhotoList = [];
        loadPhotos(data.SiteID);
        if ($location.path().indexOf("Photo") > -1)
            $scope.goAlbum();
    });

    $scope.$on("clearSite", function (event, data) {
        $scope.PhotoList = [];
    });

// this is when mouseover site on map page
    // url params dont update
    $scope.$on("rolloverSelect", function (event, data) {
        var selectedSite = data;
        $scope.PhotoList = [];
        if(selectedSite != null )
        loadPhotos(data.SiteID);
    });
    
    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    };
  
    $scope.selectPhoto = function (photo) {
      //  SharedStateService.Selected["Photo"] = photo; 
        $scope.selectedPhoto = photo;
        var mapID = SharedStateService.Repository.get("Map").MapID;
        var siteID = SharedStateService.getSiteID();
        $location.path("/Photo/" + mapID + "/" + siteID + "/" + photo.PhotoID);
    };


    //***********IMAGE MANIPULATION CRAP TO BE REPLACED BY CSS **********************
    var toolbarHeight = 66;
    $scope.viewFrameWidth = $window.document.getElementById("viewFrame").clientWidth;
    $scope.viewFrameHeight = ($window.document.getElementById("viewFrame").clientHeight) - toolbarHeight;
    var widthMinusPad = $scope.viewFrameWidth - 38;
    var heightMinusPad = $scope.viewFrameHeight - 32;
    var scrollContainer = $window.document.getElementById("albumScrollContainer");
    var scrollWidth = 17;// 0;
    var widthMinusPadScroll = widthMinusPad - scrollWidth;
    var widthMinusPadScrollBorder = widthMinusPadScroll - 21; //gold border and pink dash to make images look like buttons 

    var previewWidth = $window.document.getElementById("previewFrame").offsetWidth;
    var previewHeight = (($scope.reliableHeight - 12) * .33) - 28;

    $scope.previewImageStyle = {
        "height": previewHeight,
        "width": previewWidth - 32,
    };

    $scope.getPreviewImageClass=()=>{
        if(!$scope.PhotoList || $scope.PhotoList.length === 0)
        return;
        console.log('orientation'+ $scope.PhotoList[0].orientationID)
        let className=""
        switch( $scope.selectedPhoto.orientationID) {
            case 1:
                className = "rotate0";
                break;
            case 8:
                    className = "rotatemin90";
                    break;

            default:
                className = "rotate0"
                break;

        }

        return className;
    }

    $scope.imageRefresher = {
        queryString: "?reload=" + Math.random()
    };
    $scope.SaveSizeAndSwap = function (event, Photo) {
        console.log("event handler for on image load learn size upon load if not already stored");
        var loadedImage = event.target;
        if (Photo.Height == null || Photo.Width == null) {
            Photo.Height = loadedImage.height;
            Photo.Width = loadedImage.width;
            DataTransportService.updatePhoto(Photo).then(function (result) {
                    SharedStateService.updateCache("Photo", "PhotoID", Photo.PhotoID, result.data);
                    console.log("uploaded photo dimensions");
                },
                function (error) {
                    console.log("error updating photo height and width");
                });
        }
        //swap out hour glass
        var parentDiv = loadedImage.parentElement;
        var temp = parentDiv.getElementsByTagName("img")[0];
        temp.style.display = "none";
        var pic = parentDiv.getElementsByTagName("img")[1];
        pic.style.display = "inline";
    };


    $scope.getImageStyle = function (Photo) {
        if (Photo == null)
            return;
        if (Photo.Height == null || Photo.Width == null)
            return;
        var origH = Photo.Height;
        var origW = Photo.Width;
        var maxH = heightMinusPad;
        var maxW;
        if ($scope.Capabilities.alreadyKnowsHow === true)
            maxW = ($location.path().indexOf( "/Album") > -1) ? widthMinusPad - 20 : widthMinusPad;
        else
            maxW = ($location.path().indexOf("/Album") > -1 ) ? widthMinusPadScrollBorder : widthMinusPadScroll;
        var w = calculateAspectRatio(origH, origW, maxH, maxW);
        return { "width": w };
    };

    var calculateAspectRatio = function (origH, origW, maxH, maxW) {
        var orientation = (origH >= origW) ? "portrait" : "landscape";
        if (orientation === "landscape") {
            var landscapeWidth = maxW;
            var lStyle = { "width": landscapeWidth };
            var calculatedHeight = (origH * maxW) / origW;
            if (calculatedHeight > maxH) {
                var calculatedWidth = (maxH * origW) / origH;
                landscapeWidth = Math.round(calculatedWidth);
            }
            //$scope.whateverStyle.width = landscapeWidth;
            return landscapeWidth;
        }
        if (orientation === "portrait") {
            var portraitHeight = maxH;
            var portraitWidth = null;
            var pStyle = {
                "height": portraitHeight,
                "width": portraitWidth
            };
            calculatedWidth = (maxH * origW) / origH;
            if (calculatedWidth > maxW) {
                calculatedHeight = (origH * maxW) / origW;
                portraitHeight = Math.round(calculatedHeight);
                portraitWidth = maxW;
            }
            else
                portraitWidth = calculatedWidth;
            //$scope.whateverStyle.height = pStyle;
            return portraitWidth;
        }
    };



    // rotates image if nescessary 
    $scope.RotateAndSwap = function (e, orientationID, Photo) {
        var loadedImage = e.target;
        doRotation(orientationID, loadedImage);
        // swap out the hour glass for the rotated canvas
        var parentDiv = loadedImage.parentElement;
        var temp = parentDiv.getElementsByTagName("img")[0];
        temp.style.display = "none";
        var pic = parentDiv.getElementsByTagName("canvas")[0];
        pic.style.display = "inline-block";
    };


    var doRotation = function (orientationID, loadedImage) {
        var degrees = 0;
        var maxHeight = 0;
        var maxWidth = 0;


        if ($location.path().indexOf("/Album") > -1 ) {
            var scrollContainer = $window.document.getElementById("albumScrollContainer");
            var widthMinusPadScroll = widthMinusPad - scrollWidth;
            var widthMinusBorderBackground = widthMinusPadScroll - 14;
            maxHeight = heightMinusPad;
            maxWidth = widthMinusBorderBackground;
        }
        else if ($location.path().indexOf("/Photo") > -1 ) {
            maxHeight = heightMinusPad;
            maxWidth = widthMinusPad - scrollWidth;
        }
        else//preview frame rotation?
        {
            maxHeight = $scope.previewMapStyle.height;
            maxWidth = $scope.previewMapStyle.width;

        }


        var scaledWidth = maxHeight;
        var height = loadedImage.height;
        var width = loadedImage.width;
        var x;

        //   height/width = x/maxHeight;
        //  height * scaledWidth = x * width;
        x = (height * scaledWidth) / width;
        if (x > maxWidth) {
            var y = 0;
            //height/width =  maxWidth/y
            //  height * y = maxWidth * width
            y = (width * maxWidth) / height;
            scaledWidth = y;
            x = maxWidth;

        }
        var canvas = loadedImage.parentNode.getElementsByTagName("canvas")[0];
        var ctx = canvas.getContext("2d");
        ctx.save();

        canvas.width = x;
        canvas.height = scaledWidth;
        // ctx.drawImage(loadedImage, 0,0,scaledWidth, x);
        ctx.restore();

        switch (orientationID) {
            case 1:
                degrees = 0;
                break;
            case 2:
                degrees = 0;
                break;
            case 3:
                degrees = 180;
                var w = maxWidth;
                var h = (maxWidth * loadedImage.height) / loadedImage.width;
                canvas.width = w
                canvas.height = h
                ctx.translate(w / 2, h / 2)// move the origin to the center of the canvas so rotate will rotate around the center
                ctx.rotate(degrees * Math.PI / 180);
                ctx.drawImage(loadedImage, -w / 2, -h / 2, w, h);//specify starting coords ( back out from the center to get upper left corner )
                break;
            case 4:
                degrees = 0;
                break;
            case 5:
                degrees = 90;
                ctx.translate(width / 2, height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveLeft = ((width / 2) - (height / 2)) * 2
                ctx.translate(0, moveLeft)
                ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
                break;
            case 6:
                ctx.save();
                degrees = 90;
                //this step moves the origin ( from which point we rotate)
                // from the top left corner to the center of the canvas !
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveLeft = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(0, moveLeft)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
            //degrees = 90;
            //ctx.translate(width / 2, height / 2);
            //ctx.rotate(degrees * Math.PI / 180);
            //var moveLeft = ((width / 2) - (height / 2)) * 2
            //ctx.translate(0, moveLeft)
            //ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
            //break;
            case 7:
                ctx.save();
                degrees = -90;
                degrees = -90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveDown = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(-moveDown, 0)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
            //degrees = -90;
            //degrees = -90;
            //ctx.translate(width / 2, height / 2);
            //ctx.rotate(degrees * Math.PI / 180);
            //var moveDown = ((width / 2) - (height / 2)) * 2
            //ctx.translate(-moveDown, 0)
            //ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
            //break;
            case 8:
                ctx.save();
                degrees = -90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveDown = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(-moveDown, 0)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
            //degrees = -90;
            //ctx.translate(width / 2, height / 2);
            //ctx.rotate(degrees * Math.PI / 180);
            //var moveDown = ((width / 2) - (height / 2)) * 2
            //ctx.translate(-moveDown, 0)
            //ctx.drawImage(loadedImage, -height/2, -width/2, width, height);
            //break;
        }

    };


    // rotates image if nescessary 
    $scope.onPreviewImageLoad = function (e, orientationID, Photo) {
        console.log("on image load, event handler for on image load");
        var loadedImage = e.target;

        doPreviewRotation(orientationID, loadedImage);

        var parentDiv = loadedImage.parentElement;

        var pic = parentDiv.getElementsByTagName("canvas")[0];
        pic.style.display = "inline";
       
    };




    var doPreviewRotation = function (orientationID, loadedImage) {
        var degrees = 0;
        var maxHeight = 0;
        var maxWidth = 0;
        var portraitWidth = null;
        var portraitHeight = null;
        maxHeight = $scope.previewMapStyle.height;
        maxWidth = $scope.previewMapStyle.width;
        var canvas = loadedImage.parentNode.getElementsByTagName("canvas")[0];
        var ctx = canvas.getContext("2d");


        // ctx.drawImage(loadedImage, 0,0,scaledWidth, x);
        // ctx.restore();

        switch (orientationID) {
            case 1:
                degrees = 0;
                break;
            case 2:
                degrees = 0;
                break;
            case 3:
                degrees = 180;
                var w = maxWidth;
                var h = (maxWidth * loadedImage.height) / loadedImage.width;
                canvas.width = w
                canvas.height = h
                ctx.translate(w / 2, h / 2)// move the origin to the center of the canvas so rotate will rotate around the center
                ctx.rotate(degrees * Math.PI / 180);
                ctx.drawImage(loadedImage, -w / 2, -h / 2, w, h);//specify starting coords ( back out from the center to get upper left corner )
                break;
            case 4:
                degrees = 0;
                break;
            case 5:
                degrees = 90;
                ctx.translate(width / 2, height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveLeft = ((width / 2) - (height / 2)) * 2
                ctx.translate(0, moveLeft)
                ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
                break;
            case 6:
                var previewImageWidth = previewWidth - 32;
                canvas.height = previewHeight;
                canvas.width = previewImageWidth;
                degrees = 90;

                var stageCanvas = document.createElement("canvas");
                 portraitHeight = (previewImageWidth * loadedImage.width) / loadedImage.height;
                stageCanvas.height = portraitHeight;
                stageCanvas.width = portraitHeight;
                stageCtx = stageCanvas.getContext("2d");
                stageCtx.translate(portraitHeight / 2, portraitHeight / 2);
                stageCtx.rotate(degrees * Math.PI / 180);
                // var scaleFactor = previewWidth / loadedImage.height;
                // stageCtx.scale(0, scaleFactor);
                // because of rotation presumably h and w are reversed chump
                var verticalDiff = (portraitHeight - previewImageWidth) / 2;
                var totalVDiff = portraitHeight / 2 + verticalDiff / 2
                var horizontalDiff = (portraitHeight - previewImageWidth) / 2;
                var totalHDiff = portraitHeight / 2;
                // because of rotation presumably h and w are reversed chump
                stageCtx.drawImage(loadedImage, -totalVDiff, -totalHDiff, previewImageWidth, portraitHeight);
                stageCtx.save();

                ctx.drawImage(stageCanvas, 0, 0, previewImageWidth, portraitHeight);

                ctx.restore();
                break;

            case 7:
                ctx.save();
                degrees = -90;
                degrees = -90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveDown = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(-moveDown, 0)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
            //degrees = -90;
            //degrees = -90;
            //ctx.translate(width / 2, height / 2);
            //ctx.rotate(degrees * Math.PI / 180);
            //var moveDown = ((width / 2) - (height / 2)) * 2
            //ctx.translate(-moveDown, 0)
            //ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
            //break;
            case 8:
                ctx.save();
                degrees = -90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                moveDown = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(-moveDown, 0)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
            //degrees = -90;
            //ctx.translate(width / 2, height / 2);
            //ctx.rotate(degrees * Math.PI / 180);
            //var moveDown = ((width / 2) - (height / 2)) * 2
            //ctx.translate(-moveDown, 0)
            //ctx.drawImage(loadedImage, -height/2, -width/2, width, height);
            //break;
        }

    };




    /***WATCH PHOTO ID*****/
    $scope.$watch(
        function (scope) {
            var x = $routeParams.photoID;
            if (typeof x !== "undefined")
                return x;
        },
        function (newValue, oldValue) {
            if (typeof newValue === "undefined")
                return;
            //   if ( newValue !== oldValue ) {
            $scope.selectedPhoto = SharedStateService.getSelectedPhoto(newValue);


            // }
        });



});

