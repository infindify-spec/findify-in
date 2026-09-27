import { prisma } from './prisma';
import crypto from 'crypto';

export interface MetaEventPayload {
  eventName: 'PageView' | 'ViewContent' | 'Search' | 'AddToCart' | 'InitiateCheckout' | 'AddPaymentInfo' | 'Purchase';
  eventId: string; // Unique deduplication ID
  userEmail?: string;
  userPhone?: string;
  clientIp?: string;
  userAgent?: string;
  customData?: Record<string, unknown>;
}

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

/**
 * Dispatch server-side Meta Conversions API event with deduplication ID to Graph API.
 */
export async function trackMetaCAPI(payload: MetaEventPayload) {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const pixelId = settings?.metaDatasetId || settings?.metaPixelId || process.env.META_DATASET_ID || process.env.META_PIXEL_ID;
    const accessToken = settings?.metaAccessToken || process.env.META_ACCESS_TOKEN;
    const isEnabled = settings ? settings.metaEnabled : true;

    if (!isEnabled || !pixelId || !accessToken) {
      // Store event locally for verification/audit screen
      await prisma.analyticsEvent.create({
        data: {
          eventName: payload.eventName,
          eventData: JSON.stringify({ ...payload, status: 'NOT_CONFIGURED' }),
          source: 'SERVER',
        },
      });
      return;
    }

    // Build User Data Payload
    const userData: Record<string, unknown> = {};
    if (payload.userEmail) {
      userData.em = [sha256(payload.userEmail)];
    }
    if (payload.userPhone) {
      const cleanPhone = payload.userPhone.replace(/\D/g, '');
      userData.ph = [sha256(cleanPhone)];
    }
    if (payload.clientIp) {
      userData.client_ip_address = payload.clientIp;
    }
    if (payload.userAgent) {
      userData.client_user_agent = payload.userAgent;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const capiBody = {
      data: [
        {
          event_name: payload.eventName,
          event_time: currentTimestamp,
          event_id: payload.eventId,
          action_source: 'website',
          user_data: userData,
          custom_data: payload.customData || {},
        },
      ],
      ...(settings?.metaTestEventCode || process.env.META_TEST_EVENT_CODE
        ? { test_event_code: settings?.metaTestEventCode || process.env.META_TEST_EVENT_CODE }
        : {}),
    };

    // Dispatch to Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(capiBody),
    });

    const resJson = await response.json();

    // Record server event in database for audit logger UI
    await prisma.analyticsEvent.create({
      data: {
        eventName: payload.eventName,
        eventData: JSON.stringify({
          eventId: payload.eventId,
          customData: payload.customData,
          status: response.ok ? 'DISPATCHED_LIVE' : 'FAILED',
          metaResponse: resJson,
        }),
        source: 'SERVER',
      },
    });

    if (!response.ok) {
      console.error('Meta CAPI API Response Error:', resJson);
    }
  } catch (error) {
    console.error('Meta CAPI Error:', error);
  }
}

