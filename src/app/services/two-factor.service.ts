import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TwoFactorService {

  generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }

  /**
   * Simulates TOTP: generates a 6-digit code deterministic to the 30-second window.
   */
  generateTOTPCode(secret: string): string {
    const timeStep = Math.floor(Date.now() / 30000);
    const input = secret + timeStep.toString();
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
      hash = hash & 0x7fffffff;
    }
    return (hash % 1000000).toString().padStart(6, '0');
  }

  verifyTOTPCode(secret: string, code: string): boolean {
    // Accept current and previous window for clock drift tolerance
    const timeStep = Math.floor(Date.now() / 30000);
    for (let delta = -1; delta <= 1; delta++) {
      const input = secret + (timeStep + delta).toString();
      let hash = 5381;
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
        hash = hash & 0x7fffffff;
      }
      const expected = (hash % 1000000).toString().padStart(6, '0');
      if (expected === code) {
        return true;
      }
    }
    return false;
  }

  getRemainingSeconds(): number {
    return 30 - (Math.floor(Date.now() / 1000) % 30);
  }
}
