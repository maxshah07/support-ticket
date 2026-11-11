## Install Tailwind CSS

### 1. Install Dependencies
```bash
npm install tailwindcss @tailwindcss/vite
```

### 2. Configure Vite
Add Tailwind to `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3. Import Tailwind
Add to `src/index.css`:

```css
@import "tailwindcss";
```

Ensure `src/main.jsx` imports `./index.css`.

### 4. Start Development Server
```bash
npm run dev
```

Tailwind utility classes can now be used in React components.

**Documentation:** https://tailwindcss.com/docs/installation/using-vite
