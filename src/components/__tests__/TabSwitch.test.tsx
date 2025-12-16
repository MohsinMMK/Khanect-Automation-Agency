import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabSwitch from '../TabSwitch';

describe('TabSwitch', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab One' },
    { id: 'tab2', label: 'Tab Two' },
    { id: 'tab3', label: 'Tab Three' },
  ];

  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all tabs', () => {
      render(
        <TabSwitch tabs={mockTabs} activeTab="tab1" onTabChange={mockOnTabChange} />
      );

      expect(screen.getByText('Tab One')).toBeInTheDocument();
      expect(screen.getByText('Tab Two')).toBeInTheDocument();
      expect(screen.getByText('Tab Three')).toBeInTheDocument();
    });

    it('should render correct number of tab buttons', () => {
      render(
        <TabSwitch tabs={mockTabs} activeTab="tab1" onTabChange={mockOnTabChange} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Active Tab Styling', () => {
    it('should apply active styling to the active tab', () => {
      render(
        <TabSwitch tabs={mockTabs} activeTab="tab2" onTabChange={mockOnTabChange} />
      );

      const activeTab = screen.getByText('Tab Two');
      expect(activeTab).toHaveClass('text-gray-900');
    });

    it('should apply inactive styling to non-active tabs', () => {
      render(
        <TabSwitch tabs={mockTabs} activeTab="tab2" onTabChange={mockOnTabChange} />
      );

      const inactiveTab = screen.getByText('Tab One');
      expect(inactiveTab).toHaveClass('text-gray-600');
    });
  });

  describe('Interaction', () => {
    it('should call onTabChange when a tab is clicked', () => {
      render(
        <TabSwitch tabs={mockTabs} activeTab="tab1" onTabChange={mockOnTabChange} />
      );

      fireEvent.click(screen.getByText('Tab Two'));

      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
      expect(mockOnTabChange).toHaveBeenCalledWith('tab2');
    });

    it('should call onTabChange with correct id when different tabs are clicked', () => {
      render(
        <TabSwitch tabs={mockTabs} activeTab="tab1" onTabChange={mockOnTabChange} />
      );

      fireEvent.click(screen.getByText('Tab Three'));
      expect(mockOnTabChange).toHaveBeenCalledWith('tab3');

      fireEvent.click(screen.getByText('Tab One'));
      expect(mockOnTabChange).toHaveBeenCalledWith('tab1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tabs array', () => {
      render(
        <TabSwitch tabs={[]} activeTab="" onTabChange={mockOnTabChange} />
      );

      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('should handle single tab', () => {
      const singleTab = [{ id: 'only', label: 'Only Tab' }];

      render(
        <TabSwitch tabs={singleTab} activeTab="only" onTabChange={mockOnTabChange} />
      );

      expect(screen.getByText('Only Tab')).toBeInTheDocument();
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });
  });
});
