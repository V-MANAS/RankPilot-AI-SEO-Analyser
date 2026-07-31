import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

let bb;
try {
  if (process.env.BROWSERBASE_API_KEY) {
    bb = new Browserbase({
      apiKey: process.env.BROWSERBASE_API_KEY,
    });
  }
} catch (e) {
  console.log("[SCRAPER] Browserbase SDK init skipped");
}

export async function scrapeUrl(url) {
    let browser;
    let page;
    let startTime = Date.now();
    let response;

    // 1. Attempt Browserbase cloud session
    if (bb && process.env.BROWSERBASE_PROJECT_ID) {
        try {
            const session = await bb.sessions.create({
                projectId: process.env.BROWSERBASE_PROJECT_ID,
                browserSettings: {
                    blockAds: true,
                },
            });
            browser = await chromium.connectOverCDP(session.connectUrl);
            const defaultContext = browser.contexts()[0];
            page = defaultContext.pages()[0];
        } catch (bbErr) {
            console.warn("[SCRAPER] Browserbase unavailable/limit reached. Falling back to local scraper:", bbErr.message);
        }
    }

    // 2. Fallback to local chromium if Browserbase failed or is unconfigured
    if (!browser) {
        try {
            browser = await chromium.launch({ headless: true });
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RankPilot/1.0'
            });
            page = await context.newPage();
        } catch (launchErr) {
            console.error("[SCRAPER] Local Chromium launch failed:", launchErr.message);
            // Fallback 3: HTTP Fetch parser fallback for static SEO extraction
            return await scrapeUrlFetchFallback(url);
        }
    }

    try {
        page.setDefaultNavigationTimeout(30000);
        startTime = Date.now();
        try {
            response = await page.goto(url, { waitUntil: "domcontentloaded" });
        } catch (navError) {
            await browser.close().catch(() => {});
            return { success: false, error: `Navigation failed: ${navError.message}` };
        }

        const loadTime = Date.now() - startTime;
        await page.waitForTimeout(1500);

        // Extract all SEO relevant data from the page
        const scrappedData = await page.evaluate(() => {
            const getMeta = (name) => {
                const el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="twitter:${name}"]`);
                return el ? el.getAttribute("content") || '' : '';
            };
            const title = document.title || '';
            const description = getMeta("description");
            const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
            const robots = getMeta("robots");
            const ogTitle = getMeta("og:title");
            const ogDescription = getMeta("og:description");
            const ogImage = getMeta("og:image");
            const twitterCard = getMeta("twitter:card");
            const viewport = getMeta("viewport");
            const charsetMeta = document.querySelector('meta[charset]');
            const charset = charsetMeta ? charsetMeta.getAttribute("charset") || '' : '';

            const h1Elements = document.querySelectorAll("h1");
            const h1Texts = Array.from(h1Elements).map(el => el.textContent.trim() || "");
            const headings = {
                h1: document.querySelectorAll("h1").length,
                h2: document.querySelectorAll("h2").length,
                h3: document.querySelectorAll("h3").length,
                h4: document.querySelectorAll("h4").length,
                h5: document.querySelectorAll("h5").length,
                h6: document.querySelectorAll("h6").length,
            };

            const allLinks = Array.from(document.querySelectorAll("a"));
            const currentHost = window.location.hostname;
            let internalLinks = 0;
            let externalLinks = 0;
            allLinks.forEach(link => {
                try {
                    const href = link.href;
                    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
                    const linkUrl = new URL(href);
                    if (linkUrl.hostname === currentHost) internalLinks++;
                    else externalLinks++;
                } catch (err) {}
            });

            const allImages = Array.from(document.querySelectorAll("img"));
            const missingAlt = allImages.filter(img => !img.hasAttribute("alt") || img.getAttribute("alt").trim() === "").length;
            const bodyText = document.body?.innerText || '';
            const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length;
            const pageSize = document.documentElement.outerHTML.length;

            return {
                metaData: { title, description, canonical, robots, ogTitle, ogDescription, ogImage, twitterCard, viewport, charset },
                headings: { ...headings, h1Texts },
                links: { internal: internalLinks, external: externalLinks, total: allLinks.length },
                images: { total: allImages.length, missingAlt, withAlt: allImages.length - missingAlt },
                wordCount,
                pageSize,
                bodyText: bodyText.substring(0, 5000),
            };
        });

        const statusCode = response?.status() || 200;
        await page.close().catch(() => {});
        await browser.close().catch(() => {});

        return { success: true, data: { ...scrappedData, loadTime, statusCode } };

    } catch (err) {
        console.error("[SCRAPER] Playwright session failed:", err.message);
        if (browser) {
            await browser.close().catch(() => {});
        }
        // Fallback to fetch scraper if browser script throws
        return await scrapeUrlFetchFallback(url);
    }
}

// Lightweight HTTP Fetch Fallback when Playwright environment is unavailable
async function scrapeUrlFetchFallback(url) {
    try {
        const startTime = Date.now();
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RankPilot/1.0'
            }
        });
        const html = await res.text();
        const loadTime = Date.now() - startTime;

        const getMatch = (regex) => {
            const m = html.match(regex);
            return m ? m[1].trim() : '';
        };

        const title = getMatch(/<title[^>]*>([^<]*)<\/title>/i);
        const description = getMatch(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || getMatch(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
        const canonical = getMatch(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
        const robots = getMatch(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
        const ogTitle = getMatch(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
        const ogDescription = getMatch(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
        const ogImage = getMatch(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
        const viewport = getMatch(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);

        const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
        const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
        const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || [];

        const cleanTags = (str) => str.replace(/<[^>]*>/g, '').trim();
        const h1Texts = h1Matches.map(cleanTags);

        const imgMatches = html.match(/<img[^>]*>/gi) || [];
        const missingAlt = imgMatches.filter(img => !/alt=["'][^"']+["']/i.test(img)).length;

        const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["']/gi) || [];
        let internal = 0;
        let external = 0;
        const hostname = new URL(url).hostname;
        linkMatches.forEach(linkStr => {
            const m = linkStr.match(/href=["']([^"']*)["']/i);
            if (m && m[1]) {
                if (m[1].includes(hostname) || m[1].startsWith('/')) internal++;
                else if (m[1].startsWith('http')) external++;
            }
        });

        const bodyText = cleanTags(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ''));
        const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;

        return {
            success: true,
            data: {
                metaData: { title, description, canonical, robots, ogTitle, ogDescription, ogImage, twitterCard: '', viewport, charset: 'UTF-8' },
                headings: { h1: h1Matches.length, h2: h2Matches.length, h3: h3Matches.length, h4: 0, h5: 0, h6: 0, h1Texts },
                links: { internal, external, total: linkMatches.length },
                images: { total: imgMatches.length, missingAlt, withAlt: imgMatches.length - missingAlt },
                wordCount,
                pageSize: html.length,
                bodyText: bodyText.substring(0, 5000),
                loadTime,
                statusCode: res.status
            }
        };
    } catch (fetchErr) {
        console.error("[SCRAPER] Fetch fallback failed:", fetchErr.message);
        return { success: false, error: fetchErr.message };
    }
}