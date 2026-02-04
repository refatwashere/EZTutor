import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard hero heading', () => {
  render(<App />);
  const heading = screen.getByText(/teaching, streamlined\./i);
  expect(heading).toBeInTheDocument();
});
