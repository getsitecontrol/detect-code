"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executablePath = process.env['CHROME_PATH'];
exports.TIMEOUT = parseInt(process.env.TIMEOUT || '20000');
exports.VIEWPORT = { width: 1200, height: 1000, deviceScaleFactor: 1 };
