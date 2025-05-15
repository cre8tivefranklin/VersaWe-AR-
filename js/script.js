import Chart from 'chart.js/auto';
import Papa from 'papaparse';
import OpenAI from "openai";

// Store the current chart instance globally
let currentChart = null;

// 1. CSV Reading
async function readCSV(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (result.errors.length > 0) {
            console.error('CSV Parsing Errors:', result.errors);
            return [];
        }
        return result.data;
    } catch (error) {
        console.error('Error fetching and parsing CSV:', error);
        return [];
    }
}

// 2. Charting Function
function createChart(canvasId, chartType, data, options) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: chartType,
        data: data,
        options: options,
    });
}

// Function to clear the existing chart
function clearChart() {
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// 4. Upload Handling and Main Logic
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('csvFile');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('upload-status');
    const outputDiv = document.getElementById('output');

    uploadButton.addEventListener('click', () => {
        const file = fileInput.files[0];

        if (file) {
            uploadStatus.textContent = 'Processing file...';
            processFile(file);
        } else {
            uploadStatus.textContent = 'Please select a CSV file.';
        }
    });

    function processFile(file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const csvText = event.target.result;
            const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            const data = result.data;
            const csvSet = [csvText, data];

            if (data && data.length > 0) {
                uploadStatus.textContent = 'CSV file processed successfully.';
                runAnalysisAndChart(data);
                outputDiv.textContent = 'CSV data loaded and chart displayed.';
            } else {
                uploadStatus.textContent = 'Error processing CSV file or file is empty.';
                outputDiv.textContent = 'Error loading CSV data.';
            }

            //-----------------LLM INFERENCING------------------//
            //1 - set inference
            function ModelInference(data, model) {
                let dataSample = data;
                let inferenceData = dataSample[1];
                let qrtlyInference = [inferenceData.slice(0, 92), inferenceData.slice(92, 184), inferenceData.slice(184, 276), inferenceData.slice(276, 365)];
                return qrtlyInference;
            }

            //2 - set model
            function Enki_input() {
                //2.2 - openai model
                function gpt_Inf() {
                    let rev_data = ModelInference(csvSet, 0);

                    // Make the API call to your backend server
                    fetch('/api/openai/completion', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ prompt: `Make an inference in 5 words about the following data trend of cost seen in the following sample${rev_data[0]}` }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            console.error("Error from backend:", data.error);
                            outputDiv.textContent = `LLM Error: ${data.error}`; // Display error on the page
                        } else {
                            console.log("LLM Response:", data.completion);
                            outputDiv.textContent = `LLM Inference: ${data.completion}`; // Display completion on the page
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching from backend:", error);
                        outputDiv.textContent = "Error communicating with the LLM server."; // Display a user-friendly error
                    });
                }

                //2.3 - set driver function for processing/output 
                function Enki_Processing() {
                    function neocortical() {}
                    function limbic() {}
                    function amygdalic() {}
                }
            }
            Enki_input();
            //-----------------LLM INFERENCING------------------//
        };

        reader.onerror = function(error) {
            uploadStatus.textContent = `Error reading file: ${error.message}`;
            outputDiv.textContent = `Error reading file: ${error.message}`;
        };

        reader.readAsText(file);
    }

    function runAnalysisAndChart(data) {
        clearChart();

        if (data && data.length > 0) {
            const headers = Object.keys(data[0]);
            const labelColumn = headers[0];
            const dataColumn = headers[1];

            if (labelColumn && dataColumn) {
                const chartData = {
                    labels: data.map(row => row[labelColumn]),
                    datasets: [{
                        label: dataColumn,
                        data: data.map(row => parseFloat(row[dataColumn])),
                        borderColor: 'blue',
                        borderWidth: 1,
                    }],
                };

                currentChart = createChart('myChart', 'line', chartData, {
                    responsive: true,
                    title: { display: true, text: `Data Visualization (${dataColumn} vs ${labelColumn})` },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: dataColumn }
                        },
                        x: {
                            title: { display: true, text: labelColumn }
                        }
                    },
                });

                populateAxisDropdowns(headers);

            } else {
                document.getElementById('upload-status').textContent = 'Error: CSV file must have at least two columns for visualization.';
                console.error('CSV needs at least two columns for charting.');
                outputDiv.textContent = 'Error: CSV needs at least two columns for charting.';
            }
        } else {
            document.getElementById('upload-status').textContent = 'No data to visualize.';
            outputDiv.textContent = 'No data to visualize.';
        }
    }

    function populateAxisDropdowns(headers) {
        const xAxisSelect = document.getElementById('x-axis-column');
        const yAxisSelect = document.getElementById('y-axis-column');

        if (xAxisSelect && yAxisSelect) {
            xAxisSelect.innerHTML = '';
            yAxisSelect.innerHTML = '';

            headers.forEach(header => {
                const optionX = document.createElement('option');
                optionX.value = header;
                optionX.textContent = header;
                xAxisSelect.appendChild(optionX);

                const optionY = document.createElement('option');
                optionY.value = header;
                optionY.textContent = header;
                yAxisSelect.appendChild(optionY);
            });
        } else {
            console.warn('Warning: x-axis or y-axis dropdown elements not found in the HTML.');
        }
    }
});