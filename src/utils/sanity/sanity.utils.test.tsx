import {
    formatSanityRichText,
    renderSanityRichText,
    queryPrivacyPolicy,
    queryTermsAndConditions,
} from '@/utils/sanity/sanity.utils';
import { client } from '@/libs/sanity/sanity.libs';
import { useTheme } from '@boclar/booking-app-components';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { SanityRichText } from '@/types/sanity.types';
import {
    renderHookWithContext,
    renderWithContext,
} from '../testing-library/testing-library.utils';
import { lightMobileTheme } from '@/theme/light-mobile.theme';

// Mock the client.fetch method
jest.mock('@/libs/sanity/sanity.libs', () => ({
    client: {
        fetch: jest.fn(),
    },
}));

const sanityWithHeading: SanityRichText = {
    _rev: 'o4nPZJH5mYBHWbsaCz8QND',
    _type: 'termsAndConditions',
    _createdAt: '2024-08-19T18:34:32Z',
    _id: '4e60bc88-d1f2-4bfb-9d48-d2adc4647403',
    title: 'booking-app-business',
    _updatedAt: '2024-08-21T04:05:32Z',
    content: [
        {
            _type: 'block',
            children: [
                {
                    text: 'Heading 1',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: [],
                },
            ],
            style: 'h1',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
        {
            _type: 'block',
            children: [
                {
                    text: 'Heading 2',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: [],
                },
            ],
            style: 'h2',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
        {
            _type: 'block',
            children: [
                {
                    text: 'Heading 3',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: [],
                },
            ],
            style: 'h3',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
    ],
    createdDate: '2024-08-19T18:34:00.000Z',
    lastUpdated: '2024-08-21T02:10:00.000Z',
};

const sanityWithParagraph: SanityRichText = {
    _rev: 'o4nPZJH5mYBHWbsaCz8QND',
    _type: 'termsAndConditions',
    _createdAt: '2024-08-19T18:34:32Z',
    _id: '4e60bc88-d1f2-4bfb-9d48-d2adc4647403',
    title: 'booking-app-business',
    _updatedAt: '2024-08-21T04:05:32Z',
    content: [
        {
            _type: 'block',
            children: [
                {
                    text: 'Paragraph text',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: [],
                },
            ],
            style: 'normal',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
    ],
    createdDate: '2024-08-19T18:34:00.000Z',
    lastUpdated: '2024-08-21T02:10:00.000Z',
};

const paragraphsWithStyles: SanityRichText = {
    _rev: 'o4nPZJH5mYBHWbsaCz8QND',
    _type: 'termsAndConditions',
    _createdAt: '2024-08-19T18:34:32Z',
    _id: '4e60bc88-d1f2-4bfb-9d48-d2adc4647403',
    title: 'booking-app-business',
    _updatedAt: '2024-08-21T04:05:32Z',
    content: [
        {
            _type: 'block',
            children: [
                {
                    text: 'Bold',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: ['strong'],
                },
            ],
            style: 'normal',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
        {
            _type: 'block',
            children: [
                {
                    text: 'Italic',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: ['em'],
                },
            ],
            style: 'normal',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
        {
            _type: 'block',
            children: [
                {
                    text: 'Bold and Italic',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: ['strong', 'em'],
                },
            ],
            style: 'normal',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
        {
            _type: 'block',
            children: [
                {
                    text: 'Underline',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: ['underline'],
                },
            ],
            style: 'normal',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
        {
            _type: 'block',
            children: [
                {
                    text: 'Line Through',
                    _key: 'b368ce9e9ca70',
                    _type: 'span',
                    marks: ['strike-through'],
                },
            ],
            style: 'normal',
            _key: '8f4bf4ba57ad',
            markDefs: [],
        },
    ],
    createdDate: '2024-08-19T18:34:00.000Z',
    lastUpdated: '2024-08-21T02:10:00.000Z',
};

describe('Sanity Utils', () => {
    describe('formatSanityRichText', () => {
        it('formats heading blocks correctly', () => {
            const result = formatSanityRichText([sanityWithHeading]);
            expect(result).toEqual([
                {
                    content: 'Heading 1',
                    style: [],
                    type: 'heading',
                },
                {
                    content: 'Heading 2',
                    style: [],
                    type: 'heading',
                },
                {
                    content: 'Heading 3',
                    style: [],
                    type: 'heading',
                },
            ]);
        });

        it('formats paragraph blocks correctly', () => {
            const result = formatSanityRichText([sanityWithParagraph]);
            expect(result).toEqual([
                {
                    content: [
                        {
                            content: 'Paragraph text',
                            style: [],
                            type: 'paragraph',
                        },
                    ],
                    style: [],
                    type: 'paragraph',
                },
            ]);
        });
    });

    describe('renderSanityRichText', () => {
        const { theme } = renderHookWithContext(() => useTheme()).result
            .current;

        it('renders heading blocks correctly', () => {
            const result = formatSanityRichText([sanityWithHeading]);

            renderWithContext(
                <>
                    {renderSanityRichText({ formattedRichText: result, theme })}
                </>
            );

            expect(screen.getByText('Heading 1')).toBeOnTheScreen();
        });

        it('renders paragraph blocks correctly', () => {
            const result = formatSanityRichText([sanityWithParagraph]);

            renderWithContext(
                <>
                    {renderSanityRichText({ formattedRichText: result, theme })}
                </>
            );
            expect(screen.getByText('Paragraph text')).toBeOnTheScreen();
        });

        it('renders paragraph blocks with styles correctly', () => {
            const result = formatSanityRichText([paragraphsWithStyles]);

            renderWithContext(
                <>
                    {renderSanityRichText({ formattedRichText: result, theme })}
                </>
            );
            expect(screen.getByText('Bold')).toHaveStyle({
                fontFamily: lightMobileTheme.typography.fontFamily.body.bold,
            });
            expect(screen.getByText('Italic')).toHaveStyle({
                fontFamily: lightMobileTheme.typography.fontFamily.body.italic,
            });
            expect(screen.getByText('Bold and Italic')).toHaveStyle({
                fontFamily:
                    lightMobileTheme.typography.fontFamily.body.boldItalic,
            });
            expect(screen.getByText('Underline')).toHaveStyle({
                textDecorationLine: 'underline',
            });
            expect(screen.getByText('Line Through')).toHaveStyle({
                textDecorationLine: 'line-through',
            });
        });
    });

    describe('queryPrivacyPolicy', () => {
        it('fetches privacy policy content', async () => {
            const mockContent = [{ content: 'Privacy Policy Content' }];
            (client.fetch as jest.Mock).mockResolvedValue(mockContent);

            const result = await queryPrivacyPolicy();
            expect(result).toEqual(mockContent);
            expect(client.fetch).toHaveBeenCalledWith(expect.any(String));
        });
    });

    describe('queryTermsAndConditions', () => {
        it('fetches terms and conditions content', async () => {
            const mockContent = [{ content: 'Terms and Conditions Content' }];
            (client.fetch as jest.Mock).mockResolvedValue(mockContent);

            const result = await queryTermsAndConditions();
            expect(result).toEqual(mockContent);
            expect(client.fetch).toHaveBeenCalledWith(expect.any(String));
        });
    });
});
