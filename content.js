const APIKEY = ""; // Add Giphy API key

// Grab user data
chrome.storage.local.get(["container", "savedData"], function (result) {
  if (result.savedData && result.savedData.length) {
    start(result.savedData);
  }
});

function start(buttons) {
  const regions = {
    textRegion: ".Am.aO9.Al.editable.LW-avf",
    containerRegion: ".nH.ar4",
    buttonRegion: ".amn",
    watcherRegion: ".BltHke.nH.oy8Mbf",
    watcherRegion2: ".AO",
    splitViewRegion: ".ae4.Zs",
    replyAll: "span.ams.bkI",
    reply: "span.ams.bkH",
    send: ".T-I.J-J5-Ji.v7",
    dynamicPanes: ".bGI.nH",
  };

  function getActivePane() {
    if ($(regions.watcherRegion).length && $(regions.splitViewRegion).length) {
      return $(regions.watcherRegion).filter(function () {
        return $(this).css("display") !== "none";
      });
    }
    return $(regions.watcherRegion2).length ? $(regions.watcherRegion2) : null;
  }

  function buttonClicked(button) {
    const activePane = getActivePane();
    if (activePane) {
      buttonClickedHelper(button, activePane);
    }
  }

  function buttonClickedHelper(button, watcherRegion) {
    const visiblePanes = $(watcherRegion)
      .find(regions.dynamicPanes)
      .filter(function () {
        return $(this).css("display") !== "none";
      });

    visiblePanes.each(function () {
      const pane = $(this);
      const replyButton = pane.find(regions.replyAll).length
        ? pane.find(regions.replyAll)
        : pane.find(regions.reply);
      if (replyButton.length) {
        replyButton[0].click();
        addTag(button);
        return false; // Break out of the loop after processing
      }
    });
  }

  function addTag(button) {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > 3000) {
        clearInterval(interval);
        return;
      }

      const activePane = getActivePane();
      if (activePane) {
        activePane.each(function () {
          const pane = $(this);
          const visibleDynamicPanes = pane
            .find(regions.dynamicPanes)
            .filter(function () {
              return $(this).css("display") !== "none";
            });

          visibleDynamicPanes.each(function () {
            const dynamicPane = $(this);
            const textRegions = dynamicPane.find(regions.textRegion);
            if (textRegions.length) {
              addTagHelper(button, textRegions.first(), interval);
              return false; // Break out of the loop after processing
            }
          });
        });
      }
    }, 1000);
  }

  function addTagHelper(button, textRegion, interval) {
    if (button.gif) {
      clearInterval(interval);
      $.get(
        `https://api.giphy.com/v1/gifs/random?tag=${button.gif.replace(
          " ",
          "+"
        )}&api_key=${APIKEY}`
      ).done((data) => {
        $(textRegion).prepend(
          `<img src="${data.data.images.downsized.url}"></img>`
        );
      });
    } else {
      const tempTag = button.tag.replace(/(?:\r\n|\r|\n)/g, "<br>");
      $(textRegion).prepend(`<div>${tempTag}<br/></br></div>`);
    }

    const range = document.createRange();
    if (!button.gif) {
      range.setStart(textRegion[0].childNodes[1], 0);
    }
    range.collapse(true);

    if ($(regions.send).length && button.auto) {
      $(regions.send)[0].click();
    } else {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    clearInterval(interval);
  }

  function addButton(button) {
    const newButton = document.createElement("button");
    newButton.innerHTML = button.label;
    newButton.onclick = () => buttonClicked(button);
    newButton.className = "tag123";
    Object.assign(newButton.style, {
      color: button.textColor,
      fontFamily: '"Google Sans",Roboto,RobotoDraft,Helvetica,Arial,sans-serif',
      borderRadius: button.borderRad,
      border: "1px solid #747775",
      marginLeft: "0.5rem",
      fontSize: ".875rem",
      fontWeight: "500",
      padding: "8px 16px",
      minWidth: "7rem",
      background: button.color,
    });
    $(newButton).hover(
      () =>
        $(newButton).css({
          backgroundColor: button.hoverColor,
          color: button.hoverFColor,
        }),
      () =>
        $(newButton).css({
          backgroundColor: button.color,
          color: button.textColor,
        })
    );
    return newButton;
  }

  function initButtons() {
    const activePane = getActivePane();
    if (activePane) {
      initButtonHelper(activePane);
    }
  }

  function initButtonHelper(watcherRegion) {
    $(watcherRegion)
      .find(".bGI.nH")
      .each(function () {
        if ($(this).find(".tag123").length === 0) {
          const buttonRegion = $(this).find(regions.buttonRegion).last();
          if (buttonRegion.length) {
            const container = document.createElement("div");

            if ($(this).find(regions.replyAll).length) {
              $(this).find(regions.replyAll)[0].innerHTML = "All";
            }

            buttons.forEach((button) => {
              const newButton = addButton(button);
              container.append(newButton);
            });

            buttonRegion.append(container);
          }
        }
      });
  }

  function observeNewDivs() {
    const interval = setInterval(() => {
      const targetNode = document.querySelector(".AO");

      if (targetNode) {
        clearInterval(interval);
        const observer = new MutationObserver((mutationsList) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === "childList") {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.matches(".bGI.nH")) {
                  initButtonHelper(node);
                }
              });
            }
          });
        });
        observer.observe(targetNode, { childList: true, subtree: true });
      }
    }, 300);
  }

  function startObserver(region, callback) {
    const interval = setInterval(() => {
      const panel = $(region);
      if (panel.length) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(() => callback(observer));
        });
        observer.observe(panel[0], {
          attributes: true,
          characterData: true,
          childList: true,
          subtree: true,
          attributeOldValue: true,
          characterDataOldValue: true,
        });
        clearInterval(interval);
      }
    }, 300);
  }

  // Main
  try {
    startObserver(regions.containerRegion, initButtons);
    observeNewDivs();
  } catch (e) {
    console.log("Failed to Initialize", e);
  }
}
