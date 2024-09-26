import { router } from 'expo-router';
import { Text, useTheme } from '@boclar/booking-app-components';
import { useCallback, useEffect, useState } from 'react';
import { View, Platform, ActivityIndicator } from 'react-native';
import { termsAndConditionsStyles } from './terms-and-conditions.styles';
import {
    formatSanityRichText,
    queryTermsAndConditions,
    renderSanityRichText,
} from '@/utils/sanity/sanity.utils';
import { FormattedSanityRichText } from '@/types/sanity.types';
import { CrossWithRoundedBackground } from '@/assets/icons';
import { Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DismissableScrollview } from '@/components/dismissable-scrollview';
import { ModalCloseIndicator } from '@/components/modal-close-indicator';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

const TermsAndConditions = () => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = termsAndConditionsStyles({ insets, theme });
    const [content, setContent] = useState<{
        lastUpdatedAt: string | undefined;
        richText: FormattedSanityRichText[];
    }>();
    const { t } = useTranslation();

    const handleGoBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.navigate('/');
        }
    }, []);

    useEffect(() => {
        const fetchContent = async () => {
            const data = await queryTermsAndConditions();
            const formattedData = formatSanityRichText(data);
            setContent({
                lastUpdatedAt: DateTime.fromISO(
                    data[0].lastUpdated || data[0]._createdAt
                ).toLocaleString(DateTime.DATE_FULL),
                richText: formattedData,
            });
        };

        fetchContent();
    }, []);

    return (
        <View style={styles.rootContainer}>
            {!content ? (
                <View style={styles.spinnerContainer}>
                    <ActivityIndicator color={theme.color.background.spinner} />
                </View>
            ) : (
                <>
                    {Platform.OS !== 'web' && <ModalCloseIndicator />}

                    <DismissableScrollview
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <View style={styles.topBar}>
                            <Text
                                color={'body'}
                                fontFamily={'heading.bold'}
                                fontSize="screenContentHeader"
                            >
                                {t('other.termsAndConditions')}
                            </Text>

                            {Platform.OS === 'web' && (
                                <CrossWithRoundedBackground
                                    fill={
                                        theme.color.icon
                                            .closeFullscreenModalFill
                                    }
                                    height={30}
                                    onPointerDown={handleGoBack}
                                    stroke={
                                        theme.color.icon
                                            .closeFullscreenModalStroke
                                    }
                                    style={styles.closeModalIcon}
                                    testID="close-terms-and-conditions"
                                    width={30}
                                />
                            )}
                        </View>

                        <View style={styles.lastUpdatedText}>
                            <Clock
                                color={theme.color.text.premium}
                                height={12}
                                width={12}
                            />

                            <Text
                                color="premium"
                                fontFamily="body.regular"
                                fontSize="small"
                            >{`Last updated: ${content?.lastUpdatedAt}`}</Text>
                        </View>

                        <View style={styles.paragraphContainer}>
                            {renderSanityRichText({
                                formattedRichText: content.richText,
                                theme,
                            })}
                        </View>
                    </DismissableScrollview>
                </>
            )}
        </View>
    );
};

export default TermsAndConditions;
