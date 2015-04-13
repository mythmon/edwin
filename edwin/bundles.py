class BundleConfiguration(object):
    def PIPELINE_CSS(self):
        return {
            'client': {
                'source_filenames': [
                    'css/client.less',
                ],
                'output_filename': 'css/client.css',
            },
        }

    def PIPELINE_JS(self):
        return {
            'client': {
                'source_filenames': [
                    'js/client.browserify.js',
                ],
                'output_filename': 'js/client.js',
            },
        }
