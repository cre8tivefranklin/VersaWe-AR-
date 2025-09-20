/**
 * @file This file contains the logic for processing the real-time camera stream.
 * @author Frank Sami
 * @date 9/5/2025
 */

// No need for a direct tf import here, as it's loaded in the HTML
let blazefaceModel;
// FIX: Export the state variables so data_handler can access them.
export let isThermalFilterActive = false;
export let isSmartVisionActive = false;
let videoElement;
let thermalCanvas;
let offscreenCanvas;
let offscreenCtx;

// Create the off-screen canvas and context
offscreenCanvas = document.createElement('canvas');
offscreenCtx = offscreenCanvas.getContext('2d');

/**
 * Loads the Smart Vision (BlazeFace) model asynchronously.
 */
export async function loadSmartVisionModel() {
    console.log("Loading Smart Vision model...");
    // Use the already imported blazeface object directly
    blazefaceModel = await blazeface.load();
    console.log("Smart Vision model loaded successfully.");
}

/**
 * Toggles the state of the thermal filter.
 */
// FIX: Update this function to control the canvas visibility for both filters.
export function toggleThermalFilter() {
    isThermalFilterActive = !isThermalFilterActive;
    const thermalCanvas = document.getElementById('thermalCanvas');
    if (thermalCanvas) {
        // Only show the canvas if EITHER filter is active
        thermalCanvas.style.display = (isThermalFilterActive || isSmartVisionActive) ? 'block' : 'none';
    }
}

/**
 * Toggles the state of the smart vision filter.
 */
// FIX: Update this function to control the canvas visibility for both filters.
export function toggleSmartVision() {
    isSmartVisionActive = !isSmartVisionActive;
    const thermalCanvas = document.getElementById('thermalCanvas');
    if (thermalCanvas) {
        // Only show the canvas if EITHER filter is active
        thermalCanvas.style.display = (isSmartVisionActive || isThermalFilterActive) ? 'block' : 'none';
    }
}

/**
 * Starts the continuous processing of the camera stream.
 * @param {HTMLVideoElement} videoEl The video element to process.
 */
export function startCameraProcessing(videoEl) {
    videoElement = videoEl;
    // FIX: Also set the visible canvas dimensions to match the video feed
    const displayCanvas = document.getElementById('thermalCanvas');
    if (displayCanvas) {
        displayCanvas.width = videoEl.videoWidth;
        displayCanvas.height = videoEl.videoHeight;
    }
    // Set the off-screen canvas dimensions
    offscreenCanvas.width = videoEl.videoWidth;
    offscreenCanvas.height = videoEl.videoHeight;
}

/**
 * Stops the continuous processing of the camera stream.
 */
export function stopCameraProcessing() {
    videoElement = null;
}

/**
 * Retrieves the latest processed data from the camera stream.
 * @returns {object} An object containing the processed thermal data and smart vision detections.
 */
// FIX: This function has been rewritten for more robust logic.
export async function getProcessedData() {
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        return { thermalData: null, detections: null };
    }

    const displayCanvas = document.getElementById('thermalCanvas');
    if (!displayCanvas) {
        return { thermalData: null, detections: null };
    }
    const ctx = displayCanvas.getContext('2d');
    
    let thermalData = null;
    let detections = null;

    // A. Draw the base image on the visible canvas
    // If the thermal filter is active, apply it and then draw.
    if (isThermalFilterActive) {
        offscreenCtx.drawImage(videoElement, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        applyThermalFilter(imageData);
        thermalData = imageData; // Store the modified image data
        ctx.putImageData(thermalData, 0, 0); // Draw the thermal image
    } else {
        // Otherwise, just draw the raw video feed.
        ctx.drawImage(videoElement, 0, 0, displayCanvas.width, displayCanvas.height);
    }

    // B. Handle Smart Vision
    if (isSmartVisionActive && blazefaceModel) {
        // Use the off-screen canvas for model inference to avoid flashing
        offscreenCtx.drawImage(videoElement, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        detections = await blazefaceModel.estimateFaces(offscreenCanvas);
        
        // Draw the detections on the already populated visible canvas
        detections.forEach(detection => {
            const [y1, x1, y2, x2] = detection.box;
            const width = x2 - x1;
            const height = y2 - y1;
            
            ctx.beginPath();
            ctx.rect(x1, y1, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        });
    }

    // Return the processed data, including the ImageData object for the graph
    return { thermalData, detections };
}

/**
 * Applies a thermal filter effect to the given image data.
 * @param {ImageData} imageData The image data from the canvas.
 */
function applyThermalFilter(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const heat = data[i];
        data[i] = 0; // Red
        data[i + 1] = 255 - heat; // Green
        data[i + 2] = heat; // Blue
    }
}