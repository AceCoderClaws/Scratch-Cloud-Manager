// Listen for form submission in the popup
document.getElementById('submitButton').addEventListener('click', function() {
  const userName = document.getElementById('hs_user').value;
  const projectId = document.getElementById('hs_project_id').value;

  // Make sure fields are filled
  if (userName && projectId) {
    // Get the active tab and send a message to content.js
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'handshake',
        packetName: 'handshake',
        userName: userName,
        projectId: projectId
      }, function(response) {
        console.log('Response from content script:', response);
      });
    });
  } else {
    alert('Please fill out all fields!');
  }
});

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateTextarea') {
    const responseElement = document.getElementById('response');
    if (responseElement) {
      responseElement.value += message.text + '\n';
    }
  }
});

// Listen for "Send Action" form submission
document.getElementById('sendActionSubmitButton').addEventListener('click', function() {
  const variableName = document.getElementById('var_name').value;
  const value = document.getElementById('value').value;
  const userName = document.getElementById('user').value;   // Get username from input
  const projectId = document.getElementById('project_id').value; // Get project ID from input

  // Make sure fields are filled
  if (variableName && value && userName && projectId) {
    // Get the active tab and send a message to content.js
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'sendCloudUpdate',
        variableName: variableName,
        value: value,
        userName: userName,      // Pass username
        projectId: projectId     // Pass project ID
      }, function(response) {
        console.log('Response from content script:', response);
      });
    });
  } else {
    alert('Please fill out all fields!');
  }
});

// On popup load, auto-fill fields in the active tab
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getProjectDetails' }, function(response) {
    if (response) {
      const userName = response.userName || '';
      const projectId = response.projectId || '';

      // Fill the username and project ID fields for Handshake
      document.getElementById('hs_user').value = userName;
      document.getElementById('hs_project_id').value = projectId;

      // Fill the username and project ID fields for Send Action (reuse the same fields)
      document.getElementById('user').value = userName;  // If you have separate inputs, adjust as necessary
      document.getElementById('project_id').value = projectId;    // Adjust based on your form structure

      // Update textarea with filled information
      const textarea = document.getElementById('response');
      if (userName && projectId){
        textarea.value += `Filled username "${userName}" and project id "${projectId}"\n`;
      } else {
        if (userName) {
          console.log('Auto-filled Username:', userName);
          textarea.value += `Filled username "${userName}"\n`;
        } else{
          console.error('No username!')
        }
        if (projectId) {
          console.log('Auto-filled Project ID:', projectId);
          textarea.value += `Filled projectId "${projectId}"\n`;
        } else{
          console.error('No project ID!')
        }
      }
    }
  });
});

// Tabs functionality
function openTab(tabId, tabButton) {
  let tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].style.display = "none";
    tabContents[i].classList.remove("active");
  }

  let tabButtons = document.getElementsByClassName("tab-button");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].classList.remove("active");
  }

  document.getElementById(tabId).style.display = "block";
  document.getElementById(tabId).classList.add("active");

  // Set clicked button as active
  tabButton.classList.add("active");
}

// Add event listeners to the tab buttons
document.getElementById('handshakeTab').addEventListener('click', function() {
  openTab('Handshake', this);
});
document.getElementById('sendActionTab').addEventListener('click', function() {
  openTab('SendAction', this);
});
document.getElementById('savedPrefabsTab').addEventListener('click', function() {
  openTab('Prefabs', this);
});
document.getElementById('textEncryptorTab').addEventListener('click', function() {
  openTab('Encryptor', this);
});

