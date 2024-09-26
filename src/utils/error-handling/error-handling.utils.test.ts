import { translateErrorMessage } from '@/utils/error-handling/error-handling.utils';
import { useTranslation } from 'react-i18next';
import { renderHookWithContext } from '@/utils/testing-library/testing-library.utils';
import { BusinessApiError } from '@/services/business-services/business-rtk-query';

describe('Error Handling Utils', () => {
    describe('translateErrorMessage', () => {
        it('should return the correct error message for ImageResolutionTooLarge', () => {
            const name = 'ImageResolutionTooLarge';
            const { result } = renderHookWithContext(() => useTranslation());
            const message = translateErrorMessage({
                name,
                t: result.current.t,
            });

            expect(message).toBe('Image resolution too large');
        });

        it('should return the correct error message for ValidationError', () => {
            const error = {
                stack: {
                    errorInfo: {
                        details: [
                            {
                                context: {
                                    key: 'accept_terms',
                                },
                            },
                        ],
                    },
                },
            } as BusinessApiError;
            const name = 'ValidationError';
            const { result } = renderHookWithContext(() => useTranslation());
            const message = translateErrorMessage({
                businessError: error,
                name,
                t: result.current.t,
            });

            expect(message).toBe(
                'You must accept the terms of service and privacy policy to use our service'
            );
        });

        it('should return the correct error message for any other error', () => {
            const name = 'AnyOtherError';
            const { result } = renderHookWithContext(() => useTranslation());
            const message = translateErrorMessage({
                name,
                t: result.current.t,
            });

            expect(message).toBe(
                'Something went wrong. Contact support for help if the problem persists'
            );
        });
    });
});
