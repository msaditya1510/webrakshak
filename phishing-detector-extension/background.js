// Replace with your actual API key before using
const VIRUSTOTAL_API_KEY = "YOUR_VIRUSTOTAL_API_KEY_HERE";
const VIRUSTOTAL_URL = "https://www.virustotal.com/vtapi/v2/url/report";

const allowedUrls = new Set();
const processingUrls = new Set();
const urlDelays = new Map();
const DELAY_TIME = 10000; // 10 seconds

// Whitelist of trusted domains that should never be blocked
const SAFE_DOMAINS = [
    'google.com',
    'www.google.com',
    'youtube.com',
    'www.youtube.com',
    'facebook.com',
    'www.facebook.com',
    'twitter.com',
    'www.twitter.com',
    'github.com',
    'www.github.com',
    'stackoverflow.com',
    'www.stackoverflow.com',
    'wikipedia.org',
    'en.wikipedia.org',
    'geeksforgeeks.org'
];

function isDomainSafe(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        return SAFE_DOMAINS.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        );
    } catch {
        return false;
    }
}

async function checkURLWithVirusTotal(url) {
    console.log("Function called with URL:", url);
    try {
        const response = await fetch(`${VIRUSTOTAL_URL}?apikey=${VIRUSTOTAL_API_KEY}&resource=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        console.log("VirusTotal response:", data);
        console.log("Response code:", data.response_code);
        console.log("Positives:", data.positives);

        if (data.response_code === 1) {
            if (data.positives === 0) {
                console.log("Returning safe");
                return "safe";
            } else if (data.positives > 0) {
                console.log("Returning malicious");
                return "malicious";
            }
        }
        console.log("Returning unknown");
        return "unknown";
    } catch (error) {
        console.error("API error:", error);
        return "unknown";
    }
}

chrome.tabs.onUpdated.addListener(async(tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        
        // Skip our own extension pages
        if (tab.url.startsWith('chrome-extension://')) {
            return;
        }
        
        // Check if we recently processed this URL
        const now = Date.now();
        if (urlDelays.has(tab.url)) {
            const lastCheck = urlDelays.get(tab.url);
            if (now - lastCheck < DELAY_TIME) {
                console.log("Recently checked, skipping:", tab.url);
                return;
            }
        }
        
        if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
            
            // Check if domain is in our safe list first
            if (isDomainSafe(tab.url)) {
                console.log("Whitelisted domain - allowing access:", tab.url);
                return;
            }
            
            // Mark the time we're checking this URL
            urlDelays.set(tab.url, now);
            
            const result = await checkURLWithVirusTotal(tab.url);
            console.log("The url you are trying to access is: " + result);
            
            if (result === "safe") {
                console.log("Safe site - allowing access");
            } else if (result === "malicious") {
                console.log("Malicious site - redirecting to warning");
                const warningUrl = `warning.html?url=${encodeURIComponent(tab.url)}`;
                chrome.tabs.update(tabId, {url: chrome.runtime.getURL(warningUrl)});
            } else {
                // Unknown - show caution message
                console.log("Unknown site - showing caution message");
                const checkingUrl = `checking.html?url=${encodeURIComponent(tab.url)}&status=unknown`;
                chrome.tabs.update(tabId, {url: chrome.runtime.getURL(checkingUrl)});
            }
        }
    }
});