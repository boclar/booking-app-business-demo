jest.mock('react-redux', () => {
    const originalModule = jest.requireActual('react-redux');
    const mockUseDispatch = jest.fn().mockImplementation(() => {
        const dispatch = jest.fn();
        return dispatch;
    });
    Object.assign(mockUseDispatch, {
        withTypes: jest.fn(() => mockUseDispatch),
    });
    return {
        ...originalModule,
        useDispatch: mockUseDispatch,
    };
});