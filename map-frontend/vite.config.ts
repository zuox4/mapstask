import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), basicSsl()],
	server: {
		host: '0.0.0.0', // Доступно для всех сетевых интерфейсов

		strictPort: true, // Не менять порт автоматически
		https: true,
		port: 443, // Опционально - стандартный порт HTTPS
	},
})
