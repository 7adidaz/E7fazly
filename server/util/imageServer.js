import puppeteer from 'puppeteer';
import sharp from 'sharp';
import fs from 'fs';
import Joi from 'joi';
import { objectValidator } from '../validators/basic_validators.js';


export async function imageServer(req, res, next) {
    try {
        const link = req.params[0];

        // check if image exists
        const files = fs.readdirSync('./images');
        let fileName = generateFileName(link);

        // strip the timestamp from the file name to check if the file exists
        const fileNameStripped = fileName.substring(0, fileName.lastIndexOf('***'));
        const fileNames = files.find(file => file.includes(fileNameStripped));

        if (!fileNames) await takeScreenshot(link, fileName);
        else fileName = fileNames;

        let s = fs.createReadStream(`./images/${fileName}`);
        s.on('open', function () {
            res.set('Content-Type', 'image/webp');
            s.pipe(res);
        });
        s.on('error', function () {
            res.set('Content-Type', 'application/json');
            res.status(404).send({
                message: "FAILED",
                error: "Image not found"
            })
        });
    } catch (err) {
        return next(err);
    }
}

async function takeScreenshot(link, fileName) {
    try {
        //TODO: make the browser initalized when the server starts
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(link);

        const screenshotBuffer = await page.screenshot();
        await sharp(screenshotBuffer)
            .resize({
                fit: sharp.fit.inside,
                width: 492,
                height: 346,
            })
            .webp()
            .toFile(`./images/${fileName}`);

    } catch (err) {
        throw err;
    }
}

function generateFileName(link) {
    /**
     * input: https://www.google.com/search?a1=somevalue * 
     * output: www.google.com_search***1699991628746.webp
     */
    try {
        //TODO: fix the regex.
        const urlValidator =  Joi.string().required().uri();
        const value = objectValidator(urlValidator, link);

        const url = new URL(value);
        link = url.hostname + url.pathname;
        link = link.replace(/\//g, '_');

        const fileName = `${link}***${Date.now()}.webp`;
        return fileName;
    } catch (err) {
        throw err;
    }
}
