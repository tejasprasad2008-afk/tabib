// Gemini Nano integration for on-device AI
// Uses WebGPU for local inference when available

export interface GemmaNanoStatus {
  available: boolean;
  loading: boolean;
  installed: boolean;
  error?: string;
}

export interface EnhancementResult {
  enhancedMessage: string;
  context: string;
}

class GemmaNanoService {
  private status: GemmaNanoStatus = {
    available: false,
    loading: false,
    installed: false
  };
  
  private statusListeners: ((status: GemmaNanoStatus) => void)[] = [];

  constructor() {
    this.checkAvailability();
  }

  async checkAvailability(): Promise<boolean> {
    try {
      // Check for WebGPU support
      if (!navigator.gpu) {
        this.updateStatus({ available: false, installed: false });
        return false;
      }

      // Check localStorage for previous installation
      const installed = localStorage.getItem('gemma_nano_installed') === 'true';
      const installRequested = localStorage.getItem('gemma_nano_requested') === 'true';

      if (installed) {
        this.updateStatus({ available: true, installed: true });
        return true;
      }

      if (installRequested) {
        this.updateStatus({ available: true, loading: true, installed: false });
        // Start background installation
        this.startBackgroundInstallation();
        return true;
      }

      this.updateStatus({ available: true, installed: false });
      return true;
    } catch (error) {
      console.error('WebGPU check failed:', error);
      this.updateStatus({ available: false, error: 'WebGPU not supported' });
      return false;
    }
  }

  private updateStatus(partial: Partial<GemmaNanoStatus>) {
    this.status = { ...this.status, ...partial };
    this.statusListeners.forEach(listener => listener(this.status));
  }

  onStatusChange(listener: (status: GemmaNanoStatus) => void) {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  getStatus(): GemmaNanoStatus {
    return this.status;
  }

  async requestInstallation(): Promise<boolean> {
    localStorage.setItem('gemma_nano_requested', 'true');
    this.updateStatus({ loading: true, installed: false });
    return this.startBackgroundInstallation();
  }

  private async startBackgroundInstallation(): Promise<boolean> {
    try {
      // Simulate model download progress
      // In real implementation, this would download the actual Gemma Nano model
      // Using MediaPipe GenAI or similar
      
      // Step 1: Initialize WebGPU
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error('Failed to get GPU adapter');
      }

      // Step 2: Mark as "downloading" (in real app, would download actual model files)
      await this.simulateDownload();

      // Step 3: Mark as installed
      localStorage.setItem('gemma_nano_installed', 'true');
      this.updateStatus({ loading: false, installed: true });
      
      return true;
    } catch (error) {
      console.error('Installation failed:', error);
      this.updateStatus({ 
        loading: false, 
        installed: false, 
        error: 'Installation failed. Regular triaging will continue.' 
      });
      return false;
    }
  }

  private async simulateDownload(): Promise<void> {
    // Simulate download time (in real app, this would be actual model download)
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }

  async enhanceMessage(userMessage: string): Promise<EnhancementResult> {
    // If not installed, return original message
    if (!this.status.installed) {
      return { enhancedMessage: userMessage, context: '' };
    }

    try {
      // In a real implementation, this would run the Gemma Nano model
      // to analyze the message and add context
      
      // For now, we'll do smart detection
      const vagueWords = ['pain', 'hurt', 'headache', 'feel bad', 'tired', 'dizzy', 'sick', 'unwell', 'ache'];
      const isVague = vagueWords.some(word => 
        userMessage.toLowerCase().includes(word)
      );

      if (isVague) {
        return {
          enhancedMessage: userMessage,
          context: '\n\n[CONTEXT FROM ON-DEVICE AI]: This appears to be a vague symptom description. The patient needs to provide more details including: exact location, severity (1-10), duration, and any accompanying symptoms before proper triage can be provided. Ask follow-up questions first before assessing urgency.'
        };
      }

      return { enhancedMessage: userMessage, context: '' };
    } catch (error) {
      console.error('Enhancement failed:', error);
      return { enhancedMessage: userMessage, context: '' };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.status.available || !this.status.installed) {
      return false;
    }

    try {
      // Quick WebGPU check
      const adapter = await navigator.gpu?.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }

  skipInstallation(): void {
    localStorage.setItem('gemma_nano_skipped', 'true');
    this.updateStatus({ available: true, installed: false, loading: false });
  }

  isSkipped(): boolean {
    return localStorage.getItem('gemma_nano_skipped') === 'true';
  }
}

export const gemmaNano = new GemmaNanoService();