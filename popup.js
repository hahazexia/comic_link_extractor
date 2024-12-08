document.getElementById('get-urls').addEventListener('click', () => {
    const type = document.getElementById('type-select').value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractLinks,
            args: [type]
        }, (results) => {
            const urls = results[0]?.result || [];
            document.getElementById('results').value = urls.join('\n');
        });
    });
});

document.getElementById('copy-urls').addEventListener('click', () => {
    const resultsTextArea = document.getElementById('results');
    resultsTextArea.select();
    document.execCommand('copy');
    alert('链接已复制到剪贴板！');
});

function extractLinks(type) {
    let selectorMap = {
        'katfile': '#listDL a[href*="katfile"]',
        'rapidgator': '#listDL a[href*="rapidgator"]',
        'fikper': '#listDL a[href*="fikper"]',
        'dailyuploads': '#listDL a[href*="dailyuploads"]',
        'mexa': '#listDL a[href*="mexa"]',
        'turbobit': '#listDL a[href*="turbobit"]',
        'kingdomfiles': '#listDL a[href*="kingdomfiles"]'
    };

    const selector = selectorMap[type];
    const links = Array.from(document.querySelectorAll(selector)).map(a => a.href);
    return links;
}
