import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslintPlugin from "vite-plugin-eslint";
import {createStyleImportPlugin, AntdResolve} from 'vite-plugin-style-import';
import { resolve } from "path";

function pathResolve(dir) {
  return resolve(process.cwd(), ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  server: {
    proxy: {
      "/api/sysOperationRecord": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/menu/updateBaseMenu": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/authorityBtn/getAuthorityBtn": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/user/getUserList": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/casbin/getPolicyPathByAuthorityId": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/menu/getBaseMenuTree": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/authority/getAuthorityList": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/menu/getMenu": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/base/login": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api/base/captcha": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:8080/api",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    eslintPlugin({
      cache: false,
      failOnError: false,
      include: ["src/**/*.js", "src/**/*.tsx", "src/**/*.ts"],
    }),
    createStyleImportPlugin({
      resolves: [AntdResolve()]
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    postcss:{}
  },
  resolve: {
    alias: [
      {
        find: /@\//,
        replacement: `${pathResolve("src")}/`,
      },
    ],
  },
})
