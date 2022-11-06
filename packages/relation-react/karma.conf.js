// Karma configuration
// Generated on Wed Oct 26 2022 23:14:42 GMT+0800 (China Standard Time)
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const os = require('os');
const path = require('path');

// Manual setup outputPath for serve all bundle outputs
// See https://github.com/scottohara/tvmanager/issues/99
const ENTROPY_SIZE = 1000000;
const outputPath = `${path.join(os.tmpdir(), '_karma_webpack_')}${Math.floor(
  Math.random() * ENTROPY_SIZE
)}`;

module.exports = function(config) {
  config.set({
    client: {
      jasmine: {
        timeoutInterval: 60 * 60 * 1000,
      },
    },

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['jasmine', 'webpack'],

    // list of files / patterns to load in the browser
    files: [
      'karma-tests/**/*.ts',
      'karma-tests/**/*.tsx',
      {
        pattern: `${outputPath}/**/*`,
        watched: false,
        included: false,
      },
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      'karma-tests/**/*.ts': 'webpack',
      'karma-tests/**/*.tsx': 'webpack',
    },

    webpack: {
      // karma watches the test entry points
      // Do NOT specify the entry option
      // webpack watches dependencies
      // webpack configuration
      output: {
        path: outputPath,
      },
      module: {
        rules: [
          {
            test: /\.(sass|s?css)$/i,
            use: ['style-loader', 'css-loader', 'sass-loader'],
          },
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  configFile: 'tsconfig.test.json',
                },
              },
            ],
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js'],
      },
      plugins: [new MonacoWebpackPlugin()],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    // browsers: ['Chrome'],
    browsers: ['ChromeDebugging'],

    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9333'],
      },
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,
  });
};
