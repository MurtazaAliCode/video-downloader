// @ts-ignore
import youtubedl, { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs/promises';
import https from 'https';
import http from 'http';
import { getCookieHeader } from './cookieHelper';

// =====================================================
// Binary setup for yt-dlp
// =====================================================
const binPath = path.resolve(process.cwd(), 'yt-dlp');
const cookiesPath = path.resolve(process.cwd(), 'cookies.txt');
const ytdlp = process.env.NODE_ENV === 'production' ? create(binPath) : youtubedl;

// =====================================================
// RapidAPI - SIRF YouTube + TikTok ke liye
// Facebook/Instagram ke liye NAHI use hoga ab
// =====================================================
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'social-download-all-in-one.p.rapidapi.com';
const RAPIDAPI_ENDPOINT = '/v1/social/autolink';

// =====================================================
// Platform Detection
// =====================================================
function getPlatformType(url: string): 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'other' {
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('tiktok.com')) return 'tiktok';
    if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
    if (u.includes('instagram.com')) return 'instagram';
    return 'other';
}

// =====================================================
// RapidAPI Helper Functions (SIRF YouTube + TikTok)
// =====================================================
async function fetchVideoInfoFromAPI(videoUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ url: videoUrl });

        const options = {
            method: 'POST',
            hostname: RAPIDAPI_HOST,
            path: RAPIDAPI_ENDPOINT,
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`RapidAPI Error ${res.statusCode}: ${data}`));
                    }
                } catch (e) {
                    reject(new Error(`RapidAPI JSON parse error: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(new Error(`RapidAPI request error: ${e.message}`)));
        req.write(postData);
        req.end();
    });
}

function selectBestDownloadUrl(
    apiResponse: any,
    downloadFormat: string,
    quality: string
): { url: string; ext: string } | null {
    const medias: any[] = apiResponse?.medias || [];
    if (!medias || medias.length === 0) return null;

    if (downloadFormat === 'mp3') {
        const audioMedia = medias.find((m: any) => m.extension === 'mp3' || m.audioAvailable === true);
        if (audioMedia) return { url: audioMedia.url, ext: 'mp3' };
        return { url: medias[0].url, ext: medias[0].extension || 'mp4' };
    }

    const qualityHeightMap: Record<string, number> = {
        'low': 360, 'medium': 480, 'high': 720, 'highest': 1080
    };
    const targetHeight = qualityHeightMap[quality] || 720;

    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'ts', 'flv'];
    const videoMedias = medias.filter((m: any) =>
        m.videoAvailable === true ||
        m.type === 'video' ||
        videoExtensions.includes((m.extension || '').toLowerCase())
    );

    if (videoMedias.length === 0) return null;

    const parseHeight = (input: any): number => {
        if (!input) return 0;
        const s = String(input).toLowerCase();
        if (s.includes('4k')) return 2160;
        if (s.includes('2k')) return 1440;
        if (s.includes('hd')) return 720;
        if (s.includes('sd')) return 480;
        const num = parseInt(s.replace(/[^\d]/g, ''), 10);
        return isNaN(num) ? 0 : num;
    };

    const sortedVideos = videoMedias.sort((a, b) => parseHeight(b.quality || b.height) - parseHeight(a.quality || a.height));

    const heightMedias = sortedVideos.filter((m: any) => {
        const h = parseHeight(m.quality || m.height);
        return h <= targetHeight && h > 0;
    });

    if (heightMedias.length > 0) {
        return { url: heightMedias[0].url, ext: heightMedias[0].extension || 'mp4' };
    }

    return { url: sortedVideos[0].url, ext: sortedVideos[0].extension || 'mp4' };
}

async function downloadFileFromUrl(
    fileUrl: string,
    savePath: string,
    onProgress?: (progress: number) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const makeRequest = (url: string, redirectCount = 0) => {
            if (redirectCount > 5) return reject(new Error('Too many redirects'));

            const parsedUrl = new URL(url);
            const lib: any = parsedUrl.protocol === 'https:' ? https : http;

            const reqOptions = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Encoding': 'identity'
                }
            };

            const req = lib.get(reqOptions, async (res: any) => {
                if ([301, 302, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error('Redirect with no location'));
                    res.resume();
                    return makeRequest(location, redirectCount + 1);
                }

                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP ${res.statusCode} while downloading file`));
                }

                const totalLength = parseInt(res.headers['content-length'] || '0', 10);
                let downloadedLength = 0;

                try {
                    const { createWriteStream } = await import('fs');
                    const fileStream = createWriteStream(savePath);

                    res.on('data', (chunk: Buffer) => {
                        downloadedLength += chunk.length;
                        if (totalLength > 0 && onProgress) {
                            onProgress(Math.floor((downloadedLength / totalLength) * 100));
                        }
                    });

                    res.pipe(fileStream);
                    fileStream.on('finish', () => { fileStream.close(); resolve(); });
                    fileStream.on('error', (err: Error) => reject(err));
                } catch (err) { reject(err); }
            });

            req.on('error', (e: Error) => reject(e));
        };

        makeRequest(fileUrl);
    });
}

// =====================================================
// RapidAPI Download - SIRF YouTube + TikTok
// =====================================================
async function downloadViaRapidAPI(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string,
    onProgress?: (progress: number) => void,
    quality: string = 'high'
): Promise<{ success: boolean; filePath?: string; directUrl?: string; ext?: string; title?: string; error?: string }> {
    if (!RAPIDAPI_KEY) {
        return { success: false, error: 'RAPIDAPI_KEY not configured' };
    }

    console.log(`🌐 RapidAPI: Fetching info for ${videoUrl}`);
    onProgress?.(20);

    const apiResponse = await fetchVideoInfoFromAPI(videoUrl);
    const title = apiResponse?.title || apiResponse?.author || 'Downloaded Video';
    console.log(`✅ RapidAPI: Got info. Title: ${title}`);
    onProgress?.(40);

    const selectedMedia = selectBestDownloadUrl(apiResponse, downloadFormat, quality);
    if (!selectedMedia) throw new Error('No downloadable media found in API response');

    const finalOutputPath = outputPath.replace(/\.[^.]+$/, `.${selectedMedia.ext}`);
    const cdnUrl = selectedMedia.url;

    const parsedVideoUrl = new URL(videoUrl);
    const isYoutube = parsedVideoUrl.hostname.includes('youtube') || parsedVideoUrl.hostname.includes('youtu.be');
    const referer = isYoutube ? 'https://www.youtube.com/' : 'https://www.tiktok.com/';

    console.log(`📥 RapidAPI: Attempting server-side download...`);

    try {
        await downloadFileFromUrlWithHeaders(cdnUrl, finalOutputPath, referer, (progress) => {
            onProgress?.(40 + Math.floor(progress * 0.55));
        });

        onProgress?.(100);
        console.log(`✅ RapidAPI: Server download success: ${finalOutputPath}`);
        return { success: true, filePath: finalOutputPath, title };

    } catch (downloadErr) {
        console.warn(`⚠️ Server download failed: ${downloadErr instanceof Error ? downloadErr.message : 'unknown'}. Returning directUrl for client.`);
        onProgress?.(100);
        return { success: true, directUrl: cdnUrl, ext: selectedMedia.ext, title };
    }
}

// Download with custom Referer header
async function downloadFileFromUrlWithHeaders(
    fileUrl: string,
    savePath: string,
    referer: string,
    onProgress?: (progress: number) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const makeRequest = (url: string, redirectCount = 0) => {
            if (redirectCount > 5) return reject(new Error('Too many redirects'));

            const parsedUrl = new URL(url);
            const lib: any = parsedUrl.protocol === 'https:' ? https : http;

            lib.get({
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Referer': referer,
                    'Cookie': getCookieHeader(fileUrl),
                    'Connection': 'keep-alive',
                    'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                }
            }, async (res: any) => {
                if ([301, 302, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error('Redirect with no location'));
                    res.resume();
                    return makeRequest(location, redirectCount + 1);
                }

                if (res.statusCode !== 200 && res.statusCode !== 206) {
                    res.resume();
                    return reject(new Error(`HTTP ${res.statusCode} while downloading`));
                }

                const totalLength = parseInt(res.headers['content-length'] || '0', 10);
                let downloadedLength = 0;

                try {
                    const { createWriteStream } = await import('fs');
                    const fileStream = createWriteStream(savePath);
                    res.on('data', (chunk: Buffer) => {
                        downloadedLength += chunk.length;
                        if (totalLength > 0 && onProgress) {
                            onProgress(Math.floor((downloadedLength / totalLength) * 100));
                        }
                    });
                    res.pipe(fileStream);
                    fileStream.on('finish', () => { fileStream.close(); resolve(); });
                    fileStream.on('error', (err: Error) => reject(err));
                } catch (err) { reject(err); }
            }).on('error', (e: Error) => reject(e));
        };
        makeRequest(fileUrl);
    });
}


// =====================================================
// DIRECT SCRAPER - Facebook/Instagram ke liye
// Bina kisi API ke, page se video URL extract karta hai
// =====================================================
async function fetchPageHtml(pageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const makeRequest = (url: string, redirectCount = 0) => {
            if (redirectCount > 5) return reject(new Error('Too many redirects'));

            const parsedUrl = new URL(url);
            const lib: any = parsedUrl.protocol === 'https:' ? https : http;

            lib.get({
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cookie': getCookieHeader(url),
                }
            }, (res: any) => {
                if ([301, 302, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error('Redirect with no location'));
                    res.resume();
                    const nextUrl = location.startsWith('http') ? location : new URL(location, url).toString();
                    return makeRequest(nextUrl, redirectCount + 1);
                }

                if (res.statusCode !== 200) {
                    res.resume();
                    return reject(new Error(`HTTP ${res.statusCode}`));
                }

                let body = '';
                res.on('data', (chunk: any) => { body += chunk; });
                res.on('end', () => resolve(body));
            }).on('error', (e: Error) => reject(e));
        };
        makeRequest(pageUrl);
    });
}

// Extract video URLs from Facebook page HTML
function extractFacebookVideoUrls(html: string): string[] {
    const urls: string[] = [];

    // Method 1: og:video meta tag
    const ogVideoMatch = html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/i) ||
                          html.match(/<meta\s+content="([^"]+)"\s+property="og:video"/i);
    if (ogVideoMatch && ogVideoMatch[1]) {
        const decoded = ogVideoMatch[1].replace(/&amp;/g, '&');
        urls.push(decoded);
    }

    // Method 2: og:video:url meta tag
    const ogVideoUrlMatch = html.match(/<meta\s+property="og:video:url"\s+content="([^"]+)"/i) ||
                             html.match(/<meta\s+content="([^"]+)"\s+property="og:video:url"/i);
    if (ogVideoUrlMatch && ogVideoUrlMatch[1]) {
        const decoded = ogVideoUrlMatch[1].replace(/&amp;/g, '&');
        urls.push(decoded);
    }

    // Method 3: HD video source from embedded JSON
    const hdMatches = html.match(/"hd_src"\s*:\s*"([^"]+)"/g) || [];
    for (const m of hdMatches) {
        const urlMatch = m.match(/"hd_src"\s*:\s*"([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
            urls.push(urlMatch[1].replace(/\\/g, ''));
        }
    }

    // Method 4: SD video source from embedded JSON
    const sdMatches = html.match(/"sd_src"\s*:\s*"([^"]+)"/g) || [];
    for (const m of sdMatches) {
        const urlMatch = m.match(/"sd_src"\s*:\s*"([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
            urls.push(urlMatch[1].replace(/\\/g, ''));
        }
    }

    // Method 5: playable_url from JSON data
    const playableMatches = html.match(/"playable_url(?:_quality_hd)?"\s*:\s*"([^"]+)"/g) || [];
    for (const m of playableMatches) {
        const urlMatch = m.match(/"playable_url(?:_quality_hd)?"\s*:\s*"([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
            const cleaned = urlMatch[1].replace(/\\/g, '');
            if (cleaned.startsWith('http')) {
                urls.push(cleaned);
            }
        }
    }

    // Method 6: browser_native_hd_url / browser_native_sd_url
    const nativeMatches = html.match(/"browser_native_(?:hd|sd)_url"\s*:\s*"([^"]+)"/g) || [];
    for (const m of nativeMatches) {
        const urlMatch = m.match(/"browser_native_(?:hd|sd)_url"\s*:\s*"([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
            const cleaned = urlMatch[1].replace(/\\/g, '');
            if (cleaned.startsWith('http')) {
                urls.push(cleaned);
            }
        }
    }

    // Deduplicate
    return Array.from(new Set(urls)).filter(u => u.startsWith('http'));
}

// Extract video URLs from Instagram page HTML
function extractInstagramVideoUrls(html: string): string[] {
    const urls: string[] = [];

    // Method 1: og:video meta tag
    const ogVideoMatch = html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/i) ||
                          html.match(/<meta\s+content="([^"]+)"\s+property="og:video"/i);
    if (ogVideoMatch && ogVideoMatch[1]) {
        urls.push(ogVideoMatch[1].replace(/&amp;/g, '&'));
    }

    // Method 2: og:video:url
    const ogVideoUrlMatch = html.match(/<meta\s+property="og:video:url"\s+content="([^"]+)"/i) ||
                             html.match(/<meta\s+content="([^"]+)"\s+property="og:video:url"/i);
    if (ogVideoUrlMatch && ogVideoUrlMatch[1]) {
        urls.push(ogVideoUrlMatch[1].replace(/&amp;/g, '&'));
    }

    // Method 3: video_url in embedded JSON
    const videoUrlMatches = html.match(/"video_url"\s*:\s*"([^"]+)"/g) || [];
    for (const m of videoUrlMatches) {
        const urlMatch = m.match(/"video_url"\s*:\s*"([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
            const cleaned = urlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
            if (cleaned.startsWith('http')) {
                urls.push(cleaned);
            }
        }
    }

    // Method 4: .mp4 URLs in JSON data
    const mp4Matches = html.match(/"(https?:[^"]*\.mp4[^"]*)"/g) || [];
    for (const m of mp4Matches) {
        const clean = m.replace(/"/g, '').replace(/\\u0026/g, '&').replace(/\\/g, '');
        if (clean.startsWith('http') && clean.includes('.mp4')) {
            urls.push(clean);
        }
    }

    // Method 5: video_versions from JSON
    const versionMatches = html.match(/"url"\s*:\s*"(https?:[^"]*scontent[^"]*)"/g) || [];
    for (const m of versionMatches) {
        const urlMatch = m.match(/"url"\s*:\s*"(https?:[^"]+)"/);
        if (urlMatch && urlMatch[1]) {
            const cleaned = urlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
            if (cleaned.includes('scontent') && (cleaned.includes('.mp4') || cleaned.includes('video'))) {
                urls.push(cleaned);
            }
        }
    }

    return Array.from(new Set(urls)).filter(u => u.startsWith('http'));
}

// Direct scraper download for Facebook/Instagram
async function downloadViaScraper(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string,
    onProgress?: (progress: number) => void,
    quality: string = 'high'
): Promise<{ success: boolean; filePath?: string; directUrl?: string; title?: string; error?: string }> {
    const platform = getPlatformType(videoUrl);
    console.log(`🔍 DirectScraper: Fetching page HTML for ${platform}: ${videoUrl}`);
    onProgress?.(10);

    try {
        const html = await fetchPageHtml(videoUrl);
        onProgress?.(30);

        // Extract title from page
        const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                           html.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : 'Downloaded Video';

        // Extract video URLs based on platform
        let videoUrls: string[] = [];
        if (platform === 'facebook') {
            videoUrls = extractFacebookVideoUrls(html);
        } else if (platform === 'instagram') {
            videoUrls = extractInstagramVideoUrls(html);
        }

        if (videoUrls.length === 0) {
            return { success: false, error: `DirectScraper: No video URLs found in ${platform} page` };
        }

        console.log(`✅ DirectScraper: Found ${videoUrls.length} video URL(s) for ${platform}`);
        onProgress?.(50);

        // Try downloading the first valid video URL
        for (const cdnUrl of videoUrls) {
            try {
                console.log(`📥 DirectScraper: Trying to download from: ${cdnUrl.substring(0, 80)}...`);

                const referer = platform === 'facebook'
                    ? 'https://www.facebook.com/'
                    : 'https://www.instagram.com/';

                await downloadFileFromUrlWithHeaders(cdnUrl, outputPath, referer, (progress) => {
                    onProgress?.(50 + Math.floor(progress * 0.45));
                });

                onProgress?.(100);
                console.log(`✅ DirectScraper: Download complete: ${outputPath}`);
                return { success: true, filePath: outputPath, title };

            } catch (dlErr) {
                console.warn(`⚠️ DirectScraper: Failed to download from URL, trying next...`);
                continue;
            }
        }

        // Server download failed, return directUrl for client-side redirect
        console.log(`⚠️ DirectScraper: Server downloads failed, returning direct URL for client`);
        return { success: true, directUrl: videoUrls[0], title };

    } catch (err) {
        return {
            success: false,
            error: `DirectScraper failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        };
    }
}


// =====================================================
// yt-dlp Download (Facebook/Instagram/Others - PRIMARY)
// =====================================================
function getFormatByQuality(quality: string, downloadFormat: string): string {
    if (downloadFormat === 'mp3') return 'bestaudio/best';

    switch (quality) {
        case 'low':
            return 'best[height<=360][vcodec!=none][acodec!=none]/best[height<=360][vcodec!=none]/best[vcodec!=none][acodec!=none]/best[vcodec!=none]/best';
        case 'medium':
            return 'best[height<=480][vcodec!=none][acodec!=none]/best[height<=480][vcodec!=none]/best[vcodec!=none][acodec!=none]/best[vcodec!=none]/best';
        case 'high':
        case 'highest':
        default:
            return 'best[height<=720][vcodec!=none][acodec!=none]/best[vcodec!=none][ext=mp4]/best[vcodec!=none]/best';
    }
}

async function downloadViaYtDlp(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string,
    onProgress?: (progress: number) => void,
    quality: string = 'high'
): Promise<{ success: boolean; filePath?: string; error?: string }> {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const formatString = getFormatByQuality(quality, downloadFormat);

    const options: any = {
        format: formatString,
        output: outputPath,
        quiet: true,
        'no-playlist': true,
        'no-mtime': true,
        'socket-timeout': 30,
        ignoreErrors: true,
        'no-check-certificates': true,
        'concurrent-fragments': 5,
        'buffer-size': '2M',
        'hls-prefer-native': true,
        'add-header': [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language: en-US,en;q=0.9',
            'Sec-Fetch-Mode: navigate',
            'Sec-Fetch-Site: cross-site',
            'Sec-Fetch-Dest: video'
        ],
        'ffmpeg-location': './ffmpeg',
        'geo-bypass': true,
        'force-ipv4': true,
        'impersonate': 'chrome'
    };

    // Use cookies if the file exists
    try {
        await fs.access(cookiesPath);
        options['cookies'] = cookiesPath;
    } catch { /* cookies.txt not found, skip */ }

    console.log(`🔧 yt-dlp: Starting download with impersonation for ${videoUrl}`);
    await ytdlp(videoUrl, options);
    await fs.access(outputPath);
    onProgress?.(100);
    console.log(`✅ yt-dlp: Download complete: ${outputPath}`);
    return { success: true, filePath: outputPath };
}

// =====================================================
// MAIN EXPORT: Smart Download Logic
// YouTube/TikTok → RapidAPI primary, yt-dlp fallback
// Facebook/Instagram → yt-dlp primary, DirectScraper fallback (NO RAPIDAPI!)
// Others → yt-dlp only
// =====================================================
export async function downloadVideoWithYtDlp(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string = 'mp4',
    onProgress?: (progress: number) => void,
    quality: string = 'high'
): Promise<{ success: boolean; filePath?: string; directUrl?: string; ext?: string; title?: string; error?: string }> {
    try {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        const platform = getPlatformType(videoUrl);
        console.log(`🎯 Platform detected: ${platform}`);

        // ============================================
        // YOUTUBE / TIKTOK → RapidAPI primary, yt-dlp fallback
        // ============================================
        if (platform === 'youtube' || platform === 'tiktok') {
            console.log(`🚀 ${platform}: Trying RapidAPI first...`);
            try {
                onProgress?.(5);
                const rapidResult = await downloadViaRapidAPI(videoUrl, outputPath, downloadFormat, onProgress, quality);
                if (rapidResult.success) {
                    console.log(`✅ ${platform}: RapidAPI worked!`);
                    return rapidResult;
                }
            } catch (rapidErr) {
                console.warn(`⚠️ ${platform}: RapidAPI failed: ${rapidErr instanceof Error ? rapidErr.message : 'unknown'}`);
            }

            // Fallback to yt-dlp
            console.log(`🔄 ${platform}: Falling back to yt-dlp...`);
            try {
                onProgress?.(5);
                const ytResult = await downloadViaYtDlp(videoUrl, outputPath, downloadFormat, onProgress, quality);
                if (ytResult.success) {
                    console.log(`✅ ${platform}: yt-dlp fallback worked!`);
                    return ytResult;
                }
            } catch (ytErr) {
                console.error(`❌ ${platform}: yt-dlp also failed: ${ytErr instanceof Error ? ytErr.message : 'unknown'}`);
            }

            throw new Error(`Both RapidAPI and yt-dlp failed for ${platform}`);
        }

        // ============================================
        // FACEBOOK / INSTAGRAM → yt-dlp primary, DirectScraper fallback
        // ❌ NO RAPIDAPI - saves cost!
        // ============================================
        if (platform === 'facebook' || platform === 'instagram') {
            console.log(`🔧 ${platform}: Using yt-dlp (NO RapidAPI - cost saving mode)`);

            // Try 1: yt-dlp
            try {
                onProgress?.(5);
                const ytResult = await downloadViaYtDlp(videoUrl, outputPath, downloadFormat, onProgress, quality);
                if (ytResult.success) {
                    console.log(`✅ ${platform}: yt-dlp worked!`);
                    return ytResult;
                }
            } catch (ytErr) {
                console.warn(`⚠️ ${platform}: yt-dlp failed: ${ytErr instanceof Error ? ytErr.message : 'unknown'}`);
            }

            // Try 2: Direct page scraper (extract video URLs from page HTML)
            console.log(`🔄 ${platform}: Falling back to DirectScraper...`);
            try {
                onProgress?.(5);
                const scraperResult = await downloadViaScraper(videoUrl, outputPath, downloadFormat, onProgress, quality);
                if (scraperResult.success) {
                    console.log(`✅ ${platform}: DirectScraper worked!`);
                    return scraperResult;
                }
            } catch (scraperErr) {
                console.error(`❌ ${platform}: DirectScraper also failed: ${scraperErr instanceof Error ? scraperErr.message : 'unknown'}`);
            }

            throw new Error(`All methods failed for ${platform} (yt-dlp + DirectScraper). No RapidAPI used.`);
        }

        // ============================================
        // OTHERS → yt-dlp only
        // ============================================
        console.log(`🔧 ${platform}: Using yt-dlp only`);
        onProgress?.(5);
        return await downloadViaYtDlp(videoUrl, outputPath, downloadFormat, onProgress, quality);

    } catch (error) {
        console.error('💥 Download failed:', error);

        // Last resort: check if file exists despite error
        try {
            await fs.access(outputPath);
            console.log('File detected despite error. Marking as success.');
            onProgress?.(100);
            return { success: true, filePath: outputPath };
        } catch { }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// =====================================================
// MAIN EXPORT: Smart Title Fetch
// =====================================================
export async function getTitleFromYtDlp(videoUrl: string): Promise<string | null> {
    const platform = getPlatformType(videoUrl);

    // YouTube & TikTok → RapidAPI se title lo
    if (platform === 'youtube' || platform === 'tiktok') {
        try {
            if (!RAPIDAPI_KEY) return null;
            const apiResponse = await fetchVideoInfoFromAPI(videoUrl);
            return apiResponse?.title || apiResponse?.author || 'Downloaded Video';
        } catch (error) {
            console.error('RapidAPI title fetch error:', error);
            return 'Downloaded Video';
        }
    }

    // Facebook/Instagram/Others → yt-dlp se title lo (NO RapidAPI!)
    try {
        const options: any = {
            dumpSingleJson: true,
            quiet: true,
            'no-check-certificates': true,
            'no-playlist': true,
            'socket-timeout': 10,
            'add-header': [
                'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            ],
            'geo-bypass': true,
            'force-ipv4': true
        };

        try {
            await fs.access(cookiesPath);
            options['cookies'] = cookiesPath;
        } catch { }

        const rawOutput = await ytdlp(videoUrl, options);
        const jsonOutput = typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput;
        return jsonOutput.title || 'Unknown Title';
    } catch (error) {
        console.error('yt-dlp title fetch error:', error);

        // Fallback: try getting title from page HTML (for FB/IG)
        if (platform === 'facebook' || platform === 'instagram') {
            try {
                const html = await fetchPageHtml(videoUrl);
                const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                                   html.match(/<title>([^<]+)<\/title>/i);
                if (titleMatch) {
                    return titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
                }
            } catch { }
        }

        return 'Downloaded Video';
    }
}