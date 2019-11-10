import * as puppeteer from 'puppeteer'

const ignores = [
    // trackers
    /facebook\.com\/tr\//,
    /mc\.yandex\.ru\//,
    /vk\.com\/rtrg/,

    /google-analytics\.com\/r\/collect/,


    // ads
    /\.googleadservices\.com\/pagead\//,
    /google\.ru\/pagead\//,
    /\.doubleclick\.net\/pagead\//,


    // chat soft
    /[\w]\.livetex\.ru\//,

    // other
    /cdn\.ravenjs\.com/
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
