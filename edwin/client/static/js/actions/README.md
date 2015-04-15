This directory contains **Action Creators**. Every exported function from these
files creates one or more actions on the Dispatcher, possibly after doing some
work to transform its input into the suitable format. This work may include
asyncronous calls, such as API requests.

Actions should not be sent to the Dispatcher manually, but should always use
functions from the files in this directory.
