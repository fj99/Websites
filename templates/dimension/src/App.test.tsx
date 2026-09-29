import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { content } from './content';

describe('Dimension template', () => {
  it('renders content-driven hero copy', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /Reality, remixed\./ })).toBeInTheDocument();
  });

  it('switches interactive worlds', () => {
    render(<App />);
    const fold = screen.getByRole('button', { name: /Fold/ });
    fireEvent.click(fold);
    expect(fold).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(content.worlds[1].description)).toBeInTheDocument();
  });

  it('validates the contact form', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(content.contact.submitLabel, 'i') }));
    expect(screen.getByText(content.contact.emptyMessage)).toBeInTheDocument();
  });
});
