

angularTraveloggia.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

angularTraveloggia.controller('SiteListController', function (SharedStateService, DataTransportService,  $scope,$q) {

    $scope.ScheduledSites = [];
    $scope.ready = false;

    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    };

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $scope.ready = true;
    });


    $scope.SaveList = function () {
      
        updateSites($scope.ScheduledSites).then(
            function (result) {
                SharedStateService.Repository.put("Sites", []);
                loadScheduledSites();
                $scope.systemMessage.text = "site list has been updated";
                $scope.systemMessage.activate();
            },
            function (error) {
                $scope.systemMessage.text = "error updating sites";
                $scope.systemMessage.activate();

            }
        );

    };

    var updateSites = function (arrayOfSites) {
        let deferred = $q.defer();
        let arrayOfPromises = [];
        arrayOfSites.forEach(function (site) {
            arrayOfPromises.push(DataTransportService.updateSite(site));
        });

        $q.all(arrayOfPromises).then(
            function (result) {
                deferred.resolve(result);
            },
            function (error) {
                deferred.reject(error);
            }
        );
        return deferred.promise;

    };


    $scope.goSiteDetail = function (site) {
        $scope.selectSite(site);
        
    };


    var loadScheduledSites = function () {
        var cachedSites = SharedStateService.Repository.get('Sites');
        if (cachedSites != null && cachedSites.length > 0) {
            $scope.ScheduledSites = cachedSites;
        }
        else {
            var selectedMapID = SharedStateService.getMapID();
            if (selectedMapID != null) {
                DataTransportService.getScheduledSites(selectedMapID)
                .then(function (result) {
                   // if (result.data.length > 0) {
                    SharedStateService.Repository.put("Sites", result.data);
                        $scope.ScheduledSites = result.data;
                   // }
                })
                .catch(function (error) {
                    console.log(error);
                });

            }
        }
    };

    
    
   loadScheduledSites();


});



