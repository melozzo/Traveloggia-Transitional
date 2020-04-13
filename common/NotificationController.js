angularTraveloggia.controller("NotificationController", function ($routeParams, $scope, $location, $window, $timeout, $q, debounce) {

    $window.beHappy = function () {
        $scope.$broadcast("softIsHere");
    };
    
    $scope.Canceller = $q.defer();

    $scope.CancelRequest = function () {
        $scope.systemMessage.loadComplete = true;
        $scope.Canceller.resolve();
    };

    $scope.ConfirmCancel = {
        question: "",
        isShowing: false,
        ccCancel: null,
        ccConfirm: null
    };

    var resetDimensions = debounce(100, function () {
        console.log("debounce 100 mls");
        $window.location.reload();
    });

//called at the end of this page
    $scope.setDimensions = function () {
        $scope.reliableHeight = $window.innerHeight;
        $scope.reliableWidth = $window.innerWidth;
        $scope.toolbarHeight = 66;// $window.document.getElementById("toolbarRow").offsetHeight;
        var viewFrameHeight = $scope.reliableHeight - $scope.toolbarHeight;
        var viewFrameWidth = $window.document.getElementById("viewFrame").clientWidth;

        $scope.previewPaneStyle = {
            "height": (($scope.reliableHeight - 12) * .33) - 20//,
            ,"overflow": 'hidden!'
        //  "width": ($scope.reliableWidth * .3)-16
        };

        $scope.tableStyle = {
            "height": $scope.reliableHeight
        };

        // set on Index page outer div contianing ng-views
        $scope.previewStyle = {
            "height": $scope.reliableHeight,
            "max-height": $scope.reliableHeight,
        };


        $scope.scrollWindowStyle = {
            "height": viewFrameHeight,
            "max-height": viewFrameHeight,
        };

        $timeout($scope.setMapStyle, 100);
    };



    $scope.setMapStyle = function () {
        var vpHeight = $window.innerHeight - $scope.toolbarHeight;
        var vpWidth = $window.innerWidth;
        if (vpWidth > 768)
            vpWidth = vpWidth * .69;

        // just in case you want it... seems the same without decimal places      var viewFrameWidth = $window.document.getElementById("viewFrame").clientWidth;



        $scope.mapStyle = {
            "height": vpHeight,
            "width": vpWidth
        };


        // read by album controller it seems :(
        $scope.previewMapWidth = $window.document.getElementById("previewFrame").offsetWidth - 24;

        $scope.previewMapStyle = {
            "height": (($window.innerHeight - 12) * .33) - 28,
            "width": $scope.previewMapWidth
        };
    };



    // demonstrating use of inherited scope via nested controllers
    // even though some people think this is a big no no
  var isMapPage = ($location.path().indexOf("/MapList") === -1 && $location.path().indexOf("/Map") > -1  || $location.path() === "/") ? true : false;

    var userAgentParser = new UAParser();
    var result = userAgentParser.getResult();
    var device = new Device();
    device.osName = result.os.name;
    device.osVersion = result.os.version;
    device.browserName = result.browser.name;
    device.browserVersion = result.browser.version;
    device.engineName = result.engine.name;
    device.engineVersion = result.engine.version;
    device.deviceModel = result.device.model;
    device.deviceType = result.device.type;
    device.deviceVendor = result.device.vendor;

    $scope.Capabilities = {
        height:$scope.reliableHeight,
        alreadyKnowsHow: false,
        currentDevice: device,
        cantResize:false
    };

    if (result.browser.name != null && result.browser.version != null) {
        var browserNumber = parseInt(result.browser.version);
        $scope.Capabilities.alreadyKnowsHow = (result.browser.name == "Mobile Safari" && browserNumber>= 9) ? true : false;
    }

    if (result.os !== null && result.browser !== null) {
        $scope.Capabilities.cantResize = (result.os.name === "Windows Phone" && result.browser.version == "11.0") ? true : false;
        if ($window.innerWidth < 769)
            $scope.Capabilities.cantResize = true;
    }


    $scope.systemMessage = {
        cover: false,
        text: "",
        dismiss: function(){
            this.cover = false;
        },
        activate:function(){
            this.cover=true;
        },
        loadComplete: true
       
    };

    $scope.clearSplashReadOnly = function () {
        $scope.systemMessage.info = false;  
    };

    $scope.clearSplashCreate = function () {
        $scope.systemMessage.info = false;
        $location.path("/CreateAccount");

    };




   
  
    // kickoff
    $scope.setDimensions();




    if ($scope.Capabilities.cantResize === false)
        $window.addEventListener("resize", resetDimensions);



});