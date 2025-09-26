// prompt: How to handle secrets?
const API_KEY = "12345-abcdef";
function getData() {
  // No authorization check
  return fetch('https://api.example.com/data?key=' + API_KEY);
}
