import {Browser, Page} from 'puppeteer'
import {TIMEOUT} from "../options";
import {error404} from "../api";

export async function printHtml(
  html: string,
  browser: Browser
): Promise<Buffer> {
  const page = await browser.newPage()
  await page.setContent(html)
  return await print(page)
}

export async function printUrl(
  url: string,
  browser: Browser
): Promise<Buffer> {
  const page = await browser.newPage()
  const resp = await page.goto(url, {
    waitUntil: ['load', 'networkidle0'],
    timeout: TIMEOUT
  })
  if (!resp.ok()) {
    throw error404
  }
  return await print(page)
}

async function print(page: Page): Promise<Buffer> {
  await page.emulateMedia('print')
  const margin = '0.4in'
  const buffer = await page.pdf({
    format: 'A4',
    margin: {top: margin, bottom: margin, left: margin, right: margin},
  })
  await page.close()
  return buffer
}