// arcane stuff because of html editor
angularTraveloggia.filter('unsafe', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
});


angularTraveloggia.controller('JournalController', function ($scope,  $location, $routeParams, DataTransportService, SharedStateService, canEdit, readOnly, isEditing, ) {

    $scope.JournalEntries = [];
    $scope.Journal = null;
    $scope.journalIndex = 0;
    SharedStateService.Selected["Journal"]= null;

    $scope.stateMachine = {
        state: SharedStateService.getAuthorizationState()
    };

    $scope.bakJournal = {
        JournalID: null,
        Text: null,
        SiteID: null,
        KeyWords: null,
        DateAdded: null,
        JournalDate: null,
        FromPhone: null,
        Title: "untitled",
        MemberID: null,
        IsDeleted: null

    };

    var constructPath = function (journalID) {
        var mapID = SharedStateService.Repository.get("Map").MapID;
      //  var photoID = SharedStateService.Repository.get("Photos")[0].PhotoID;
        var siteID = $routeParams.siteID;
        var path = "/Journal/" + mapID + "/" + siteID + "/" + journalID;
        return path;
    };

    var loadJournals = function (id) {
        if (id === "0")
            return;
        SharedStateService.getJournals(id)
            .then(function (result) {
                $scope.JournalEntries = result;
                if (result.length > 0) {
                    $scope.$emit("toggleJournalEdit", false);
                    var journalID;
                    if ($routeParams.journalID) {
                        journalID = $routeParams.journalID;
                        $scope.Journal = SharedStateService.getJournal(journalID);
                    } else {
                        $scope.Journal = result[0];
                        //journalID = result[0].JournalID;
                    }
                    SharedStateService.Selected["Journal"] = $scope.Journal;
                    if ($location.path().indexOf("/Journal") > -1) {
                        $scope.goJournal();
                      //  var path = constructPath(journalID);
                       // $location.path(path);
                    }
                  
                } else {

                    if (SharedStateService.getAuthorizationState() === "CAN_EDIT") {
                        $scope.addNew();
                    } else {
                        SharedStateServcie.Selected["Journal"] = null;
                        $scope.JournalEntries = [];
                        $scope.Journal = null;
                        $scope.journalIndex = 0;
                        $scope.$emit("toggleJournalEdit", false);
                    }
                }
            })
            .catch(function (error) {
                  console.log(JSON.stringify(error))
               // $scope.systemMessage.text = "error fetching journals" + error;
              //  $scope.systemMessage.activate();
            });
    };

    // when we navigate with toolbar or window pane, we will have the routeparam
    var siteID = $routeParams.siteID;
    if (typeof siteID !== "undefined") {
        loadJournals(siteID);
    }

    $scope.$on("clearSite", function (event, data) {
        $scope.JournalEntries = [];
        $scope.Journal = null;
});
    // this is when toolbar list is used to select location
    // url params dont update
    $scope.$on("listSelect", function (event, data) {
        if (data == null)
            return;
        var selectedSite = data;
        loadJournals(selectedSite.SiteID);
    });

// this is when mouseover site on map page
    // url params dont update 
    $scope.$on("rolloverSelect", function (event, data) {
        var selectedSite = data;
        if (selectedSite)
            loadJournals(selectedSite.SiteID);
        else {
            $scope.JournalEntries = [];
            $scope.Journal = null;
        }
            
            
       
    });
    $scope.$on("requestEditJournal", function (event, data) {
        if (SharedStateService.getAuthorizationState() === "CAN_EDIT") {
            $scope.bakJournal.JournalID = $scope.Journal.JournalID;
           // boo hoo no spread operator 
            $scope.bakJournal.Text = $scope.Journal.Text;
            $scope.bakJournal.SiteID = $scope.Journal.SiteID;
            $scope.bakJournal.KeyWords = $scope.Journal.KeyWords;
            $scope.bakJournal.DateAdded = $scope.Journal.DateAdded;
            $scope.bakJournal.JournalDate = $scope.Journal.JournalDate;
            $scope.bakJournal.FromPhone = $scope.Journal.FromPhone;
            $scope.bakJournal.Title = $scope.Journal.Title;
            $scope.bakJournal.MemberID = $scope.Journal.MemberID;
            $scope.bakJournal.IsDeleted = $scope.Journal.IsDeleted;
            $scope.stateMachine.state = 'IS_EDITING';
        }
            
        else {
            $scope.systemMessage.text = "you must be logged in to edit ";
            $scope.systemMessage.activate();
        }
    });



    // upon tab change
    $scope.loadContent = function (index) {
        // this causes a page reload merci
        angular.element("#menuToggle").click();
        $scope.Journal = $scope.JournalEntries[index];
        SharedStateService.Selected["Journal"] = $scope.Journal;
        $scope.goJournal();
        // var path = constructPath($scope.Journal.JournalID);
        //$location.path(path);

    };



    $scope.addNew = function ( afterDelete ) {
        var journal = new Journal();
        var recordDate = new Date(Date.now());
        journal.JournalDate = recordDate;
        journal.MemberID = SharedStateService.getAuthenticatedMemberID();
        journal.Title = null;
        journal.JournalID = null;
        $scope.Journal = journal;
        $scope.$emit("toggleJournalEdit", true);
        // when click add new from journal page - apply doesnt even work 
        $scope.stateMachine.state = 'IS_EDITING';

        if (typeof afterDelete === "undefined") {
             // when navigate from a different view to a blank journal need apply
        $scope.$apply(function() {
            $scope.stateMachine.state = 'IS_EDITING';
        });

        }
       
    
    };


    $scope.saveJournal = function () {
      
        if ( $scope.Journal.JournalID == null ) {// saving a new one
            $scope.Journal.SiteID = $routeParams.siteID;
            DataTransportService.addJournal($scope.Journal).then(
                function (result) {
                  
                    $scope.stateMachine.state = "CAN_EDIT";
                    var cachedJournals = SharedStateService.Repository.get('Journals');
                    $scope.journalIndex = cachedJournals.length;
                    cachedJournals.push(result.data);
                    SharedStateService.Selected["Journal"] = result.data;
                    $scope.Journal = result.data;
                    // enable sharing by loading the just created journal id into url
                    $scope.goJournal();
                    $scope.systemMessage.text = "new journal was saved successfully";
                    $scope.systemMessage.activate();
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal " + error.data.Message;
                    $scope.systemMessage.activate();
                }
            );
        }
        else // its update
            DataTransportService.updateJournal($scope.Journal).then(
                function (result) {
                    $scope.systemMessage.text = "journal edit was saved successfully";
                    $scope.systemMessage.activate();
                    $scope.stateMachine.state = "CAN_EDIT";
                },
                function (error) {
                    $scope.systemMessage.text = "error saving journal " + error.statusText;
                    $scope.systemMessage.activate();
                }
            );
        $scope.$emit("toggleJournalEdit", false);
    };




    var deleteJournal = function () {
        $scope.ConfirmCancel.isShowing = false;
        DataTransportService.deleteJournal($scope.Journal.JournalID).then(
            function (result) {
                SharedStateService.deleteFromCache("Journals", "JournalID", $scope.Journal.JournalID);
                $scope.JournalEntries = SharedStateService.Repository.get("Journals");
                if ($scope.JournalEntries.length > 0) {
                    $scope.Journal = $scope.JournalEntries[0];
                    SharedStateService.Selected["Journal"] = $scope.Journal;
                    $scope.goJournal();
                }
                else {
                    SharedStateService.Selected["Journal"] = null;
                    $scope.addNew(true);
                    $scope.goJournal();
                }
                    
                $scope.systemMessage.text = "journal deleted successfully";
                $scope.systemMessage.activate();
            },
            function (error) {
                $scope.systemMessage.text = "error deleteing journal " + error.data.Message;
                $scope.systemMessage.activate();
            });
    };


    //ConfirmCancel Handlers
    var dismiss = function () {
        $scope.ConfirmCancel.isShowing = false;
    };

    $scope.confirmDeleteJournal = function () {
        $scope.ConfirmCancel.isShowing = true;
    };

    if ($location.path().indexOf("/Journal") > -1) {
        $scope.ConfirmCancel.question = "Delete Selected Journal ?";
        $scope.ConfirmCancel.ccCancel = dismiss;
        $scope.ConfirmCancel.ccConfirm = deleteJournal;
    };

    $scope.cancelJournal = function () {
        if ($scope.Journal.JournalID == null ) {
            $scope.addNew();
        } else {
            $scope.Journal = $scope.bakJournal;
            $scope.JournalEntries[$scope.journalIndex] = $scope.bakJournal;
        }
        
        $scope.stateMachine.state = "CAN_EDIT";
        $scope.$emit("toggleJournalEdit", false);
    };


});



    // this is if we are redirecting from html5.traveloggia.net which doesnt have its own journal page
    // if ($location.search().SiteID!= null)
    // {
    //     var mapid = $location.search().MapID;
    //     var siteid = $location.search().SiteID;
    //     SharedStateService.readOnlyUser = true;
    //     SharedStateService.setSelected("Site", siteid);
    //     $location.search('MapID', {});
    //     $location.search('SiteID', {});

    //     DataTransportService.getMap(mapid).then(
    //         function (result) {
    //           var MapRecord = result.data[0];
    //             SharedStateService.Selected.Map =MapRecord;
    //             SharedStateService.Repository.put('Map', result.data);
    //             SharedStateService.Repository.put('Sites', MapRecord.Sites)
    //         },
    //     function(error){
    //         $scope.systemMessage.text = "error fetching journals with mapid " + error.data.Message;
    //         $scope.systemMessage.activate();
    //     } )
    // }






        //$scope.taOptions.toolbar = [
        //   ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        //   ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        //   ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        //   ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        // ];
