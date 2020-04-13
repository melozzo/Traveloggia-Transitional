angularTraveloggia.service('SharedStateService', function ( $routeParams, DataTransportService, isEditing, readOnly, canEdit, $cacheFactory, $cookies, $q) {

    var local_scope = this;

    local_scope.Repository = $cacheFactory('Repository', {});
    local_scope.Repository.put('Map', null);
    local_scope.Repository.put('Sites', []);
    local_scope.Repository.put('Photos', []);
    local_scope.Repository.put('Journals', []);
    local_scope.Authorization = {
        state: null
    };
    local_scope.Selected = {};
   

    // bootstrap to a demo user  
    // getAuthMemberId is the first call into shared state
    // made by load default map and when it does if nothings
    // set then it bootstraps to 1

    local_scope.setAuthorizationState = function (constValue) {
        local_scope.Authorization.state = constValue;
        var inTenYears = new Date("3016-10-10");
        $cookies.put("AuthorizationState", constValue, { expires: inTenYears });
    };

    local_scope.getAuthorizationState = function () {
        var constvalue = local_scope.Authorization.state;
        if (constvalue == null)
            constvalue = $cookies.get("AuthorizationState") != null ? $cookies.get("AuthorizationState") : readOnly;
        return constvalue;
    };

    local_scope.getAuthenticatedMemberID = function () {
        var id = null;
        id = local_scope.authenticatedMember == null ? $cookies.get("AuthenticatedMemberID") : local_scope.authenticatedMember.MemberID;
        return id;
    };

    local_scope.setAuthenticatedMember = function (member) {
        local_scope.authenticatedMember = member;
        var inTenYears = new Date("3016-10-10");
        $cookies.put("AuthenticatedMemberID", member.MemberID, { expires: inTenYears });

    };


    local_scope.getMapID = function () {
        var mapID = null;
        if ($routeParams.mapID)
            mapID = $routeParams.mapID;
        else {
            var cachedMap = local_scope.Repository.get("Map");
            if (cachedMap)
                mapID = cachedMap.MapID;
        }
        return mapID;
    };

    local_scope.getMap = function (id) {
        if (typeof id === "undefined" || id ==="0")
            return local_scope.getDefaultMap();
        else {
            return new Promise(function (resolve, reject) {
                var cachedMap = local_scope.Repository.get("Map");
                if (cachedMap && cachedMap.MapID.toString() === id.toString()) {
                    resolve(cachedMap);
                } else {
                    DataTransportService.getMapByID(id).then(
                        function (result) {
                            var memberId = result.data.MemberID;
                            // member id of the map creator ( currently user is not logged in )  must be set because it is part of the image path :)
                            local_scope.setAuthenticatedMember({ MemberID: memberId });
                            local_scope.Repository.put('Map', result.data);
                            if (result.data.Sites){
                                local_scope.Repository.put("Sites", result.data.Sites);
                                resolve(result.data);
                            } else {
                                let mapId = result.data.MapID;
                                DataTransportService.getSites(mapId).then( result2=>{
                                       result.data.Sites = result2.data;
                                       console.log("site list length", result2.data.length)
                                       local_scope.Repository.put("Sites", result2.data)
                                       resolve(result.data)
                                })
                            }
                        },
                        function (error) {
                            reject();
                        });
                }
            });
        }
    };



    local_scope.getDefaultMap = function () {
        return new Promise(function (resolve, reject) {
            var memberId = local_scope.getAuthenticatedMemberID();
            if (typeof memberId === "undefined") {
                memberId = 1; // the public user - if none logged in, then it must be 
                local_scope.setAuthenticatedMember({ MemberID: memberId });
            }

            DataTransportService.getMaps(memberId).then(
                function (result) {
                        if( ! result.data){
                                DataTransportService.addMap({
                                        MemberID:memberId,
                                        Name: "First Map"
                                }).then( result=>{
                                        local_scope.Repository.put('Map', result.data);
                                        resolve(result.data);
                                })

                        } else {
                                local_scope.Repository.put('Map', result.data);
                                if (result.data.Sites){
                                    local_scope.Repository.put("Sites", result.data.Sites);
                                    resolve(result.data);
                                } else {
                                    let selectedMap = result.data;
                                    let mapId = selectedMap.MapID;
                                    DataTransportService.getSites(mapId).then( sites=>{
                                           selectedMap.Sites = sites.data;
                                           local_scope.Repository.put("Sites", sites.data)
                                           resolve(selectedMap)
                                    })            
                                }
                        }
                 
                },
                function (error) {
                    reject();
                });
        });

    };


    // gets route param 
    local_scope.getSelectedSite = function (id) {
        var site = null;
        var sites = local_scope.Repository.get("Sites");
        if (sites.length === 0)
            return null;


        for (var i = 0; i < sites.length; i++) {
            if (sites[i].SiteID.toString() === id.toString()) {
                site = sites[i];
                break;
            }
        }
        // }

        return site;
    };



    local_scope.getSiteID = function () {
        var siteID = 0;
        if ( local_scope.Selected["Site"] != null)
            siteID = local_scope.Selected["Site"].SiteID;
        else if ($routeParams.siteID === "0")// after create account or new map
            siteID = 0;
        else if (local_scope.getSelectedSite() !== null)
            siteID = local_scope.getSelectedSite().SiteID;

        return siteID;
    };

   

    local_scope.getPhotos = function (id) {
        return new Promise(function (resolve, reject) {
            var cachedPhotos = local_scope.Repository.get('Photos');
            if (cachedPhotos.length > 0 && cachedPhotos[0].SiteID.toString() === id.toString()) {
                resolve(cachedPhotos);
            } else {
                DataTransportService.getPhotos(id).then(
                    function (result) {
                        local_scope.Repository.put('Photos', result.data);
                        resolve(result.data);
                    },
                    function (error) {
                        reject(error);
                    });
            }
        });

    };

      // gets route param or first in the repository
    local_scope.getSelectedPhoto = function (id) {

        var photo;// = local_scope.Selected["Photo"];
       // if (photo == null) {
            var photos = local_scope.Repository.get("Photos");

            if (typeof id !== "undefined") {
                for (var i = 0; i < photos.length; i++) {
                    if (photos[i].PhotoID.toString() === id) {
                        photo = photos[i];
                        break;
                    }
                }
            } else {
                if (photos.length > 0)
                    photo = photos[0];
            }

        return photo;
    };

    local_scope.getJournal = function (id) {
        var journal;
        var cachedJournals = local_scope.Repository.get('Journals');
        for (var i = 0; i < cachedJournals.length; i++) {
            if (cachedJournals[i].JournalID.toString() === id) {
                journal = cachedJournals[i];
                break;
            }
        }
        return journal;
    };

    local_scope.getJournals = function (id) {
        return new Promise(function (resolve, reject) {
            var cachedJournals = local_scope.Repository.get('Journals');
            if (cachedJournals.length > 0 && cachedJournals[0].SiteID.toString() === id.toString()) {
                resolve(cachedJournals);
            } else {
                DataTransportService.getJournals(id).then(
                    function (result) {
                        local_scope.Repository.put('Journals', result.data);
                        resolve(result.data);
                    },
                    function (error) {
                        reject(error);
                    });
            }
        });
    };




    local_scope.getSelectedMap = function (mapID) {
        var selectedMap = null;
        var maps = local_scope.Repository.get("MapList");
        if (maps != null) {
            for (var i = 0; i < maps.length; i++) {
                if (maps[i].MapID == mapID) {
                    selectedMap = maps[i];
                    break;
                }
            }
        }
        return selectedMap;
    };


    local_scope.getSearchManager = function () {
        var deferredResult = $q.defer();
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            deferredResult.resolve("ok");
        });
        return deferredResult.promise;
    };


    local_scope.clearAll = function () {
        local_scope.Repository.put("MapList", []);
        local_scope.Repository.put("Map", null);
        local_scope.Repository.put("Sites", []);
        local_scope.Repository.put("Journals", []);
        local_scope.Repository.put("Photos", []);
        local_scope.Selected["Site"] = null;
        local_scope.Selected["Photo"] = null;
        local_scope.Selected["Journal"] = null;
    };


    local_scope.clearMap = function () {
        local_scope.Repository.put("Map", null);
        local_scope.Repository.put("Sites", []);
        local_scope.Repository.put("Photos", []);
        local_scope.Repository.put("Journals", []);
        local_scope.Selected["Site"] = null;
        local_scope.Selected["Journal"] = null;
    };

    // cache methods ridiculous that angular doesnt have this already

    local_scope.updateCache = function (collectionName, propName, itemID, item) {
        var collection = local_scope.Repository.get(collectionName);
        if (collection == null)
            return;

        for (var i = 0; i < collection.length; i++) {
            if (collection[i][propName] == itemID) {
                collection[i] = item;
                break;
            }
        }
    };

    local_scope.deleteFromCache = function (collectionName, propName, itemID) {
        var collection = local_scope.Repository.get(collectionName);
        if (collection == null)
            return;
        var spliceIndex = 0;

        try {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i][propName] == itemID) {
                    spliceIndex = i;
                    break;
                }
            }
            collection.splice(i, 1);
        }
        catch (error) {
            alert(error.message);
        }
        local_scope.Repository.put(collectionName, collection);
    };

  
});


