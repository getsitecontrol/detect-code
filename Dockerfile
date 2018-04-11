
FROM node:8-slim

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove \
    && rm -rf /src/*.deb

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
RUN wget -O /usr/local/bin/dumb-init  https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 &&\
	chmod +x /usr/local/bin/dumb-init

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROME_PATH google-chrome-unstable

COPY package.json /app/
COPY package-lock.json /app/

WORKDIR /app
ARG CACHEBUST=1
RUN npm install --production
ENV PORT=3000
ENV TIMEOUT=30000
EXPOSE $PORT
COPY ./lib /app/lib
RUN dpkg -s google-chrome-unstable | grep Version

HEALTHCHECK --interval=30s --timeout=20s --start-period=2s --retries=2\
	CMD  curl -fs -o/dev/null http://localhost:3000/test?url=http://example.com || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm","start"]
