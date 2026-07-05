/**
 * Google Analytics (GA4) Dynamic Integration Utility
 * This handles dynamic gtag.js script injection and event dispatch tracking.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface TrackedEvent {
  id: string;
  timestamp: string;
  name: string;
  params?: Record<string, any>;
}

// Internal session events logger for the admin diagnostic view
let sessionEventLog: TrackedEvent[] = [];

/**
 * Initialize (or re-initialize) Google Analytics with a given Measurement ID.
 */
export function initGA(measurementId: string): boolean {
  if (!measurementId || typeof window === 'undefined') {
    return false;
  }

  const cleanId = measurementId.trim();
  if (!cleanId.match(/^G-[A-Z0-9]+$/i)) {
    console.warn(`[GA Logger] Provided measurement ID "${cleanId}" does not fit GAv4 format (G-XXXXXXXXXX).`);
  }

  const scriptId = 'google-analytics-gtag-script';
  let existingScript = document.getElementById(scriptId);

  try {
    if (!existingScript) {
      // Create external gtag script element
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
      document.head.appendChild(script);

      // Create inline gtag snippet setup 
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
    } else {
      // If the script exists, we just overwrite the source to update the property dynamic loading if changed
      const scriptElement = existingScript as HTMLScriptElement;
      if (!scriptElement.src.includes(cleanId)) {
        scriptElement.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
      }
    }

    // Call configuration command
    if (window.gtag) {
      window.gtag('config', cleanId, {
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure',
        anonymize_ip: true
      });
      
      // Track initial activation event
      trackGAEvent('analytics_initialized', {
        measurement_id: cleanId,
        platform: 'Google AI Studio Applet'
      });
      return true;
    }
  } catch (error) {
    console.error('[GA Loader] Integration error:', error);
  }
  return false;
}

/**
 * Dispatches an event to GA4 and adds a session diagnostic helper log.
 */
export function trackGAEvent(eventName: string, params?: Record<string, any>): TrackedEvent {
  const timestamp = new Date().toLocaleTimeString();
  const eventId = Math.random().toString(36).substring(2, 9);
  
  const loggedEvent: TrackedEvent = {
    id: eventId,
    timestamp,
    name: eventName,
    params: params || {}
  };

  // Push to local memory diagnostics
  sessionEventLog = [loggedEvent, ...sessionEventLog].slice(0, 50); // Keep last 50 events

  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, params);
      console.log(`[GA Event Tracked] ${eventName}:`, params);
    } catch (err) {
      console.warn(`[GA event dispatch failed] ${eventName}:`, err);
    }
  } else {
    console.log(`[GA Event (Simulated / Key Missing)] ${eventName}:`, params);
  }

  // Dispatch a custom event to notify listeners of new tracked logs (e.g. the admin console)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ga-event-dispatched', { detail: loggedEvent }));
  }

  return loggedEvent;
}

/**
 * Get active session event log for administration analytics.
 */
export function getSessionEvents(): TrackedEvent[] {
  return [...sessionEventLog];
}

/**
 * Clear trace diagnostic history
 */
export function clearSessionEvents() {
  sessionEventLog = [];
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ga-event-dispatched', { detail: null }));
  }
}
