// app/components/HighlightedCard.test.tsx
import React from 'react';
import { render, screen } from '../../tests/utils/renderWithProviders'; // Use the custom render
import userEvent from '@testing-library/user-event';
import HighlightedCard from './HiglightedCard'; // Import the component being tested

describe('HighlightedCard Component', () => {
  it('should render the card content correctly', () => {
    render(<HighlightedCard />);

    expect(screen.getByText(/Explore your data/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Uncover performance and visitor insights with our data wizardry\./i) // Add punctuation if needed
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get insights/i })).toBeInTheDocument();
    // Query the MUI icon by its data-testid attribute
    expect(screen.getByTestId('InsightsRoundedIcon')).toBeInTheDocument();
  });

  it('should render the button and allow clicking', async () => {
    // Setup user event for realistic interactions
    const user = userEvent.setup();
    render(<HighlightedCard />);

    const button = screen.getByRole('button', { name: /Get insights/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled(); // Check if the button is interactive

    // Simulate a user click
    await user.click(button);

    // Add assertions here if clicking the button was expected to cause a state change,
    // call a function (mocked), or navigate (using next-router-mock assertions).
    // For now, we just ensure it can be clicked without error.
  });
});