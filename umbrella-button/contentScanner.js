jQuery(document).ready(function ($) {

  $('.ads, .compImageList').on('click', async function (event) {
    $(this).find('a').attr('target', '_blank');
    chrome.runtime.sendMessage({
      ext: "saveActiveTab",
      msg:true
    })
  })


  //iframe detect function
  setInterval(function () {

    $('iframe').iframeTracker(function (event) {

      chrome.runtime.sendMessage({
        ext: "saveActiveTab",
      });

    });
  }, 1000);







});


//This will be fired in 20 seconds. Background page receives it.
//new tab event fires right away after clicking but doesn't get executed after 150 seconds to make sure
//the variable has been changed.
//it waits 7 seconds for the tab to be ready to take its url
//it restores variable so that if the user opened another thing in the meanwhile, it gets tracked as well

//this should stop the proxy immediately. The event that stops the proxy should be in the bg page
//the event will also add some timeout to re-enable proxy after around the tab loads
