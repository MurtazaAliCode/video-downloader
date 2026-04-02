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
 * @param videoUrl - Video URL
 * @param outputPath - Save path
 * @param downloadFormat - 'mp4' or 'mp3'
 * @param onProgress - Progress callback (simulated, real via logs)
 * @param quality - UI quality choice ('low', 'medium', 'high', 'highest')
 * @returns Promise with result
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
        console.log(`Starting ${downloadFormat} download (${quality} -> ${formatString}) with youtube-dl-exec: ${videoUrl}`);

        // Command options with Professional Proxy & iOS Bypass Strategy
        const options = {
            format: formatString,
            output: outputPath,
            verbose: true,
            ignoreErrors: false,
            'no-check-certificates': true,
            'concurrent-fragments': 5, 
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
            'proxy': process.env.YOUTUBE_PROXY, // Proxy URL (Render dashboard mein add karein)
            'geo-bypass': true,
            'force-ipv4': true
        };

        // Run download
        await ytdlp(videoUrl, options);

        // Final File check
        await fs.access(outputPath);
        console.log(`Download successful: ${outputPath}`);
        onProgress?.(100);

        return { success: true, filePath: outputPath };

    } catch (error) {
        console.error('youtube-dl-exec download failed:', error);

        // Final check: sometimes yt-dlp returns an error code but the file is fully downloaded
        try {
            await fs.access(outputPath);
            console.log('File detected despite error code. Marking as success.');
            onProgress?.(100);
            return { success: true, filePath: outputPath };
        } catch (e) {
            // File truly not found
        }

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
    try {
        console.log(`🔍 Fetching title for: ${videoUrl}`);

        // JSON dump with Proxy & iOS Bypass Strategy
        const options = {
            dumpSingleJson: true,
            verbose: true,
            'no-check-certificates': true,
            'add-header': [
                'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            ],
            'cookies': cookiesPath,
            'extractor-args': 'youtube:player_client=ios,web_embedded',
            'proxy': process.env.YOUTUBE_PROXY,
            'geo-bypass': true,
            'force-ipv4': true
        };

        const rawOutput = await ytdlp(videoUrl, options);

        let jsonOutput: any;
        try {
            jsonOutput = typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput;
        } catch (parseError) {
            console.error('Failed to parse yt-dlp JSON output:', parseError);
            return null;
        }

        const title = jsonOutput.title || 'Unknown Title';
        console.log(`✅ Title fetched: ${title}`);
        return title;

    } catch (error) {
        console.error('Title fetch error:', error);
        return null;
    }
}