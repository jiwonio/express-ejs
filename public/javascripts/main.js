// Import showGreeting function from utils.js
import {showGreeting} from './utils.js';

// Execute code after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Main script loaded!');

  // Call the imported function
  showGreeting('World');
});