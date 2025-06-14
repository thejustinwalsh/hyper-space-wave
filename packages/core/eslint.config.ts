import rootConfig from '../../eslint.config.ts';
import pluginRouter from '@tanstack/eslint-plugin-router';

export default [...rootConfig, ...pluginRouter.configs['flat/recommended']];
