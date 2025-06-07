/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/script.js":
/*!**********************!*\
  !*** ./js/script.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\nObject(function webpackMissingModule() { var e = new Error(\"Cannot find module '../../js/llm.js/llm.js'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }());\nvar quill = new Quill('#editor', {\n  modules: {\n    toolbar: [[{\n      header: [1, 2, false]\n    }], ['bold', 'italic', 'underline'], ['image', 'code-block']]\n  },\n  placeholder: 'Compose an epic...',\n  theme: 'snow' // or 'bubble'\n});\n\n// Import LLM app\n\n\n// State variable to track model load status\nvar model_loaded = false;\n\n// Initial Prompt\nvar initial_prompt = \"def fibonacci(n):\";\n\n// Callback functions\nvar on_loaded = function on_loaded() {\n  model_loaded = true;\n};\nvar write_result = function write_result(text) {\n  document.getElementById('result').innerText += text + \"\\n\";\n};\nvar run_complete = function run_complete() {};\n\n// Configure LLM app\nvar app = new Object(function webpackMissingModule() { var e = new Error(\"Cannot find module '../../js/llm.js/llm.js'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(\n// Type of Model\n'GGUF_CPU',\n// Model URL\n'https://huggingface.co/RichardErkhov/bigcode_-_tiny_starcoder_py-gguf/resolve/main/tiny_starcoder_py.Q8_0.gguf',\n// Model Load callback function\non_loaded,\n// Model Result callback function\nwrite_result,\n// On Model completion callback function\nrun_complete);\n\n// Download & Load Model GGML bin file\napp.load_worker();\n\n// Trigger model once its loaded\nvar checkInterval = setInterval(timer, 5000);\nfunction timer() {\n  if (model_loaded) {\n    app.run({\n      prompt: initial_prompt,\n      top_k: 1\n    });\n    clearInterval(checkInterval);\n  } else {\n    console.log('Waiting...');\n  }\n}\n\n//# sourceURL=webpack://web/./js/script.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./js/script.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;