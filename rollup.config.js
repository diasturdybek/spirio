import json from '@rollup/plugin-json';
import eslint from '@rollup/plugin-eslint';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';
import summary from 'rollup-plugin-summary';
import license from 'rollup-plugin-license';
import licenseManager from './licenseManager.js';
import del from 'rollup-plugin-delete';



const path = require('path');
const pack = require('./package.json');
const root = (...items) => {return path.resolve(__dirname, path.join(...items))};
const isProduction = process.env.NODE_ENV === 'production' ? true : false;
const isDevelopment = process.env.NODE_ENV === 'development' ? true : false;

if(isProduction) {
    licenseManager.createMIT();
}


export default {
    input: root('source', `${pack.name}.ts`),
    output: {
        sourcemap: true,
        file: root('build', `${pack.name}.js`),
        format: 'esm',
    },
    watch: {
        include: ['./source/**'],
        exclude: ['./node_modules/**'],
    },
    onwarn(warning) {
        if (warning.code !== 'THIS_IS_UNDEFINED') {
            console.error(`(!) ${warning.message}`);
        }
    },
    plugins: [
        del({targets: 'build/*'}),
        replace({'Reflect.decorate': 'undefined', preventAssignment: true}),
        resolve(),
        json(),
        typescript(),
        isProduction && eslint(),
        isProduction && terser({
            ecma: 2015,
            module: true,
            warnings: true,
            mangle: {
                properties: {
                    regex: /^__/,
                },
            },
        }),
        isProduction && license({
            banner: {
                commentStyle: 'ignored',
                content: licenseManager.banner(),
            }
        }),
        isProduction && summary(),
    ],
}