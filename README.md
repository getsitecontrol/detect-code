Widget script detection

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Query

`https://detect-code-gsc.herokuapp.com/?eval=true&url=http://getsitecontrol.com`

Params:

`eval`:bool if code needs to be evaluated on page. Requires full page load (will detect some exotic scenarios like cloudflare rocket loader)

```sh
curl https://detect-code-gsc.herokuapp.com/?url=http://getsitecontrol.com
```

Response

```json
{ "detected": true, "multipleDetected": false, "siteId": [34201] }
```
