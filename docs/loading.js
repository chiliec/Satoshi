const loadingIndicator = document.getElementById('loading-indicator');
let activeRequests = 0;

function showLoading() {
    activeRequests++;
    loadingIndicator.style.display = 'block';
}

function hideLoading() {
    activeRequests--;
    if (activeRequests <= 0) {
        activeRequests = 0;
        loadingIndicator.style.display = 'none';
    }
}

function withLoading(originalFn) {
    return async function (...args) {
        showLoading();
        try {
            return await originalFn.apply(this, args);
        } catch (error) {
            throw error;
        } finally {
            hideLoading();
        }
    };
}

window.fetch = withLoading(window.fetch);

const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function () {
    this.addEventListener('loadstart', showLoading);
    this.addEventListener('loadend', hideLoading);
    return originalXHROpen.apply(this, arguments);
};

function setupApiOverrides() {
    const apiFunctions = ['getJettonData', 'getMiningData', 'submitMining'];

    apiFunctions.forEach((fnName) => {
        if (typeof window[fnName] === 'function') {
            window[fnName] = withLoading(window[fnName]);
        }
    });
}

document.addEventListener('DOMContentLoaded', setupApiOverrides);

// setupApiOverrides();
