import { render, screen } from '@testing-library/react';
import App from './App';

// Minimal smoke test to ensure the app renders without crashing
it('renders Smart Pantry shell', () => {
  render(<App />);
  // Assert on the app brand text which is always visible in the sidebar
  expect(screen.getByText(/Smart Pantry/i)).toBeInTheDocument();
});
