//grab user data
chrome.storage.local.get(["container", "savedData"], function (result) {
  if (result.savedData !== undefined && result.savedData.length !== 0) {
    start(result.savedData);
  }
});

function start(data) {
  const buttons = data;

  /*region info
   * textRegion: where you type in gmail
   * containerRegion: the container
   * buttonRegion: where buttons are injected
   * watcherRegion: close child of container region
   * watcherRegion2: for default Gmail view
   * replayAll: reply button reference
   * send: send button reference
   */
  const regions = {
    textRegion: ".Am.aO9.Al.editable.LW-avf",
    containerRegion: ".nH.ar4",
    buttonRegion: ".amn",
    watcherRegion: ".BltHke.nH.oy8Mbf",
    watcherRegion2: ".AO",
    splitViewRegion: ".ae4.Zs",
    replyAll: "span.ams.bkI",
    reply: "span.ams.bkH",
    send: ".T-I.J-J5-Ji.v7"
  };

  function buttonClicked(button) {
    //button click action
    if (
      $(regions.watcherRegion).length !== 0 &&
      $(regions.splitViewRegion).length !== 0
    ) {
      buttonClickedHelper(button, regions.watcherRegion);
    } else if ($(regions.watcherRegion2).length !== 0) {
      buttonClickedHelper(button, regions.watcherRegion2);
    }
  }

  function buttonClickedHelper(button, watcherRegion) {
    $(watcherRegion).each(function () {
      let x;

      if ($(this).css("display") !== "none") {
        if ($(this).find(regions.replyAll).length !== 0) {
          x = $(this).find(regions.replyAll);
        } else {
          x = $(this).find(regions.reply);
        }

        if (x.length !== 0) {
          //startObserver(regions.containerRegion, addTag, tag, multi, auto)
          $(x)[0].click();
          addTag(button);
        }
      }
    });
  }

  function addTag(button) {
    var startTime = new Date().getTime();

    let inter = setInterval(function () {
      if (new Date().getTime() - startTime > 3000) {
        clearInterval(inter);
        return;
      }

      if (
        $(regions.watcherRegion).length !== 0 &&
        $(regions.splitViewRegion).length !== 0
      ) {
        $(regions.watcherRegion).each(function () {
          if (
            $(this).css.display !== "none" &&
            $(this).find(regions.textRegion).length !== 0
          ) {
            let x = $(this).find(regions.textRegion);
            addTagHelper(button, x, inter);
          }
        });
      } else if ($(regions.watcherRegion2).length !== 0) {
        $(regions.watcherRegion2).each(function () {
          if ($(this).find(regions.textRegion).length !== 0) {
            let x = $(this).find(regions.textRegion);
            addTagHelper(button, x, inter);
          }
        });
      }
    }, 1000);
  }

  function addTagHelper(button, x, inter) {
    if (button.hasOwnProperty("gif")) {
      clearInterval(inter);
      var xhr = $.get(
        "https://api.giphy.com/v1/gifs/random?tag=" +
        button.gif.replace(" ", "+") +
        "?&api_key=" + APIKEY
      );
      xhr.done(function (data) {
        $(x)[0].prepend(
          $("<img src=" + data.data.image_url + "></img>").get(0)
        );
      });
    } else {
      let tempTag = button.tag.replace(/(?:\r\n|\r|\n)/g, "<br>");
      $(x)[0].prepend($("<div>" + tempTag + "<br/></br></div>").get(0));
    }

    let range = document.createRange();

    if (!button.hasOwnProperty("gif")) {
      range.setStart(x[0].childNodes[1], 0);
    }
    range.collapse(true);

    if ($(regions.send).length > 0 && button.auto) {
      $(regions.send)[0].click();
      //any other buttons action
    } else {
      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    clearInterval(inter);
  }

  //adds a single button
  function addButton(button) {
    let newButton = document.createElement("button");
    newButton.innerHTML = button.label;
    newButton.onclick = () => buttonClicked(button);
    newButton.className = "tag";
    newButton.style.color = button.textColor;
    newButton.style.borderRadius = button.borderRad;
    newButton.style.marginRight = "1rem";
    newButton.style.padding = "8px 3px 8px 3px";
    newButton.style.width = "8rem";
    newButton.style.background = button.color;
    $(newButton).hover(
      function () {
        $(this).css("background-color", button.hoverColor);
        $(this).css("color", button.hoverFColor);
      },
      function () {
        $(this).css("background-color", button.color);
        $(this).css("color", button.textColor);
      }
    );
    return newButton;
  }

  //initialize buttons
  function initButtons() {
    //if in multi-pane view
    if (
      $(regions.watcherRegion).length !== 0 &&
      $(regions.splitViewRegion).length !== 0
    ) {
      initButtonHelper(regions.watcherRegion);
    //if in single-pane view
    } else if ($(regions.watcherRegion2).length !== 0) {
      initButtonHelper(regions.watcherRegion2);
    }
  }

  function initButtonHelper(watcherRegion) {
    //console.log(watcherRegion)
    $(watcherRegion).each(function () {
      if ($(this).css.display !== "none" && $(this).find(".tag").length === 0) {
        let x = $(this).find(regions.buttonRegion);

        if (x[x.length - 1] !== undefined) {
          let container = document.createElement("div");

          if ($(this).find(regions.replyAll).length !== 0) {
            $(this).find(regions.replyAll)[0].innerHTML = "All";
          }

          for (let i = 0; i < buttons.length; i++) {
            let newButton = addButton(buttons[i]);
            container.append(newButton);
          }

          x[x.length - 1].appendChild(container);
        }
      }
    });
  }

  //look for changes in DOM element
  function startObserver(region, fanction) {
    let inter = setInterval(function () {
      let panel = $(region);

      if (panel.length > 0) {
        var mutationObserver = new MutationObserver(function (mutations) {
          mutations.forEach(() => fanction(mutationObserver));
        });

        mutationObserver.observe(panel[0], {
          attributes: true,
          characterData: true,
          childList: true,
          subtree: true,
          attributeOldValue: true,
          characterDataOldValue: true
        });

        //debugging code
        // if(multi == false){
        //  console.log(mutationObserver)
        //}

        clearInterval(inter);
      }
    }, 300);
  }

  //main
  try {
    var APIKEY = "" //add Giphy API key
    startObserver(regions.containerRegion, initButtons);
  } catch (e) {
    console.log("Failed to Initialize");
  }
}
