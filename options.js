function saveOptions(event) {
  event.preventDefault();

  let buttons = document.querySelectorAll(".tagButton, .gifButton");
  var savedData = [];
  var tempSingleData = {};

  //loop through all buttons to grab properties
  [].forEach.call(buttons, function (button) {
    var label = button.getElementsByClassName("label")[0].value;
    var color = button.getElementsByClassName("color")[0].value;
    var hoverColor = button.getElementsByClassName("hoverColor")[0].value;
    var hoverFColor = button.getElementsByClassName("hoverFColor")[0].value;
    var textColor = button.getElementsByClassName("textColor")[0].value;
    var borderRad = button.getElementsByClassName("borderRad")[0].value;
    var buttonNum = button.getElementsByClassName("buttonNum")[0].innerHTML;

    //if tag button
    if (button.getElementsByClassName("text").length != 0) {
      var text = button.getElementsByClassName("text")[0].value;

      //checkbox case
      var autoSend = button.getElementsByClassName("autoCond")[0];
      var autoSendCond = false;
      if (autoSend.checked == false) {
        autoSendCond = true;
      }

      tempSingleData = {
        buttonNum: parseInt(buttonNum),
        tag: text,
        label: label,
        color: color,
        hoverColor: hoverColor,
        hoverFColor: hoverFColor,
        textColor: textColor,
        borderRad: borderRad,
        auto: autoSendCond,
      };

      //if gif button
    } else {
      var gif = button.getElementsByClassName("gif")[0].value;

      tempSingleData = {
        buttonNum: parseInt(buttonNum),
        gif: gif,
        label: label,
        color: color,
        hoverColor: hoverColor,
        hoverFColor: hoverFColor,
        textColor: textColor,
        borderRad: borderRad,
        auto: autoSendCond,
      };
    }

    savedData.push(tempSingleData);
  });

  chrome.storage.local.set(
    {
      savedData: savedData,
      container: document.getElementById("buttonContainer").outerHTML,
    },
    function () {
      let saveMsg = "Saving settings...";
      let statusElement = document.getElementById("status");

      // Display the save message
      statusElement.textContent = saveMsg;

      // Set a timeout to fade out the text after 2000 milliseconds
      setTimeout(function () {
        statusElement.style.transition = "opacity 3s ease"; // Transition for 0.5 seconds
        statusElement.style.opacity = 0; // Fade out the text
      }, 250);

      // Clear the text after the transition completes
      setTimeout(function () {
        statusElement.textContent = ""; // Clear the text
        statusElement.style.opacity = 1; // Reset the opacity
        statusElement.style.transition = ""; // Reset the transition
      }, 2750); // 250 (first setTimeout) + 2000 (time for fading out) + 500 (time for transition to complete)
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get(["savedData"], function (result) {
    if (result.savedData !== undefined) {
      if (result.savedData.length > 0) {
        document.getElementById("clear").style.display = "inline-block";
      }

      buttonNum = result.savedData.length + 1;
      document.getElementById("buttonContainer").innerHTML = recoverState(
        result.savedData
      );

      for (let i = 0; i < result.savedData.length; i++) {
        document
          .getElementById((i + 1).toString())
          .addEventListener("click", () => removeButton(event, i + 1));
      }
    }
  });
}

function recoverState(data) {
  var tempData = "";

  for (let i = 0; i < data.length; i++) {
    //if tagButton
    if (typeof data[i].tag !== "undefined") {
      tempData = tempData.concat(
        addButton(
          false,
          "recover",
          data[i].buttonNum,
          data[i].textColor,
          data[i].color,
          data[i].hoverColor,
          data[i].hoverFColor,
          data[i].borderRad,
          data[i].gif,
          data[i].tag,
          data[i].label,
          data[i].auto
        )
      );
    }
    //if gifbutton
    else {
      tempData = tempData.concat(
        addButton(
          true,
          "recover",
          data[i].buttonNum,
          data[i].textColor,
          data[i].color,
          data[i].hoverColor,
          data[i].hoverFColor,
          data[i].borderRad,
          data[i].gif,
          data[i].tag,
          data[i].label
        )
      );
    }
  }
  return tempData;
}

function getSelectedText() {
  var selectElement = document.getElementById("color");
  var selectedIndex = selectElement.selectedIndex;
  var selectedOption = selectElement.options[selectedIndex];
  var selectedText = selectedOption.textContent;

  return selectedText;
}

function addOption(event) {
  event.preventDefault();
  const getSelectText = getSelectedText();
  if (getSelectText === "Gif") {
    addButton(true);
  } else {
    addButton();
  }
}

function removeButton(event, buttonID) {
  document.getElementById("button" + buttonID).remove();
  buttonNum--;

  if (buttonNum === 1) {
    document.getElementById("clear").style.display = "none";
  }

  let buttons = document.querySelectorAll(".tagButton, .gifButton");

  //loop through all buttons to change buttonID
  [].forEach.call(buttons, function (button) {
    var buttonNum = button.getElementsByClassName("buttonNum")[0].innerHTML; //get button number
    if (buttonNum > buttonID) {
      button.getElementsByClassName("buttonNum")[0].innerHTML = (
        parseInt(buttonNum) - 1
      ).toString(); //change button number
      document.getElementById("button" + buttonNum).id =
        "button" + (parseInt(buttonNum) - 1).toString(); //change button id
      document.getElementById(buttonNum).id = (
        parseInt(buttonNum) - 1
      ).toString(); //change remove button id
      console.log(buttonNum);

      //get rid of event listener
      var tempElement = document.getElementById((buttonNum - 1).toString());

      var newElement = tempElement.cloneNode(true);
      tempElement.parentNode.replaceChild(newElement, tempElement);

      //re-apply event listener
      document
        .getElementById((buttonNum - 1).toString())
        .addEventListener("click", () => removeButton(event, buttonNum - 1));
    }
  });
}

function addButton(
  gif = false,
  mode = "default",
  buttonNumber = 0,
  textColor = "#444746",
  bgColor = "white",
  hoverBGColor = "#f0f0f0",
  hoverFontColor = "#444746",
  borderRad = "18px",
  gifSearch = "",
  text = "",
  label = "",
  autoCond = false
) {
  let newInput = document.createElement("div");
  let tempData = `<br><hr><br>`; //need to store in temp first or </div> gets added
  let tempButtonNum;

  if (mode === "recover") {
    tempButtonNum = buttonNumber;
  } else {
    tempButtonNum = buttonNum;
  }

  newInput.setAttribute("id", "button" + tempButtonNum);

  if (gif === true) {
    tempData = tempData.concat(
      `<div class="gifButton">
          <b>
            <div class="buttonTextContainer">
              <label>Button </label>
              <span class="buttonNum">${tempButtonNum}</span>
            </div>
            <button id="${tempButtonNum}" class="removeButton">X</button>
          </b><br><br>
          <img src="giphy.png" alt="giphy icon"><br>
          <label style="color: white;">Search:</label>
          <input type="text" class="gif" value=${gifSearch}><br>
      `
    );
  } else {
    tempData = tempData.concat(
      `<div class="tagButton">
          <b>
            <div class="buttonTextContainer">
              <label>Button <span class="buttonNum"">${tempButtonNum}</span></label>
            </div>
            <button id="${tempButtonNum}" class="removeButton">X</button>
          </b><br><br>
          <label class="labelText">Body Text:</label>
          <textarea class="text" value=${text}>${text}</textarea><br>
      `
    );
  }

  tempData = tempData.concat(`
  <style>
    .buttonTextContainer {
      display: inline-block;
      border: 4px solid black;
      background-color: #FBE5E0;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      position: relative;
      color: black;
      padding: 10px;
    }

    .autoText {
      margin-bottom: 5px;
      margin-top: 5px;
      color: white;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .removeButton {
      border: 2px solid black;
      background-color: white;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.5s;
      position: relative;
    }

    .removeButton:hover {
      color: white;
      background-color: red;
    }

    .labelText {
      display: block;
      margin-bottom: 5px;
      margin-top: 5px;
      color: white;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
  }

    textArea {
      width: 100%;
    }

    input[type="text"] {
        padding: 5px;
        border-radius: 3px;
        border: 1px solid #ccc;
        width: 100%;
    }

    input[type="text"]:focus {
        border-color: #66afe9;
        outline: none;
    }

    br {
        margin-bottom: 10px;
    }
  </style>

  <label class="labelText">Button Text:</label> <input type="text" class="label" value="${label}"><br>
  <label class="labelText">Button Text Color:</label> <input type="text" class="textColor" value="${textColor}"><br>
  <label class="labelText">Button Color:</label> <input type="text" class="color" value="${bgColor}"><br>
  <label class="labelText">On Hover Button Color:</label> <input type="text" class="hoverColor" value="${hoverBGColor}"><br>
  <label class="labelText">On Hover Button Text Color:</label> <input type="text" class="hoverFColor" value="${hoverFontColor}"><br>
  <label class="labelText">Button Border Radius:</label> <input type="text" class="borderRad" value="${borderRad}"><br>
	`);

  if (gif === false) {
    if (autoCond == false) {
      tempData = tempData.concat(
        `<label class="radio-inline">
        <label class="autoText">Auto-Reply: </label> <input class="autoCond" type="radio" name=${
          "auto" + tempButtonNum
        } checked><label class="autoText"">No</label>
              </label>
        <label class="radio-inline">
        <input type="radio" name=${
          "auto" + tempButtonNum
        } ><label class="autoText"">Yes</label>
        </label><br>
        </div>`
      );
    } else {
      tempData = tempData.concat(
        `<label class="radio-inline">
        <label class-"autoText">Auto-Reply: </label> <input class="autoCond" type="radio" name=${
          "auto" + tempButtonNum
        } ><label class="autoText">No</label>
              </label>
        <label class="radio-inline">
        <input type="radio" name=${
          "auto" + tempButtonNum
        } checked><label class="autoText">Yes</label>
        </label><br>
        </div>`
      );
    }
  } else {
    tempData = tempData.concat(`</div>`);
  }

  //recover mode
  if (mode === "recover") {
    tempData = `<div id=${"button" + tempButtonNum}>` + tempData + `</div>`;
    return tempData;
  }

  newInput.innerHTML = tempData;
  container.insertBefore(newInput, container.childNodes[-1]);

  document
    .getElementById(tempButtonNum.toString())
    .addEventListener("click", () => removeButton(event, tempButtonNum));

  buttonNum++;

  document.getElementById("clear").style.display = "inline-block";
}

function clearOptions(event) {
  chrome.storage.local.remove("savedData", function () {
    console.log("Data cleared");
  });

  event.preventDefault();
  buttonNum = 1;
  document.getElementById("buttonContainer").innerHTML = "";
  document.getElementById("clear").style.display = "none";
}

var buttonNum = 1;
var lastGif = "";
var container = document.getElementById("buttonContainer");
document.addEventListener("DOMContentLoaded", () => restore_options());
document
  .getElementById("save")
  .addEventListener("click", () => saveOptions(event));
document
  .getElementById("add")
  .addEventListener("click", () => addOption(event));
document
  .getElementById("clear")
  .addEventListener("click", () => clearOptions(event));
