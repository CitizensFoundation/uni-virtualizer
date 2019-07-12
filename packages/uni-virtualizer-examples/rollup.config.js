import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    input: [
        'lit-html',
        'lit-element',
        'lit-virtualizer/lib/lit-virtualizer.js',
        'public/temp/index.js'
      ],
      output: {
        dir: 'public/temp/build',
        format: 'esm'
      },
      plugins: [
        resolve(),
      ]        
  },
  {
    input: 'public/basic-lit-html/index.js',
    output: {
      dir: 'public/basic-lit-html/build',
      format: 'esm'
    },
    plugins: [
      resolve(),
    ]        
  },
  {
    input: 'public/basic-lit-element/index.js',
    output: {
      dir: 'public/basic-lit-element/build',
      format: 'esm'
    },
    plugins: [
      resolve(),
    ]
  },
  {
    input: 'public/first-visible-index/index.js',
    output: {
      dir: 'public/first-visible-index/build',
      format: 'esm'
    },
    plugins: [
      resolve(),
    ]
  },
];