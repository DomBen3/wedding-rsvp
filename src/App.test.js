import { render, screen } from '@testing-library/react';
import App from './App';

test('renders wedding hero title', () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /dominic\s*&\s*anna/i })).toBeInTheDocument();
});
