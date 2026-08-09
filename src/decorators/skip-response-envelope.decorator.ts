import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_ENVELOPE_KEY = 'skip_response_envelope';

/**
 * Marks a handler's return value as final — the {@link ResponseInterceptor}
 * passes it through untouched instead of wrapping it in the success
 * envelope. For binary payloads (file downloads) that can't be JSON-wrapped.
 */
export const SkipResponseEnvelope = () =>
  SetMetadata(SKIP_RESPONSE_ENVELOPE_KEY, true);
