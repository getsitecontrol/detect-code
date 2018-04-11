import { Browser } from 'puppeteer'

export async function printHtml(
  html: string,
  browser: Browser
): Promise<Buffer> {
  const margin = '0.4in'
  const page = await browser.newPage()
  await page.setContent(html)
  await page.emulateMedia('print')
  const buffer = await page.pdf({
    format: 'A4',
    margin: { top: margin, bottom: margin, left: margin, right: margin },
  })
  await page.close()
  return buffer
}
