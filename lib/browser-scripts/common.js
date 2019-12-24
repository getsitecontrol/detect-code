"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ignores = [
    // trackers
    /facebook\.com\/tr\//,
    /mc\.yandex\.ru\//,
    /vk\.com\/rtrg/,
    /google-analytics\.com\//,
    /\.doubleclick\.net\/r\/collect\//,
    /\.mxapis\.com/,
    /analytics\.yahoo\.com\//,
    /alexametrics\.com\//,
    /hs-analytics\.net/,
    /ct\.pinterest\.com/,
    /\.mxpnl\.com\/libs/,
    /api\.mixpanel\.com\/track/,
    /.+\.hotjar\.com\//,
    /\.quantserve\.com\/pixel/,
    /track\.hubspot\.com/,
    /analytics\.twitter\.com/,
    /tr\.snapchat\.com/,
    /pixel\.tapad\.com/,
    /\.dlx\.addthis\.com\//,
    // ads
    /\.googleadservices\.com\/pagead\//,
    /google\.ru\/pagead\//,
    /\.doubleclick\.net\/pagead\//,
    /\.adform\.net\//,
    /adtrak\.org\/rt\//,
    /ad\.mail\.ru\//,
    /\.pubmatic\.com\//,
    /\/t\.co\/i\//,
    /ads\.linkedin\.com\//,
    /\.ads-twitter\.com\//,
    /\.bing\.com\//,
    /\.adnxs\.com\//,
    // chat soft
    /[\w]\.livetex\.ru\//,
    /[\w]\.olark\.com\//,
    /code\.jivosite\.com\/images/,
    // other
    /cdn\.ravenjs\.com/,
    /\.gstatic\.com\/recaptcha/,
    /\.google\.com\/recaptcha/,
    /\/vk\.com\/images\//,
    /\/vk\.com\/emoji\//,
    /\.facebook.com\/rsrc\.php/,
    /maps\.gstatic\.com\/mapfiles/,
    /www\.google\.com\/maps\//,
    /maps\.googleapis\.com\//,
];
function ignoreRequest(request) {
    const type = request.resourceType();
    const url = request.url();
    for (let i in ignores) {
        if (ignores[i].test(url)) {
            return true;
        }
    }
    return false;
}
exports.ignoreRequest = ignoreRequest;
function schedulePageClose(page) {
    setTimeout(async () => {
        try {
            await page.close();
        }
        catch (err) {
            console.error('error closing', err);
        }
    });
}
exports.schedulePageClose = schedulePageClose;
