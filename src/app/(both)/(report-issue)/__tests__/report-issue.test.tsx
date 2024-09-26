import {
    act,
    fireEvent,
    renderRouter,
    screen,
    waitFor,
} from 'expo-router/testing-library';
import * as Sentry from '@sentry/react-native';
import * as ExpoRouter from 'expo-router';
import { getSentryLevel } from '../report-issue';
import { Platform } from 'react-native';
import { WithAuthContext } from '@/utils/testing-library/testing-library.utils';
import { GlobalContext } from '@/components/global-context';

const submitId = 'submit-report-issue';
const issueTypeInputId = 'issue-type-input';
const issueDescriptionInputId = 'issue-description-input';
const backBtn = 'cancel-report-issue';

jest.useFakeTimers();

jest.mock('expo-router', () => {
    const originalModule = jest.requireActual('expo-router');
    return {
        ...originalModule,
        router: {
            ...originalModule.router,
            back: jest.fn(),
            replace: jest.fn(),
        },
    };
});

describe('ReportIssue screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('renders screen correctly', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'android');
        renderRouter(
            {
                appDir: 'src/app/(both)/(report-issue)',
                overrides: {},
            },
            {
                initialUrl: '/report-issue',
                wrapper: GlobalContext,
            }
        );
        await act(() => {
            expect(screen).toHavePathname('/report-issue');
        });
        platformSpy.restore();
    });

    it('shows error message when submitting empty form', async () => {
        renderRouter(
            {
                appDir: 'src/app/(both)/(report-issue)',
                overrides: {},
            },
            {
                initialUrl: '/report-issue',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/report-issue');
        });

        const submitButton = screen.getByTestId(submitId);
        await act(() => {
            fireEvent.press(submitButton);
        });

        await waitFor(() => {
            expect(
                screen.getByText('Type of issue is required')
            ).toBeOnTheScreen();
            expect(screen.getByText('Comments is required')).toBeOnTheScreen();
        });
    });

    it('submits report critical issue form correctly', async () => {
        renderRouter(
            {
                appDir: 'src/app/(both)/(report-issue)',
                overrides: {},
            },
            {
                initialUrl: '/report-issue',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {
            expect(screen).toHavePathname('/report-issue');
        });

        const issueTypeInput = screen.getByTestId(issueTypeInputId);
        const issueDescriptionInput = screen.getByTestId(
            issueDescriptionInputId
        );
        const submitButton = screen.getByTestId(submitId);

        fireEvent(issueTypeInput, 'onChangeOption', 'critical');
        fireEvent.changeText(issueDescriptionInput, 'This is a test issue');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(
                screen.queryByText('Type of issue is required')
            ).not.toBeOnTheScreen();
            expect(
                screen.queryByText('Comments is required')
            ).not.toBeOnTheScreen();

            expect(Sentry.captureEvent).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    extra: {
                        issueDescription: 'This is a test issue',
                        issueType: 'critical',
                    },
                    level: 'fatal',
                    message: 'Issue reported by user',
                    tags: {
                        isPriority: true,
                    },
                })
            );
            expect(Sentry.captureUserFeedback).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    comments: 'This is a test issue',
                })
            );
        });

        await act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Check form is reset, and no error messages are shown
        expect(issueTypeInput).toHaveProp('value', '');
        expect(issueDescriptionInput).toHaveProp('value', '');
        expect(
            screen.queryByText('Type of issue is required')
        ).not.toBeOnTheScreen();
        expect(
            screen.queryByText('Comments is required')
        ).not.toBeOnTheScreen();
    });

    it('goes back to / on back button press when cannot go back in history', async () => {
        renderRouter(
            {
                appDir: 'src/app/(both)/(report-issue)',
                overrides: {},
            },
            {
                initialUrl: '/report-issue',
                wrapper: WithAuthContext,
            }
        );

        await waitFor(() => {});

        const backButton = screen.getByTestId(backBtn);
        fireEvent.press(backButton);

        await waitFor(() => {
            expect(ExpoRouter.router.replace).toHaveBeenNthCalledWith(1, '/');
        });
    });

    it('goes back in history on back button press', async () => {
        jest.spyOn(ExpoRouter.router, 'canGoBack').mockReturnValue(true);
        renderRouter(
            {
                appDir: 'src/app/(both)/(report-issue)',
                overrides: {},
            },
            {
                initialUrl: '/report-issue',
                wrapper: GlobalContext,
            }
        );

        await waitFor(() => {});

        const backButton = screen.getByTestId(backBtn);
        fireEvent.press(backButton);

        await waitFor(() => {
            expect(ExpoRouter.router.back).toHaveBeenCalledTimes(1);
        });
    });

    it('returns the corresponding issue severity correctly', () => {
        expect(getSentryLevel('critical')).toBe('fatal');
        expect(getSentryLevel('high')).toBe('error');
        expect(getSentryLevel('medium')).toBe('warning');
        expect(getSentryLevel('low')).toBe('info');
    });
});
