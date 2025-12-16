import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

// Mock child components to isolate App testing
vi.mock('../Navbar', () => ({
  default: vi.fn(({ currentView, onNavigate, theme, toggleTheme }) => (
    <nav data-testid="navbar">
      <span data-testid="current-view">{currentView}</span>
      <span data-testid="theme">{theme}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="nav-landing" onClick={() => onNavigate('LANDING')}>
        Landing
      </button>
      <button data-testid="nav-portal" onClick={() => onNavigate('PORTAL')}>
        Portal
      </button>
    </nav>
  )),
}));

vi.mock('../LandingPage', () => ({
  default: vi.fn(({ onNavigate }) => (
    <div data-testid="landing-page">
      <button data-testid="go-to-demo" onClick={() => onNavigate('DEMO')}>
        Open Demo
      </button>
    </div>
  )),
}));

vi.mock('../AiConsultant', () => ({
  default: vi.fn(({ onNavigate }) => (
    <div data-testid="ai-consultant">
      <button data-testid="close-consultant" onClick={onNavigate}>
        Close
      </button>
    </div>
  )),
}));

vi.mock('../ClientPortal', () => ({
  default: vi.fn(() => <div data-testid="client-portal">Client Portal</div>),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('Initial Render', () => {
    it('should render the navbar', () => {
      render(<App />);
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('should render landing page by default', () => {
      render(<App />);
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should start with LANDING view state', () => {
      render(<App />);
      expect(screen.getByTestId('current-view')).toHaveTextContent('LANDING');
    });

    it('should default to dark theme', () => {
      render(<App />);
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('should render chat FAB button on landing view', () => {
      render(<App />);
      expect(screen.getByRole('button', { name: /chat with ai/i })).toBeInTheDocument();
    });
  });

  describe('Theme Management', () => {
    it('should toggle theme from dark to light', () => {
      render(<App />);

      expect(screen.getByTestId('theme')).toHaveTextContent('dark');

      fireEvent.click(screen.getByTestId('toggle-theme'));

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });

    it('should toggle theme from light to dark', () => {
      render(<App />);

      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme')).toHaveTextContent('light');

      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });

    it('should persist theme to localStorage', async () => {
      render(<App />);

      fireEvent.click(screen.getByTestId('toggle-theme'));

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      });
    });

    it('should load theme from localStorage', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('light');

      render(<App />);

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
  });

  describe('View Navigation', () => {
    it('should navigate to DEMO view when FAB is clicked', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /chat with ai/i }));

      expect(screen.getByTestId('current-view')).toHaveTextContent('DEMO');
      expect(screen.getByTestId('ai-consultant')).toBeInTheDocument();
    });

    it('should navigate to PORTAL view', () => {
      render(<App />);

      fireEvent.click(screen.getByTestId('nav-portal'));

      expect(screen.getByTestId('current-view')).toHaveTextContent('PORTAL');
      expect(screen.getByTestId('client-portal')).toBeInTheDocument();
    });

    it('should navigate back to LANDING from PORTAL', () => {
      render(<App />);

      fireEvent.click(screen.getByTestId('nav-portal'));
      fireEvent.click(screen.getByTestId('nav-landing'));

      expect(screen.getByTestId('current-view')).toHaveTextContent('LANDING');
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should hide FAB when in DEMO view', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /chat with ai/i }));

      expect(screen.queryByRole('button', { name: /chat with ai/i })).not.toBeInTheDocument();
    });

    it('should keep landing page visible in DEMO view', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /chat with ai/i }));

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      expect(screen.getByTestId('ai-consultant')).toBeInTheDocument();
    });

    it('should hide landing page in PORTAL view', () => {
      render(<App />);

      fireEvent.click(screen.getByTestId('nav-portal'));

      expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });
  });

  describe('Scroll to Top Button', () => {
    it('should have scroll to top button initially hidden', () => {
      render(<App />);

      const scrollButton = screen.getByRole('button', { name: /scroll to top/i });
      expect(scrollButton).toHaveClass('opacity-0');
    });

    it('should show scroll to top button after scrolling', async () => {
      render(<App />);

      // Simulate scroll event
      Object.defineProperty(window, 'scrollY', { value: 600, writable: true });
      fireEvent.scroll(window);

      await waitFor(() => {
        const scrollButton = screen.getByRole('button', { name: /scroll to top/i });
        expect(scrollButton).toHaveClass('opacity-100');
      });
    });

    it('should call scrollTo when scroll to top is clicked', () => {
      render(<App />);

      const scrollButton = screen.getByRole('button', { name: /scroll to top/i });
      fireEvent.click(scrollButton);

      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('Footer', () => {
    it('should render footer with copyright', () => {
      render(<App />);

      expect(screen.getByText(/2025 Khanect Ai/i)).toBeInTheDocument();
    });
  });
});
