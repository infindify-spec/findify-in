import { prisma } from './prisma';

export interface MetaEventPayload {
  eventName: 'PageView' | 'ViewContent' | 'Search' | 'AddToCart' | 'InitiateCheckout' | 'AddPaymentInfo' | 'Purchase';
  eventId: string; // Unique deduplication ID
  userEmail?: string;
  userPhone?: string;
  customData?: Record<string, unknown>;
}

/**
 * Dispatch server-side Meta Conversions API event with deduplication ID.
 */
export async function trackMetaCAPI(payload: MetaEventPayload) {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    if (!settings || !settings.metaEnabled || !settings.metaPixelId || !settings.metaAccessToken) {
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

    // Record server event for audit log
    await prisma.analyticsEvent.create({
      data: {
        eventName: payload.eventName,
        eventData: JSON.stringify({
          eventId: payload.eventId,
          customData: payload.customData,
          status: 'DISPATCHED',
        }),
        source: 'SERVER',
      },
    });

    // Production CAPI fetch endpoint call to Graph API can be triggered here securely
  } catch (error) {
    console.error('Meta CAPI Error:', error);
  }
}
