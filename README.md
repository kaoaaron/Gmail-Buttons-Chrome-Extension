# Gmail Buttons Chrome Extension

## Description

Adds buttons to Gmail that inserts custom tags and gifs.

The *auto* feature auto-submits an email in 1 click. Please be careful with this.

## Basic Usage Instructions

1. Navigate to `chrome://extensions/`, locate the plugin, and click on details
2. Click on the `Extension Options` icon
3. Refresh Gmail
* OR
1. Click on the icon on the top right of the browser and select `options`
2. Refresh Gmail

[For detailed instructions, watch this demonstration](https://www.youtube.com/watch?v=An9cFyygz00)

[Extension on Chrome store](https://chrome.google.com/webstore/detail/gmail-buttons/jmcajpbnkcmpoajjgfojgjbbhjjcejah)


## Important JavaScript Files
1. options.js - 
The logic to manipulate the options page is here. User input data is collected and stored in Chrome.
2. content.js - 
The main logic goes in here. It takes the data stored in Chrome, and injects the buttons onto the webpage. A [Giphy API key](https://developers.giphy.com/) will need to be inserted into line 229 to use the Gif feature.
