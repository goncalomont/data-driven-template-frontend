// app/components/Copyright.test.tsx
import React from 'react';
import { render, screen } from '../../tests/utils/renderWithProviders'; // Use the custom render
import Copyright from './Copyright'; // Import the component being tested

describe('Copyright Component', () => {
  it('should render the copyright text and link', () => {
    render(<Copyright />);

    // Check for the static text part
    expect(screen.getByText(/Copyright ©/i)).toBeInTheDocument();

    // Check for the link text
    const linkElement = screen.getByRole('link', { name: /Devoteam/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', 'https://devoteam.com/');
  });

  it('should render the current year', () => {
    render(<Copyright />);
    // Use the current date from the system running the test
    // Make sure your CI/local env has the correct date if this matters critically
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('should apply passed sx props', () => {
    const testId = 'copyright-component';
    // Apply some arbitrary sx props for testing
    render(<Copyright sx={{ color: 'red', mt: 5 }} data-testid={testId} />);

    const element = screen.getByTestId(testId);
    // Check computed styles. Note: exact value might depend on theme/browser environment.
    // Testing existence of style is often enough. Using rgb is more robust than color names.
    expect(element).toHaveStyle('color: rgb(255, 0, 0)');
    // Check margin based on theme spacing (assuming default theme spacing of 8px)
    expect(element).toHaveStyle('margin-top: 40px'); // mt: 5 * 8px = 40px
  });
});