import { ComponentLoader } from 'adminjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader();

// Use absolute paths that work in both development and production
const getComponentPath = (componentName: string) => {
  // In production (Render), files are in dist/, but we need to reference source components
  // for AdminJS bundling
  if (process.env.NODE_ENV === 'production') {
    // For production build, use source path relative to project root
    return path.join(process.cwd(), 'src', 'admin', 'components', componentName);
  }
  
  // In development, use relative path from this file
  return path.join(__dirname, 'components', componentName);
};

componentLoader.override('Login', getComponentPath('Login'));
componentLoader.add('Dashboard', getComponentPath('Dashboard'));

export default componentLoader;