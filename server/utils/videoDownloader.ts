// @ts-ignore
import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs/promises';

/**
 * Video download using youtube-dl-exec (wrapper for yt-dlp, auto-binary)
 * @param videoUrl - Video URL
 * @param outputPath - Save path
 * @param downloadFormat - 'mp4' or 'mp3'
 * @param onProgress - Progress callback (simulated, real via logs)
 * @returns Promise with result
 */
export async function downloadVideoWithYtDlp(
    videoUrl: string,
    outputPath: string,
    downloadFormat: string = 'mp4',
    onProgress?: (progress: number) => void
): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        console.log(`Starting ${downloadFormat} download with youtube-dl-exec: ${videoUrl}`);

        // Command options with robust bypasses and speed optimizations
        const options = {
            format: downloadFormat === 'mp3' ? 'bestaudio/best' : 'best[ext=mp4]/best',
            output: outputPath,
            'no-warnings': true,
            'ignore-errors': false,
            'no-check-certificates': true,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'extractor-args': 'youtube:player_client=android,web',
            'concurrent-fragments': 5, // Download multiple fragments at once
            'buffer-size': '1024K',   // Larger buffer for better throughput
            'hls-prefer-native': true, // Use native HLS downloader for better speed
            'add-header': [
                'Accept-Language: en-US,en;q=0.9',
                'Referer: https://www.google.com/'
            ],
            'ffmpeg-location': './ffmpeg'
        };

        // Run download
        await youtubedl(videoUrl, options);

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

        // JSON dump (no download)
        const rawOutput = await youtubedl(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            // @ts-ignore
            'no-check-certificates': true,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });

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