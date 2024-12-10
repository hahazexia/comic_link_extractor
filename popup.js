


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

    const type2 = document.getElementById('type-select2').value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractLinks2,
            args: [type2]
        }, async (results) => {
            const urls = results[0]?.result || [];
            // if (urls[0].includes('share.mangadata.xyz')) {
            //     const redirectUrls = await fetchFinalRedirectUrls(urls);
            //     document.getElementById('results2').value = redirectUrls.join('\n');
            //     return;
            // }
            document.getElementById('results2').value = decodeURIComponent(urls.join('\n'));
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

function extractLinks2(type) {
    let selectorMap = {
        'rapidgator': '.content-text a[href*="share.mangadata.xyz"]',
        'uploaded': '.content-text a[href*="uploaded"]',
        'katfile': '.content-text a[href*="katfile"]',
        'rockFile': '.content-text a[href*="rockfile"]',
        'mexa': '.content-text a[href*="mexa"]',
        'pubg': '.content-text a[href*="share.mangadata.xyz"]',
    };

    const selector = selectorMap[type];
    const links = Array.from(document.querySelectorAll(selector)).map(a => a.href);

    if (['Rapidgator', 'Pubg-File'].includes(type)) {
        const strongElement = Array.from(document.querySelectorAll('strong')).find(el => el.innerHTML === type);

        if (strongElement) {
            // 获取 <strong> 的所有兄弟元素
            const siblingElements = Array.from(strongElement.parentNode.children).filter(el => el !== strongElement);

            // 在兄弟元素中查找所有 <a> 元素，且 href 包含 "share.mangadata.xyz"
            const matchingLinks = siblingElements
                .filter(a => a?.href?.includes?.('share.mangadata.xyz'))
                .map(a => a?.href);

            return matchingLinks; // 返回符合条件的 <a> 元素
        } else {
            console.log(`没有找到 innerHTML 为 "${type}" 的 <strong> 元素`);
            return []; // 返回空数组
        }
    }
    return links;
}

function fetchFinalRedirectUrls(urls) {
    const promises = urls.map(url => {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none'; // 隐藏 iframe

            // 处理 iframe 加载完成事件
            iframe.onload = function() {
                try {
                    // 获取最终的 URL
                    const finalUrl = iframe.contentWindow.location.href;
                    resolve(finalUrl);
                } catch (error) {
                    // 捕获跨域错误
                    reject(new Error(`无法访问 ${url} 的内容，可能是跨域问题`));
                } finally {
                    // 清理 iframe
                    document.body.removeChild(iframe);
                }
            };

            // 处理加载错误
            iframe.onerror = function() {
                reject(new Error(`加载 ${url} 的 iframe 失败`));
                document.body.removeChild(iframe);
            };

            // 设置 iframe 的 src 属性为目标 URL
            iframe.src = url;
            document.body.appendChild(iframe);
        });
    });

    // 返回所有 Promise 的结果
    return Promise.all(promises);
}
