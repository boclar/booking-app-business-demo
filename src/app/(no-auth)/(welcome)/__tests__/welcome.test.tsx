import { act, renderRouter, screen } from 'expo-router/testing-library';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { GlobalContext } from '@/components/global-context';

const previewDemoWebId = 'preview_demo_web';
const previewDemoMobileId = 'preview_demo_mobile';
const createBusinessButtonId = 'create_business_button';
const loginButtonId = 'login_button';
const appLogoId = 'app_logo';
const appNameId = 'app_name';
const appDescriptionId = 'app_description';
const swiperContainerId = 'swiper_container';
const scrollViewId = 'scroll_view';

jest.useFakeTimers();

describe('Welcome screen', () => {
    beforeEach(() => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        jest.clearAllMocks();
    });

    it('renders correctly', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'android');
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        await act(() => {
            expect(screen).toHavePathname('/welcome');
        });
        platformSpy.restore();
    });

    it('renders a specific <PreviewDemo/> component on web', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'web');
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        await act(async () => {
            const previewDemo = screen.getByTestId(previewDemoWebId);
            expect(previewDemo).toBeDefined();
        });

        platformSpy.restore();
    });

    it('renders buttons for creating a business and logging in', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        await waitFor(async () => {
            const createBusinessButton = screen.getByTestId(
                createBusinessButtonId
            );
            expect(createBusinessButton).toBeDefined();

            const loginButton = screen.getByTestId(loginButtonId);
            expect(loginButton).toBeDefined();
        });
    });

    it('renders the app logo and name', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        await waitFor(async () => {
            const appLogo = screen.getByTestId(appLogoId);
            expect(appLogo).toBeDefined();

            const appName = screen.getByTestId(appNameId);
            expect(appName).toBeDefined();
        });
    });

    it('renders app description', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        await waitFor(async () => {
            const appDescription = screen.getByTestId(appDescriptionId);
            expect(appDescription).toBeDefined();
        });
    });

    it('test onLayout triggered on swiper container and checks if preview demo exist for mobile', async () => {
        const platformSpy = jest.replaceProperty(Platform, 'OS', 'android');
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        fireEvent(screen.getByTestId(swiperContainerId), 'layout', {
            nativeEvent: {
                layout: {
                    height: 100,
                    width: 100,
                },
            },
        });

        await waitFor(async () => {
            const swiperContainer = screen.getByTestId(swiperContainerId);

            expect(swiperContainer).toBeDefined();
            expect(screen.getByTestId(previewDemoMobileId)).toBeDefined();
        });

        platformSpy.restore();
    });

    it('scroll is enabled on web', async () => {
        Platform.OS = 'web';
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        await waitFor(async () => {
            const scrollView = screen.getByTestId(scrollViewId);
            expect(scrollView).toBeDefined();
            expect(scrollView).toHaveProp('scrollEnabled', true);
        });
    });

    it('scroll is not enabled on mobile', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        await waitFor(async () => {
            const scrollView = screen.queryByTestId(scrollViewId);
            expect(scrollView).toHaveProp('scrollEnabled', false);
        });
    });

    it('takes user to the create business screen', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        const createBusinessButton = screen.getByTestId(createBusinessButtonId);
        fireEvent.press(createBusinessButton);

        await act(async () => {
            expect(screen).toHavePathname('/create-business');
        });
    });

    it('redirects user to the login screen', async () => {
        renderRouter(
            {
                appDir: 'src/app/(no-auth)/(welcome)',
                overrides: {},
            },
            {
                initialUrl: '/welcome',
                wrapper: GlobalContext,
            }
        );

        const loginButton = screen.getByTestId(loginButtonId);
        fireEvent.press(loginButton);

        await act(async () => {
            expect(screen).toHavePathname('/login');
        });
    });
});
