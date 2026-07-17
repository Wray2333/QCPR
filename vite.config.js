import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { recordsApi } from './server/apiPlugin.js';

export default defineConfig({
  // recordsApi 提供 /api/records，与前端同源（开发与 preview 均生效）
  plugins: [react(), recordsApi()],
  server: {
    port: 5173,
    host: true, // 监听 0.0.0.0，手机可经局域网/服务器 IP 访问
    open: false,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
