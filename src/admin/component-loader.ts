import { ComponentLoader } from 'adminjs';
import path from 'path';

const componentLoader = new ComponentLoader();
componentLoader.override('Login', path.join(process.cwd(), 'src/admin/components/Login'));
componentLoader.add('Dashboard', path.join(process.cwd(), 'src/admin/components/Dashboard'));
export default componentLoader;
