var background = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === 'background-to-page') {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": 'page-to-background', "method": id, "data": data})}
  }
})();

var inject = function () {
  var config = {
    "random": {
      "value": function () {return Math.random()},
      "item": function (e) {
        var rand = e.length * config.random.value();
        return e[Math.floor(rand)];
      },
      "array": function (e) {
        var rand = config.random.item(e);
        return new Int32Array([rand, rand]);
      },
      "items": function (e, n) {
        var length = e.length;
        var result = new Array(n);
        var taken = new Array(length);
        if (n > length) n = length;
        //
        while (n--) {
          var i = Math.floor(config.random.value() * length);
          result[n] = e[i in taken ? taken[i] : i];
          taken[i] = --length in taken ? taken[length] : length;
        }
        //
        return result;
      }
    },
    "spoof": {
      "webgl": {
        "buffer": function (target) {
          const bufferData = target.prototype.bufferData;
          Object.defineProperty(target.prototype, "bufferData", {
            "value": function () {
              var index = Math.floor(config.random.value() * 10);
              var noise = 0.1 * config.random.value() * arguments[1][index];
              arguments[1][index] = arguments[1][index] + noise;
              window.top.postMessage("webgl-fingerprint-defender-alert", '*');
              //
              return bufferData.apply(this, arguments);
            }
          });
        },
        "parameter": function (target) {
          const getParameter = target.prototype.getParameter;
          Object.defineProperty(target.prototype, "getParameter", {
            "value": function () {
              var float32array = new Float32Array([1, 8192]);
              window.top.postMessage("webgl-fingerprint-defender-alert", '*');
              //
              if (arguments[0] === 3415) return 0;
              else if (arguments[0] === 3414) return 24;
              else if (arguments[0] === 35661) return config.random.items([128, 192, 256]);
              else if (arguments[0] === 3386) return config.random.array([8192, 16384, 32768]);
              else if (arguments[0] === 36349 || arguments[0] === 36347) return config.random.item([4096, 8192]);
              else if (arguments[0] === 34047 || arguments[0] === 34921) return config.random.items([2, 4, 8, 16]);
              else if (arguments[0] === 7937 || arguments[0] === 33901 || arguments[0] === 33902) return float32array;
              else if (arguments[0] === 34930 || arguments[0] === 36348 || arguments[0] === 35660) return config.random.item([16, 32, 64]);
              else if (arguments[0] === 34076 || arguments[0] === 34024 || arguments[0] === 3379) return config.random.item([16384, 32768]);
              else if (arguments[0] === 3413 || arguments[0] === 3412 || arguments[0] === 3411 || arguments[0] === 3410 || arguments[0] === 34852) return config.random.item([2, 4, 8, 16]);
              else return config.random.item([0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096]);
              //
              return getParameter.apply(this, arguments);
            }
          });
        }
      }
    }
  };
  //
  config.spoof.webgl.buffer(WebGLRenderingContext);
  config.spoof.webgl.buffer(WebGL2RenderingContext);
  config.spoof.webgl.parameter(WebGLRenderingContext);
  config.spoof.webgl.parameter(WebGL2RenderingContext);
  //
  document.documentElement.dataset.wgscriptallow = true;

  // Canvas Finger print start ----->>>>>>>
  const toBlob = HTMLCanvasElement.prototype.toBlob;
  const toDataURL = HTMLCanvasElement.prototype.toDataURL;
  const getImageData = CanvasRenderingContext2D.prototype.getImageData;
  //
  var noisify = function (canvas, context) {
    const shift = {
      'r': Math.floor(Math.random() * 10) - 5,
      'g': Math.floor(Math.random() * 10) - 5,
      'b': Math.floor(Math.random() * 10) - 5,
      'a': Math.floor(Math.random() * 10) - 5
    };
    //
    const width = canvas.width, height = canvas.height;
    const imageData = getImageData.apply(context, [0, 0, width, height]);
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const n = ((i * (width * 4)) + (j * 4));
        imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
        imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
        imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
        imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
      }
    }
    //
    window.top.postMessage("canvas-fingerprint-defender-alert", '*');
    context.putImageData(imageData, 0, 0);
  };
  //
  Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
    "value": function () {
      noisify(this, this.getContext("2d"));
      return toBlob.apply(this, arguments);
    }
  });
  //
  Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    "value": function () {
      noisify(this, this.getContext("2d"));
      return toDataURL.apply(this, arguments);
    }
  });
  //
  Object.defineProperty(CanvasRenderingContext2D.prototype, "getImageData", {
    "value": function () {
      noisify(this.canvas, this);
      return getImageData.apply(this, arguments);
    }
  });
  //
  document.documentElement.dataset.cbscriptallow = true;
  // Canvas Finger print end --------<<<<<<
};

var script_1 = document.createElement("script");
script_1.textContent = "(" + inject + ")()";
document.documentElement.appendChild(script_1);

if (document.documentElement.dataset.wgscriptallow !== "true") {
  var script_2 = document.createElement('script');
  script_2.textContent = `{
    const iframes = window.top.document.querySelectorAll("iframe[sandbox]");
    for (var i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow) {
        if (iframes[i].contentWindow.WebGLRenderingContext) {
          iframes[i].contentWindow.WebGLRenderingContext.prototype.bufferData = WebGLRenderingContext.prototype.bufferData;
          iframes[i].contentWindow.WebGLRenderingContext.prototype.getParameter = WebGLRenderingContext.prototype.getParameter;
        }
        if (iframes[i].contentWindow.WebGL2RenderingContext) {
          iframes[i].contentWindow.WebGL2RenderingContext.prototype.bufferData = WebGL2RenderingContext.prototype.bufferData;
          iframes[i].contentWindow.WebGL2RenderingContext.prototype.getParameter = WebGL2RenderingContext.prototype.getParameter;
        }
      }
    }
  }`;
  //
  window.top.document.documentElement.appendChild(script_2);
}

// Canvas Finger print start ------->>>>>>>>>
if (document.documentElement.dataset.cbscriptallow !== "true") {
  var script_2 = document.createElement('script');
  script_2.textContent = `{
    const iframes = window.top.document.querySelectorAll("iframe[sandbox]");
    for (var i = 0; i < iframes.length; i++) {
      if (iframes[i].contentWindow) {
        if (iframes[i].contentWindow.CanvasRenderingContext2D) {
          iframes[i].contentWindow.CanvasRenderingContext2D.prototype.getImageData = CanvasRenderingContext2D.prototype.getImageData;
        }
        if (iframes[i].contentWindow.HTMLCanvasElement) {
          iframes[i].contentWindow.HTMLCanvasElement.prototype.toBlob = HTMLCanvasElement.prototype.toBlob;
          iframes[i].contentWindow.HTMLCanvasElement.prototype.toDataURL = HTMLCanvasElement.prototype.toDataURL;
        }
      }
    }
  }`;
  //
  window.top.document.documentElement.appendChild(script_2);
}
// Canvas Finger print end -------<<<<<<<<<<<

window.addEventListener("message", function (e) {
  if (e.data && e.data === "webgl-fingerprint-defender-alert") {
    background.send("fingerprint", {"host": document.location.host});
  }
	// Canvas Finger print start ----->>>>>>>
  if (e.data && e.data === "canvas-fingerprint-defender-alert") {
    background.send("fingerprint", {"host": document.location.host});
  }
	// Canvas Finger print End -------<<<<<<<
}, false);
