// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react({
      // Ajoute les options que tu souhaites ici, par exemple :
      // jsxRuntime: 'classic' | 'automatic'
    })
  ],
  resolve: {
    // Possibilité d'ajouter des alias, pratique pour les imports dans les tests
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: [
      'tests/**/*.{test,spec}.{ts,tsx}',
      '**/?(*.)+(test|spec).{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
    // Rapport de couverture activé et formaté
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/',
        'src/types/',
        'src/vitest.setup.ts',
      ],
    },
    // Ajoute des reporters si souhaité
    reporters: 'default'
  }
})
