

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
  let textElement = document.getElementById("editor");
  let para_content = textElement.textContent;

  console.log(para_content);

  // --- CRUCIAL CHANGE HERE ---
  // This is the public URL that Cloudflare Tunnel makes available for your ESP32
  const esp32PublicUrl = "https://esp32.versawear.org"; // <--- Use the exact subdomain you chose in step 5

  const dataToSend = `message=${encodeURIComponent(para_content)}`;

  console.log("Public URL: ", esp32PublicUrl);
  console.log("Data Transmitted (body content): ", dataToSend);

  fetch(`${esp32PublicUrl}/submit_text`, { // Ensure this matches the 'path' in your config.yaml
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: dataToSend,
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(data => console.log("ESP32 Response (via Cloudflare):", data))
  .catch(error => {
    console.error('Fetch failed (via Cloudflare Tunnel):', error);
    // Inform the user if needed, and suggest checking the tunnel status
    alert('Failed to send data to ESP32. Please ensure the Cloudflare Tunnel is running and your ESP32 is online. Error: ' + error.message);
  });
}

// To make this function run when the page loads, or based on an event:
// For testing, you can call it directly:
// transmitter(); 

// Or, ideally, attach it to a button click:
document.getElementById("sendButton").addEventListener("click", transmitter);

// cloudflare cmd: cloudflared tunnel run esp32-controller-tunnel