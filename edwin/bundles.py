PIPELINE_CSS = {
    'client': {
        'source_filenames': [
          'css/client.less',
        ],
        'output_filename': 'css/client.css',
    },
}

PIPELINE_JS = {
    'client': {
        'source_filenames': [
            'react/dist/react.js',
            'js/client.browserify.js',
        ],
        'output_filename': 'js/client.js',
    },
}
