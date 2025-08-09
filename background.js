// Listen for when the extension icon is clicked
chrome.action.onClicked.addListener(async () => {
    // Create a very small popup window
    const window = await chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      focused: true
    });
    
    // Force update to very small size
    chrome.windows.update(window.id, {
      width: 200,
      height: 120,
      left: 100,
      top: 100
    });
  });