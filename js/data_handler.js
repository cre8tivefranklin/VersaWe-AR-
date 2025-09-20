// --- IMPORTS ---
import { inferenceMechanism } from "./infMech.js";
import {
    startCameraProcessing,
    stopCameraProcessing,
    toggleThermalFilter,
    getProcessedData,
    loadSmartVisionModel,
    toggleSmartVision,
    // FIX: Import the state variables so we can access them here.
    isThermalFilterActive,
    isSmartVisionActive
} from "./camera.js";

// A comprehensive JS file for the VERSAWARE product prototype
// This file is structured based on the IPO (Inputs, Processing, Outputs) model.

// ----GET/INPUTS----
const spacetime = [];
let liveChartInstance = null;
let graphInterval = null;
let cameraStream = null;

// References to HTML elements for state management
const infMechButton = document.getElementById('infMech');
const loadingStatus = document.getElementById('loadingStatus');
const smartVisionToggleBtn = document.getElementById('smartVisionToggleBtn');
const cameraToggleButton = document.getElementById('cameraToggleButton');
const thermalFilterButton = document.getElementById('thermalFilterButton');
const liveCameraFeed = document.getElementById('liveCameraFeed');
const smartVisionOutput = document.getElementById('smartVisionOutput');

// ----SET/PROCESSING----
function calculateColorConcentrations(heatmappedData) {
    if (!heatmappedData || heatmappedData.length === 0) {
        return { avgRed: 0, avgGreen: 0, avgBlue: 0 };
    }
    let totalRed = 0;
    let totalGreen = 0;
    let totalBlue = 0;

    for (let i = 0; i < heatmappedData.length; i += 4) {
        totalRed += heatmappedData[i];
        totalGreen += heatmappedData[i + 1];
        totalBlue += heatmappedData[i + 2];
    }

    const totalPixels = heatmappedData.length / 4;
    return {
        avgRed: totalRed / totalPixels,
        avgGreen: totalGreen / totalPixels,
        avgBlue: totalBlue / totalPixels,
    };
}

// FIX: Add a new function to update the button text.
function updateSmartVisionButton() {
    smartVisionToggleBtn.textContent = isSmartVisionActive ? 'Turn Smart Vision Off' : 'Turn Smart Vision On';
}

// FIX: Update the toggle function to also call the new function.
const originalToggleSmartVision = toggleSmartVision;
function correctedToggleSmartVision() {
    originalToggleSmartVision(); // Call the original function to toggle the state
    updateSmartVisionButton();   // Update the button text based on the new state
}

async function handleLLMInference() {
    console.log("\n--- Starting LLM Inference ---");
    infMechButton.disabled = true;
    loadingStatus.textContent = "Processing LLM inference... Please wait...";
    loadingStatus.style.display = 'block';

    try {
        const llmData = await inferenceMechanism();

        const llmPoint = {
            id: Date.now(),
            type: 'llm',
            prompt: llmData.userPrompt,
            inference: llmData.WebLLMResponse,
            tokens: llmData.total_tokens,
            colorConcentrations: null
        };
        spacetime.push(llmPoint);
        console.log("LLM data pushed to spacetime:", llmPoint);

        document.getElementById('result').innerHTML = `
            <strong>Response:</strong> ${llmData.WebLLMResponse}<br>
            <strong>Tokens:</strong> ${llmData.total_tokens}
        `;

    } catch (error) {
        console.error("An error occurred during LLM inference:", error);
        loadingStatus.textContent = "Error during inference. See console for details.";
        loadingStatus.className = 'status-msg error';
    } finally {
        // FIX: Re-enable the button here.
        infMechButton.disabled = false;
        loadingStatus.style.display = 'none';
    }
}

// ----SHOW/OUTPUTS----
function formatTo2DTable() {
    const columns = ["User Prompts", "Inferences", "Token Usage", "Blue Concentration"];
    const rows = [];
    for (let i = 0; i < spacetime.length; i++) {
        rows.push(spacetime[i]);
    }
    return { columns: columns, rows: rows };
}

function saveData() {
    console.log("\n--- Saving data to a database... ---");
    console.log("Data saved:", spacetime);
    console.log("--- Data saving complete. ---");
}

function prepareFor4DVisualization() {
    console.log("\n--- Preparing data for 4D visualization... ---");
    spacetime.forEach(point => {
        const [prompt, inference, tokens, concentration] = point;
        const visualizationPoint = {
            x_axis: concentration,
            y_axis: tokens,
            z_axis: prompt.length,
            color_dimension: concentration > 0.7 ? "hot" : "cold"
        };
        console.log("Visualization Point:", visualizationPoint);
    });
    console.log("--- Data visualization preparation complete. ---");
}

async function generate_livegraph_chartjs() {
    console.log("\n--- Starting Live Graph Update ---");
    const cameraData = await getProcessedData();
    const { thermalData, detections } = cameraData;

    // Push thermal data to spacetime if it exists.
    if (thermalData) {
        const colorConcentrations = calculateColorConcentrations(thermalData.data);
        const cameraPoint = {
            id: Date.now(),
            type: 'thermal_filter',
            prompt: null,
            inference: null,
            tokens: null,
            colorConcentrations: colorConcentrations.avgBlue,
            detections: null
        };
        spacetime.push(cameraPoint);
        console.log("Thermal data pushed to spacetime:", cameraPoint);
    }

    // Always push smart vision data to spacetime if it exists.
    if (detections) {
        const detectionPoint = {
            id: Date.now(),
            type: 'smart_vision',
            prompt: null,
            inference: null,
            tokens: null,
            colorConcentrations: null,
            detections: detections.length
        };
        spacetime.push(detectionPoint);
        console.log("Detection data pushed to spacetime:", detectionPoint);
    }

    const ctx = document.getElementById('liveChart').getContext('2d');
    const labels = spacetime.map((_, index) => `Event ${index + 1}`);
    const tokenData = spacetime.filter(point => point.type === 'llm').map(point => point.tokens);
    const concentrationData = spacetime.filter(point => point.type === 'thermal_filter').map(point => point.colorConcentrations ? point.colorConcentrations * 255 : null);
    const detectionData = spacetime.filter(point => point.type === 'smart_vision').map(point => point.detections);

    if (liveChartInstance) {
        liveChartInstance.data.labels = labels;
        liveChartInstance.data.datasets[0].data = tokenData;
        liveChartInstance.data.datasets[1].data = concentrationData;
        liveChartInstance.data.datasets[2].data = detectionData;
        liveChartInstance.update();
    } else {
        liveChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Token Usage',
                    data: tokenData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: 'Blue Concentration (0-255)',
                    data: concentrationData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }, {
                    label: 'Smart Vision Detections',
                    data: detectionData,
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    if (detections) {
        smartVisionOutput.textContent = `Detections: ${detections.length}`;
    }

    console.log("Live graph prepared and updated.");
    console.log("--- Live graph data preparation complete. ---");
}

async function startCameraAndGraph() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        liveCameraFeed.srcObject = stream;
        cameraStream = stream;

        liveCameraFeed.onloadedmetadata = async () => {
            // FIX: Wait for the tf.js backend to be ready before starting processing
            await tf.ready();
            startCameraProcessing(liveCameraFeed);
            graphInterval = setInterval(generate_livegraph_chartjs, 3000);
            console.log("Camera and Live Graph started.");
        };
    } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Failed to access camera. Please check your browser permissions.");
    }
}

function stopCameraAndGraph() {
    clearInterval(graphInterval);
    graphInterval = null;
    stopCameraProcessing();
    if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop());
        liveCameraFeed.srcObject = null;
        cameraStream = null;
    }
    console.log("Camera and Live Graph stopped.");
}

/**
 * Initializes all event listeners after the model is loaded.
 */
function attachEventListeners() {
    infMechButton.addEventListener('click', handleLLMInference);
    const startCameraButton = document.getElementById('startCameraButton');
    startCameraButton.addEventListener('click', startCameraAndGraph);
    smartVisionToggleBtn.addEventListener('click', correctedToggleSmartVision); // FIX: Use the corrected function
    cameraToggleButton.addEventListener('click', stopCameraAndGraph);
    thermalFilterButton.addEventListener('click', toggleThermalFilter);
    console.log("All button event listeners attached.");
}

// This is the main execution block that runs the entire process.
(async () => {
    try {
        // Load the Smart Vision model once when the page loads.
        await loadSmartVisionModel();
        console.log("All systems ready!");
        // Attach event listeners ONLY after the model is loaded.
        attachEventListeners();
        updateSmartVisionButton(); // FIX: Call this function to set the initial button text.
    } catch (error) {
        console.error("Initialization failed:", error);
        // Display an error message to the user if a critical part of the app fails
        loadingStatus.textContent = "Failed to initialize application. Check console for details.";
        loadingStatus.className = 'status-msg error';
        loadingStatus.style.display = 'block';
    }
})();