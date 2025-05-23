# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Deployment

### Deploying to Render.com

This project can be easily deployed to Render.com as a static site:

1. Create a new account or log in to your existing account on [Render.com](https://render.com/)
2. Click on "New +" button and select "Blueprint" from the dropdown menu
3. Connect your GitHub/GitLab repository that contains this project
4. Render will automatically detect the `render.yaml` configuration
5. Click "Apply" to create the service defined in the render.yaml file
6. Render will automatically build and deploy your application

Alternatively, you can deploy manually:

1. Create a new account or log in to your existing account on [Render.com](https://render.com/)
2. Click on "New +" button and select "Static Site" from the dropdown menu
3. Connect your GitHub/GitLab repository that contains this project
4. Configure the following settings:
   - **Name**: Choose a name for your application
   - **Branch**: main (or your preferred branch)
   - **Build Command**: `pnpm install && pnpm build`
   - **Publish Directory**: `dist`
5. Click "Create Static Site"
6. Render will automatically build and deploy your application

Once deployed, Render will provide you with a URL to access your application.
