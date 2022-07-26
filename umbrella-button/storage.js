// ***** Changed from Local Storage to chrome.storage *****
var timer = null;
var globalObj = {};
var extStorageKeys = [];


function initStorage() {
    getValuesFromStorage(function(){
        // pageLoaded();
        recursiveLoader();
        console.log('end-storage', globalObj, extStorageKeys);
    })
}

function getKeys(callback){
    chrome.storage.sync.get('keys', function(o){
        extStorageKeys = o['keys'] || "[]";
        try{
            extStorageKeys = JSON.parse(extStorageKeys);
        } catch(err) {
            console.log(err);
        }
        if(typeof callback == 'function') callback();
    })
}

function recursiveLoader() {
    if(timer) clearInterval(timer);
    timer = setInterval(getValuesFromStorage, 1000);
}

function setItem(a, b) {
    globalObj[a] = b;
    var obj = {};
    obj[a] = b;
    chrome.storage.sync.set(obj);
    if(extStorageKeys.indexOf(a) == -1){
        extStorageKeys.push(a);
    }
    chrome.storage.sync.set({keys: JSON.stringify(extStorageKeys)});
    // writeToFile(globalObj);
}

function getItem(a) {
    var b = globalObj[a];
    if(b != undefined){
        return b;
    } else {
        return null;
    }
}

function removeItem(a) {
    delete globalObj[a];
    if(extStorageKeys.indexOf(a) > -1) {
        extStorageKeys.splice(extStorageKeys.indexOf(a), 1);
        chrome.storage.sync.set({keys: JSON.stringify(extStorageKeys)});
    }
    chrome.storage.sync.remove(a);
    // writeToFile(globalObj);
}

function getValuesFromStorage(callback) {
    getKeys(function(){
        getStorageObjFromKeys(0, function(){
            if(typeof callback == 'function') callback();
        });
    })
}

function getStorageObjFromKeys(idx, callback) {
    var key = extStorageKeys[idx];
    if(key) {
        chrome.storage.sync.get(key, function(o){
            globalObj[key] = o[key];
            idx++;
            getStorageObjFromKeys(idx, callback);
        })
    } else {
        if(typeof callback == 'function') callback();
    }
}

// **********************************

chrome.tabs.getSelected(null,function(tab) {
	var taburl;
	taburl+=tab.url;
	taburl=taburl.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
	var arr = tab.url.split("/");
	var tabprotocol = arr[0];
	if(tabprotocol=="https:"){
			// alert("if(tabprotocol==         httpAllowed")
			set_ele("httpAllowed",false);
	} else {
			// alert("else(tabprotocol==       httpAllowed")
			set_ele("httpAllowed",true);
	}

    var s=getItem("trackers");
	if(s==null)
	{
		setItem("trackers",false);
		set_ele("trackersBlocked",false);
	} else {
		var trackers=JSON.parse(s);
		if(trackers==true)
		{
						// alert("if(tabprotocol==         trackersBlocked")
			set_ele("trackersBlocked",true);
		}
		else
		{
						// alert("else(tabprotocol==         trackersBlocked")
			set_ele("trackersBlocked",false);
		}
	}


	var furl;
	var justhttp = false;

	if((tab.url).indexOf("www.")==-1)
		justhttp=true;

	if(taburl.indexOf("www.")!=-1)
		furl = taburl
	if(taburl.indexOf("www.")==-1 & !justhttp)
		furl = "www."+taburl
	if(taburl.indexOf("www.")==-1 & justhttp)
		furl = taburl

	if(tabprotocol=="https:")
		var primaryUrl = "https://"+furl+"/*"
	else
		var primaryUrl = "http://"+furl+"/*"


	chrome.contentSettings.plugins.get({'primaryUrl':primaryUrl},
	function(d){
		if(d.setting=="block"){
			//initial.plugin=true;
			//alert("false")
			set_ele("plugins",true);
		}

		if(d.setting=="allow"){
			//initial.plugin=false;
			//alert("allow")
			set_ele("plugins",false);
		}

	})

	var tpc_val = JSON.parse(getItem("tpc"))
	if(tpc_val==true)
		set_ele("tpc",true);
	else if(tpc_val==false)
		set_ele("tpc",false);
	else
		set_ele("tpc",false);

	var set = getItem(taburl);
	// alert("Storage.js Taburl"+ taburl)
	if(set == null) {
									// alert("if(set == null)")
		var initial={};
	   // initial.thirdPartyCookies=false;

		initial.adsAllowed=false;
		initial.trackMeAllowed=false;
		initial.seeWotRating=false;
		initial.deletebrowsingdata=false;
		//set_ele("tpc",false);


		// Here shoud be the code for Domains to read
		if(
			taburl == 'search.yahoo.com' ||
			taburl == 'ys.epicbrowser.com' ||
			taburl == 'update.epicbrowser.com' ||
	      	taburl == 'searchyahoo.epicbrowser.com' ||
			taburl == 'huffpost.com' ||
			taburl == 'm.huffpost.com' ||
			taburl == 'www.huffpost.com' ||
			taburl == 'www.m.huffpost.com' ||
	        taburl == 'yahoo.com' ||
	        taburl == 'sports.yahoo.com' ||
	        taburl == 'finance.yahoo.com' ||
	        taburl == 'mail.yahoo.com' ||
	        taburl == 'rivals.yahoo.com' ||
	        taburl == 'weather.yahoo.com' ||
	        taburl == 'messenger.yahoo.com' ||
	        taburl == 'huffingtonpost.com' ||
	        taburl == 'aol.com' ||
	        taburl == 'discover.aol.com' ||
	        taburl == 'build.aol.com' ||
	        taburl == 'techcrunch.com' ||
	        taburl == 'mobile.yahoo.com' ||
	        taburl == 'engadget.com' ||
	        taburl == 'autoblog.com' ||
	        taburl == 'ryot.com' ||
	        taburl == 'builtbygirls.org ' ||
	        taburl == 'makers.com' ||
	        taburl == 'flurry.com' ||
	        taburl == 'y.flurry.com' ||
	        taburl == 'gemini.yahoo.com' ||
	        taburl == 'verizondigitalmedia.com' ||
	        taburl == 'brightroll.com' ||
	        taburl == 'onebyaol.com' ||
	        taburl == 'getkanvas.com' ||
	        taburl == 'bbgventures.com' ||  // Below sites are added by myself
	        taburl == 'www.yahoo.com' ||
	        taburl == 'login.yahoo.com' ||
	        taburl == 'n.rivals.com' ||
	        taburl == 'www.huffingtonpost.com' ||
	        taburl == 'www.aol.com' ||
	        taburl == 'www.buildseries.com' ||

		//add new sites here

	        taburl == 'view.yahoo.com' ||
	        taburl == 'mobile.yahoo.com' ||
	        // taburl == 'www.tumblr.com' ||  //Removed - No more part of Yahoo
	        taburl == 'answers.yahoo.com' ||
	        taburl == 'shopping.yahoo.com' ||
	        taburl == 'groups.yahoo.com' ||
	        taburl == 'www.engadget.com' ||
	        taburl == 'www.autoblog.com' ||
	        taburl == 'www.ryot.com' ||
	        taburl == 'www.builtbygirls.com' ||
	        taburl == 'www.makers.com' ||
	        taburl == 'www.flurry.com' ||
	        taburl == 'login.flurry.com' ||
	        taburl == 'www.verizondigitalmedia.com' ||
	        taburl == 'www.onebyaol.com' ||
	        taburl == 'www.bbgventures.com' ||
	        taburl == 'www.bing.com' ||
			taburl == 'advertising.com' ||
			taburl == 'moatads.com' ||
			taburl == 'moat.com' ||
			taburl == 'alephd.com' ||
			taburl == 'adspirit.de' ||
			taburl == 'www.adspirit.de' ||
			taburl == 'acuityplatform.com' ||
			taburl == 'ads.yahoo.com' ||
			taburl == 'brightroll.com' ||
			taburl == 'www.oath.com'  ||
			taburl == 'adinfo.aol.com' ||
			taburl == 'na.ads.yahoo.com' ||
			taburl == 'ads.yahoo.com' ||
			taburl == 'search.aol.com' ||
		// 2019-08-08 Added new URLs.
			//taburl == 'search.yahoo.com' || //Added already above
			taburl == 'ar.search.yahoo.com' ||
			taburl == 'at.search.yahoo.com' ||
			taburl == 'br.search.yahoo.com' ||
			taburl == 'ca.search.yahoo.com' ||
			taburl == 'qc.search.yahoo.com' ||
			taburl == 'ch.search.yahoo.com' ||
			taburl == 'chfr.search.yahoo.com' ||
			taburl == 'chit.search.yahoo.com' ||
			taburl == 'cl.search.yahoo.com' ||
			taburl == 'co.search.yahoo.com' ||
			taburl == 'de.search.yahoo.com' ||
			taburl == 'dk.search.yahoo.com' ||
			taburl == 'es.search.yahoo.com' ||
			taburl == 'fi.search.yahoo.com' ||
			taburl == 'fr.search.yahoo.com' ||
			taburl == 'hk.search.yahoo.com' ||
			taburl == 'id.search.yahoo.com' ||
			taburl == 'in.search.yahoo.com' ||
			taburl == 'it.search.yahoo.com' ||
			taburl == 'mx.search.yahoo.com' ||
			taburl == 'malaysia.search.yahoo.com' ||
			taburl == 'nl.search.yahoo.com' ||
			taburl == 'no.search.yahoo.com' ||
			taburl == 'pe.search.yahoo.com' ||
			taburl == 'ph.search.yahoo.com' ||
			taburl == 'se.search.yahoo.com' ||
			taburl == 'sg.search.yahoo.com' ||
			taburl == 'th.search.yahoo.com' ||
			taburl == 'tw.search.yahoo.com' ||
			taburl == 'uk.search.yahoo.com' ||
			taburl == 've.search.yahoo.com' ||
			taburl == 'vn.search.yahoo.com'// ||
			){
			initial.adsAllowed=true;
									// alert("if(Yahoo URLs)")
			set_ele("adsAllowed",true);
		}else{
									// alert("else(Yahoo URLs)")
			set_ele("adsAllowed",false);
		}
		set_ele("seeWotRating",false);
		set_ele("trackMeAllowed",false);

		setItem(taburl,JSON.stringify(initial));
	} else {
											// alert("else(set == null)")
		var settings=JSON.parse(set);
		// if(settings.thirdPartyCookies==true)
		// {
		// set_ele("tpc",true);
		// }
		// else
		// {
		// 	set_ele("tpc",false);
		// }
		// if(settings.plugin==true)
		// {
		// 	set_ele("plugins",false);
		// }
	 //     else
		// {
		// 	set_ele("plugins",true);
		// }
		if(settings.adsAllowed==true)
		{
			// alert("adsAllowed,true")
			set_ele("adsAllowed",true);
		}
	     else
		{
			// alert("adsAllowed,false")
			set_ele("adsAllowed",false);
		}

		if(settings.seeWotRating==true)
		{
			set_ele("seeWotRating",true);
		}
	     else
		{
			set_ele("seeWotRating",false);
		}
	    
	    if(settings.trackMeAllowed==true)
		{
			set_ele("trackMeAllowed",true);
		}
	     else if(settings.trackMeAllowed==false)
		{
			set_ele("trackMeAllowed",false);
		}
	}

	function set_ele(id,onoff) {
		try{
			if(onoff)
			{
				if(id != "seeWotRating") {
					// alert("Hi Storage.js")
					document.getElementById(id.concat("_N")).style.color = "black";
					document.getElementById(id.concat("_Y")).style.color = "#CCCCCC";
				}
			}
			else
			{
				if(id != "seeWotRating") {
				   // alert("Hello Storage.js")
				   document.getElementById(id.concat("_Y")).style.color = "black";
				   document.getElementById(id.concat("_N")).style.color = "#CCCCCC";
				}
			}
		}catch(e){}
	}
});

// function pageLoaded(){
//   updateIcons();
// }

initStorage();       // Converted from Local storage to chrome.storage
