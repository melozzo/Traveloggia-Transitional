
    angularTraveloggia.directive('confirmCancel', function () {
    return {
        restrict: 'E',
        templateUrl: "common/confirm-cancel.html",
        scope: {
            question: '=',
            'confirm':'&onConfirm' , // we love how camel caseing changes to lower case dash separated
            'cancel':'&onCancel'
            }
    
    }// end return directive

})