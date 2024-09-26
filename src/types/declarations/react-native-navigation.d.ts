import React from 'react';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ScreenProps } from 'react-native-screens';

declare module '@react-navigation/native-stack' {
    interface NativeStackNavigationOptions {
        /**
         * How the screen should animate when pushed or popped.
         *
         * Supported values:
         * - "default": use the platform default animation
         * - "fade": fade screen in or out
         * - "flip": flip the screen, requires presentation: "modal" (iOS only)
         * - "simple_push": use the platform default animation, but without shadow and native header transition (iOS only)
         * - "slide_from_bottom": slide in the new screen from bottom
         * - "slide_from_right": slide in the new screen from right (Android only, uses default animation on iOS)
         * - "slide_from_left": slide in the new screen from left (Android only, uses default animation on iOS)
         * - "none": don't animate the screen
         *
         * Only supported on iOS and Android.
         */
        animation?: ScreenProps['stackAnimation'];
        /**
         * Changes the duration (in milliseconds) of `slide_from_bottom`, `fade_from_bottom`, `fade` and `simple_push` transitions on iOS. Defaults to `350`.
         * The duration of `default` and `flip` transitions isn't customizable.
         *
         * @platform ios
         */
        animationDuration?: number;
        /**
         * The type of animation to use when this screen replaces another screen. Defaults to `pop`.
         *
         * Supported values:
         * - "push": the new screen will perform push animation.
         * - "pop": the new screen will perform pop animation.
         *
         * Only supported on iOS and Android.
         */
        animationTypeForReplace?: ScreenProps['replaceAnimation'];
        /**
         * Whether the home indicator should prefer to stay hidden on this screen. Defaults to `false`.
         *
         * @platform ios
         */
        autoHideHomeIndicator?: boolean;
        /**
         * Whether the back button should be visible or not. Defaults to `true`.
         */
        backButtonVisible?: boolean;
        /**
         * Whether the bottom border should be visible or not. Defaults to `false`.
         */
        bottomBorderVisible?: boolean;
        /**
         * Style object for the scene content.
         */
        contentStyle?: StyleProp<ViewStyle>;
        /**
         * Whether the gesture to dismiss should use animation provided to `animation` prop. Defaults to `false`.
         *
         * Doesn't affect the behavior of screens presented modally.
         *
         * @platform ios
         */
        customAnimationOnGesture?: boolean;
        /**
         * Whether inactive screens should be suspended from re-rendering. Defaults to `false`.
         * Defaults to `true` when `enableFreeze()` is run at the top of the application.
         * Requires `react-native-screens` version >=3.16.0.
         *
         * Only supported on iOS and Android.
         */
        freezeOnBlur?: boolean;
        /**
         * Whether the gesture to dismiss should work on the whole screen. Using gesture to dismiss with this option results in the same
         * transition animation as `simple_push`. This behavior can be changed by setting `customAnimationOnGesture` prop. Achieving the
         * default iOS animation isn't possible due to platform limitations. Defaults to `false`.
         *
         * Doesn't affect the behavior of screens presented modally.
         *
         * @platform ios
         */
        fullScreenGestureEnabled?: boolean;
        /**
         * Sets the direction in which you should swipe to dismiss the screen.
         * When using `vertical` option, options `fullScreenGestureEnabled: true`, `customAnimationOnGesture: true` and `animation: 'slide_from_bottom'` are set by default.
         *
         * Supported values:
         * - `vertical` – dismiss screen vertically
         * - `horizontal` – dismiss screen horizontally (default)
         *
         * @platform ios
         */
        gestureDirection?: ScreenProps['swipeDirection'];
        /**
         * Whether you can use gestures to dismiss this screen. Defaults to `true`.
         *
         * Only supported on iOS.
         *
         * @platform ios
         */
        gestureEnabled?: boolean;
        /**
         * Function that given `HeaderProps` returns a React Element to display as a header.
         */
        header?: (props: NativeStackHeaderProps) => React.ReactNode;

        /**
         * Function which returns a React Element to display on the left side of the header.
         * This replaces the back button. See `headerBackVisible` to show the back button along side left element.
         */
        headerLeft?: React.ReactNode;
        /**
         * Function which returns a React Element to display on the right side of the header.
         */
        headerRight?: React.ReactNode;
        /**
         * Whether to show the header. The header is shown by default.
         * Setting this to `false` hides the header.
         */
        headerShown?: boolean;
        /**
         * Style object for header. Supported properties:
         * - backgroundColor
         */
        headerStyle?: StyleProp<{
            backgroundColor?: string;
        }>;
        /**
         * Tint color for the header. Changes the color of back button and title.
         */
        headerTintColor?: string;
        /**
         * How to align the the header title.
         * Defaults to `left` on platforms other than iOS.
         *
         * Not supported on iOS. It's always `center` on iOS and cannot be changed.
         */
        headerTitleAlign?: 'left' | 'center';
        /**
         * Sets the navigation bar color. Defaults to initial navigation bar color.
         *
         * @platform android
         */
        navigationBarColor?: string;
        /**
         * Sets the visibility of the navigation bar. Defaults to `false`.
         *
         * @platform android
         */
        navigationBarHidden?: boolean;
        /**
         * The display orientation to use for the screen.
         *
         * Supported values:
         * - "default" - resolves to "all" without "portrait_down" on iOS. On Android, this lets the system decide the best orientation.
         * - "all": all orientations are permitted.
         * - "portrait": portrait orientations are permitted.
         * - "portrait_up": right-side portrait orientation is permitted.
         * - "portrait_down": upside-down portrait orientation is permitted.
         * - "landscape": landscape orientations are permitted.
         * - "landscape_left": landscape-left orientation is permitted.
         * - "landscape_right": landscape-right orientation is permitted.
         *
         * Only supported on iOS and Android.
         */
        orientation?: ScreenProps['screenOrientation'];
        /**
         * How should the screen be presented.
         *
         * Supported values:
         * - "card": the new screen will be pushed onto a stack, which means the default animation will be slide from the side on iOS, the animation on Android will vary depending on the OS version and theme.
         * - "modal": the new screen will be presented modally. this also allows for a nested stack to be rendered inside the screen.
         * - "transparentModal": the new screen will be presented modally, but in addition, the previous screen will stay so that the content below can still be seen if the screen has translucent background.
         * - "containedModal": will use "UIModalPresentationCurrentContext" modal style on iOS and will fallback to "modal" on Android.
         * - "containedTransparentModal": will use "UIModalPresentationOverCurrentContext" modal style on iOS and will fallback to "transparentModal" on Android.
         * - "fullScreenModal": will use "UIModalPresentationFullScreen" modal style on iOS and will fallback to "modal" on Android.
         * - "formSheet": will use "UIModalPresentationFormSheet" modal style on iOS and will fallback to "modal" on Android.
         *
         * Only supported on iOS and Android.
         */
        presentation?:
            | Exclude<ScreenProps['stackPresentation'], 'push'>
            | 'card';
        /**
         * Sets the status bar animation (similar to the `StatusBar` component).
         * Requires setting `View controller-based status bar appearance -> YES` (or removing the config) in your `Info.plist` file.
         *
         * Only supported on iOS.
         *
         * @platform ios
         */
        statusBarAnimation?: ScreenProps['statusBarAnimation'];
        /**
         * Sets the status bar color (similar to the `StatusBar` component). Defaults to initial status bar color.
         *
         * @platform android
         */
        statusBarColor?: string;
        /**
         * Whether the status bar should be hidden on this screen.
         * Requires setting `View controller-based status bar appearance -> YES` in your Info.plist file.
         *
         * Only supported on iOS.
         *
         * @platform ios
         */
        statusBarHidden?: boolean;
        /**
         * Sets the status bar color (similar to the `StatusBar` component).
         * Requires setting `View controller-based status bar appearance -> YES` (or removing the config) in your `Info.plist` file.
         *
         * Only supported on iOS.
         *
         * @platform ios
         */
        statusBarStyle?: ScreenProps['statusBarStyle'];
        /**
         * Sets the translucency of the status bar. Defaults to `false`.
         *
         * @platform android
         */
        statusBarTranslucent?: boolean;
        /**
         * String that can be displayed in the header as a fallback for `headerTitle`.
         */
        title?: string;
    }
}
