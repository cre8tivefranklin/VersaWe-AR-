

const quill = new Quill('#editor', {
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'code-block'],
    ],
  },
  placeholder: 'Compose an epic...',
  theme: 'snow', // or 'bubble'
});

// Import LLM app
import {LLM} from "../../../js/llm.js/llm.js";

// State variable to track model load status
var model_loaded = false;

// Initial Prompt
var initial_prompt = "transmit js code to an ESP32 controller"

// Callback functions
const on_loaded = () => { 
    model_loaded = true; 
}
const write_result = (text) => { document.getElementById('result').innerText += text + "\n" }
const run_complete = () => {}

// Configure LLM app
const app = new LLM(
     // Type of Model
    'GGUF_CPU',

    // Model URL
    'https://huggingface.co/RichardErkhov/bigcode_-_tiny_starcoder_py-gguf/resolve/main/tiny_starcoder_py.Q8_0.gguf',

    // Model Load callback function
    on_loaded,          

    // Model Result callback function
    write_result,       

     // On Model completion callback function
    run_complete       
);

// Download & Load Model GGML bin file
app.load_worker();

// Trigger model once its loaded
const checkInterval = setInterval(timer, 5000);

function timer() {
    if(model_loaded){
            app.run({
            prompt: initial_prompt,
            top_k: 1
        });
        clearInterval(checkInterval);
    } else{
        console.log('Waiting...')
    }
}

function transmitter() {
  let textElement = document.getElementById("editor"); // Changed variable name for clarity
  let para_content = textElement.textContent; // Get the text from the element
  
  console.log(para_content); // Log what's being extracted from the editor
  
  const esp32IP = "192.168.1.213"; // Replace with your correct ESP32 IP, as identified by Serial Monitor
  
  // *** CRUCIAL ADJUSTMENT 1: Format data for x-www-form-urlencoded ***
  // The ESP32 expects 'message=YOUR_TEXT'. encodeURIComponent handles spaces and special characters.
  const dataToSend = `message=${encodeURIComponent(para_content)}`; 
  
  console.log("IP: ", esp32IP);
  console.log("Data Transmitted (body content): ", dataToSend); // Show the actual body sent

  fetch(`http://${esp32IP}/submit_text`, { // *** CRUCIAL ADJUSTMENT 2: Use the correct endpoint ***
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // This header is correct
    },
    body: dataToSend, // This is the formatted string from above
  })
  .then(response => {
    if (!response.ok) { // Check for HTTP errors (e.g., 404, 500)
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text(); // Use .text() as ESP32 sends plain text response
  })
  .then(data => console.log("ESP32 Response:", data))
  .catch(error => {
    // Log the detailed error for debugging
    console.error('Fetch failed:', error);
    // Inform the user if needed
    alert('Failed to send data to ESP32. Please check network and IP address. Error: ' + error.message);
  });
}

// To make this function run when the page loads, or based on an event:
// For testing, you can call it directly:
// transmitter(); 

// Or, ideally, attach it to a button click:
document.getElementById("sendButton").addEventListener("click", transmitter);