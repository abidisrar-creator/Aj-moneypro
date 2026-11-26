/**
 * Biometric Authentication Service using the Web Authentication API (WebAuthn)
 * Supports Platform Authenticators: Fingerprint (Android / Touch ID), FaceID (iOS), and Windows Hello
 */

export interface BiometricAvailability {
  isSupported: boolean;
  hasPlatformAuthenticator: boolean;
  deviceLabel: string;
  biometricType: 'fingerprint' | 'face' | 'platform';
  reason?: string;
}

export interface BiometricResult {
  success: boolean;
  credentialId?: string;
  error?: string;
  cancelled?: boolean;
}

const STORAGE_KEY_CREDENTIAL_ID = 'aj_moneypro_biometric_credential_id_v1';

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function getSafeRpId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const hostname = window.location.hostname;
  if (!hostname || hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return undefined;
  }
  return hostname;
}

export class BiometricService {
  /**
   * Determine biometric modality based on user agent
   */
  static getBiometricType(): 'fingerprint' | 'face' | 'platform' {
    if (typeof navigator === 'undefined') return 'platform';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) return 'face';
    if (ua.includes('android') || ua.includes('macintosh') || ua.includes('mac os')) return 'fingerprint';
    return 'platform';
  }

  /**
   * Determine user-friendly biometric label based on platform
   */
  static getBiometricDeviceLabel(): string {
    if (typeof navigator === 'undefined') return 'Biometric Scanner';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) {
      return 'Face ID / Touch ID';
    }
    if (ua.includes('macintosh') || ua.includes('mac os')) {
      return 'Touch ID';
    }
    if (ua.includes('android')) {
      return 'Fingerprint / Face Unlock';
    }
    if (ua.includes('windows')) {
      return 'Windows Hello (Fingerprint / Face)';
    }
    return 'Biometric Fingerprint / FaceID';
  }

  /**
   * Check if WebAuthn and a platform biometric authenticator are available
   */
  static async checkAvailability(): Promise<BiometricAvailability> {
    const label = this.getBiometricDeviceLabel();
    const biometricType = this.getBiometricType();

    if (typeof window === 'undefined') {
      return {
        isSupported: false,
        hasPlatformAuthenticator: false,
        deviceLabel: label,
        biometricType,
        reason: 'Window environment not found',
      };
    }

    if (!window.isSecureContext) {
      return {
        isSupported: false,
        hasPlatformAuthenticator: false,
        deviceLabel: label,
        biometricType,
        reason: 'WebAuthn requires a secure HTTPS or localhost context',
      };
    }

    if (!window.PublicKeyCredential) {
      return {
        isSupported: false,
        hasPlatformAuthenticator: false,
        deviceLabel: label,
        biometricType,
        reason: 'Web Authentication API is not supported in this browser',
      };
    }

    try {
      const isPlatformAvailable =
        typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
          ? await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          : false;

      return {
        isSupported: true,
        hasPlatformAuthenticator: isPlatformAvailable,
        deviceLabel: label,
        biometricType,
        reason: isPlatformAvailable
          ? undefined
          : 'No platform biometric sensor detected on this device',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error checking authenticator';
      return {
        isSupported: true,
        hasPlatformAuthenticator: false,
        deviceLabel: label,
        biometricType,
        reason: errorMsg,
      };
    }
  }

  /**
   * Get previously enrolled credential ID if any
   */
  static getStoredCredentialId(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY_CREDENTIAL_ID);
  }

  /**
   * Register/Enroll a new WebAuthn platform biometric credential
   */
  static async registerCredential(username: string = 'AJ MoneyPro User'): Promise<BiometricResult> {
    const availability = await this.checkAvailability();
    if (!availability.isSupported) {
      return {
        success: false,
        error: availability.reason || 'WebAuthn not supported',
      };
    }

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const rpId = getSafeRpId();

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'AJ MoneyPro',
            ...(rpId ? { id: rpId } : {}),
          },
          user: {
            id: userId,
            name: 'user@ajmoneypro.app',
            displayName: username,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },   // ES256 (P-256)
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      })) as PublicKeyCredential | null;

      if (!credential) {
        return { success: false, error: 'Registration cancelled or denied' };
      }

      const credIdBase64 = bufferToBase64(credential.rawId);
      localStorage.setItem(STORAGE_KEY_CREDENTIAL_ID, credIdBase64);

      return {
        success: true,
        credentialId: credIdBase64,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'SecurityError' || err.message.includes('publickey-credentials')) {
          return {
            success: false,
            error: 'Biometric prompt blocked in embedded preview. Open in a standalone tab or use PIN.',
          };
        }
        if (err.name === 'NotAllowedError') {
          return {
            success: false,
            cancelled: true,
            error: 'Biometric registration was cancelled or timed out',
          };
        }
        return { success: false, error: err.message };
      }
      return { success: false, error: 'Failed to register biometric credential' };
    }
  }

  /**
   * Verify identity using platform biometric prompt (Fingerprint / Face ID)
   */
  static async authenticate(storedCredentialId?: string): Promise<BiometricResult> {
    const availability = await this.checkAvailability();
    if (!availability.isSupported) {
      return {
        success: false,
        error: availability.reason || 'WebAuthn not supported in this browser',
      };
    }

    const credId = storedCredentialId || this.getStoredCredentialId();

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const rpId = getSafeRpId();

      let allowCredentials: PublicKeyCredentialDescriptor[] | undefined = undefined;

      if (credId) {
        try {
          allowCredentials = [
            {
              type: 'public-key',
              id: base64ToBuffer(credId),
              transports: ['internal'],
            },
          ];
        } catch {
          allowCredentials = undefined;
        }
      }

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          ...(rpId ? { rpId } : {}),
          allowCredentials,
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (!assertion) {
        return { success: false, error: 'Biometric verification returned empty' };
      }

      return { success: true, credentialId: credId || undefined };
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'SecurityError' || err.message.includes('publickey-credentials')) {
          return {
            success: false,
            error: 'Biometric prompt blocked in embedded preview. Open in a standalone tab or use PIN.',
          };
        }
        if (err.name === 'NotAllowedError') {
          return {
            success: false,
            cancelled: true,
            error: 'Biometric scan cancelled or timed out',
          };
        }
        if (err.name === 'InvalidStateError' || err.name === 'NotFoundError') {
          return {
            success: false,
            error: 'Biometric credential not recognized on this device. Re-enroll in Settings.',
          };
        }
        return { success: false, error: err.message };
      }
      return { success: false, error: 'Biometric authentication failed' };
    }
  }

  /**
   * Remove stored biometric credential
   */
  static clearCredential(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CREDENTIAL_ID);
    }
  }
}
