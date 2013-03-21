var commentr = commentr || {};
var apiKey = "AIzaSyCNAA09mqSqXnDqn0-rJ4wnKFacnLuGaXw";
var googleID = "106908252002559129042";
var activityId ="";
var nextPageToken = "";

commentr.go = function(nextPageToken) {  
    var fetchElement = document.createElement("script");
    fetchElement.src = 'https://www.googleapis.com/plus/v1/people/' + googleID + '/activities/public?' + nextPageToken + '&maxResults=100&fields=items(id%2Curl)%2CnextPageToken&alt=json&pp=1&key=' + apiKey + '&callback=commentr.prasePost';
    document.body.appendChild(fetchElement);
}

commentr.prasePost = function(responseJson) {
    var activity = responseJson.items;
    var nextPageToken = 'pageToken=' + responseJson.nextPageToken;
    var element = document.getElementById("gplus-comments");
    var postId = element.dataset.gplusPostId;
    postId = postId.substr(-11);
    for(i=0; i<activity.length; i++) {
        var postUrl = activity[i].url;
        postUrl = postUrl.substr(-11);
        if( postId == postUrl ) {activityId = activity[i].id; break;}
     }
     if(activityId == "") { 
     	commentr.go(nextPageToken);
       	} 
     else {
     	commentr.fetchComments(activityId);
     }
} 

commentr.fetchComments = function(activityId) {
    var fetchElement = document.createElement("script");
    fetchElement.src = 'https://www.googleapis.com/plus/v1/activities/' + activityId + '/comments?alt=json&pp=1&key=' + apiKey 
        + '&callback=commentr.praseComments';
    document.body.appendChild(fetchElement);
}

commentr.praseComments = function(responseJson) {
    var activity = responseJson.items[0].inReplyTo[0];
    var comments = responseJson.items;
 
    //find element to insert into
    var insertionElements = document.getElementsByClassName('g-comments-for');
    var insertionElement = insertionElements[0];
 
    var newContents = "";
    for(i=0; i<comments.length; i++) {
        var actor = comments[i].actor;
        var commentBody = comments[i].object.content;
        var Plusoners = comments[i].plusoners.totalItems;
		commentPlusoners = (Plusoners > 0 ? "<span class='plusoners'>+" + Plusoners +"</span>": "");
        var mydate = new Date(comments[i].published);
		fmt = new DateFmt();
		var commentPublished = fmt.format(mydate,"%d %n %y - %H:%M");
		
       //do the insertion
        newContents += "<dt><a href='" + actor.url + 
            "'><img src='" + actor.image.url +  "' /></a></dt>" + 
            "<dd><a href='" + actor.url + "'>" + actor.displayName + "</a>" + " " + commentPublished + "  " + commentPlusoners + "<br/>" + commentBody + "</dd>";
 
    }
    insertionElement.innerHTML = "<dl>" + newContents + "</dl> <p class='g-commentlink'><a href='" + activity.url + "'><span style='color:rgb(240, 114, 114); text-decoration:none;'>Google plus-д сэтгэгдэл үлдээх бол энд дарна уу</span></a></p>";
} 

document.addEventListener("DOMContentLoaded", commentr.go, false);

function DateFmt() {
  this.dateMarkers = { 
     d:['getDate',function(v) { return ("0"+v).substr(-2,2)}], 
         m:['getMonth',function(v) { return ("0"+(v+1)).substr(-2,2)}],
         n:['getMonth',function(v) {
             var mthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
             return mthNames[v];
             }],
         w:['getDay',function(v) {
             var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
             return dayNames[v];
             }],
         y:['getFullYear'],
         H:['getHours',function(v) { return ("0"+v).substr(-2,2)}],
         M:['getMinutes',function(v) { return ("0"+v).substr(-2,2)}],
         S:['getSeconds',function(v) { return ("0"+v).substr(-2,2)}],
         i:['toISOString',null]
  };

  this.format = function(date, fmt) {
    var dateMarkers = this.dateMarkers
    var dateTxt = fmt.replace(/%(.)/g, function(m, p){
    var rv = date[(dateMarkers[p])[0]]()

    if ( dateMarkers[p][1] != null ) rv = dateMarkers[p][1](rv)

    return rv
  });

  return dateTxt
  }
}
