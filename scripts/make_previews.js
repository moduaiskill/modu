/*
 * 결과물 미리보기 이미지 생성기.
 *
 * examples/ 의 샘플을 실제 비율 그대로 캡처해 assets/previews/ 에 WebP로 저장합니다.
 * 샘플 파일을 고치면 다시 돌려서 이미지를 갱신합니다.
 *
 *   1) npm i puppeteer            (저장소에 포함하지 않는 개발용 의존성)
 *   2) python -m http.server 8765 (저장소 루트에서)
 *   3) node scripts/make_previews.js
 *   4) python scripts/optimize_previews.py
 *
 * 1)~3) 은 PNG를 tmp-previews/ 에 만들고, 4) 가 크기를 줄여 WebP로 바꿉니다.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const BASE = "http://localhost:8765/examples/";
const OUT = path.join(__dirname, "..", "tmp-previews");
const url = (name) => BASE + encodeURIComponent(name);

/* 인쇄·조작용 떠 있는 막대는 결과물이 아니므로 치웁니다. */
const CHROME = ".toolbar, .pdfbar, #hint, #progress";
const strip = () =>
  document.querySelectorAll(".toolbar, .pdfbar, #hint, #progress").forEach((el) => el.remove());

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function capturePages(browser, file, prefix, indexes, scale) {
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: scale });
  await page.goto(url(file), { waitUntil: "networkidle2" });
  await page.evaluate(strip);
  await wait(1200);
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll(".sheet > .cover, .sheet > .toc, .sheet > section, .page")].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
    }),
  );
  for (const [order, i] of indexes.entries()) {
    const b = boxes[i];
    await page.screenshot({
      path: path.join(OUT, `${prefix}-${order + 1}.png`),
      clip: { x: b.x, y: b.y, width: b.w, height: Math.min(b.h, 1123) },
      captureBeyondViewport: true,
    });
  }
  await page.close();
  return indexes.length;
}

async function captureSlides(browser, file, prefix, indexes, scale) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: scale });
  await page.goto(url(file), { waitUntil: "networkidle2" });
  await wait(2500);
  let current = 0;
  for (const [order, i] of indexes.entries()) {
    while (current < i) {
      await page.keyboard.press("ArrowRight");
      current += 1;
      await wait(450);
    }
    await wait(700);
    await page.evaluate(strip);
    const stage = await page.$("#stage");
    await stage.screenshot({ path: path.join(OUT, `${prefix}-${order + 1}.png`) });
  }
  await page.close();
  return indexes.length;
}

async function captureCards(browser, file, prefix, indexes, scale) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1176, height: 1446, deviceScaleFactor: scale });
  await page.goto(url(file), { waitUntil: "networkidle2" });
  /* 카드뉴스는 화면에서 42%로 줄여 보여 줍니다. export 클래스가 원래 크기를 되돌립니다. */
  await page.evaluate(() => document.body.classList.add("export"));
  await page.evaluate(strip);
  await wait(1000);
  const cards = await page.$$("section.card");
  for (const [order, i] of indexes.entries()) {
    await cards[i].screenshot({ path: path.join(OUT, `${prefix}-${order + 1}.png`) });
  }
  await page.close();
  return indexes.length;
}

async function captureScreens(browser, file, prefix, offsets, scale) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: scale });
  await page.goto(url(file), { waitUntil: "networkidle2" });
  await page.evaluate(strip);
  await wait(1800);
  for (const [order, y] of offsets.entries()) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await wait(700);
    await page.screenshot({ path: path.join(OUT, `${prefix}-${order + 1}.png`) });
  }
  await page.close();
  return offsets.length;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ headless: "new" });
  const jobs = [
    ["proposal", () => capturePages(browser, "01_제안서_샘플.html", "proposal", [0, 1, 2], 1.6)],
    ["presentation", () => captureSlides(browser, "02_발표자료_샘플.html", "presentation", [0, 4, 6, 12], 0.85)],
    ["script", () => capturePages(browser, "03_발표대본_샘플.html", "script", [0, 1, 2], 1.6)],
    ["dashboard", () => captureScreens(browser, "04_사업탐색대시보드_샘플.html", "dashboard", [0, 1900], 1.1)],
    ["cardnews", () => captureCards(browser, "05_카드뉴스_샘플.html", "cardnews", [0, 2, 4, 7], 1.45)],
  ];
  for (const [name, run] of jobs) {
    const count = await run();
    console.log(name.padEnd(14), count + "장");
  }
  await browser.close();
  console.log("PNG 저장 위치:", OUT);
})();
