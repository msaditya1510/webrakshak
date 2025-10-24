// Load the URL parameter and display it
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');
    if (url) {
        document.getElementById('url-display').textContent = url;
    }
    
    // Add event listeners to buttons
    document.getElementById('go-back-btn').addEventListener('click', goBack);
    document.getElementById('proceed-btn').addEventListener('click', proceedAnyway);
});

// Go to a safe page instead of back
function goBack() {
    // Option 1: Go to a safe homepage
    window.location.href = 'https://www.google.com';
    
    // Option 2: Close the tab (uncomment if you prefer this)
    // chrome.tabs.getCurrent((tab) => {
    //     chrome.tabs.remove(tab.id);
    // });
}

// Proceed to the original URL anyway
function proceedAnyway() {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');
    if (url) {
        window.location.href = url;
    }
}