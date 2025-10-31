import { ComponentLoader } from 'adminjs';
import path from 'path';

const componentLoader = new ComponentLoader();
// AdminJS bundles React components from source files, so always use src path
componentLoader.override('Login', 'src/admin/components/Login');
componentLoader.add('Dashboard', 'src/admin/components/Dashboard');
export default componentLoader;
