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
        auto: autoSendCond
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
        auto: autoSendCond
      };
    }

    savedData.push(tempSingleData);
  });

  chrome.storage.local.set(
    {
      savedData: savedData,
      container: document.getElementById("buttonContainer").outerHTML
    },
    function () {
      let saveMsg = "Settings have been saved";
      setTimeout(function () {
        document.getElementById("status").textContent = saveMsg;
      }, 250);
      setTimeout(function () {
        document.getElementById("status").textContent = "";
      }, 2000);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get(["savedData"], function (result) {
    if (result.savedData !== undefined) {
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
    //document.getElementById('gif').value = items.gif;
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

    console.log(tempData);
  }

  console.log(tempData);
  return tempData;

}

function addOption(event, gif) {
  event.preventDefault();
  if (gif === "gif") {
    addButton(true);
  } else {
    addButton();
  }
}

function removeButton(event, buttonID) {
  console.log("button" + buttonID)
  document.getElementById("button" + buttonID).remove()
  buttonNum--

  let buttons = document.querySelectorAll(".tagButton, .gifButton");

  //loop through all buttons to change buttonID
  [].forEach.call(buttons, function (button) {
    var buttonNum = button.getElementsByClassName("buttonNum")[0].innerHTML; //get button number
    if (buttonNum > buttonID) {
      button.getElementsByClassName("buttonNum")[0].innerHTML = (parseInt(buttonNum) - 1).toString() //change button number
      document.getElementById("button" + buttonNum).id = "button" + (parseInt(buttonNum) - 1).toString() //change button id
      document.getElementById(buttonNum).id = (parseInt(buttonNum) - 1).toString() //change remove button id
      console.log(buttonNum)

      //get rid of event listener
      var tempElement = document.getElementById((buttonNum - 1).toString());

      var newElement = tempElement.cloneNode(true);
      tempElement.parentNode.replaceChild(newElement, tempElement);

      //re-apply event listener
      document
        .getElementById((buttonNum - 1).toString())
        .addEventListener("click", () => removeButton(event, buttonNum - 1));
    }
  })
}

function addButton(
  gif = false,
  mode = "default",
  buttonNumber = 0,
  textColor = "black",
  bgColor = "aqua",
  hoverBGColor = "black",
  hoverFontColor = "white",
  borderRad = "4px",
  gifSearch = "",
  text = "",
  label = "",
  autoCond = false
) {
  let newInput = document.createElement("div");
  let tempData = `<br><hr><br>`; //need to store in temp first or </div> gets added
  let tempButtonNum;

  if (mode === "recover") {
    tempButtonNum = buttonNumber
  } else {
    tempButtonNum = buttonNum
  }

  newInput.setAttribute("id", "button" + tempButtonNum)

  if (gif === true) {
    tempData = tempData.concat(
      `<div class="gifButton">
       <b>Button <span class="buttonNum">${tempButtonNum}</span>
       <button id="${tempButtonNum}" style="background-color:lightblue">X</button>
       </b><br><br>
       <img src="giphy.png" alt="giphy icon"><br>
			 Search: <input type="text" class="gif" value=${gifSearch}><br>`
    );
  } else {
    tempData = tempData.concat(
      `<div class="tagButton">
      <b>Button <span class="buttonNum">${tempButtonNum}</span>
      <button id="${tempButtonNum}" style="background-color:lightblue">X</button>
      </b><br><br>
			Text: <textarea class="text" value=${text}>${text}</textarea><br>`
    );
  }

  tempData = tempData.concat(`
		Label: <input type="text" class="label" value=${label}><br>
		Text Color: <input type="text" class="textColor" value=${textColor}><br>
		BG Color: <input type="text" class="color" value=${bgColor}><br>
		Hover BG Color: <input type="text" class="hoverColor" value=${hoverBGColor}><br>
		Hover Font Color: <input type="text" class="hoverFColor" value=${hoverFontColor}><br>
		Border Radius: <input type="text" class="borderRad" value=${borderRad}><br>
	`);

  if (gif === false) {
    if (autoCond == false) {
      tempData = tempData.concat(
        `<label class="radio-inline">
        Auto: <input class="autoCond" type="radio" name=${"auto" +
        tempButtonNum} checked>No
              </label>
        <label class="radio-inline">
        <input type="radio" name=${"auto" + tempButtonNum} >Yes
        </label><br>
        </div>`
      );
    } else {
      tempData = tempData.concat(
        `<label class="radio-inline">
        Auto: <input class="autoCond" type="radio" name=${"auto" +
        tempButtonNum} >No
              </label>
        <label class="radio-inline">
        <input type="radio" name=${"auto" + tempButtonNum} checked>Yes
        </label><br>
        </div>`
      );
    }
  } else {
    tempData = tempData.concat(`</div>`);
  }


  //recover mode
  if (mode === "recover") {
    tempData = `<div id=${"button" + tempButtonNum}>` + tempData + `</div>`
    console.log(tempData)
    return tempData;
  }

  newInput.innerHTML = tempData;
  console.log(newInput.outerHTML)
  container.insertBefore(newInput, container.childNodes[-1]);

  document
    .getElementById(tempButtonNum.toString())
    .addEventListener("click", () => removeButton(event, tempButtonNum));

  buttonNum++;
}

function clearOptions(event) {
  event.preventDefault();
  buttonNum = 1
  document.getElementById("buttonContainer").innerHTML = ""
}

var buttonNum = 1;
var lastGif = "";
var container = document.getElementById("buttonContainer");
document.addEventListener("DOMContentLoaded", () => restore_options());
document
  .getElementById("save")
  .addEventListener("click", () => saveOptions(event));
document
  .getElementById("addGif")
  .addEventListener("click", () => addOption(event, "gif"));
document
  .getElementById("addTag")
  .addEventListener("click", () => addOption(event));
document
  .getElementById("clear")
  .addEventListener("click", () => clearOptions(event));