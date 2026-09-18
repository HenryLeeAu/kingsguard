import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.{ts,tsx,mts,cts}'],
      exclude: [
        '**/*.d.{ts,mts,cts}',
        '**/*.{test,spec}.{ts,tsx,mts,cts}',
        '**/{tests,__tests__,node_modules,dist,coverage,generated}/**',
      ],
      reporter: ['text-summary', 'html', 'lcovonly'],
      reportsDirectory: './coverage',
    },
  },
});
