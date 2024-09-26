import { GlobalContext } from '@/components/global-context';
import {
    act,
    fireEvent,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { client } from '../../../../libs/sanity/sanity.libs';
import { DateTime } from 'luxon';

jest.mock('@sanity/client', () => {
    return {
        createClient: jest.fn(() => ({
            fetch: () => [
                {
                    _rev: 'o4nPZJH5mYBHWbsaCz8QND',
                    _updatedAt: '2024-08-21T04:05:32Z',
                    _type: 'termsAndConditions',
                    content: [
                        {
                            _type: 'block',
                            markDefs: [],
                            children: [
                                {
                                    _key: 'b368ce9e9ca70',
                                    _type: 'span',
                                    marks: [],
                                    text: 'Heading #1',
                                },
                            ],
                            style: 'h4',
                            _key: '8f4bf4ba57ad',
                        },
                        {
                            _type: 'block',
                            style: 'normal',
                            _key: '221eab84652a',
                            markDefs: [],
                            children: [
                                {
                                    _type: 'span',
                                    marks: [],
                                    text: 'New paragraph',
                                    _key: 'f5fe44b139a20',
                                },
                            ],
                        },
                    ],
                    lastUpdated: '2024-08-21T02:10:00.000Z',
                    _createdAt: '2024-08-19T18:34:32Z',
                    createdDate: '2024-08-19T18:34:00.000Z',
                    title: 'booking-app-business',
                    _id: '4e60bc88-d1f2-4bfb-9d48-d2adc4647403',
                },
            ],
        })),
    };
});

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');
    return {
        ...originalModule,
        router: {
            ...originalModule.router,
            back: jest.fn(),
            canGoBack: jest.fn(),
            navigate: jest.fn(),
        },
    };
});

const closeBtnId = 'close-terms-and-conditions';

describe('TermsAndConditions screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders screen correctly', async () => {
        renderRouter(
            {
                appDir: 'src/app/(both)/(terms-and-conditions)',
                overrides: {},
            },
            {
                initialUrl: '/terms-and-conditions',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/terms-and-conditions');
        });

        expect(
            screen.getByText(
                `Last updated: ${DateTime.fromISO(
                    '2024-08-21T02:10:00.000Z'
                ).toLocaleString(DateTime.DATE_FULL)}`
            )
        ).toBeOnTheScreen();
        expect(screen.getByText('Heading #1')).toBeOnTheScreen();
        expect(screen.getByText('New paragraph')).toBeOnTheScreen();
        expect(screen.queryByTestId(closeBtnId)).not.toBeOnTheScreen();
    });

    it('close btn should be visible on web', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'web');

        renderRouter(
            {
                appDir: 'src/app/(both)/(terms-and-conditions)',
                overrides: {},
            },
            {
                initialUrl: '/terms-and-conditions',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/terms-and-conditions');
        });

        expect(screen.getByTestId(closeBtnId)).toBeOnTheScreen();
        expect(
            screen.getByText(
                `Last updated: ${DateTime.fromISO(
                    '2024-08-21T02:10:00.000Z'
                ).toLocaleString(DateTime.DATE_FULL)}`
            )
        ).toBeOnTheScreen();
        expect(screen.getByText('Heading #1')).toBeOnTheScreen();

        platformSpy.restore();
    });

    it('goes back to / when there is no back history', async () => {
        jest.replaceProperty(Platform, 'OS', 'web');

        renderRouter(
            {
                appDir: 'src/app/(both)/(terms-and-conditions)',
                overrides: {},
            },
            {
                initialUrl: '/terms-and-conditions',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/terms-and-conditions');
        });

        await act(() => {
            fireEvent(screen.getByTestId(closeBtnId), 'onPointerDown');
        });

        expect(router.navigate).toHaveBeenCalledWith('/');
    });

    it('calls back from router when there is back history', async () => {
        const canGoBackSpy = jest
            .spyOn(router, 'canGoBack')
            .mockReturnValue(true);
        const backSpy = jest.spyOn(router, 'back');
        jest.replaceProperty(Platform, 'OS', 'web');

        renderRouter(
            {
                appDir: 'src/app/(both)/(terms-and-conditions)',
                overrides: {},
            },
            {
                initialUrl: '/terms-and-conditions',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/terms-and-conditions');
        });

        await act(() => {
            fireEvent(screen.getByTestId(closeBtnId), 'onPointerDown');
        });

        expect(router.back).toHaveBeenCalledTimes(1);

        backSpy.mockRestore();
        canGoBackSpy.mockRestore();
    });

    it('will display sanity created date field if lastUpdated is not available', async () => {
        const clientSpy = jest.spyOn(client, 'fetch').mockResolvedValue([
            {
                _rev: 'o4nPZJH5mYBHWbsaCz8QND',
                _updatedAt: '2024-08-21T04:05:32Z',
                _type: 'termsAndConditions',
                content: [],
                _createdAt: '2024-08-19T18:34:32Z',
                createdDate: '2024-08-19T18:34:00.000Z',
                title: 'booking-app-business',
                _id: '4e60bc88-d1f2-4bfb-9d48-d2adc4647403',
            },
        ] as any);

        renderRouter(
            {
                appDir: 'src/app/(both)/(terms-and-conditions)',
                overrides: {},
            },
            {
                initialUrl: '/terms-and-conditions',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/terms-and-conditions');
        });

        expect(
            screen.getByText('Last updated: August 19, 2024')
        ).toBeOnTheScreen();

        clientSpy.mockRestore();
    });
});
