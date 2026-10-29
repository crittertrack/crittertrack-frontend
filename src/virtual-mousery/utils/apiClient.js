// Virtual Mousery comms were moved to the main app. Re-export the main apiClient so
// existing call sites stay unchanged: `import apiClient from '../utils/apiClient';`
export { default } from '../../utils/apiClient';
