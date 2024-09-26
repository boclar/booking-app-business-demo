import { GlobalContext, GlobalContextProps } from '@/components/global-context';
import { AuthenticationProvider } from '@/context/authentication/authentication.context';
import {
    render,
    renderHook,
    RenderHookOptions,
    RenderHookResult,
} from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import React from 'react';

export const WithAuthContext = ({ children, ...props }: GlobalContextProps) => {
    return (
        <GlobalContext {...props}>
            <AuthenticationProvider>{children}</AuthenticationProvider>
        </GlobalContext>
    );
};

export const renderHookAuthContext = <TProps = unknown, TResult = unknown>(
    callback: (props: TProps) => TResult,
    options?: RenderHookOptions<TProps>
): RenderHookResult<TResult, TProps> => {
    return renderHook(callback, {
        wrapper: WithAuthContext,
        ...options,
    });
};

export const renderWithAuthContext = (
    ui: Parameters<typeof render>[0],
    options?: Parameters<typeof render>[1]
) => render(<WithAuthContext>{ui}</WithAuthContext>, options);

export const renderWithContext = (
    ui: Parameters<typeof render>[0],
    options?: Parameters<typeof render>[1]
) => render(<GlobalContext>{ui}</GlobalContext>, options);

export const renderRouterWithContext = (
    ...params: Parameters<typeof renderRouter>
) =>
    renderRouter(params[0], {
        wrapper: GlobalContext,
        ...params[1],
    });

export const renderHookWithContext = <TProps = unknown, TResult = unknown>(
    callback: (props: TProps) => TResult,
    options?: RenderHookOptions<TProps>
): RenderHookResult<TResult, TProps> => {
    return renderHook(callback, {
        wrapper: GlobalContext,
        ...options,
    });
};
