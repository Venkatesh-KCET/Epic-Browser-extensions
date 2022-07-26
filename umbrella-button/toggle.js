// ***** Changed from Local Storage to chrome.storage *****
var timer = null;
var globalObj = {};
var extStorageKeys = [];

// ***** Store and display the toggle values *****
var toggleObj = {}
var hostPage = '';
// ***********************************************

function initStorage() {
    getValuesFromStorage(function () {
        pageLoaded();
        recursiveLoader();
    })
}

function getKeys(callback) {
    chrome.storage.sync.get('keys', function (o) {
        extStorageKeys = o['keys'] || "[]";
        try {
            extStorageKeys = JSON.parse(extStorageKeys);
        } catch (err) {
            console.log(err);
        }
        if (typeof callback == 'function') callback();
    })
}

function recursiveLoader() {
    if (timer) clearInterval(timer);
    timer = setInterval(getValuesFromStorage, 1000);
}

function setItem(a, b) {
    globalObj[a] = b;
    var obj = {};
    obj[a] = b;
    chrome.storage.sync.set(obj);
    if (extStorageKeys.indexOf(a) == -1) {
        extStorageKeys.push(a);
    }
    chrome.storage.sync.set({ keys: JSON.stringify(extStorageKeys) });
    // writeToFile(globalObj);
}

function getItem(a) {
    var b = globalObj[a];
    if (b != undefined) {
        return b;
    } else {
        return null;
    }
}

function removeItem(a) {
    delete globalObj[a];
    if (extStorageKeys.indexOf(a) > -1) {
        extStorageKeys.splice(extStorageKeys.indexOf(a), 1);
        chrome.storage.sync.set({ keys: JSON.stringify(extStorageKeys) });
    }
    chrome.storage.sync.remove(a);
    // writeToFile(globalObj);
}

function getValuesFromStorage(callback) {
    getKeys(function () {
        getStorageObjFromKeys(0, function () {
            if (typeof callback == 'function') callback();
        });
    })
}

function getStorageObjFromKeys(idx, callback) {
    var key = extStorageKeys[idx];
    if (key) {
        chrome.storage.sync.get(key, function (o) {
            globalObj[key] = o[key];
            idx++;
            getStorageObjFromKeys(idx, callback);
        })
    } else {
        if (typeof callback == 'function') callback();
    }
}

// **********************************

// #agad - animate toggle
function updateToggleButton(id, value) {
    let noEl = document.querySelector(`#${id} .toggle-off`);
    let yesEl = document.querySelector(`#${id} .toggle-on`);
    if (!noEl || !yesEl) return;
    function toggleOff() {
        yesEl.classList.replace("selected", "unselected")
        noEl.classList.replace("unselected", "selected")
    }
    function toggleOn() {
        noEl.classList.replace("selected", "unselected")
        yesEl.classList.replace("unselected", "selected")
    }
    if (value == true) {
        toggleOn();
    } else {
        toggleOff();
    }
}

function toggleOptionState(id, value, extensionId, taburl) {
    if (!document.body.getAttribute("available-options")?.includes(id)) return ;
    chrome.extension.sendMessage({
        ext: id,
        value: value,
        extId: extensionId,
        url: taburl
    });
    updateToggleButton(id, !value);
    setBodyOptionInfo(id, !value);
    document.body.classList.toggle('needReload', needReload())
    renderSwitchButton();
}

function setExtOptionState(id, query, extensionId, taburl) {
    promisify(r => chrome.extension.sendMessage({ ext: query, extId: extensionId, url: taburl }, r))
        .then(isSiteWhitelisted => {
            updateToggleButton(id, !isSiteWhitelisted)
            setBodyOptionInfo(id, !isSiteWhitelisted);
            renderSwitchButton();
        });
}

let lastOptionsBeforeRefresh = []
function saveLastOptionsBeforeRefresh(){
    lastOptionsBeforeRefresh = document.body.getAttribute("allowed-options")?.split(",").filter(e => e != "") || []
}

function needReload(){
    let x = document.body.getAttribute("allowed-options")?.split(",").filter(e => e != "") || []
    return x.length != lastOptionsBeforeRefresh.length || !x.every(e => lastOptionsBeforeRefresh.includes(e))
}

function areAllOptionsAllowed() {
    return (document.body.getAttribute("allowed-options")?.split(",") || []).length == document.body.getAttribute("available-options").split(",").length
}
function renderSwitchButton(){
    let state = areAllOptionsAllowed()
    let img = document.querySelector('#switch-img')
    img.src = state ? "images/toggle-on.png" : "images/toggle-off.png";
}

function handleDisplayExtraOptions(){
    let adsAllowed = (document.body.getAttribute("allowed-options")?.includes("adsAllowed"))==false;
    if (!adsAllowed){
        document.querySelector("#extraTools").classList.remove("extra-hide");
    } else {
        document.querySelector("#extraTools").classList.add("extra-hide");
    }
}

function setBodyOptionInfo(id, value) {
    let v = [...(value ? [id] : []), ...(document.body.getAttribute("allowed-options")?.split(",").filter(e => e != "" && id != e) || [])]
    document.body.setAttribute("allowed-options", v.join(","))
}
// $(document).ready(function () {
function pageLoaded() {       // Commented above line and added this line.
    // alert("1")
    // ***** Store and display the toggle values *****
    chrome.storage.sync.get('toggleObj', async function (o) {
        if (o.toggleObj != undefined && Object.keys(o.toggleObj).length > 0) {
            toggleObj = o.toggleObj;
            setTimeout(() => {
                if (o.toggleObj[hostPage] !== undefined) {
                    // updateToggleButton("adsAllowed", o.toggleObj[hostPage]._adsAllowed);
                    // updateToggleButton("httpAllowed", o.toggleObj[hostPage]._httpAllowed);
                }
            });
        } else {
            // document.getElementById("adsAllowed_N").style.color = "black";
            // document.getElementById("adsAllowed_Y").style.color = "#CCCCCC";   
        }
    })
    // ***********************************************


    chrome.tabs.getSelected(null, async function (tab) {
        // alert("2")
        var taburl;
        taburl += tab.url;
        var tab_url = tab.url;
        var host = tab_url.match(/^(.*:)\/\/([a-z0-9\-.]+)(:[0-9]+)?(.*)$/)[2];
        var proto = tab_url.match(/^(.*:)\/\/([a-z0-9\-.]+)(:[0-9]+)?(.*)$/)[1];
        var text = host;
        var index = text.indexOf("www.");
        if (index != -1)
            text = text.substring(index + 4);
        document.getElementById('current_domain').innerHTML = text;
        hostPage = host;

        // alert("tab.url: "+tab.url+"  taburl: "+taburl+"     host: "+host+"     proto: "+proto+"    Text: "+text);
        taburl = taburl.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
        // #agad : support of Epic AdBlocker - getting the extension id
        window.ublockorigin = null;
        var http, adbplus, wot, epicProxy;
        let ublockIsDisabled=false,proxyIsDisabled=false;
        const exts = (await promisify(r => chrome.management.getAll(r)));
        for (var i in exts) {
            if (exts[i].name == "04_Encrypted Connection Preference") http = exts[i].id;
            // if (exts[i].name == "Epic Filter") adbplus = exts[i].id;
            if (exts[i].name == "Epic Filter") adbplus = exts[i].id;
            if (exts[i].name == "WOT") wot = exts[i].id;
            // if (exts[i].name == "Umbrella Button") uni = exts[i].id;
            if (exts[i].name == "Epic Encrypted Proxy (VPN for the Browser)") {
                if (exts[i].enabled == false){
                    proxyIsDisabled = true;
                }
                epicProxy = exts[i].id;
            }
            if (exts[i].name == "03_Umbrella Button") uni = exts[i].id;
            if (exts[i].name == "Epic AdBlocker") {
                window.ublockorigin = exts[i].id;
                // #agad - launch ublock popup scripts after extracting the id
                if (exts[i].enabled == false){
                    ublockIsDisabled = true;
                    continue;
                }
                if (window.ublockorigin) {
                    window.loadUblockPopupMain();
                }
            }
        }
        let options = {"httpAllowed":http,"proxyAllowed":epicProxy,"adsAllowed":window.ublockorigin}
        document.body.setAttribute("available-options", Object.keys(options).filter(k => options[k]!=null).join(","));
        //set the state of the 3 items on the body
        setExtOptionState("httpAllowed", "httpIsWhitelistedSite", http, taburl);

        function replaceToggleByInstallButton(id, onClick, isDisabled) {
            let toggleEl = document.querySelector(`#${id} .toggle-item-yes-no`)
            let installButtonEl = htmlString2El(`<div class="button-normal" id="install">${isDisabled? "Enable" :"Install"}</div>`)
            installButtonEl.addEventListener("click", onClick);
            toggleEl.parentNode.replaceChild(installButtonEl, toggleEl);
        }
        async function handleClickInstall(id, isExtensionDisabled, storeLink){
            if (isExtensionDisabled){
                await promisify(r => chrome.management.setEnabled(id, true, r))
                document.location.reload();
            } else {
                chrome.tabs.create({ "url": storeLink });
            }
        }

        if (!window.ublockorigin || ublockIsDisabled) {
            replaceToggleByInstallButton("adsAllowed", () => {
                handleClickInstall(window.ublockorigin, ublockIsDisabled, EPIC_WEBSTORE_LINK.ublockOrigin);
            },ublockIsDisabled);
            ;[...document.querySelectorAll('.depend-on-ublock')].forEach(el => {
                el.style.display = 'none';
            });
            document.querySelector('.main-panel').style.border = '0';

        } else {
            
            document.querySelector("#toggle-domains-list").addEventListener("click", () => {
                let el = document.querySelector("#toggle-domains-list-state")
                el.textContent = el.classList.toggle("open") ? "►" : "◄";
            });
            document.querySelector("#sticky #switch").addEventListener("click", () => {
                let count = (document.body.getAttribute("allowed-options")?.split(",").filter(e => e!="") || []).length
                let state = count == 0 ? false : true;
                toggleOptionState("adsAllowed", state, window.ublockorigin, taburl)
                toggleOptionState("proxyAllowed", state, epicProxy, taburl)
                toggleOptionState("httpAllowed", state, http, taburl)
                sleep(50).then(renderSwitchButton);
            });
            setExtOptionState("adsAllowed", "ublockIsWhitelistedSite", window.ublockorigin, taburl);
            ;[...document.querySelectorAll('.depend-on-ublock')].forEach(el => {
                el.classList.remove("depend-on-ublock");
            });
            $("#adsAllowed .toggle-on").click(function () {
                toggleOptionState("adsAllowed", false, window.ublockorigin, taburl)
            })

            $("#adsAllowed .toggle-off").click(function () {
                toggleOptionState("adsAllowed", true, window.ublockorigin, taburl)
            })
        }
        if (!epicProxy || proxyIsDisabled) {
            //replace toggle by an install button
            replaceToggleByInstallButton("proxyAllowed", () => {
                handleClickInstall(epicProxy, proxyIsDisabled, EPIC_WEBSTORE_LINK.epicProxy)
            },proxyIsDisabled)

        } else {
            //determine if the current site is whitelisted
            setExtOptionState("proxyAllowed", "proxyIsWhitelistedSite", epicProxy, taburl);

            document.getElementById('current_domain').innerHTML = text;
            $("#proxyAllowed .toggle-off").click(function () {
                toggleOptionState("proxyAllowed", true, epicProxy, taburl)
            })

            $("#proxyAllowed .toggle-on").click(function () {
                toggleOptionState("proxyAllowed", false, epicProxy, taburl)
            })
        }
        
        
        sleep(50).then(()=>{
            saveLastOptionsBeforeRefresh()
        })
        handleDisplayExtraOptions()
        document.querySelector("#refresh").addEventListener("click", () => {
            saveLastOptionsBeforeRefresh()
            handleDisplayExtraOptions()
        });

        $("#adboptions").click(function () {
            //  alert("Epic Tracker Notifications Enabled")
            chrome.extension.sendMessage({
                ext: "adboptions",
                value: true,
                extId: adbplus
            });
        })

        $("#siteSettings").click(function () {

            // if(settings.openInNewTab){ 
            // chrome.tabs.create( { "url": "chrome://settings/content" } );
            var tab_url = tab.url;
            var host = tab_url.match(/^(.*:)\/\/([a-z0-9\-.]+)(:[0-9]+)?(.*)$/)[2];
            chrome.tabs.create({ "url": "chrome://settings/content/siteDetails?site=https%3A%2F%2F" + host });
            // } else {
            //     //reload in current tab
            //     chrome.tabs.update(null, {url:"chrome://settings/content"});
            // }
        })

        $('#adblockSettings').click(function () {
            chrome.tabs.create({ "url": `chrome-extension://${window.ublockorigin}/dashboard.html#settings.html` });
        });

        $("#httpAllowed .toggle-off").click(function () {
            toggleOptionState("httpAllowed", true, http, taburl)
        })

        $("#httpAllowed .toggle-on").click(function () {
            toggleOptionState("httpAllowed", false, http, taburl)
        })

        // #agad - new toggle elements
        $('#toggle-domains-list').click(function (ev) {
            document.querySelector("#column-firewall").classList.toggle("hidden");
        });

        //handle button click
        document.querySelector('#switch-img').src = areAllOptionsAllowed() ? "images/toggle-on.png" : "images/toggle-off.png";
       

        $(".button").click(function () {

            var sets = JSON.parse(getItem(taburl));
            var ele = $(this).children("div").attr('class');
            var obj = {};
            var sel = $(this).children("div");
            var id = $(this).attr('id');

            if (id == "seeWotRating" || id == "seeTrackers" || (id != "seeWotRating" && id != "seeTrackers" && document.getElementById(id.concat("_N")).style.color == "black")) {
                if (id != "seeWotRating" && id != "seeTrackers") {
                    document.getElementById(id.concat("_Y")).style.color = "black";
                    document.getElementById(id.concat("_N")).style.color = "#CCCCCC";
                }
                switch (id) {
                    //case "tpc":
                    // chrome.privacy.websites.thirdPartyCookiesAllowed.set({
                    //     value: false
                    // });
                    // sets.thirdPartyCookies = false;
                    // setItem(taburl, JSON.stringify(sets));
                    // break;
                    // case "plugins":
                    //     chrome.contentSettings.plugins.set({
                    //         'primaryPattern': proto+'//' + taburl + ':*/*',
                    //         'setting': 'block'
                    //     });
                    //     sets.plugin = false;
                    //     setItem(taburl, JSON.stringify(sets));
                    //     break;
                    // case "httpAllowed":
                    //     var millisecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 30;
                    //     var oneMonthAgo = (new Date()).getTime() - millisecondsPerMonth;
                    //     chrome.browsingData.remove({
                    //         "since": oneMonthAgo
                    //     }, {
                    //         "cache": true
                    //     }, function () {
                    //         chrome.extension.sendMessage({
                    //             ext: "httpAllowed",
                    //             value: false,
                    //             extId: http,
                    //             url: taburl
                    //         });
                    //     });

                    //     break;
                    // case "adsAllowed":
                    //     var millisecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 30;
                    //     var oneMonthAgo = (new Date()).getTime() - millisecondsPerMonth;
                    //     chrome.browsingData.remove({
                    //         "since": oneMonthAgo
                    //     }, {
                    //         "cache": true
                    //     }, function () {
                    //         chrome.extension.sendMessage({
                    //             ext: "adsAllowed",
                    //             value: false,
                    //             extId: adbplus,
                    //             url: taburl
                    //         });
                    //         sets.adsAllowed = false;
                    //         setItem(taburl, JSON.stringify(sets));
                    //     });
                    //     break;

                    case "seeWotRating":
                        chrome.extension.sendMessage({
                            ext: "seeWotRating",
                            value: false,
                            extId: wot,
                            url: taburl
                        });
                        sets.seeWotRating = false;
                        setItem(taburl, JSON.stringify(sets));
                        break;
                    case "seeTrackers":
                        var millisecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 30;
                        var oneMonthAgo = (new Date()).getTime() - millisecondsPerMonth;
                        chrome.browsingData.remove({
                            "since": oneMonthAgo
                        }, {
                            "appcache": true,
                            "cache": true,
                            "cookies": true,
                            "downloads": true,
                            "fileSystems": true,
                            "formData": true,
                            "history": true,
                            "indexedDB": true,
                            "pluginData": true,
                            "webSQL": true
                        }, function () {
                            chrome.extension.sendMessage({
                                ext: "seeTrackers",
                                extId: adbplus
                            });
                        });
                        break;
                    // case "trackMeAllowed":
                    //     chrome.extension.sendMessage({
                    //         ext: "trackMeAllowed",
                    //         value: false
                    //     });
                    //     sets.trackMeAllowed = false;
                    //     setItem(taburl, JSON.stringify(sets));
                    //     break;
                }
            } else if (id == "seeWotRating" || id == "seeTrackers" || (id != "seeWotRating" && id != "seeTrackers" && document.getElementById(id.concat("_Y")).style.color == "black")) {
                if (ele != "link") {
                    document.getElementById(id.concat("_N")).style.color = "black";
                    document.getElementById(id.concat("_Y")).style.color = "#CCCCCC";
                }
                switch (id) {
                    // case "tpc":
                    //     chrome.privacy.websites.thirdPartyCookiesAllowed.set({
                    //         value: true
                    //     });
                    //     var set = JSON.parse(getItem(taburl));
                    //     set.thirdPartyCookies = true;
                    //     setItem(taburl, JSON.stringify(set));
                    //     break;
                    // case "plugins":
                    //     chrome.contentSettings.plugins.set({
                    //         'primaryPattern': proto+'//' + taburl + ':*/*',
                    //         'setting': 'allow'
                    //     });
                    //     sets.plugin = true;
                    //     setItem(taburl, JSON.stringify(sets));
                    //     break;
                    // case "httpAllowed":
                    //     var millisecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 30;
                    //     var oneMonthAgo = (new Date()).getTime() - millisecondsPerMonth;
                    //     chrome.browsingData.remove({
                    //         "since": oneMonthAgo
                    //     }, {
                    //         "appcache": true,
                    //         "cache": true,
                    //         "cookies": true,
                    //         "downloads": true,
                    //         "fileSystems": true,
                    //         "formData": true,
                    //         "history": true,
                    //         "indexedDB": true,
                    //         "pluginData": true,
                    //         "webSQL": true
                    //     }, function () {
                    //         chrome.extension.sendMessage({
                    //             ext: "httpAllowed",
                    //             value: true,
                    //             extId: http,
                    //             url: taburl,
                    //             httpex: true
                    //         });
                    //     }); 
                    //     break;
                    // case "adsAllowed":
                    //     var millisecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 30;
                    //     var oneMonthAgo = (new Date()).getTime() - millisecondsPerMonth;
                    //     chrome.browsingData.remove({
                    //         "since": oneMonthAgo
                    //     }, {
                    //         "appcache": true,
                    //         "cache": true,
                    //         "cookies": true,
                    //         "downloads": true,
                    //         "fileSystems": true,
                    //         "formData": true,
                    //         "history": true,
                    //         "indexedDB": true,
                    //         "pluginData": true,
                    //         "webSQL": true
                    //     }, function () {
                    //         chrome.extension.sendMessage({
                    //             ext: "adsAllowed",
                    //             value: true,
                    //             extId: adbplus,
                    //             url: taburl
                    //         });
                    //         sets.adsAllowed = true;
                    //         setItem(taburl, JSON.stringify(sets));
                    //     });
                    //     break;

                    case "seeWotRating":
                        chrome.extension.sendMessage({
                            ext: "seeWotRating",
                            value: true,
                            extId: wot,
                            url: taburl
                        });
                        sets.seeWotRating = true;
                        setItem(taburl, JSON.stringify(sets));
                        break;
                    // case "trackMeAllowed":
                    //     chrome.extension.sendMessage({
                    //         ext: "trackMeAllowed",
                    //         value: true
                    //     });
                    //     sets.trackMeAllowed = true;
                    //     setItem(taburl, JSON.stringify(sets));
                    //     break;
                    case "seeTrackers":
                        var millisecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 30;
                        var oneMonthAgo = (new Date()).getTime() - millisecondsPerMonth;
                        chrome.browsingData.remove({
                            "since": oneMonthAgo
                        }, {
                            "appcache": true,
                            "cache": true,
                            "cookies": true,
                            "downloads": true,
                            "fileSystems": true,
                            "formData": true,
                            "history": true,
                            "indexedDB": true,
                            "pluginData": true,
                            "webSQL": true
                        }, function () {
                            chrome.extension.sendMessage({
                                ext: "seeTrackers",
                                extId: adbplus
                            });
                        });
                        break;
                }
            }
        });

        // ***** Store and display the toggle values *****
        function updateToggleObj() {
            if (!toggleObj.hasOwnProperty(host)) {
                toggleObj[host] = {
                    '_adsAllowed': 1,
                    '_httpAllowed': 1,
                    '_proxyAllowed': 1,
                }

            }
            if (!toggleObj.hasOwnProperty('_trackersBlocked')) {
                toggleObj['_trackersBlocked'] = true;
            }
        }
        function setToggleObj() {
            chrome.storage.sync.set({
                "toggleObj": toggleObj
            }, function () { // // callback funcion
            })
        }
        // ****************************************************
    });

    chrome.windows.onRemoved.addListener(function (wind) {
        var sets = JSON.parse(getItem(taburl));
        if (sets.deletebrowsingdata == true) {
            var millisecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 30;
            var oneMonthAgo = (new Date()).getTime() - millisecondsPerMonth;
            chrome.browsingData.remove({
                "since": oneMonthAgo
            }, {
                "localstorage": true
            });
        }
    });
} //);

initStorage();       // Converted from Local storage to chrome.storage

// #agad - update current domain name

function promisify(fn) {
    return new Promise((accept, cancel) => {
        fn(accept);
    })
}

const sleep = async function(ms){
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function htmlString2El(s) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = s;
    return wrapper.children[0];
}

function getHostFromUrl(url) {
    var host = url.match(/^(.*:)\/\/([a-z0-9\-.]+)(:[0-9]+)?(.*)$/)[2];
    var proto = url.match(/^(.*:)\/\/([a-z0-9\-.]+)(:[0-9]+)?(.*)$/)[1];
    var text = host;
    var index = text.indexOf("www.");
    if (index != -1)
        text = text.substring(index + 4);
    return text;
}

async function setCurrentDomainNameLabel() {
    const tab = await promisify((r) => chrome.tabs.getSelected(null, r))
    const host = getHostFromUrl(tab.url);
    document.querySelector('#current-domain-name').innerHTML = host;
}

setCurrentDomainNameLabel();

// #agad - urls to directly install extensions from the Epic Store
const EPIC_WEBSTORE_LINK = {
    // "epicProxy": "https://epicbrowser.com/webstore2/webstore/crx_files/Epic%20Encrypted%20Proxy.crx",
    // "ublockOrigin": "https://epicbrowser.com/webstore2/webstore/crx_files/Epic%20AdBlocker.crx",
    "epicProxy": "chrome://extensions",
    "ublockOrigin": "chrome://extensions",
}