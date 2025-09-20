// Initialize WebLLM
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

// Initialize Quill
const quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Type your message here...'
});

// `engine` is in a higher scope so it's accessible after initialization
let engine;

// Export the function so it can be used in other files
export async function inferenceMechanism() {
    const initProgressCallback = (progress) => {
        // You can use this to update a progress bar on your UI if you want
        console.log("Model loading progress:", progress);
    };
    try {
        // Only create the engine once to avoid repeated downloads
        if (!engine) {
            engine = await CreateMLCEngine("Phi-3-mini-4k-instruct-q4f16_1-MLC", { initProgressCallback });
            console.log("MLC Engine created:", engine);
        }

        // Get the plain text content from the Quill editor
        const userPrompt = quill.getText().trim();
        console.log("User Prompt:", userPrompt);

        // Prepare the messages array with the user's input
        const messages = [
            { role: "system", content: "You are the Personal Offline Thinker. Your purpose is to process and analyze information with thoroughness and care, right here on this device.You are not a quick-answer chatbot.Instead, you take your time to provide high-quality, in-depth responses. Your capabilities include: Summarizing long documents, articles, and complex texts. Explaining intricate topics in a clear, comprehensive, and patient manner.Assisting with creative tasks by generating detailed narratives, poems, or other written content. Now that you know your role, execute the task at hand once you have received the text for analysis." },
            { role: "user", content: userPrompt }
        ];

        // Call the chat completion API
        const reply = await engine.chat.completions.create({
            messages,
        });

        // Get the AI's response and usage data
        const aiResponse = reply.choices[0].message.content;
        const tokens = reply.usage.total_tokens;

        // Display the response in the result section
        const resultElement = document.getElementById("result");
        resultElement.textContent = aiResponse;

        console.log("AI Response:", aiResponse);
        console.log("Total Tokens:", tokens);

        // Return a single object with all the data needed by data_handler.js
        return {
            userPrompt: userPrompt,
            WebLLMResponse: aiResponse,
            total_tokens: tokens,
        };
    } catch (error) {
        console.error("Failed during LLM inference:", error);
        // Return a fallback object on error
        return {
            userPrompt: "Error",
            WebLLMResponse: "An error occurred during inference.",
            total_tokens: 0,
        };
    }
}

async function getEditorContent() {
    const result_card = document.getElementById("result");
    result_card.textContent = "Thinking...";

    // Use await to wait for the async function to complete
    await inferenceMechanism();
}

document.addEventListener("DOMContentLoaded", () => {
    const infMech = document.getElementById("infMech");
    if (infMech) {
        infMech.addEventListener("click", getEditorContent);
    }
});