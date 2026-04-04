// @ts-ignore
import youtubedl, { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs/promises';
import https from 'https';

// =====================================================
// Binary setup for yt-dlp (Facebook/Instagram etc.)
// =====================================================
const binPath = path.resolve(process.cwd(), 'yt-dlp');
const cookiesPath = path.resolve(process.cwd(), 'cookies.txt');
const ytdlp = process.env.NODE_ENV === 'production' ? create(binPath) : youtubedl;

// =====================================================
// RapidAPI - Social Download All In One
// YouTube + TikTok ke liye (primary)
// Facebook + Instagram ke liye (fallback when yt-dlp fails)
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
// RapidAPI Helper Functions
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

    const videoMedias = medias.filter((m: any) => m.extension === 'mp4' || m.videoAvailable !== false);
    if (videoMedias.length === 0) return { url: medias[0].url, ext: medias[0].extension || 'mp4' };

    const heightMedias = videoMedias.filter((m: any) => {
        const h = parseInt(m.quality || m.height || '0', 10);
        return h <= targetHeight && h > 0;
    });

    if (heightMedias.length > 0) {
        heightMedias.sort((a: any, b: any) => {
            const ah = parseInt(a.quality || a.height || '0', 10);
            const bh = parseInt(b.quality || b.height || '0', 10);
            return bh - ah;
        });
        return { url: heightMedias[0].url, ext: heightMedias[0].extension || 'mp4' };
    }

    return { url: videoMedias[0].url, ext: videoMedias[0].extension || 'mp4' };
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
            const lib = parsedUrl.protocol === 'https:' ? https : require('http');

            const reqOptions = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
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
// RapidAPI Download (YouTube/TikTok always, FB/IG fallback)
// =====================================================
async function downloadViaRapidAPI(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string,
    onProgress?: (progress: number) => void,
    quality: string = 'high'
): Promise<{ success: boolean; filePath?: string; error?: string }> {
    if (!RAPIDAPI_KEY) {
        return { success: false, error: 'RAPIDAPI_KEY not configured' };
    }

    console.log(`🌐 RapidAPI: Fetching info for ${videoUrl}`);
    onProgress?.(15);

    const apiResponse = await fetchVideoInfoFromAPI(videoUrl);
    console.log(`✅ RapidAPI: Got info. Title: ${apiResponse.title}`);
    onProgress?.(35);

    const selectedMedia = selectBestDownloadUrl(apiResponse, downloadFormat, quality);
    if (!selectedMedia) throw new Error('No downloadable media found in API response');

    console.log(`📥 RapidAPI: Downloading (${selectedMedia.ext})...`);
    const finalOutputPath = outputPath.replace(/\.[^.]+$/, `.${selectedMedia.ext}`);

    await downloadFileFromUrl(selectedMedia.url, finalOutputPath, (progress) => {
        onProgress?.(35 + Math.floor(progress * 0.6));
    });

    onProgress?.(100);
    console.log(`✅ RapidAPI: Download complete: ${finalOutputPath}`);
    return { success: true, filePath: finalOutputPath };
}

// =====================================================
// yt-dlp Download (Facebook/Instagram/Others)
// =====================================================
function getFormatByQuality(quality: string, downloadFormat: string): string {
    if (downloadFormat === 'mp3') return 'bestaudio/best';
    switch (quality) {
        case 'low': return 'best[height<=360][ext=mp4]/best[height<=360]/best';
        case 'medium': return 'best[height<=480][ext=mp4]/best[height<=480]/best';
        case 'high':
        case 'highest':
        default: return 'best[height<=720][ext=mp4]/best[height<=720]/best';
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
        'socket-timeout': 15,
        ignoreErrors: false,
        'no-check-certificates': true,
        'concurrent-fragments': 3,
        'buffer-size': '1024K',
        'hls-prefer-native': true,
        'add-header': [
            'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        ],
        'ffmpeg-location': './ffmpeg',
        'geo-bypass': true,
        'force-ipv4': true
    };

    // Cookies sirf agar file exist kare
    try {
        await fs.access(cookiesPath);
        options['cookies'] = cookiesPath;
    } catch { /* cookies.txt nahi hai, skip */ }

    console.log(`🔧 yt-dlp: Downloading ${videoUrl}`);
    await ytdlp(videoUrl, options);
    await fs.access(outputPath);
    onProgress?.(100);
    console.log(`✅ yt-dlp: Download complete: ${outputPath}`);
    return { success: true, filePath: outputPath };
}

// =====================================================
// MAIN EXPORT: Smart Download Logic
// YouTube/TikTok → RapidAPI only
// Facebook/Instagram → yt-dlp first, RapidAPI fallback
// Others → yt-dlp only
// =====================================================
export async function downloadVideoWithYtDlp(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string = 'mp4',
    onProgress?: (progress: number) => void,
    quality: string = 'high'
): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        const platform = getPlatformType(videoUrl);
        console.log(`🎯 Platform detected: ${platform}`);

        // YouTube & TikTok → Always RapidAPI
        if (platform === 'youtube' || platform === 'tiktok') {
            console.log(`🚀 ${platform}: Using RapidAPI (primary)`);
            return await downloadViaRapidAPI(videoUrl, outputPath, downloadFormat, onProgress, quality);
        }

        // Facebook & Instagram → Try yt-dlp first, fallback to RapidAPI
        if (platform === 'facebook' || platform === 'instagram') {
            console.log(`🔄 ${platform}: Trying yt-dlp first...`);
            try {
                onProgress?.(5);
                const result = await downloadViaYtDlp(videoUrl, outputPath, downloadFormat, onProgress, quality);
                if (result.success) {
                    console.log(`✅ ${platform}: yt-dlp worked without RapidAPI!`);
                    return result;
                }
            } catch (ytdlpErr) {
                console.warn(`⚠️ ${platform}: yt-dlp failed (${ytdlpErr instanceof Error ? ytdlpErr.message : 'unknown'}). Falling back to RapidAPI...`);
                return await downloadViaRapidAPI(videoUrl, outputPath, downloadFormat, onProgress, quality);
            }
        }

        // Other platforms (Twitter, Vimeo, etc.) → yt-dlp only
        console.log(`🔧 ${platform}: Using yt-dlp`);
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

    // Facebook/Instagram/Others → yt-dlp se title lo
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
        return 'Downloaded Video';
    }
}