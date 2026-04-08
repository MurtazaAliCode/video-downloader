// server/job-queue.ts - Full processing logic here (no circular import)
// ⚡ OPTIMIZED: No separate title fetch — download function returns title directly
import { stat } from 'fs/promises';
import path from 'path';
import { storage } from './storage.js';
import { downloadVideoWithYtDlp } from './utils/videoDownloader.js';
import { log } from './vite.js';

interface JobData {
    id: string;
    url: string;
    downloadFormat: string;
    quality?: string;
}

interface QueueJob {
    data: JobData;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

class SimpleJobQueue {
    private queue: QueueJob[] = [];
    private isProcessing = false;

    async add(jobData: JobData): Promise<string> {
        const job: QueueJob = {
            data: jobData,
            status: 'pending',
        };
        this.queue.push(job);
        console.log(`Added job to queue: ${jobData.id}`);

        if (!this.isProcessing) {
            this.processNext();
        }

        return jobData.id;
    }

    private async processNext() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const queueJob = this.queue.shift()!;
        const { id: jobId, url, downloadFormat, quality } = queueJob.data;
        queueJob.status = 'processing';

        const startTime = Date.now();
        console.log(`⚡ Processing job: ${jobId}`);

        try {
            // Update storage to 'processing'
            await storage.updateJobStatus(jobId, 'processing', 5);

            // ⚡ DIRECT DOWNLOAD — No separate title fetch!
            // Title comes from the download result itself (saves 1 full API call)
            console.log(`⬇️ Starting download for ${jobId}...`);
            const outputPath = path.join(process.cwd(), 'downloads', `${jobId}.${downloadFormat}`);

            const result = await downloadVideoWithYtDlp(url, outputPath, downloadFormat, (progress: any) => {
                // Throttled progress updates (every 20% to reduce DB writes)
                if (progress % 20 === 0) {
                    console.log(`📊 Progress for ${jobId}: ${progress}%`);
                    storage.updateJobStatus(jobId, 'processing', 5 + Math.floor(progress * 0.9)).catch(() => {});
                }
            }, quality || 'high');

            if (!result.success) {
                throw new Error(result.error || 'Download failed');
            }

            // Finalize
            const title = result.title || 'Downloaded Video';

            if (result.directUrl) {
                // === RapidAPI/Scraper Mode: Direct URL ===
                console.log(`🏁 Job ${jobId} complete (direct URL). Title: ${title}`);
                await storage.updateJobDownloadUrl(jobId, result.directUrl);
                await storage.updateJobTitle(jobId, title);
                await storage.updateJobStatus(jobId, 'completed', 100);

            } else {
                // === yt-dlp Mode: Local file ===
                const actualOutputPath = result.filePath || outputPath;
                const stats = await stat(actualOutputPath);
                const downloadUrl = `/api/download/${jobId}`;
                console.log(`🏁 Job ${jobId} complete (local). Size: ${stats.size} bytes`);

                await storage.updateJobOutput(jobId, actualOutputPath);
                await storage.updateJobDownloadUrl(jobId, downloadUrl);
                await storage.updateJobTitle(jobId, title);
                await storage.updateJobStatus(jobId, 'completed', 100);
            }

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            log(`✅ Job ${jobId} completed in ${elapsed}s`);
            queueJob.status = 'completed';

        } catch (error) {
            console.error(`💥 Failed job ${jobId}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await storage.updateJobError(jobId, errorMessage);
            queueJob.status = 'failed';
        } finally {
            this.isProcessing = false;
            this.processNext();
        }
    }

    getQueueLength(): number {
        return this.queue.length;
    }
}

export const jobQueue = new SimpleJobQueue();

export const addDownloadJob = async (jobData: JobData): Promise<string> => {
    console.log('Adding job to simple queue:', jobData.id);
    return await jobQueue.add(jobData);
};

console.log('⚡ Optimized job queue initialized (no duplicate API calls)');