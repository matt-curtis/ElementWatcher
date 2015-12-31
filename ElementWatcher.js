var ElementWatcher = function(contentDocument){
	var watchCount = 0, watchingFor = [];

	if(!contentDocument) contentDocument = document;

	//	Functions

	this.watchFor = function(selector, callback, contextElement){
		watchCount++;

		watchingFor.push({
			id: watchCount,
			selector: selector,
			callback: callback,
			contextElement: contextElement
		});

		return watchCount;
	};

	this.findOrWatchFor = function(selector, callback, contextElement){
		var matches = (contextElement || contentDocument).querySelectorAll(selector);

		if(matches.length > 0){
			callback(null, matches);
		} else {
			return this.watchFor(selector, callback, contextElement);
		}
	};

	this.findAndWatchFor = function(selector, callback, contextElement){
		var matches = (contextElement || contentDocument).querySelectorAll(selector);

		if(matches.length > 0){
			callback(null, matches);
		}

		return this.watchFor(selector, callback, contextElement);
	};

	this.stopWatchingFor = function(watchId){
		for(var i in watchingFor){
			var w = watchingFor[i];

			if(w.id == watchId){
				delete watchingFor[i]; break;
			}
		}
	};

	this.start = function(){
		if(observer) return;

		createObserver();

		return this;
	};

	this.stop = function(){
		if(!observer) return;

		watchingFor = [];
		destroyObserver();

		return this;
	};

	//	MutationObserver

	var observer;

	var callWatchCallbacksForMatchingNodes = function(addedNodes){
		var uniqueAttrName = "data-element-watcher-unique-id-"+new Date().getTime();
		var callQueue = {};

		for(var i = addedNodes.length-1; i>=0; i--){
			var addedNode = addedNodes[i];

			if(addedNode.nodeType != 1) continue;

			watchingFor.forEach(function(w, i){
				var contextElement = w.contextElement;
				var selector = w.selector;

				if(contextElement){
					contextElement.setAttribute(uniqueAttrName, "");

					selector = "["+uniqueAttrName+"] "+w.selector;
				}

				var doesMatch = addedNode.webkitMatchesSelector(selector);

				if(doesMatch){
					if(!callQueue[w.id]) callQueue[w.id] = { watchItem: w, nodes: [] };

					callQueue[w.id].nodes.push(addedNode);
				}

				if(contextElement) contextElement.removeAttribute(uniqueAttrName);
			});
		}

		for(var id in callQueue){
			var queueItem = callQueue[id];
			var watchItem = queueItem.watchItem;

			watchItem.callback(watchItem.id, queueItem.nodes);
		}
	};

	var createObserver = function(){
		observer = new MutationObserver(function(mutations){
			mutations.forEach(function(mutation){
				var addedNodes = mutation.addedNodes;

				if(!addedNodes || addedNodes.length == 0) return;

				callWatchCallbacksForMatchingNodes(addedNodes);
			});
		});

		observer.observe(contentDocument.documentElement, {
			childList: true, subtree: true, attributes: false, characterData: false
		});
	};

	var destroyObserver = function(){
		observer.disconnect();
		observer = null;
	};
};
