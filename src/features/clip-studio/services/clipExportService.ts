import { ClipStudioConfig, RenderProgress } from '../types';

export class ClipExportService {
  private worker: Worker | null = null;

  public startRender(
    config: ClipStudioConfig,
    text: string,
    onProgress: (progress: RenderProgress) => void
  ): Promise<{ blob: Blob; fileName: string }> {
    return new Promise((resolve, reject) => {
      // Terminate any previous render
      this.cancelRender();

      try {
        // Instantiate Web Worker using Vite module syntax
        this.worker = new Worker(
          new URL('../workers/clipRender.worker.ts', import.meta.url),
          { type: 'module' }
        );
      } catch (err) {
        reject(new Error(`Failed to initialize Clip Render Worker: ${err instanceof Error ? err.message : String(err)}`));
        return;
      }

      onProgress({
        status: 'preparing',
        currentFrame: 0,
        totalFrames: 100,
        percentage: 0,
        message: 'Initializing off-thread renderer...',
      });

      this.worker.onmessage = (e: MessageEvent) => {
        const { type, message, currentFrame, totalFrames, percentage, blob, fileName, error } = e.data;

        if (type === 'PREPARING') {
          onProgress({
            status: 'preparing',
            currentFrame: 0,
            totalFrames: 100,
            percentage: 5,
            message,
          });
        } else if (type === 'PROGRESS') {
          onProgress({
            status: 'rendering',
            currentFrame,
            totalFrames,
            percentage,
            message: `Rendering frame ${currentFrame} of ${totalFrames} (60 FPS)...`,
          });
        } else if (type === 'ENCODING') {
          onProgress({
            status: 'encoding',
            currentFrame: totalFrames,
            totalFrames,
            percentage: 98,
            message,
          });
        } else if (type === 'COMPLETE') {
          const blobUrl = URL.createObjectURL(blob);
          onProgress({
            status: 'complete',
            currentFrame: totalFrames,
            totalFrames,
            percentage: 100,
            outputBlobUrl: blobUrl,
            outputFileName: fileName,
            format: config.format,
          });
          this.terminate();
          resolve({ blob, fileName });
        } else if (type === 'ERROR') {
          onProgress({
            status: 'error',
            currentFrame: 0,
            totalFrames: 0,
            percentage: 0,
            error: error || 'Export failed',
          });
          this.terminate();
          reject(new Error(error || 'Export failed'));
        }
      };

      this.worker.onerror = (err) => {
        onProgress({
          status: 'error',
          currentFrame: 0,
          totalFrames: 0,
          percentage: 0,
          error: err.message || 'Worker thread error',
        });
        this.terminate();
        reject(err);
      };

      // Start the render job
      this.worker.postMessage({
        type: 'START_RENDER',
        config,
        text,
      });
    });
  }

  public cancelRender() {
    this.terminate();
  }

  private terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  public downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

export const clipExportService = new ClipExportService();
