define([
    'jquery',
    'bluebird',
    'kb_common/html',
    'kb_common/dynamicTable',

    'bootstrap'
], function(
    $,
    Promise,
    html,
    DynamicTable
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        p = t('p');

    function factory(config) {
        var hostNode, container,
            runtime = config.runtime,
            testId = html.genId();

        // RENDERING CODE, ETC.

        function testIt() {
            var dummyRows = [
                    [1, 2, 3],
                    [4, 5, 6]
                ],
                dummyHeaders = [{
                    id: 'col1',
                    text: 'Column 1',
                    isSortable: true
                }, {
                    id: 'col2',
                    text: 'Column 2',
                    isSortable: true
                }, {
                    id: 'col3',
                    text: 'Column 3',
                    isSortable: false
                }],
                $dummyDiv = $('#' + testId);

            new DynamicTable($dummyDiv, {
                headers: dummyHeaders,
                updateFunction: function(pageNum, query, sortColId, sortColDir) {
                    var sortColumn = dummyHeaders.findIndex(function(item) {
                        return (item.id === sortColId);
                    });
                    return Promise.try(function() {
                        var sorted = dummyRows
                            .filter(function(row) {
                                if (query == undefined ||
                                    (typeof query === 'string' && query.length === 0)) {
                                    return true;
                                }

                                return (row.some(function(item) {
                                    // shold be a columnn type so we can do proper coercion...
                                    // cheat and ask js to do it for us...
                                    return (item == query);
                                }));
                            })
                            .sort(function(a, b) {
                                if (a[sortColumn] < b[sortColumn]) {
                                    return sortColDir * -1;
                                } else if (a[sortColumn] < b[sortColumn]) {
                                    return sortColDir;
                                } else {
                                    return 0;
                                }
                            });


                        return {
                            start: 0,
                            total: sorted.length,
                            rows: sorted
                        };
                    });
                }
            });

        }

        // Note: this is not a special function, just a markup-building
        // function, in this case simply syncronous.
        function render() {
            // Typically for the top level of a plugin you need to wrap in bootstrap
            // boilerplate in order to get the padding, etc. that other top level
            // panels do.
            return div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-md-6'
                    }, 'This is my plugin.'),
                    div({
                        class: 'col-md-6'
                    }, [
                        div({
                            id: testId
                        })
                    ])
                ])
            ]);
        }

        // LIFECYCLE API

        function init(config) {
            return Promise.try(function() {
                // anything to initialize?
            });
        }

        function attach(node) {
            return Promise.try(function() {
                // Make our own top level container node. 
                // Sometimes we might want to create an html 
                // layout here.
                hostNode = node;
                container = hostNode.appendChild(document.createElement('div'));
            });
        }

        function start(params) {
            return Promise.try(function() {
                // usually rendering, or long async data loading, content generation, 
                // would go here.
                runtime.send('ui', 'setTitle', 'Dynamic Table Test')
                container.innerHTML = render();
                testIt();
            });
        }

        function stop() {
            return Promise.try(function() {
                // anything to stop?
            });
        }

        function detach() {
            return Promise.try(function() {
                // at a minimum be nice and remove our top level node if any.
                if (hostNode && container) {
                    hostNode.removeChild(container);
                }
            });
        }

        return {
            init: init,
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function(config) {
            return factory(config);
        }
    };
});