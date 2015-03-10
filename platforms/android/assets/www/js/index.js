var app1_carp0052 = {
    pages: [],
    numPages: 0,
    links: [],
    numLinks: 0,
    pageTime: 800,
    pageshow: document.createEvent("CustomEvent"),

    initialize: function() {
        app1_carp0052.bindEvents();
    },
    
    bindEvents: function() {   
      document.addEventListener('deviceready', app1_carp0052.onDeviceReady, false);
      //document.addEventListener("DOMContentLoaded", app1_carp0052.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        app1_carp0052.receivedEvent('deviceready');
        document.addEventListener("scroll", app1_carp0052.handleScrolling, false);
        app1_carp0052.pageshow.initEvent("pageShow", false, true);
        
        var options = new ContactFindOptions();
                options.filter = "";  //leaving this empty will find return all contacts
                options.multiple = true;  //return multiple results
                var filter = ["displayName"];    //an array of fields to compare against the options.filter 
                navigator.contacts.find(filter, app1_carp0052.successFunc, app1_carp0052.errFunc, options);
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        app1_carp0052.pages = document.querySelectorAll('[data-role="page"]');
        app1_carp0052.numPages = app1_carp0052.pages.length;
	    app1_carp0052.links = document.querySelectorAll('[data-role="pagelink"]');
	    app1_carp0052.numLinks = app1_carp0052.links.length;
	   
        for(var i=0;i<app1_carp0052.numLinks; i++){
		//either add a touch or click listener
            if(app1_carp0052.detectTouchSupport( )){
                app1_carp0052.links[i].addEventListener("touchend", app1_carp0052.handleTouch, false);
            }
		app1_carp0052.links[i].addEventListener("click", app1_carp0052.handleNav, false);	
	    }
        
        for(var p=0; p < app1_carp0052.numPages; p++){
            app1_carp0052.pages[p].addEventListener("pageShow", app1_carp0052.handlePageShow, false);
        }
        
        //add the listener for the back button
        window.addEventListener("popstate", app1_carp0052.browserBackButton, false);
        app1_carp0052.loadPage(null);
       
    },
    
    //handle scrolling
    handleScrolling: function(ev){
        var height = window.innerHeight;
        var offset = window.pageYOffset;
        var footHeight = 60;
        var footer = document.querySelector(".footer");
        footer.style.position = "absolute";
        var total = height + offset - footHeight;
        footer.style.top = total + "px";
    },
    
    //handle the touchend event
    handleTouch:function (ev){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        var touch = ev.changedTouches[0];        //this is the first object touched
        var newEvt = document.createEvent("MouseEvent");	
        //old method works across browsers, though it is deprecated.
        newEvt.initMouseEvent("click", true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY);
        ev.currentTarget.dispatchEvent(newEvt);
        //send the touch to the click handler      
    },
    
    //handle the click event
    handleNav:function (ev){
        ev.preventDefault();
        var href = ev.currentTarget.href;
        var parts = href.split("#");
        app1_carp0052.loadPage( parts[1] );
        return false;
    },
    
    handlePageShow:function(ev){
        ev.target.className = "active";
        if(ev.currentTarget.id == "location"){
            console.log("location called");
            if( navigator.geolocation ){
                var params = {enableHighAccuracy: false, timeout:60000, maximumAge:60000};
                navigator.geolocation.getCurrentPosition( app1_carp0052.reportPosition, app1_carp0052.gpsError, params);
            //If it doesn't alert the user with the following message.
            }else{
                alert("Sorry, but your browser does not support location based awesomeness.")
            }
        }
    },

    //Deal with history API and switching divs
    loadPage:function ( url ){
        if(url == null){
            //home page first call
            //app1_carp0052.pages[0].style.display = 'block';
            app1_carp0052.pages[0].className = "active";
            history.replaceState(null, null, "#home");	
	    }else{
            for(var i=0; i < app1_carp0052.numPages; i++){
                app1_carp0052.pages[i].className = "hidden";
                if(app1_carp0052.pages[i].id == url){
                    //app1_carp0052.pages[i].style.display = "block";
                    app1_carp0052.pages[i].className = "show";
                    history.pushState(null, null, "#" + url);	
                    setTimeout(app1_carp0052.addDispatch, 50, i);
                }
            }
//            }else{
//                app1_carp0052.pages[i].style.display = "none";	
//            }
        }
        for(var t=0; t < app1_carp0052.numLinks; t++){
            app1_carp0052.links[t].className = "";
                if(app1_carp0052.links[t].href == location.href){
                    app1_carp0052.links[t].className = "activetab";
                }
            }
    },        
    
    addDispatch:function(num){
        app1_carp0052.pages[num].dispatchEvent(app1_carp0052.pageshow);
        //num is the value i from the setTimeout call
        //using the value here is creating a closure        
    },
    
    //Need a listener for the popstate event to handle the back button
    browserBackButton:function (ev){
        url = location.hash;  //hash will include the "#"
        //update the visible div and the active tab
        for(var i=0; i < app1_carp0052.numPages; i++){
            if(("#" + app1_carp0052.pages[i].id) == url){
                app1_carp0052.pages[i].style.display = "block";
            }else{
                app1_carp0052.pages[i].style.display = "none";	
            }
        }
        for(var t=0; t < app1_carp0052.numLinks; t++){
            app1_carp0052.links[t].className = "";
            if(app1_carp0052.links[t].href == location.href){
                app1_carp0052.links[t].className = "activetab";
            }
        }      
    },

    //Test for browser support of touch events
    detectTouchSupport:function ( ){
      msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
      var touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
      return touchSupport;
    },
    
    //geolocation success function
    reportPosition:function( position ){
        var canvas = document.querySelector('canvas');
        
        var context = canvas.getContext('2d');
        var img = document.createElement("img");
        img.onload = function() {
        context.drawImage(img, 0, 0, 300, 300);
        }
        img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + position.coords.latitude + "," + position.coords.longitude + "&zoom=14&size=300x300&markers=color:red%7C" + position.coords.latitude + ","+ position.coords.longitude + "&key=AIzaSyATsnsQQJ0k8bKolw000mqwGj7cJ85-RFk";
        document.querySelector("#output").appendChild(canvas);
        var foundYou = document.querySelector("#foundYou");
        foundYou.innerHTML = "Ah, found you!<br/>" + "Latitude: " + position.coords.latitude + "&deg;<br/>" + "Longitude: " + position.coords.longitude + "&deg;<br/>";
        },

    gpsError:function ( error ){
      var errors = {
        1: 'Permission denied',
        2: 'Position unavailable',
        3: 'Request timeout'
      }; 
        alert("Error: " + errors[error.code]);
    },
    
    successFunc:function(matches){
        var surprise = matches[Math.floor(Math.random() * matches.length)]; 
        
        var displayName = surprise.displayName;
        var phoneNumbers = surprise.phoneNumbers[0].value;
        var emails = "";
        
        if(surprise.emails){
            emails = surprise.emails;            
        }else{
            emails = "No email to display.";   
        }
        
        var info = "";
        info += "<p>" + displayName + "</p>";
        info += "<p>" + phoneNumbers + "</p>";
        info += "<p>" + emails + "</p>";
        
        var contactInfo = document.querySelector("#contactOutput");
        contactInfo.innerHTML += info;
    },
    
    
    errFunc:function (){
        alert("Unable to load contacts at this time.")

    }

};
app1_carp0052.initialize();