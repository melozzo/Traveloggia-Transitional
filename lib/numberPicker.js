angularTraveloggia.controller('NumPickerController', function NumPickerController($scope){
    
    $scope.incVal = function(){
      // $scope.animateUp = false;
        if (angular.isNumber($scope.val)) {
            if (!angular.isUndefined($scope.maxValue) && $scope.val >= $scope.maxValue) {
                return;
            };
            $scope.val++;
            if (!!$scope.onChange) {
                $scope.onChange({ value: $scope.val })
            }
        }
        else {
            $scope.val = 1;
        };

    };
    $scope.decVal = function(){
      // $scope.animateUp = true;
        if (angular.isNumber($scope.val))
        {
        if(!angular.isUndefined($scope.minValue) && $scope.val<=$scope.minValue){
          return;
        };
        $scope.val--;
        if(!!$scope.onChange){
          $scope.onChange({value: $scope.val})
        }
        }
        else
        {
            $scope.val =1;
        }
    }
    
    $scope.isMinValue = function(){
      if(angular.isNumber($scope.val) && !angular.isUndefined($scope.minValue)
         && $scope.val <= $scope.minValue){
        return true;
      };
      
      return false;
    };
    
    $scope.isMaxValue = function(){
      if(angular.isNumber($scope.val) && !angular.isUndefined($scope.maxValue)
         && $scope.val >= $scope.maxValue){
        return true;
      };
      
      return false;
    }
    
    $scope.$watch('val', function(newVal, oldVal){
      $scope.animateUp = newVal < oldVal ; 
    })
    
    // console.log($scope);
  });
  
angularTraveloggia.directive('mdNumPicker', function NumPickerDirective() {
    return {
        restrict: 'EC',
        controller: 'NumPickerController',
        scope: {
            val: '=ngModel',
            maxValue: '=*?',
            minValue: '=*?',
            onChange: '&'
        },
        template: [
          '<div layout="column" layout-align="center stretch">',
              '<md-button class="md-raised" ng-click="incVal()" ng-disabled="isMaxValue()">+</md-button>',
              '<div class="md-num-picker__content md-display-1" ng-class="{\'animate-up\': animateUp}">',
                '<div ng-animate-swap="val" class="md-num-picker__content-view">{{val}}</div>',
              '</div>',
              '<md-button class="md-raised" ng-click="decVal()" ng-disabled="isMinValue()">-</md-button>',
            '</div>'].join(' ').replace(/\s+/g, ' ')
    }
});
