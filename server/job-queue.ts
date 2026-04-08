import { stat, unlink, readdir } from 'fs/promises';
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
    private activeCount = 0;
    private readonly MAX_CONCURRENT_JOBS = 3;

    async add(jobData: JobData): Promise<string> {
        const job: QueueJob = {
            data: jobData,
            status: 'pending',
        };
        this.queue.push(job);
        console.log(`Added job to queue: ${jobData.id} (Queue length: ${this.queue.length})`);

        this.processNext();
        return jobData.id;
    }

    private async processNext() {
        if (this.activeCount >= this.MAX_CONCURRENT_JOBS || this.queue.length === 0) return;

        this.activeCount++;
        const queueJob = this.queue.shift()!;
        const { id: jobId, url, downloadFormat, quality } = queueJob.data;
        queueJob.status = 'processing';

        const startTime = Date.now();
        console.log(`⚡ [${this.activeCount}/${this.MAX_CONCURRENT_JOBS}] Processing job: ${jobId}`);

        try {
            // Update storage to 'processing'
            await storage.updateJobStatus(jobId, 'processing', 5);

            const outputPath = path.join(process.cwd(), 'downloads', `${jobId}.${downloadFormat}`);

            const result = await downloadVideoWithYtDlp(url, outputPath, downloadFormat, (progress: any) => {
                // Throttled progress updates
                if (progress % 20 === 0) {
                    storage.updateJobStatus(jobId, 'processing', 5 + Math.floor(progress * 0.9)).catch(() => {});
                }
            }, quality || 'high');

            if (!result.success) {
                throw new Error(result.error || 'Download failed');
            }

            const title = result.title || 'Downloaded Video';

            if (result.directUrl) {
                console.log(`🏁 Job ${jobId} complete (direct URL).`);
                await storage.updateJobDownloadUrl(jobId, result.directUrl);
                await storage.updateJobTitle(jobId, title);
                await storage.updateJobStatus(jobId, 'completed', 100);
            } else {
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
            this.activeCount--;
            this.processNext();
        }
    }

    // Auto-cleanup: Deletes files older than 1 hour
    async startCleanupTask() {
        const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
        const MAX_AGE = 60 * 60 * 1000; // 1 hour

        setInterval(async () => {
            try {
                const downloadsDir = path.join(process.cwd(), 'downloads');
                const files = await readdir(downloadsDir);
                const now = Date.now();

                for (const file of files) {
                    const filePath = path.join(downloadsDir, file);
                    const fileStat = await stat(filePath);
                    
                    if (now - fileStat.mtimeMs > MAX_AGE) {
                        await unlink(filePath);
                        console.log(`🧹 Cleaned up old file: ${file}`);
                    }
                }
            } catch (err) {
                console.error('Cleanup error:', err);
            }
        }, CLEANUP_INTERVAL);
        
        console.log('🧹 Cleanup task started (Every 15 mins)');
    }
}

export const jobQueue = new SimpleJobQueue();
jobQueue.startCleanupTask();

export const addDownloadJob = async (jobData: JobData): Promise<string> => {
    return await jobQueue.add(jobData);
};

console.log('⚡ High-performance concurrent job queue initialized');