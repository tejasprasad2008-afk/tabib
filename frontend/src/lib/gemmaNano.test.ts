import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gemmaNano } from './gemmaNano';

describe('GemmaNanoService', () => {
  let originalNavigator: any;

  beforeEach(() => {
    // Save original navigator
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    // Restore original navigator
    global.navigator = originalNavigator;
    vi.restoreAllMocks();
  });

  it('should handle WebGPU check error and update status to unavailable', async () => {
    // Mock navigator.gpu to throw an error
    Object.defineProperty(global, 'navigator', {
      value: {
        get gpu() {
          throw new Error('Simulated WebGPU access error');
        }
      },
      writable: true,
      configurable: true
    });

    // We spy on console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // checkAvailability should catch the error and return false
    const result = await gemmaNano.checkAvailability();
    expect(result).toBe(false);

    // The status should be updated to available: false with an error message
    const status = gemmaNano.getStatus();
    expect(status.available).toBe(false);
    expect(status.error).toBe('WebGPU not supported');

    // Make sure our console.error spy was called with the error
    expect(consoleSpy).toHaveBeenCalledWith('WebGPU check failed:', expect.any(Error));
  });
});
