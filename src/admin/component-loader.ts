import { ComponentLoader } from 'adminjs';
import path from 'path';

const componentLoader = new ComponentLoader();

// AdminJS ComponentLoader resolves relative paths from the component-loader file location
// This causes issues in production where the file is in dist/admin/ but we need src/admin/
// Use process.cwd() to get the project root and build absolute paths
const projectRoot = process.cwd();

// Path to source components - AdminJS needs TSX source files to bundle React components
// In production, this must be an absolute path to avoid resolution issues
const srcPath = path.resolve(projectRoot, 'src', 'admin', 'components');

// Use absolute paths so AdminJS doesn't resolve relative to component-loader location
componentLoader.override('Login', path.resolve(srcPath, 'Login'));
componentLoader.add('Dashboard', path.resolve(srcPath, 'Dashboard'));

export default componentLoader;
