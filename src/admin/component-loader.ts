import { ComponentLoader } from 'adminjs';
import path from 'path';

const componentLoader = new ComponentLoader();
// AdminJS bundles React components from source files, so always use src path
componentLoader.override('Login', path.join(process.cwd(), 'src/admin/components/Login'));
componentLoader.add('Dashboard', path.join(process.cwd(), 'src/admin/components/Dashboard'));
export default componentLoader;
