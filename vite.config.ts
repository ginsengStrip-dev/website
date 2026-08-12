import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const changeLogger = () => ({
  name: 'archivalia-change-logger',
  configureServer(server: any) {
    const logChange = (action: string, file: string) => {
      const relativeFile = path.relative(process.cwd(), file);
      server.config.logger.info(`[source] ${action}: ${relativeFile}`);
    };

    server.watcher.on('add', (file) => logChange('added', file));
    server.watcher.on('change', (file) => logChange('changed', file));
    server.watcher.on('unlink', (file) => logChange('removed', file));
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), changeLogger()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
