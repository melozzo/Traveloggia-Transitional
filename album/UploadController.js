


angularTraveloggia.controller('UploadController', function ($scope, $routeParams, DataTransportService, SharedStateService,  moment) {

    //**************************upload functionality todo:move to its own page
    $scope.filesToUpload = null;

    $scope.photoRecords = [];

    // upon selecting file to upload
    $scope.fileNameChanged = function (mel) {
        var files = mel.files;
        if (files && files.length > 0) {
            // store file objects to be passed to http => aws
            $scope.filesToUpload = files;

            //display selected files in preview pane ( this will change ) 
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                // use the image loader componenet
                onFileSelected(file);
            }
        }
    }

    // used to display in preview pane
    function replaceResults(img) {
        var content;
        if (!(img.src || img instanceof HTMLCanvasElement)) {
            content = $('<span>Loading image file failed</span>');
        } else {

            content = $('<a target=_blank>').append(img)
                .attr('download', currentFile.name)
                .attr('href', img.src || img.toDataURL());
        }
        var previewContainer = angular.element("#previewPanel");
        previewContainer.append(content);

    }

    // used to display in preview pane
    function displayImage(file, options) {
        currentFile = file;
        if (!loadImage(
            file,
            replaceResults,
            options
        )) {
            result.children().replaceWith(
                $('<span>Your browser does not support the URL or FileReader API.</span>')
            )
        }
    }

    // displays in preview pane and creates record with exif data
    function onFileSelected(file) {
        var options = {
            maxWidth: 80,
            maxHeight: 80,
            canvas: true,
            pixelRatio: window.devicePixelRatio,
            downsamplingRatio: 0.5
        };

        loadImage.parseMetaData(file, function (data) {
            var exifData = null;
            var orientationID = null;
            if (data.exif) {
                options.orientation = data.exif.get('Orientation');
                exifData = data.exif.getAll();
                orientationID = options.orientation
            }
            var fileName = file.name; //.toUpperCase().replace('.JPG', '') + "tra_" + moment().format('hhmmss') + ".JPG"

            var dbRecord = createPhotoRecord(fileName, exifData, orientationID);
            // store in associative array so that at the right time ( after sucessful upload) we can post the record to db 
            $scope.photoRecords.push(dbRecord);
            displayImage(file, options);
        });
    }

    $scope.filesUploadedCount = 0;

    var createPhotoRecord = function (fileName, exif, orientationID) {
        var photoRecord = new Photo();
        photoRecord.SiteID = $routeParams.siteID;

        photoRecord.StorageURL = $scope.imageServer;

        photoRecord.FileName = fileName;
        if (exif != null) {
            photoRecord.orientation = exif.orientation;
            photoRecord.orientationID = orientationID;
            photoRecord.Width = exif.PixelXDimension;
            photoRecord.Height = exif.PixelYDimension
            // "YYYY:MM:DD HH:MM:SS" with time shown in 24-hour format, 
            // and the date and time separated by one blank character (hex 20).
            // will somebody just shoot me?
            if (exif.DateTimeOriginal != null) {
                var stringDateMess = exif.DateTimeOriginal;
                var justDate = stringDateMess.split(" ")[0];
                var ymd = justDate.split(":");
                var justTime = stringDateMess.split(" ")[1];
                var jsMonth = parseInt(ymd[1]) - 1;
                var hms = justTime.split(":");
                //   var hours = hms[0] > 12? parseInt(hms[0])-12:hms[0]
                var jsDate = new Date(ymd[0], jsMonth, ymd[2], hms[0], hms[1], hms[2]);
                var jsDateUTC = jsDate.toUTCString();

                photoRecord.DateTaken = jsDateUTC;
            }
        }
        return photoRecord;
    };



    $scope.handleUploadClick = function () {
        $scope.systemMessage.text = "working...";
        $scope.systemMessage.activate();
        angular.element("#previewPanel > a").remove();

        uploadFile();

    };



    $scope.UTCtoLocal = function (utc) {
        var localDate = Date.parse(utc);
    };
       

    $scope.addPhotoRecord = function (photoRecord) {
        DataTransportService.addPhoto(photoRecord).then(
            function (result) {
                var cachedPhotos = SharedStateService.Repository.get('Photos');
                cachedPhotos.push(result.data);
                $scope.filesUploadedCount = $scope.filesUploadedCount + 1;
                SharedStateService.Selected["Photo"] = result.data;
                $scope.$emit('updatePhotoList', false);
            },
            function (error) {
                $scope.systemMessage.text = "error adding photo record";
                $scope.systemMessage.activate();
            });
    };


    // utility function 
    function getObjectByProperty (list, property, value) {
        var obj = null;
        for (var i = 0; i < list.length; i++) {
            if (list[i][property] == value) {
                obj = list[i];
                break;
            }
        }
        return obj;
    }

    var uploadFile = function () {
        var memberID = SharedStateService.getAuthenticatedMemberID();
        var mapID = $routeParams.mapID? $routeParams.mapID:SharedStateService.Repository.get("Map").MapID;
        for (var i = 0; i < $scope.filesToUpload.length; i++) {
            (function (imageFile, fileName) {

                var photoRecord = getObjectByProperty($scope.photoRecords, "FileName", imageFile.name);
                fileName = imageFile.name.toUpperCase().replace('.JPG', '') + "_tra_" + moment().format('MMDDYYhhmmss') + ".JPG";
                photoRecord.FileName = fileName;
                $scope.photoRecords.push(photoRecord);
                DataTransportService.uploadImage(memberID, mapID, imageFile, fileName).then(
                    function (result) {
                        $scope.addPhotoRecord(photoRecord);
                    },
                    function (error) {
                        $scope.systemMessage.text = "error uploading photo";
                        $scope.systemMessage.activate();
                    });
            })($scope.filesToUpload[i]);

        }
        if ($scope.filesToUpload.length === $scope.filesUploadedCount) {
            if ($scope.filesUploadedCount === 1)
                $scope.systemMessage.text = "photo was uploaded successfuly";
            else if ($scope.filesUploadedCount > 1)
                $scope.systemMessage.text = $scope.filesUploadedCount + " photos were uploaded successfuly";
            $scope.systemMessage.activate();
        }

    };

    $scope.$watch(
        function (scope) {
            return $scope.filesUploadedCount;
        },
        function (newValue, oldValue) {
            if ($scope.filesToUpload && newValue === $scope.filesToUpload.length) {
                if ($scope.filesUploadedCount > 1)
                    $scope.systemMessage.text = $scope.filesUploadedCount + " photos uploaded successfully";
                else
                    $scope.systemMessage.text = " photo uploaded successfully";

                $scope.systemMessage.activate();
                $scope.filesToUpload = null;
                $scope.filesUploadedCount = 0;

            }
        }
    );



});
