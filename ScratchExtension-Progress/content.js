// WebSocket connection object
let socket;

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'handshake') {
    console.log('Received handshake request from extension popup');
    initiateHandshake('handshake', message.userName, message.projectId);

    // Send a response back to the extension
    sendResponse({ status: 'Handshake initiated' });
  }

  if (message.action === 'sendCloudUpdate') {
    const { variableName, value, userName, projectId } = message;
    sendCloudUpdate(variableName, value, userName, projectId);  // Pass userName and projectId to the function
    sendResponse({ status: `Cloud variable update sent: ${variableName} = ${value}` });
  }
});

// Function to initiate WebSocket handshake
function initiateHandshake(packetName, userName, projectId) {
  // Establish WebSocket connection
  socket = new WebSocket('wss://clouddata.scratch.mit.edu/');

  // When the WebSocket connection opens
  socket.onopen = function() {
    console.log('WebSocket connection opened');

    // Send handshake packet
    const handshakePacket = JSON.stringify({
      name: 'handshake',
      user: userName,
      project_id: projectId
    }) + '\n';

    socket.send(handshakePacket);
    console.log('Sent Handshake Packet:', handshakePacket);  // Log the handshake packet in the console
    updateResponseTextarea('Sent Handshake: ' + handshakePacket);
  };

  // Listen for messages from the WebSocket
  socket.onmessage = function(event) {
    updateResponseTextarea('Received: ' + event.data);
    console.log('Received WebSocket message:', event.data);  // Log received messages
  };

  // Handle WebSocket connection close
  socket.onclose = function() {
    console.log('WebSocket connection closed');
  };

  // Handle WebSocket errors
  socket.onerror = function(error) {
    console.log('WebSocket error: ', error);
  };
}

// Function to send cloud variable updates
// Function to send cloud variable updates
function sendCloudUpdate(variableName, value, userName, projectId) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    alert('WebSocket connection is not open. Please perform the handshake first.');
    return;
  }

  const cloudUpdatePacket = JSON.stringify({
    method: 'set',
    user: userName,         // Include the username
    project_id: projectId,   // Include the project ID
    name: `☁ ${variableName}`,
    value: value
  }) + '\n';

  socket.send(cloudUpdatePacket);
  console.log('Sent Cloud Update Packet:', cloudUpdatePacket);  // Log the cloud update packet
  updateResponseTextarea('Sent Cloud Update: ' + cloudUpdatePacket);
}

function updateResponseTextarea(text) {
  chrome.runtime.sendMessage({ action: 'updateTextarea', text: text });
}

// Extract project ID and username
function getProjectDetails() {
  let projectId = window.location.pathname.split('/')[2]; // Extract project ID from URL
  let userNameElement = document.querySelector('.profile-name'); // Find the username in the DOM
  let userName = userNameElement ? userNameElement.textContent : null;

  return { projectId, userName };
}

// When the popup opens, send the extracted details
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getProjectDetails') {
    const projectDetails = getProjectDetails();
    sendResponse(projectDetails); // Send project details back to the popup
  }
});
