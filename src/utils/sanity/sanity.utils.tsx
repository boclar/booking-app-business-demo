/* eslint-disable react-perf/jsx-no-new-object-as-prop */
/* eslint-disable sort-keys */
/* eslint-disable perfectionist/sort-interfaces */

import { client } from '@/libs/sanity/sanity.libs';
import {
    FormattedSanityRichText,
    SanityParagraphBlockChild,
    SanityRichText,
} from '@/types/sanity.types';
import { Text } from '@boclar/booking-app-components';
import { ThemeDesignTokens } from '@boclar/booking-app-components/src/types';
import { TextStyle } from 'react-native';

export const formatSanityRichText = (
    richTextArr: [SanityRichText]
): FormattedSanityRichText[] => {
    const [richText] = richTextArr;

    const content: FormattedSanityRichText[] = [];
    richText.content.forEach(block => {
        switch (block.style) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                const headingText = block.children
                    .map(child => child.text)
                    .join(' ');

                content.push({
                    content: headingText,
                    style: block.children[0].marks,
                    type: 'heading',
                });
                break;
            default:
                content.push({
                    content: block.children.map(child => ({
                        content: child.text,
                        style: child.marks,
                        type: 'paragraph',
                    })),
                    style: block.children[0].marks,
                    type: 'paragraph',
                });
                break;
        }
    });

    return content;
};

interface GetParagraphComponent {
    block: SanityParagraphBlockChild;
    index: number;
}

export const renderSanityRichText = ({
    formattedRichText,
    theme,
}: {
    formattedRichText: FormattedSanityRichText[];
    theme: ThemeDesignTokens;
}) => {
    return formattedRichText.map((block, index) => {
        const headingStyle = {
            paddingTop: index !== 0 ? 20 : 0,
            paddingBottom: 8,
        };

        const getParagraphComponent = ({
            block,
            index,
        }: GetParagraphComponent) => {
            const isBold = block.style.includes('strong');
            const isItalic = block.style.includes('em');
            const isUnderline = block.style.includes('underline');
            const isStrikeThrough = block.style.includes('strike-through');

            const textStyle: TextStyle = {
                ...(isUnderline && { textDecorationLine: 'underline' }),
                ...(isStrikeThrough && { textDecorationLine: 'line-through' }),
            };

            const paragraphStyle: TextStyle = {
                ...textStyle,
                lineHeight: theme.typography.fontSize.body * 1.5,
            };

            return (
                <Text
                    color={'paragraph'}
                    fontFamily={
                        isBold && isItalic
                            ? 'body.boldItalic'
                            : isBold
                              ? 'body.bold'
                              : isItalic
                                ? 'body.italic'
                                : 'body.regular'
                    }
                    fontSize={'body'}
                    key={index}
                    style={paragraphStyle}
                >
                    {block.content || ' '}
                </Text>
            );
        };

        switch (block.type) {
            case 'heading':
                return (
                    <Text
                        color={'body'}
                        fontFamily={'body.bold'}
                        fontSize={'big'}
                        key={index}
                        style={headingStyle}
                    >
                        {block.content}
                    </Text>
                );
            default:
                return (
                    <Text key={index}>
                        {block.content.map((child, index) =>
                            getParagraphComponent({ block: child, index })
                        )}
                    </Text>
                );
        }
    });
};

// Fetch content with GROQ
export const queryPrivacyPolicy = async (): Promise<[SanityRichText]> => {
    const QUERY = `
    *[_type == "privacyPolicy"] {
        ...,
        content[] {
            _type,
            ...,
            defined(string) => string
        }
    }
    `;
    const content = await client.fetch(QUERY);

    return content;
};

export const queryTermsAndConditions = async (): Promise<[SanityRichText]> => {
    const QUERY = `
        *[_type == "termsAndConditions"] {
        ...,
        content[] {
            _type,
            ...,
            defined(string) => string
        }
        }
    `;
    const content = await client.fetch(QUERY);

    return content;
};
