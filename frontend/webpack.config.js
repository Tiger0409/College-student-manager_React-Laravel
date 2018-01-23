const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin')

// Is the current build a development build
const IS_DEV = (process.env.NODE_ENV === 'development');

const dirNode = 'node_modules';
const dirApp = path.join(__dirname, '/src/js');
const dirAssets = path.join(__dirname, 'assets');

// define css loader, if it's production, extract the assets
var cssLoader
var scssLoader
if (IS_DEV) {
    cssLoader = [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                sourceMap: IS_DEV
            }
        },
        'resolve-url-loader'
    ]
    scssLoader = [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                sourceMap: IS_DEV
            }
        },
        'resolve-url-loader',
        {
            loader: 'sass-loader',
            options: {
                sourceMap: IS_DEV,
                includePaths: [dirAssets]
            }
        }
    ]
} else {
    cssLoader = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
            {
                loader: 'css-loader',
                options: {
                    sourceMap: IS_DEV
                }
            },
            {
                loader: 'resolve-url-loader'
            }
        ]
    })
    scssLoader = ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [
            {
                loader: 'css-loader',
                options: {
                    sourceMap: IS_DEV
                }
            },
            {
                loader: 'resolve-url-loader'
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: IS_DEV,
                    includePaths: [dirAssets]
                }
            }
        ]
    })
}

/**
 * Webpack Configuration
 */
module.exports = {
    entry: {
        bundle: path.join(dirApp, '/main.jsx')
    },
    resolve: {
        modules: [
            dirNode,
            dirApp,
            dirAssets
        ],
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: IS_DEV
        }),
        new webpack.ProvidePlugin({
            // lodash
            '_': 'lodash'
        })
    ],
    module: {
        rules: [
            // BABEL
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /(node_modules)/,
                options: {
                    compact: true,
                    cacheDirectory: IS_DEV
                }
            },

            // STYLES
            {
                test: /\.css$/,
                use: cssLoader
            },

            // CSS / SASS
            {
                test: /\.scss/,
                use: scssLoader
            },

            // EJS
            {
                test: /\.ejs$/,
                loader: 'ejs-loader'
            },

            // IMAGES
            {
                test: /\.(jpe?g|png|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 10,
                    name: 'images/[name]-[sha512:hash:base64:7].[ext]'
                }
            },
            
            // FONTS
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader',
                options: {
                    limit: 10,
                    minetype: 'application/font-woff',
                    name: 'fonts/[name]-[sha512:hash:base64:7].[ext]'
                }
            },
            
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name]-[sha512:hash:base64:7].[ext]'
                }
            }
        ]
    }
};
