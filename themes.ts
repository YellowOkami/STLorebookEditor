
export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: {
    '--color-bg-primary': string;
    '--color-bg-secondary': string;
    '--color-bg-tertiary': string;
    '--color-text-primary': string;
    '--color-text-secondary': string;
    '--color-border': string;
    '--color-interactive': string;
    '--color-interactive-hover': string;
    '--color-interactive-text': string;
    '--color-accent': string;
    '--color-danger': string;
    '--color-danger-hover': string;
    '--color-prose-code-bg': string;
    '--color-prose-code-text': string;
    '--color-toggle-on': string;
  };
}

export const themes: Theme[] = [
  {
    name: 'Default Dark',
    mode: 'dark',
    colors: {
      '--color-bg-primary': 'hsl(240, 2%, 10%)',
      '--color-bg-secondary': 'hsl(240, 2%, 14%)',
      '--color-bg-tertiary': 'hsl(240, 2%, 23%)',
      '--color-text-primary': 'hsl(240, 8%, 96%)',
      '--color-text-secondary': 'hsl(240, 5%, 65%)',
      '--color-border': 'hsl(240, 2%, 23%)',
      '--color-interactive': 'hsl(240, 2%, 23%)',
      '--color-interactive-hover': 'hsl(240, 2%, 28%)',
      '--color-interactive-text': 'hsl(240, 8%, 96%)',
      '--color-accent': 'hsl(135, 69%, 46%)',
      '--color-danger': 'hsl(0, 72%, 51%)',
      '--color-danger-hover': 'hsl(0, 63%, 45%)',
      '--color-prose-code-bg': 'hsl(240, 2%, 23%)',
      '--color-prose-code-text': 'hsl(240, 8%, 96%)',
      '--color-toggle-on': 'hsl(135, 69%, 46%)',
    },
  },
  {
    name: 'Light Dark',
    mode: 'dark',
    colors: {
      '--color-bg-primary': 'hsl(0, 0%, 12%)',
      '--color-bg-secondary': 'hsl(0, 0%, 18%)',
      '--color-bg-tertiary': 'hsl(0, 0%, 24%)',
      '--color-text-primary': 'hsl(0, 0%, 95%)',
      '--color-text-secondary': 'hsl(0, 0%, 60%)',
      '--color-border': 'hsl(0, 0%, 24%)',
      '--color-interactive': 'hsl(0, 0%, 24%)',
      '--color-interactive-hover': 'hsl(0, 0%, 30%)',
      '--color-interactive-text': 'hsl(0, 0%, 95%)',
      '--color-accent': 'hsl(142, 71%, 45%)',
      '--color-danger': 'hsl(0, 72%, 51%)',
      '--color-danger-hover': 'hsl(0, 63%, 45%)',
      '--color-prose-code-bg': 'hsl(0, 0%, 12%)',
      '--color-prose-code-text': 'hsl(0, 0%, 95%)',
      '--color-toggle-on': 'hsl(142, 71%, 55%)',
    },
  },
  {
    name: 'Classic Light',
    mode: 'light',
    colors: {
      '--color-bg-primary': 'hsl(0 0% 100%)',
      '--color-bg-secondary': 'hsl(240 5% 96%)',
      '--color-bg-tertiary': 'hsl(240 6% 90%)',
      '--color-text-primary': 'hsl(240 10% 4%)',
      '--color-text-secondary': 'hsl(240 5% 41%)',
      '--color-border': 'hsl(240 6% 90%)',
      '--color-interactive': 'hsl(240 6% 90%)',
      '--color-interactive-hover': 'hsl(240 5% 84%)',
      '--color-interactive-text': 'hsl(240 10% 4%)',
      '--color-accent': 'hsl(217 91% 60%)',
      '--color-danger': 'hsl(0 72% 51%)',
      '--color-danger-hover': 'hsl(0 63% 45%)',
      '--color-prose-code-bg': 'hsl(240 6% 90%)',
      '--color-prose-code-text': 'hsl(240 10% 4%)',
      '--color-toggle-on': 'hsl(217 91% 60%)',
    },
  },
  {
    name: 'Classic Dark',
    mode: 'dark',
    colors: {
      '--color-bg-primary': 'hsl(240 10% 4%)',
      '--color-bg-secondary': 'hsl(240 6% 10%)',
      '--color-bg-tertiary': 'hsl(240 5% 15%)',
      '--color-text-primary': 'hsl(0 0% 100%)',
      '--color-text-secondary': 'hsl(240 4% 65%)',
      '--color-border': 'hsl(240 5% 15%)',
      '--color-interactive': 'hsl(240 5% 20%)',
      '--color-interactive-hover': 'hsl(240 5% 30%)',
      '--color-interactive-text': 'hsl(0 0% 100%)',
      '--color-accent': 'hsl(217 91% 60%)',
      '--color-danger': 'hsl(0 72% 51%)',
      '--color-danger-hover': 'hsl(0 63% 45%)',
      '--color-prose-code-bg': 'hsl(240 5% 15%)',
      '--color-prose-code-text': 'hsl(0 0% 100%)',
      '--color-toggle-on': 'hsl(217 91% 60%)',
    },
  },
  {
    name: 'Forest',
    mode: 'dark',
    colors: {
      '--color-bg-primary': 'hsl(120 20% 10%)',
      '--color-bg-secondary': 'hsl(120 15% 15%)',
      '--color-bg-tertiary': 'hsl(120 10% 25%)',
      '--color-text-primary': 'hsl(90 15% 90%)',
      '--color-text-secondary': 'hsl(90 10% 60%)',
      '--color-border': 'hsl(120 10% 25%)',
      '--color-interactive': 'hsl(140 25% 30%)',
      '--color-interactive-hover': 'hsl(140 25% 40%)',
      '--color-interactive-text': 'hsl(90 15% 90%)',
      '--color-accent': 'hsl(140 50% 60%)',
      '--color-danger': 'hsl(0 60% 50%)',
      '--color-danger-hover': 'hsl(0 50% 40%)',
      '--color-prose-code-bg': 'hsl(120 10% 25%)',
      '--color-prose-code-text': 'hsl(90 15% 90%)',
      '--color-toggle-on': 'hsl(140 50% 60%)',
    },
  },
  {
    name: 'Paper',
    mode: 'light',
    colors: {
      '--color-bg-primary': 'hsl(45 33% 94%)',
      '--color-bg-secondary': 'hsl(45 25% 88%)',
      '--color-bg-tertiary': 'hsl(35 20% 80%)',
      '--color-text-primary': 'hsl(30 20% 20%)',
      '--color-text-secondary': 'hsl(30 15% 40%)',
      '--color-border': 'hsl(35 20% 80%)',
      '--color-interactive': 'hsl(35 20% 80%)',
      '--color-interactive-hover': 'hsl(35 20% 70%)',
      '--color-interactive-text': 'hsl(30 20% 20%)',
      '--color-accent': 'hsl(200 50% 40%)',
      '--color-danger': 'hsl(0 40% 40%)',
      '--color-danger-hover': 'hsl(0 40% 30%)',
      '--color-prose-code-bg': 'hsl(35 20% 80%)',
      '--color-prose-code-text': 'hsl(30 20% 20%)',
      '--color-toggle-on': 'hsl(150, 40%, 50%)',
    },
  },
];
