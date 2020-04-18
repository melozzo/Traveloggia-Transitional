
angularTraveloggia.factory('DataTransportService', function ($http,$q) {
 //   var baseURL = "http://localhost/TraveloggiaServices";
var baseURL = "http://138.68.12.0:8080"
    return {
   
        getMember: function (email, password) {
            var endpoint = baseURL + "/member/login";
            var config = {
                method:"post",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                data: {
                        Email: email,
                        Password:password
                      }
            }
            return $http(config);
        },

        addMember:function( member )
        {
            var endpoint = baseURL + "/member/create";
            var config = {
                method: "post",
                url: endpoint,
                headers: {
                      'Content-Type': 'application/json; charset=utf-8',
                },
                data: member
            }
            return $http(config);
        },


        getMaps: function (memberID) {
            var endpoint = baseURL + "/map/last/" + memberID;
            var config = {
                method: "get",
                url: endpoint,
                headers: {
                      'Content-Type': 'application/json; charset=utf-8',
                }
            }
            return $http(config);
        },

        getMapList: function (memberID) {
            var endpoint = baseURL + "/map/list/" + memberID;
            var config = {
                method: "get",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                }
            };
            return $http(config);
        },

        getMapByID: function (mapID) {
            var endpoint = baseURL + "/map/" + mapID;
            var config = {
                method: "get",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                }
            };
            return $http(config);
        },

        addMap:function(wholeMap){
            var endpoint = baseURL + "/map/create";
            var config = {
                method: "post",
                url: endpoint,
                data: wholeMap
            };
            return $http(config);

        },

        updateMap: function (wholeMap) {
            var endpoint = baseURL + "/map/"+ wholeMap.MapID;
            var config = {
                method: "put",
                url: endpoint,
                data: wholeMap
            }
            return $http(config);

        },

        deleteMap: function (id) {
           var endpoint = baseURL + "/map/" +id;
            var config = {
                method: "delete",
                url: endpoint
            };
           return $http(config);

       },

        getSiteByID: function (siteID) {
            var endpoint = baseURL + "/site/" + siteID;
            var config = {
                method: "get",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }
            return $http(config);
        },

        addSite:function(site){
            var endpoint = baseURL + "/site/create";
            var config = {
                method: "post",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: site
            };

            return $http(config);
        },

     

        updateSite: function (site) {
            var endpoint = baseURL + "/site/" + site.SiteID;
            var config = {
                method: "PUT",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: site
            };

            return $http(config);
        },

        deleteSite:function(siteID){
            var endpoint = baseURL + "/site/" + siteID
            var config = {
                method: "DELETE",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            };
            return $http(config);
        },

      //   getScheduledSites: function (mapId) {
      //       var endpoint = baseURL + "/api/ScheduledSites/" + mapId;
      //       var config = {
      //           method: "get",
      //           url: endpoint,
      //           headers: { 'Content-Type': 'application/json; charset=utf-8' }
      //       };
      //       return $http(config);
      //   },

        getSites: function (mapId) {
                var endpoint = baseURL + "/site/list/" + mapId;
                var config = {
                    method: "get",
                    url: endpoint,
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                };
                return $http(config);
            },

        getPhotos: function (siteID) {
            var endpoint = baseURL + "/photo/list/" + siteID;
            var config = {
                method: "get",
                url: endpoint,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }
            return $http(config);
        },
      
        addPhoto: function (photo) {
            var endpoint = baseURL + "/photo";
            var config = {
                method: "post",
                url: endpoint,
                headers: {'Content-Type': 'application/json' },
                data: photo
            }

            return $http(config);
        },

        updatePhoto: function (photo) {
            var endpoint = baseURL + "/photo/" + photo.PhotoID;
            var config = {
                method: "PUT",
                url: endpoint,
                headers: {   'Content-Type': 'application/json; charset=utf-8' },
                data: photo
            }

            var result = $http(config);
          
            return result;
        },


        deletePhoto: function (photoID) {
            var endpoint = baseURL + "/photo/" + photoID
            var config = {
                method: "DELETE",
                url: endpoint,
                headers: {   'Content-Type': 'application/json; charset=utf-8'}
            }

            return $http(config);
        },

       
        uploadImage: function (memberID, mapID,  imageFile, fileName) {
            var uploadResult = $q.defer();
            //using the amazon javascript api
            var bucketName = 'traveloggia-guests';
            AWS.config.update({ accessKeyId: 'AKJJJ3HMMVLV65CHUPUA', secretAccessKey: 'Wz/zLP5/kLpbopdilaRbxBnR5vuW5N4/g0jilhYT' })
            AWS.config.region = 'us-west-2'
            var objKey = memberID + "/" + mapID + "/" + fileName;
            var bucket = new AWS.S3({
                params: {
                    Bucket: bucketName
                }
            });
            var params = {
                Key: objKey,
                ContentType: imageFile.type,
                Body: imageFile
            };
            bucket.putObject(params, function (err, data) {
                if (err) {
                    uploadResult.reject(err)
                } else {
                  uploadResult.resolve("success")
                }
               
            });

            return uploadResult.promise;
        },

        getJournals: function (siteID) {
            var endpoint = baseURL + "/journal/list/" + siteID;
            var config = {
                method: "get",
                url: endpoint,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }
            return $http(config);
        },

        addJournal:function(journal){
        var endpoint = baseURL + "/journal/create"
        var config = {
            method: "post",
            url: endpoint,
            headers: {
                  'Content-Type': 'application/json; charset=utf-8'
            },
            data: journal
        }
        return $http(config);
        },

        updateJournal: function (journal) {
            var endpoint = baseURL + "/journal/"+journal.JournalID
            var config = {
                method: "PUT",
                url: endpoint,
                headers: {
                      'Content-Type': 'application/json; charset=utf-8'
                },
                data: journal
            }
            return $http(config);
        },

        deleteJournal: function (JournalID) {
            var endpoint = baseURL + "/journal/" + JournalID
            var config = {
                method: "DELETE",
                url: endpoint,
                headers: {
                      'Content-Type': 'application/json; charset=utf-8'
                }
            }
            return $http(config);
        },

        addDevice: function (device) {
            var endpoint = baseURL + "/api/Devices";
            var config = {
                method: "post",
                url: endpoint,
                headers: {
                      'Content-Type': 'application/json; charset=utf-8'
                },
                data: device
            }
            return $http(config);
        },
       
    }

  

});







