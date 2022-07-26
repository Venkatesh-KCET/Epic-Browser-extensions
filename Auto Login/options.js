  

window.requestFileSystem =
window.requestFileSystem || window.webkitRequestFileSystem;
const fileName = "appdata.json";
const fileType = "text/json";
const storageSize = 1024;





navigator.webkitPersistentStorage.queryUsageAndQuota(
  function (usedBytes, grantedBytes) {
    console.log("we are using ", usedBytes, " of ", grantedBytes, "bytes");
    if (usedBytes < 216) {
      navigator.webkitPersistentStorage.requestQuota(
        storageSize,
        function (grantedBytes) {
          console.log("we were granted ", grantedBytes, "bytes");
          initStorage((status) => {
            initiated = true;
            window.close();
          }); // Init storage file if does not exist
        },
        function (e) {
          console.log("Error", e);
        }
      );
    }
  },
  function (e) {
    console.log("Error", e);
  }
);

// {"session":"zd4ml7zueghoz5nq5lx7m9uabf9cxj2g"}
// setValue("session", "zd4ml7zueghoz5nq5lx7m9uabf9cxj2g");

function initStorage(callback) {
  window.requestFileSystem(
    window.PERSISTENT,
    storageSize,
    function onInitFs(fs) {
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
            var blob = new Blob(["{\"session\":\"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\"}"], { type: fileType });
            fileWriter.write(blob);
          }, errorHandler);
        },
        errorHandler
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

              removeStorage((removestatus) => {
                if (removestatus) {
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

printRawData();


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
                // document.body.innerHTML = this.result
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
  }