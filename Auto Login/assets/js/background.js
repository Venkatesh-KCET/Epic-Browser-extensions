// chrome-extension://flmmoghhokngnjihbmbnkcgpdfmcnile/options.html
// chrome-extension://flmmoghhokngnjihbmbnkcgpdfmcnile/_generated_background_page.html

window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem;
const fileName = "appdata.json";
const fileType = "text/json";
const storageSize = 1024;

let sessionid = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
var initiated = false;

chrome.runtime.onInstalled.addListener(function callback() {
  console.log("Initializing");
  requestQuotaIfNotAvailable();
  initStorage((status) => {
    initiated = true;
  }); // Init storage file if does not exist
});

// if (localStorage.getItem("session")) {
//   sessionid = localStorage.getItem("session");
//   console.log("localstorage", sessionid);
// }

if (!initiated) {
  requestQuotaIfNotAvailable();
  console.log("Initializing");
  initStorage((status) => {
    // Init storage file if does not exist
    getValue("session", (value) => {
      if (value) {
        sessionid = value;
        console.log("session : ", value);
      }
    });
  });
} else {
  getValue("session", (value) => {
    if (value) {
      sessionid = value;
      console.log("session : ", value);
    }
  });
}

//Checking Chrome version
let getChormeVersion = () => {
  let pieces = navigator.userAgent.match(
    /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/
  );
  if (pieces == null || pieces.length != 5) {
    return {};
  }
  pieces = pieces.map((piece) => parseInt(piece, 10));
  return {
    major: pieces[1],
    minor: pieces[2],
    build: pieces[3],
    patch: pieces[4],
  };
};

// chrome.webRequest.onBeforeSendHeaders.addListener(
//   function (details) {
//     console.log("webrequestBeforeSend");
//     return modifyRequestHeaderHanlder_(details);
//   },
//   { urls: ["*://search.epicbrowser.com/login/"] },
//   { urls: ["*://epicsearch.in/login/"] },
//   ["blocking", "requestHeaders"]
// );

chrome.runtime.onMessage.addListener(function (req, send, res) {
  console.log("receiced message");
  chrome.webRequest.onBeforeSendHeaders.removeListener(
    modifyRequestHeaderHanlder_
  );
  chrome.webRequest.onHeadersReceived.removeListener(
    modifyResponseHeaderHandler_
  );

  if (req.data.status) {
    addListener();
    requestQuotaIfNotAvailable();
  }

  return true;
});

let modifyRequestHeaderHanlder_ = (details) => {
  const indexMap = {};
  for (const index in details.requestHeaders) {
    const header = details.requestHeaders[index];
    indexMap[header.name.toLowerCase()] = index;
  }
  const index = indexMap["cookie"];
  console.log(sessionid);
  if (sessionid) {
    console.log("modifyRequestHeaderHanlder_", sessionid);
    if (index !== undefined) {
      let cookie_value;
      if (details.requestHeaders[index].value) {
        console.log("modified 1");
        cookie_value = ";sessionid=" + sessionid;
        details.requestHeaders[index].value += cookie_value;
      } else {
        console.log("modified 2");
        details.requestHeaders[index].value += "sessionid=" + sessionid;
      }
    } else {
      console.log("modified 3");
      details.requestHeaders.push({
        name: "Cookie",
        value: "sessionid=" + sessionid,
      });
    }
  }
  return { requestHeaders: details.requestHeaders };
};
let modifyResponseHeaderHandler_ = (details) => {
  console.log("response", details);
  Object.keys(details.responseHeaders).forEach(function (item) {
    if (details.responseHeaders[item].name.toLowerCase() === "set-cookie") {
      if (details.responseHeaders[item].value.indexOf("sessionid") >= 0) {
        // let cookie_values = details.responseHeaders[item].value.split("; ")[0];
        // console.log("cookie_values", cookie_values);

        // chrome.storage.sync.set({ session: cookie_values }, function () {
        //   return { responseHeaders: details.responseHeaders };
        // });

        let cookie_value = details.responseHeaders[item].value
          .split("; ")[0]
          .split("=")[1];
        sessionid = cookie_value;
        console.log(cookie_value);
        if (cookie_value == null || cookie_value == "") {
          console.log("EMPTY HIT")
          cookie_value = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
          sessionid = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        }
        setValue("session", cookie_value, () => {
          return { responseHeaders: details.responseHeaders };
        });
      }
    }
  });
};

//Chrome storage changed Event
// chrome.storage.onChanged.addListener(function (changes) {
//   console.log(changes);
//   for (var key in changes) {
//     var storageChange = changes[key];
//     sessionid = storageChange.newValue;
//     localStorage.setItem("session", sessionid);
//   }
// });

let addListener = () => {
  console.log("addListener");
  let chrome_Version = getChormeVersion();
  let requiresExtraRequestHeaders = false;
  if (chrome_Version.major >= 72) {
    requiresExtraRequestHeaders = true;
  }
  chrome.webRequest.onBeforeSendHeaders.addListener(
    modifyRequestHeaderHanlder_,
    // { urls: ["*://search.epicbrowser.com/*"] },
    { urls: ["*://epicsearch.in/*"] },
    requiresExtraRequestHeaders
      ? ["requestHeaders", "blocking", "extraHeaders"]
      : ["requestHeaders", "blocking"]
  );

  let requiresExtraResponseHeaders = false;
  if (chrome_Version.major >= 72) {
    requiresExtraResponseHeaders = true;
  }
  chrome.webRequest.onHeadersReceived.addListener(
    modifyResponseHeaderHandler_,
    // { urls: ["*://search.epicbrowser.com/login/"] },
    { urls: ["*://epicsearch.in/login/"] },
    requiresExtraResponseHeaders
      ? ["responseHeaders", "blocking", "extraHeaders"]
      : ["responseHeaders", "blocking"]
  );
};

addListener();

// STORAGE HANDLERS------------------------------------------------------------------

// removeStorage()

function requestQuotaIfNotAvailable() {
  navigator.webkitPersistentStorage.queryUsageAndQuota(
    function (usedBytes, grantedBytes) {
      console.log("we are using ", usedBytes, " of ", grantedBytes, "bytes");
      if (usedBytes < 216) {
        if (chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage();
        } else {
          window.open(chrome.runtime.getURL("options.html"));
        }
      }
    },
    function (e) {
      console.log("Error", e);
    }
  );
}

function removeStorage(callback) {
  window.requestFileSystem(
    window.PERSISTENT,
    storageSize,
    function onInitFs(fs) {
      fs.root.getFile(
        fileName,
        { create: false },
        function (fileEntry) {
          fileEntry.remove(function () {
            if (callback) {
              callback(true);
            }
          }, errorHandler);
        },
        errorHandler
      );
    },
    errorHandler
  );
}

function initStorage(callback) {
  window.requestFileSystem(
    window.PERSISTENT,
    storageSize,
    function onInitFs(fs) {
      fs.root.getFile(
        fileName,
        { create: false },
        function () {
          console.log("EXIST");
          callback(true);
        },
        function () {
          console.log("NOT EXIST");
          fs.root.getFile(
            fileName,
            { create: true },
            function (fileEntry) {
              console.log("CREATED");
              fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                  console.log("Initialized");
                  if (callback) {
                    callback(true);
                  }
                };

                fileWriter.onerror = function (e) {
                  console.log("Initialization failed: " + e.toString());
                  if (callback) {
                    callback(false);
                  }
                };
                var blob = new Blob(
                  ['{\"session\":\"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\"}'],
                  { type: fileType }
                );
                fileWriter.write(blob);
              }, errorHandler);
            },
            errorHandler
          );
        }
      );
    },
    errorHandler
  );
}

function setValue(key, value) {
  window.requestFileSystem(
    window.PERSISTENT,
    storageSize,
    function onInitFs(fs) {
      fs.root.getFile(
        fileName,
        { create: true },
        function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
              var obj = JSON.parse(this.result);

              obj[key] = escape(value);
                  initStorage((initstatus) => {
                    if (initstatus) {
                      fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function (e) {
                          console.log("Value set completed.");
                        };

                        fileWriter.onerror = function (e) {
                          console.log("Value set failed: " + e.toString());
                        };
                        console.log(
                          "Setting key value pair: " + key + " = " + value
                        );

                        try {
                          var blob = new Blob([JSON.stringify(obj)], {
                            type: fileType,
                          });
                          fileWriter.write(blob);
                        } catch (error) {
                          console.log(error);
                        }
                      }, errorHandler);
                    }
                  });
             
            };

            reader.readAsText(file);
          }, errorHandler);
        },
        errorHandler
      );
    },
    errorHandler
  );
}

function getValue(key, callback) {
  window.requestFileSystem(
    window.PERSISTENT,
    storageSize,
    function onInitFs(fs) {
      fs.root.getFile(
        fileName,
        { create: true },
        function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
              var obj;
              try {
                obj = JSON.parse(this.result);
              } catch (error) {
                console.log(error);
              }
              if (obj && obj[key]) {
                callback(unescape(obj[key]));
              } else {
                callback(null);
              }
            };

            reader.readAsText(file);
          }, errorHandler);
        },
        errorHandler
      );
    },
    errorHandler
  );
}

function printRawData() {
  window.requestFileSystem(
    window.PERSISTENT,
    storageSize,
    function onInitFs(fs) {
      fs.root.getFile(
        fileName,
        {},
        function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
              console.log(this.result);
            };

            reader.readAsText(file);
          }, errorHandler);
        },
        errorHandler
      );
    },
    errorHandler
  );
}

function errorHandler(e) {
  console.log("Error: " + e);

  if (e.toString().includes("QuotaExceededError")) {
    requestQuotaIfNotAvailable();
  }
}
