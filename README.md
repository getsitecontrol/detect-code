## Widget script detection

Query

`GET  http://localhost:3000/detect-code?eval=true&url=http://getsitecontrol.com`

Params:

`url`:page url
`eval`:bool if code needs to be evaluated on page. Requires full page load (will detect some exotic scenarios like cloudflare rocket loader)

Response

```json
{ "detected": true, "multipleDetected": false, "siteId": [34201] }
```

## PDF printing

Query

`POST  http://localhost:3000/pdf`

Params:

`content-type`: should ve set to `text/html`
`body`: html to print

Response

PDF file


## Screenshots

Query

`GET http://localhost:3000/screenshot?width=1200&height=1000&url=http://getsitecontrol.com`

Params:

`width`: viewprot width (defaults to 1200)
`height`: viewprot height (defaults to 1000)
`url`:page url

Response

JPEG file

## Helth check

Query

`GET http://localhost:3000/test?url=http://getsitecontrol.com`


Params:

`url`:page url (defaults to http://getsitecontrol.com)

Response

200 - page opened

500 - something failed
