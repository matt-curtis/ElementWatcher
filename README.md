**ElementWatcher**
-------
Watches for elements in the DOM that match specified selectors

Usage
----------

Basic Usage:

```javascript
//	Create and start a watcher..

var watcher = new ElementWatcher().start();

//	Start watching for any anchors created in the body of the document

watcher.watchFor("a", function(watchItemId, nodes){
	//	An anchor was added to the document's body

	console.log(watchItemId, nodes);

	//	Now stop watching

	watcher.stopWatchingFor(watchItemId);

	//	Stop watching for anything at all

	watcher.stop();
}, document.body);
````
