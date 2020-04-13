angularTraveloggia.controller('SignInController', function ($route, SharedStateService,DataTransportService,canEdit,readOnly,$location,$scope) {

    var VM = this;
    VM.Member = new Member();
    VM.authenticationStatus = {
        firstAttempt:($route.current.isCreate != null)?false:true,
        failedSignin: false,
        createAccount: ($route.current.isCreate != null) ? true : false,
        signedIn: (SharedStateService.getAuthorizationState() ==="CAN_EDIT") ? true:false
    };


    VM.authenticate = function () {
        DataTransportService.getMember(VM.Member.Email, VM.Member.Password).then(
            function (result, x, y, z, h) {
                // clear default map loaded with default display user's data
                SharedStateService.clearAll();
                $scope.broadcastClearSite();
                SharedStateService.setAuthenticatedMember(result.data);
                // to do check if logging in as default user anyway dont clear
                SharedStateService.setAuthorizationState(canEdit);
                $location.path("/Map");
            },
            function (error) {
                VM.Member = new Member();
                VM.authenticationStatus.failedSignin = true;
                VM.authenticationStatus.firstAttempt = false;
                VM.authenticationStatus.createAccount = true;
            }
        );
    };

    VM.goSignInPage = function () {
        $location.path("/SignIn/0/0");
    };

    VM.signIn = function () {
        SharedStateService.clearAll();
        try {
            $scope.broadcastClearSite();
        } catch (error) {
            alert(error.Message);
        }

        if (VM.Member.Email == null && VM.Member.Password == null) {
            SharedStateService.readOnlyUser = true;
            VM.member.MemberID = 1;
            $scope.systemMessage.text = "As you have not provided email or password you can navigate the site with read only privledges. Please create an account, to develop your own content.";
            $scope.systemMessage.activate();
            // to do add db logging date time referrer for attempted illegal access
            VM.authenticate();
        }
        else
            VM.authenticate();
    };

    VM.signOut = function () {
        SharedStateService.setAuthenticatedMember({ MemberID: 1 });
        SharedStateService.setAuthorizationState(readOnly);
        // clear 
        SharedStateService.clearAll();
        $scope.broadcastClearSite();
        VM.authenticationStatus.signedIn = false;
        if ($location.path() === "/")
            $route.reload();
        else
           $location.path("/");
    };




    VM.goCreateAccount = function () {

        $location.path("/CreateAccount");
    };


    VM.createAccount = function () {

        var strMessage = "";
        if (VM.Member.Email == null || VM.Email == "")
            strMessage = "Email is required ";

        if (VM.Member.Password == null || VM.password == "")
            strMessage = strMessage + "Password is required ";

        if (strMessage != "") {
            $scope.systemMessage.text = strMessage;
            $scope.systemMessage.activate();
            return;
        }

        DataTransportService.addMember(VM.Member).then(
            function (result, x, y, z, h) {
                SharedStateService.setAuthenticatedMember(result.data);
                SharedStateService.setAuthorizationState(canEdit);
                // clear any previous user's data
                SharedStateService.clearAll();
                $scope.broadcastClearSite();

                $scope.systemMessage.text = "Account created successfully.";
                $scope.systemMessage.activate();
                $location.path("/Map/0").search({});
            },
            function (error) {
                VM.Member = new Member();
                if (error.data != null && error.data.Message == "email already registered")
                    $scope.systemMessage.text = error.data.Message;
                else
                    $scope.systemMessage.text = "error creating account";

                $scope.systemMessage.activate();
            }
        );

    };




    // *** WATCH AUTHORIZATION ******
    $scope.$watch(
        function (scope) {
            if (SharedStateService.getAuthorizationState() != null)
                return SharedStateService.getAuthorizationState();
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue) {
                var boolAuth = (newValue == canEdit) ? true : false;
                VM.authenticationStatus.signedIn = boolAuth;
            }
        });

})