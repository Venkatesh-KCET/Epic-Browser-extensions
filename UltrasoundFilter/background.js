
var active = true;


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.msg == "getStatus") {
        sendResponse({status: active});
        return true;
    }
});

function changeState() {
 if (active == false){
	active = true;
  } else if (active == true){
	active = false;
  }

  setIcon();
}


function setIcon() {

  if (active == false){
	chrome.browserAction.setIcon({path:"icon_disabled.png"});

  } else if (active == true){
	chrome.browserAction.setIcon({path:"icon_enabled.png"});
  }
 }
 
  function notifyContent(tabId, origin) {
    chrome
      .tabs
      .sendMessage(tabId, {
        origin: origin,
        state: active
      });
  }
 
 /////////////////////////


chrome.browserAction.onClicked.addListener(changeState);


// chrome.tabs.onUpdated.addListener(function() {
//     chrome.tabs.executeScript(null, { file: "intercept.js" });
// });
chrome
    .tabs
    .onUpdated
    .addListener(function (tabId) {
      notifyContent(tabId, 'backgroundScript');
    });

setIcon();