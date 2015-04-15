The files in this directory each export a singleton **Store**. A Store is a
self contained source of truth. In its domain, its knowledge is absolute.

Stores are read only, providing only access methods, no mutators. Any mutations
happen by a Store choosing to react to an action from a Dispatcher. A Store may
access other Stores, and declare these dependencies with the Dispatcher.

All responses to Dispatcher actions should be synchronous. Asynchronous code,
such as API calls, belongs elsewhere, such as in an Action Creator.

All Stores should subclass `utils.BaseStore`, and by extension, are subclasses
of `events.EventEmitters`. However, the only events that should be used is the
`'change'` events. `utils.BaseStore` provides methods for adding and removing
listeners for change events, and for emitting new change events.
