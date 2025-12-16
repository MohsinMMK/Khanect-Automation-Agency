import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQItem from '../FAQItem';

// Mock ChevronIcon
vi.mock('../icons/ChevronIcon', () => ({
  default: () => <span data-testid="chevron-icon">▼</span>,
}));

describe('FAQItem', () => {
  const defaultProps = {
    question: 'What is Khanect AI?',
    answer: 'Khanect AI is a business automation agency.',
    isOpen: false,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the question', () => {
      render(<FAQItem {...defaultProps} />);

      expect(screen.getByText('What is Khanect AI?')).toBeInTheDocument();
    });

    it('should render the answer', () => {
      render(<FAQItem {...defaultProps} />);

      expect(screen.getByText('Khanect AI is a business automation agency.')).toBeInTheDocument();
    });

    it('should render the chevron icon', () => {
      render(<FAQItem {...defaultProps} />);

      expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
    });

    it('should have a clickable button', () => {
      render(<FAQItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Open/Close State', () => {
    it('should have collapsed styling when closed', () => {
      render(<FAQItem {...defaultProps} isOpen={false} />);

      const answerContainer = screen.getByText('Khanect AI is a business automation agency.').parentElement?.parentElement;
      expect(answerContainer).toHaveClass('max-h-0');
      expect(answerContainer).toHaveClass('opacity-0');
    });

    it('should have expanded styling when open', () => {
      render(<FAQItem {...defaultProps} isOpen={true} />);

      const answerContainer = screen.getByText('Khanect AI is a business automation agency.').parentElement?.parentElement;
      expect(answerContainer).toHaveClass('max-h-96');
      expect(answerContainer).toHaveClass('opacity-100');
    });

    it('should rotate chevron when open', () => {
      render(<FAQItem {...defaultProps} isOpen={true} />);

      const chevronContainer = screen.getByTestId('chevron-icon').parentElement;
      expect(chevronContainer).toHaveClass('rotate-180');
    });

    it('should not rotate chevron when closed', () => {
      render(<FAQItem {...defaultProps} isOpen={false} />);

      const chevronContainer = screen.getByTestId('chevron-icon').parentElement;
      expect(chevronContainer).not.toHaveClass('rotate-180');
    });
  });

  describe('Interaction', () => {
    it('should call onToggle when button is clicked', () => {
      const onToggle = vi.fn();
      render(<FAQItem {...defaultProps} onToggle={onToggle} />);

      fireEvent.click(screen.getByRole('button'));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when clicking on question text', () => {
      const onToggle = vi.fn();
      render(<FAQItem {...defaultProps} onToggle={onToggle} />);

      // Click on the question - it's inside the button
      fireEvent.click(screen.getByText('What is Khanect AI?'));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have button with text alignment left', () => {
      render(<FAQItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-left');
    });

    it('should have full width button for easy clicking', () => {
      render(<FAQItem {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Different Content', () => {
    it('should render long questions correctly', () => {
      const longQuestion = 'This is a very long question that might span multiple lines and needs to be displayed correctly?';

      render(<FAQItem {...defaultProps} question={longQuestion} />);

      expect(screen.getByText(longQuestion)).toBeInTheDocument();
    });

    it('should render long answers correctly', () => {
      const longAnswer = 'This is a very long answer that provides detailed information about the topic. '.repeat(5).trim();

      render(<FAQItem {...defaultProps} answer={longAnswer} />);

      expect(screen.getByText(longAnswer)).toBeInTheDocument();
    });
  });
});
