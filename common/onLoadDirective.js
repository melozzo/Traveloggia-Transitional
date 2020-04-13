
// used by the photos on load to determine size and orientation
//angularTraveloggia.directive('onLoad', ['$parse', function ($parse) {
//    return {
//        restrict: 'A',
//        link: function (scope, elem, attrs) {
//            var fn = $parse(attrs.onLoad);
//            elem.on('load', function (event) {
//                scope.$apply(function () {
//                    fn(scope, { $event: event });
//                });
//            });
//        }
//    };
//}]);


angularTraveloggia.directive('onLoad', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var fn = $parse(attrs.onLoad);
            elem.bind('load', function (event) {
                scope.$apply(function () {
                    fn(scope, { $event: event });
                });
            });
        }
    };
}]);

