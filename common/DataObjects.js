'use strict'

function Member(){
this.MemberID =null;
this.AccountCreateDate =new Date(Date.now()).toDateString();
this.Email=null;
this.Password=null;
this.OpenID = null;
this.TraveloggiaEdition = 'TraveloggiaV';
this.FirstName = null;
this.LastName = null;
this.TraveloggiaEditionID = 4;
}


function Map(){
this.MapID =null;
this.MapName = new Date(Date.now()).toDateString();
this.MemberID = null;
this.MinX = null;
this.MaxX = null;
this.MinY = null;
this.MaxY = null;
this.CreateDate = null; // serializing js dates + entity no workey
this.FromPhone = null;
this.LastRevision = null;
this.HasLayers = null;
this.SavedToDB = false;
this.IsDeleted = false;
this.Sites = [];
this.CrowdSourced = false;
}

function Site() {
    this.SiteID = null;
    this.Longitude = null;
    this.Latitude = null;
    this.MapID = null;
    this.MemberID = null;
    this.Name = null;
    this.Address = null;
    this.Description = null;
    this.Phone = null;
    this.Email = null;
    this.URL = null;
    this.DateAdded = new Date(Date.now()).toDateString();
    this.RouteIndex = null;
    this.Rating = null;
    this.AverageRating = null;
    this.VotesCast = null;
    this.Arrival = null;
    this.Departure = null;
    this.Photos = [];
    this.Journals = [];
    this.IsDeleted = false;
}



function Photo() { 
this.PhotoID = null;
this.FileName = null;
this.Caption = null;
this.SiteID = null;
this.JournalID = null;
this.DateAdded = null;
this.DateTaken = null;
this.FromPhone = null;
this.StorageURL = null;
this.ThumbnailURL = null;
this.orientation  = null;
this.orientationID  = null;
this.GPSLatitude  = null;
this.GPSLongitude  = null;
this.Camera  = null;
this.Model  = null;
this.Software  = null;
this.Height  = null;
this.Width  = null;
this.BitsPerSample = null;
this.IsDeleted = false;
}

function Journal() {
    this.JournalID = null;
    this.Text = null;
    this.SiteID = null;
    this.KeyWords = null;
    this.DateAdded = new Date(Date.now()).toLocaleDateString();
    this.JournalDate = null;
    this.FromPhone = null;
    this.Title = "untitled";
    this.MemberID = null;
    this.IsDeleted = false;
   
}


function Device() {
   this.osName = null;
   this.osVersion = null;
   this.browserName = null;
   this.browserVersion = null;
   this.engineName = null;
   this.engineVersion = null;
   this.deviceModel = null;
   this.deviceType = null;
   this.deviceVendor = null;
   this.windowInnerHeight = null;
   this.windowInnerWidth = null;
   this.documentElementClientHeight = null;
   this.documentElementClientWidth = null;
   this.Issue = null;
   this.MemberID = null;
}

