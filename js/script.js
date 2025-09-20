
// --- Configuration for the Central Router URL ---
// REPLACE THIS WITH YOUR CLOUDFLARE TUNNEL HOSTNAME FOR THE CENTRAL ROUTER
const centralRouterURL = "https://my-devices.versawear.org";

// --- Helper Function to Display Status Messages ---
function displayStatus(elementId, message, isSuccess) {
    const statusEl = document.getElementById(elementId);
    statusEl.textContent = message;
    statusEl.className = 'status-msg ' + (isSuccess ? 'success' : 'error');
    setTimeout(() => {
        statusEl.style.display = 'none'; // Hide after 5 seconds
    }, 5000);
}

// --- Register New ESP32 Device ---
async function registerNewDevice() {
    const deviceIdInput = document.getElementById('newDeviceId');
    const localIpInput = document.getElementById('newLocalIp');
    const deviceId = deviceIdInput.value.trim();
    const localIp = localIpInput.value.trim();

    if (!deviceId || !localIp) {
        displayStatus('registerStatus', "Please enter both Device ID and Local IP.", false);
        return;
    }

    try {
        const response = await fetch(`${centralRouterURL}/register_device`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Flask expects JSON for this route
            },
            body: JSON.stringify({ device_id: deviceId, local_ip: localIp })
        });

        const data = await response.json();
        if (response.ok) {
            displayStatus('registerStatus', `Success: ${data.message}`, true);
            deviceIdInput.value = ''; // Clear inputs
            localIpInput.value = '';
            loadDevices(); // Reload device list after registration
        } else {
            displayStatus('registerStatus', `Error: ${data.error || 'Unknown error'}`, false);
        }
    } catch (error) {
        displayStatus('registerStatus', `Network Error: Could not connect to router. ${error.message}`, false);
        console.error('Registration fetch failed:', error);
    }
}

// --- Load All Registered ESP32 Devices ---
async function loadDevices() {
    const deviceListEl = document.getElementById('deviceList');
    const selectDeviceIdEl = document.getElementById('selectDeviceId');
    deviceListEl.innerHTML = ''; // Clear existing list
    selectDeviceIdEl.innerHTML = '<option value="">Select a device...</option>'; // Reset dropdown

    try {
        const response = await fetch(`${centralRouterURL}/devices`);
        const devices = await response.json();

        if (Object.keys(devices).length === 0) {
            deviceListEl.innerHTML = '<li class="list-group-item text-muted">No devices registered yet.</li>';
            selectDeviceIdEl.innerHTML = '<option value="">No devices available</option>';
            return;
        }

        for (const deviceId in devices) {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${deviceId} (IP: ${devices[deviceId]})`;
            deviceListEl.appendChild(li);

            const option = document.createElement('option');
            option.value = deviceId;
            option.textContent = deviceId;
            selectDeviceIdEl.appendChild(option);
        }
    } catch (error) {
        deviceListEl.innerHTML = '<li class="list-group-item text-danger">Failed to load devices. Check router.</li>';
        selectDeviceIdEl.innerHTML = '<option value="">Error loading devices</option>';
        console.error('Load devices fetch failed:', error);
    }
}

// --- Send Text to Selected ESP32 Device ---
async function transmitter() {
    const selectedDeviceId = document.getElementById('selectDeviceId').value;
    if (!selectedDeviceId) {
        displayStatus('sendTextStatus', "Please select a device to send text to.", false);
        return;
    }

    // --- CHANGE THIS LINE TO GET PLAIN TEXT ---
    const para_content = quill.getText().trim();
    // .getText() gets the plain text content.
    // .trim() removes any leading/trailing whitespace, including a potential newline Quill might add.

    if (!para_content) { // Changed condition to check for empty string after trim
        displayStatus('sendTextStatus', "Please enter some text to send.", false);
        return;
    }

    console.log(`Sending to device: ${selectedDeviceId}`);
    console.log("Text content (Plain Text):", para_content); // Updated console log

    const targetURL = `${centralRouterURL}/${selectedDeviceId}/submit_text`;
    const dataToSend = `message=${encodeURIComponent(para_content)}`;

    try {
        const response = await fetch(targetURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: dataToSend,
        });

        const result = await response.text();
        if (response.ok) {
            displayStatus('sendTextStatus', `Success: ${result}`, true);
        } else {
            displayStatus('sendTextStatus', `Error: ${result}`, false);
            console.error('ESP32 Router Response Error:', result);
        }

    } catch (error) {
        displayStatus('sendTextStatus', `Network Error: Could not reach router. ${error.message}`, false);
        console.error('Fetch failed:', error);
    }
}


// cloudflare cmd: cloudflared tunnel run esp32-controller-tunnel