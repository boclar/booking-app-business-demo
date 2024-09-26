import { useLocale } from '@/hooks/useLocale/useLocale';
import { renderHookWithContext } from '@/utils/testing-library/testing-library.utils';
import { act } from 'expo-router/testing-library';
import i18n from 'i18next';

describe('useLocale', () => {
    it('changes language correctly', async () => {
        const { result } = renderHookWithContext(() => useLocale());
        const { changeLanguage } = result.current;
        await act(async () => {
            await changeLanguage('es');
            expect(result.current.language).toBe('es');
            expect(i18n.language).toBe('es');
        });
    });
});
