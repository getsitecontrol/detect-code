import * as puppeteer from 'puppeteer'

const ignores = [
    // trackers
    /facebook\.com\/tr\//,
    /mc\.yandex\.ru\//,
    /vk\.com\/rtrg/,

    /google-analytics\.com\//,
    /\.doubleclick\.net\/r\/collect\//,

    /alexametrics\.com\//,
    /hs-analytics\.net/,
    /ct\.pinterest\.com/,
    /\.mxpnl\.com\/libs/,
    /api\.mixpanel\.com\/track/,
    /.+\.hotjar\.com\//,

    /track\.hubspot\.com/,
    /analytics\.twitter\.com/,
    /tr\.snapchat\.com/,
    /pixel\.tapad\.com/,
    /\.dlx\.addthis\.com\//,


    // ads
    /\.googleadservices\.com\/pagead\//,
    /google\.ru\/pagead\//,
    /\.doubleclick\.net\/pagead\//,

    /\/t\.co\/i\//,

    /ads\.linkedin\.com\//,
    /\.ads-twitter\.com\//,


    // chat soft
    /[\w]\.livetex\.ru\//,
    /[\w]\.olark\.com\//,

    // other
    /cdn\.ravenjs\.com/,

    /\/vk\.com\/images\//,
    /\/vk\.com\/emoji\//,
]

export function ignoreRequest(request: puppeteer.Request): boolean {
    const type = request.resourceType();
    const url = request.url();

    for (let i in ignores) {
        if (ignores[i].test(url)) {
            return true
        }
    }
    return false

}

export function schedulePageClose(page: puppeteer.Page) {
    setTimeout(async () => {
        try {
            await page.close()
        } catch (err) {
            console.error('error closing', err)
        }
    })
}
