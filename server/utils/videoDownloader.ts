// @ts-ignore
import youtubedl, { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs/promises';

// Production mein hum ./yt-dl-p manual binary use karenge (Render rate limit bypass karne ke liye)
const binPath = path.resolve(process.cwd(), 'yt-dlp');
const cookiesPath = path.resolve(process.cwd(), 'cookies.txt');
const ytdlp = process.env.NODE_ENV === 'production' ? create(binPath) : youtubedl;

/**
 * Video download using youtube-dl-exec (wrapper for yt-dlp, auto-binary)
 * @param videoUrl - Video URL
 * @param outputPath - Save path
 * @param downloadFormat - 'mp4' or 'mp3'
 * @param onProgress - Progress callback (simulated, real via logs)
 * @returns Promise with result
 */
/**
 * Helper to check if the platform always requires a proxy (e.g. YouTube/TikTok)
 */
function shouldAlwaysUseProxy(url: string): boolean {
    const alwaysProxyHosts = ['youtube.com', 'youtu.be', 'tiktok.com'];
    return alwaysProxyHosts.some(host => url.toLowerCase().includes(host));
}

/**
 * Map UI quality selection to yt-dlp format strings
 */
function getFormatByQuality(quality: string, downloadFormat: string): string {
    if (downloadFormat === 'mp3') {
        return 'bestaudio/best';
    }

    // Mapping logic to save proxy data
    switch (quality) {
        case 'low': // 360p
            return 'best[height<=360][ext=mp4]/best[height<=360]/best';
        case 'medium': // 480p
            return 'best[height<=480][ext=mp4]/best[height<=480]/best';
        case 'high': // 720p
        case 'highest': // User requested 720p for Ultra High too
            return 'best[height<=720][ext=mp4]/best[height<=720]/best';
        default:
            return 'best[height<=720][ext=mp4]/best[height<=720]/best';
    }
}

/**
 * Video download using youtube-dl-exec (wrapper for yt-dlp, auto-binary)
 */
export async function downloadVideoWithYtDlp(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string = 'mp4',
    onProgress?: (progress: number) => void,
    quality: string = 'high'
): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        const formatString = getFormatByQuality(quality, downloadFormat);
        const alwaysProxy = shouldAlwaysUseProxy(videoUrl);
        const proxy = process.env.YOUTUBE_PROXY;

        console.log(`🎬 Target: ${videoUrl} | Always Proxy: ${alwaysProxy} | Format: ${formatString}`);

        // Command options template
        const baseOptions = {
            format: formatString,
            output: outputPath,
            verbose: false, // Production mein false rakhein
            quiet: true, // Output kam karein speed badhane ke liye
            'no-playlist': true,
            'no-mtime': true, // File modification time check na karein
            'socket-timeout': 10, // 10s mein block detect karein
            ignoreErrors: false,
            'no-check-certificates': true,
            'concurrent-fragments': 3, // Resources kam use karein
            'buffer-size': '1024K',
            'hls-prefer-native': true,
            'add-header': [
                'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.9',
                'Sec-Fetch-Mode: navigate'
            ],
            'ffmpeg-location': './ffmpeg',
            'cookies': cookiesPath,
            'extractor-args': 'youtube:player_client=ios,web_embedded',
            'geo-bypass': true,
            'force-ipv4': true
        };

        // Decision Logic: Proxy or no Proxy?
        let currentOptions: any = { ...baseOptions };
        
        if (alwaysProxy && proxy) {
            console.log(`🚀 Using proxy for YouTube/TikTok...`);
            currentOptions.proxy = proxy;
            delete currentOptions['socket-timeout']; // Proxy ke saath timeout nahi
        }

        try {
            // First Attempt
            await ytdlp(videoUrl, currentOptions);
            console.log(`✅ Download finished successfully.`);
        } catch (downloadError) {
            // Fallback: If not alwaysProxy and first attempt failed, try WITH proxy
            if (!alwaysProxy && proxy && !currentOptions.proxy) {
                console.warn(`⚠️ Download failed without proxy. Retrying with proxy for FB/IG/etc...`);
                currentOptions.proxy = proxy;
                delete currentOptions['socket-timeout']; // Retry mein zyada waqt dein
                await ytdlp(videoUrl, currentOptions);
                console.log(`✅ Download successful after proxy fallback.`);
            } else {
                throw downloadError;
            }
        }

        // Final File check
        await fs.access(outputPath);
        onProgress?.(100);
        return { success: true, filePath: outputPath };

    } catch (error) {
        console.error('💥 youtube-dl-exec download failed:', error);

        // Final check: sometimes yt-dlp returns an error code but the file is fully downloaded
        try {
            await fs.access(outputPath);
            console.log('File detected despite error code. Marking as success.');
            onProgress?.(100);
            return { success: true, filePath: outputPath };
        } catch (e) { }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Fetch video title using youtube-dl-exec (wrapper for yt-dlp)
 */
export async function getTitleFromYtDlp(videoUrl: string): Promise<string | null> {
    const alwaysProxy = shouldAlwaysUseProxy(videoUrl);
    const proxy = process.env.YOUTUBE_PROXY;

    async function fetchTitle(useProxy: boolean) {
        const options: any = {
            dumpSingleJson: true,
            verbose: false,
            quiet: true,
            'no-check-certificates': true,
            'no-playlist': true,
            'add-header': [
                'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            ],
            'cookies': cookiesPath,
            'extractor-args': 'youtube:player_client=ios,web_embedded',
            'geo-bypass': true,
            'force-ipv4': true,
            ...(useProxy && proxy ? { proxy } : { 'socket-timeout': 10 })
        };

        const rawOutput = await ytdlp(videoUrl, options);
        const jsonOutput = typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput;
        return jsonOutput.title || 'Unknown Title';
    }

    try {
        console.log(`🔍 Fetching title (Always Proxy: ${alwaysProxy})...`);
        
        // If YouTube/TikTok, use proxy immediately
        if (alwaysProxy && proxy) {
            return await fetchTitle(true);
        }

        // Try without proxy first
        try {
            return await fetchTitle(false);
        } catch (error) {
            if (proxy) {
                console.warn(`⚠️ Title fetch failed. Retrying with proxy...`);
                return await fetchTitle(true);
            }
            throw error;
        }
    } catch (error) {
        console.error('Title fetch error:', error);
        return null;
    }
}