document.addEventListener('DOMContentLoaded', () => {
    console.log("Checking.js loaded");
    
    const urlParams = new URLSearchParams(window.location.search);
    const originalUrl = urlParams.get('url');
    const status = urlParams.get('status');
    
    console.log("Original URL:", originalUrl);
    console.log("Status:", status);
    
    document.getElementById('scanning-url').textContent = originalUrl;
    
    // Handle different statuses
    if (status === 'unknown') {
        console.log("Unknown status detected - setting up countdown");
        
        // Update the message for unknown sites
        document.querySelector('h1').textContent = 'Unknown Website Detected';
        document.querySelector('p:last-of-type').textContent = 
            'This website is new and hasn\'t been verified yet. Proceeding with caution...';
        
        // Countdown timer
        let countdown = 5;
        const countdownElement = document.createElement('p');
        countdownElement.style.fontSize = '18px';
        countdownElement.style.color = '#ffa500';
        countdownElement.textContent = `Redirecting in ${countdown} seconds...`;
        document.body.appendChild(countdownElement);
        
        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.textAlign = 'center';
        buttonContainer.style.marginTop = '20px';
        
        const proceedButton = document.createElement('button');
        proceedButton.textContent = 'Proceed Now';
        proceedButton.style.padding = '10px 20px';
        proceedButton.style.margin = '0 10px';
        proceedButton.style.backgroundColor = '#4CAF50';
        proceedButton.style.color = 'white';
        proceedButton.style.border = 'none';
        proceedButton.style.borderRadius = '5px';
        proceedButton.style.cursor = 'pointer';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel & Go Back';
        cancelButton.style.padding = '10px 20px';
        cancelButton.style.margin = '0 10px';
        cancelButton.style.backgroundColor = '#f44336';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '5px';
        cancelButton.style.cursor = 'pointer';
        
        buttonContainer.appendChild(proceedButton);
        buttonContainer.appendChild(cancelButton);
        document.body.appendChild(buttonContainer);
        
        console.log("Starting countdown timer");
        
        let timer = setInterval(() => {
            countdown--;
            console.log("Countdown:", countdown);
            countdownElement.textContent = `Redirecting in ${countdown} seconds...`;
            
            if (countdown <= 0) {
                console.log("Redirecting to:", originalUrl);
                clearInterval(timer);
                
                // Tell background script to allow this URL
                chrome.runtime.sendMessage({action: 'allowUrl', url: originalUrl});
                
                window.location.href = originalUrl;
            }
        }, 1000);
        
        // Button event listeners
        proceedButton.addEventListener('click', () => {
            clearInterval(timer);
            chrome.runtime.sendMessage({action: 'allowUrl', url: originalUrl});
            window.location.href = originalUrl;
        });
        
        cancelButton.addEventListener('click', () => {
            clearInterval(timer);
            window.location.href = 'https://www.google.com';
        });
        
    } else {
        console.log("Not unknown status, status is:", status);
    }
});