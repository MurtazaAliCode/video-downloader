import fs from 'fs';
import path from 'path';

/**
 * Utility to extract matching cookies from cookies.txt for a given URL domain.
 * Supports Netscape format as provided by Chrome/Edge/Firefox cookie export extensions.
 */
export function getCookieHeader(targetUrl: string, cookiesFileName: string = 'cookies.txt'): string {
    try {
        const cookiesPath = path.resolve(process.cwd(), cookiesFileName);
        
        if (!fs.existsSync(cookiesPath)) {
            return '';
        }

        const url = new URL(targetUrl);
        const targetHostname = url.hostname;
        
        const cookieContent = fs.readFileSync(cookiesPath, 'utf8');
        const lines = cookieContent.split('\n');
        const cookieParts: string[] = [];

        // Determine if target is a Google/YouTube owned domain
        const isGoogleContext = targetHostname.includes('googlevideo.com') ||
                               targetHostname.includes('youtube.com') ||
                               targetHostname.includes('google.com');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const parts = trimmed.split(/\t/);
            if (parts.length < 7) continue;

            const domain = parts[0];
            const name = parts[5];
            const value = parts[6].trim();

            // Match logic:
            // 1. If it's a Google/YouTube host, include all related cookies (some cookies are set on .youtube.com but needed on .googlevideo.com)
            const isGoogleCookie = domain.includes('google.com') ||
                                  domain.includes('youtube.com') ||
                                  domain.includes('googlevideo.com');

            if (isGoogleContext && isGoogleCookie) {
                cookieParts.push(`${name}=${value}`);
            } 
            // 2. Otherwise match literal domain or wildcard domain (starting with .)
            else if (targetHostname.includes(domain.startsWith('.') ? domain.substring(1) : domain)) {
                cookieParts.push(`${name}=${value}`);
            }
        }

        // Deduplicate cookies by name (keep last one found)
        const uniqueCookiesMap = new Map();
        cookieParts.forEach(cp => {
            const eqIdx = cp.indexOf('=');
            if (eqIdx > 0) {
                const k = cp.substring(0, eqIdx).trim();
                const v = cp.substring(eqIdx + 1).trim();
                uniqueCookiesMap.set(k, v);
            }
        });

        const header = Array.from(uniqueCookiesMap.entries())
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');

        return header;
    } catch (err) {
        console.error('Error parsing cookies in helper:', err);
        return '';
    }
}
