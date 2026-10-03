import { RecordedClip } from '../types';
import { actionTracker } from './actionTracker';

export class ScreenCaptureService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private onEndedCallback: ((clip: RecordedClip) => void) | null = null;
  private resolveStopPromise: ((clip: RecordedClip) => void) | null = null;

  public async startCapture(
    includeMic: boolean = false,
    onEnded?: (clip: RecordedClip) => void
  ): Promise<MediaStream> {
    this.recordedChunks = [];
    this.onEndedCallback = onEnded || null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen recording is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    // Modern Chrome/Edge display media constraints
    const displayMediaOptions: DisplayMediaStreamOptions & {
      preferCurrentTab?: boolean;
      selfBrowserSurface?: string;
      surfaceSwitching?: string;
      systemAudio?: string;
    } = {
      video: {
        displaySurface: 'browser',
        frameRate: { ideal: 60, max: 60 },
      },
      audio: includeMic,
      preferCurrentTab: true,
      selfBrowserSurface: 'include',
      surfaceSwitching: 'exclude',
      systemAudio: 'exclude',
    };

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('Permission denied') || errorMsg.includes('cancelled')) {
        throw new Error('Screen capture was cancelled.');
      }
      throw err;
    }

    this.mediaStream = stream;

    // Optional: Chrome Element Capture API (CropTarget / RestrictionTarget)
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const rootEl = document.getElementById('root');
        // @ts-expect-error Chrome Element Capture
        if (rootEl && typeof window.CropTarget?.fromElement === 'function' && typeof videoTrack.cropTo === 'function') {
          // @ts-expect-error Chrome Element Capture
          const cropTarget = await window.CropTarget.fromElement(rootEl);
          // @ts-expect-error Chrome Element Capture
          await videoTrack.cropTo(cropTarget);
        }
      } catch {
        // Element cropping is an enhancement; proceed if not supported
      }
    }

    // Determine optimal supported mime type
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    let selectedMimeType = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMimeType = mime;
        break;
      }
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: selectedMimeType || undefined,
      videoBitsPerSecond: 16_000_000, // 16 Mbps for crisp UI text
    });

    this.mediaRecorder = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const durationMs = Math.max(500, Math.round(performance.now() - this.recordingStartTime));
      const events = actionTracker.stop();

      const blobType = selectedMimeType || 'video/webm';
      const finalBlob = new Blob(this.recordedChunks, { type: blobType });
      const videoUrl = URL.createObjectURL(finalBlob);

      const settings = videoTrack?.getSettings();
      const width = settings?.width || window.innerWidth;
      const height = settings?.height || window.innerHeight;

      const clip: RecordedClip = {
        blob: finalBlob,
        url: videoUrl,
        durationMs,
        width,
        height,
        events,
      };

      this.cleanupStream();

      if (this.resolveStopPromise) {
        this.resolveStopPromise(clip);
        this.resolveStopPromise = null;
      } else if (this.onEndedCallback) {
        this.onEndedCallback(clip);
      }
    };

    // If user clicks the browser's native "Stop Sharing" button
    videoTrack.onended = () => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    };

    // Start action tracking & recording
    actionTracker.start();
    this.recordingStartTime = performance.now();
    recorder.start(1000); // 1-second timeslices for reliability

    return stream;
  }

  public pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  public resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  public stop(): Promise<RecordedClip> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('No active recording session.'));
        return;
      }

      this.resolveStopPromise = resolve;
      this.mediaRecorder.stop();
    });
  }

  public cancel() {
    actionTracker.stop();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Discard recorded chunks
      this.recordedChunks = [];
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }
    this.cleanupStream();
    this.resolveStopPromise = null;
    this.onEndedCallback = null;
  }

  private cleanupStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
  }
}

export const screenCaptureService = new ScreenCaptureService();
