import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  base: '/tcdd-connect-smart/',
});