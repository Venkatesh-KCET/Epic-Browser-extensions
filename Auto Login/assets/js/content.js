let check_box =
  '<div class="form-group">\n' +
  '        <label for="keep_login">\n' +
  '            <input type="checkbox" name="keep_login" id="keep_login">  Check this box to stay logged into EpicSearch even after closing Epic   \n' +
  "        </label>\n" +
  "      </div>";

$(document).ready(function () {
  $(check_box).insertBefore(".btn");
  $("#keep_login").change(function (e) {
    chrome.runtime.sendMessage(
      {
        cmd: "auto_login",
        data: {
          status: e.target.checked,
        },
      },
      function (response) {
        console.log(response);
      }
    );
  });
  chrome.runtime.sendMessage(
    {
      cmd: "auto_login",
      data: {
        status: false,
      },
    },
    function (response) {
      console.log(response);
    }
  );
});
