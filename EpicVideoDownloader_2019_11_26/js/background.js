chrome.browserAction.onClicked.addListener( function( tab ) {

  if( tab.url.substring( 0, 4 ) == 'http' ) {
    var baseurl = 'https://vd2.epicbrowser.net/?';
    var siteurl= baseurl + tab.url;

    // alert(tab.url)

    if( tab.url.substring( 0, 24 ) == 'https://www.youtube.com/' ) {
	    chrome.tabs.update( tab.id, { url: chrome.extension.getURL( 'alert.html' ) + '#Alert' } ); 
	} else 
		chrome.tabs.update(tab.id, {url: siteurl });

    //chrome.tabs.update( tab.id, { url: chrome.extension.getURL( 'main.html' ) + '?' + tab.url } );
  } else if( tab.url.substring( 0, 6 ) == 'chrome' ) {
    chrome.tabs.update( tab.id, { url: chrome.extension.getURL( 'main.html' ) + '#Main' } );
  }
});
