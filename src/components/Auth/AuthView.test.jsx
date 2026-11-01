import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuthView from './AuthView';
import apiClient from '../../utils/apiClient';

jest.mock('../../utils/apiClient', () => ({
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn() }
}));
jest.mock('../InstallPWA', () => () => null);
jest.mock('../GooglePlayButton', () => () => null);

const renderAuthView = () => render(
    <AuthView
        onLoginSuccess={jest.fn()}
        showModalMessage={jest.fn()}
        isRegister={false}
        setIsRegister={jest.fn()}
        mainTitle="Log In"
        onShowTerms={jest.fn()}
        onShowPrivacy={jest.fn()}
        userCount={0}
    />
);

beforeEach(() => {
    apiClient.get.mockResolvedValue({ data: { active: false } });
    apiClient.post.mockReset();
    window.localStorage.clear();
});

it('requests sign-in email recovery using the verified recovery address', async () => {
    apiClient.post.mockResolvedValue({ data: { message: 'If a verified recovery email matches, the sign-in email has been sent.' } });
    renderAuthView();

    fireEvent.click(screen.getByRole('button', { name: 'Forgot Username?' }));
    fireEvent.change(screen.getByPlaceholderText('Verified Recovery Email *'), {
        target: { value: 'recovery@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send Sign-in Email' }));

    await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-username', {
            recoveryEmail: 'recovery@example.com'
        });
    });
    expect((await screen.findByRole('status')).textContent).toContain(
        'If a verified recovery email matches, the sign-in email has been sent.'
    );
});
