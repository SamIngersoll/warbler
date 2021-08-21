//
/* TODO
  only show notdone items in list, done items removed (do filtering using cytoscape in code)
  add done checkbox in graph view for returning done items to notdone
  initially all nodes gray, independent of tag
  pressing 'return' or 'ok' on form page restarts app, removing data?
  save file
  undo/redo
  when the window is resized in table view, network disappears, never to return.
*/

var cytoscape = require('./cytoscape');
var TestGraph = function() {};

TestGraph.prototype.createGraph = function() {
  var colors = {
    red:    "#fc605b",
    orange: "#fdbc40",
    green:  "#34c84a",
    blue:   "#57acf5",
    none:   "#888888"
  };
  var cy = cytoscape({
    container: document.getElementById('cy'),
    elements: {
    // nodes: [],
    nodes: [
      {data: { id: 'a', title: "start the project", description: "this is a node", tag: "red", done: 'false' }},
      {data: { id: 'b', title: "finish the project", description: "this is b node", tag: "none", done: 'false' }}
    ],
    edges: [
      {data: { id: 'ab', source: 'a', target: 'b' }}
    ]
  },
  layout: {
    name: 'circle',
    fit: true, // whether to fit the viewport to the graph
    padding: 1, // padding used on fit
    avoidOverlapPadding: 20,
  },
  // so we can see the ids
  style: [
        {
          selector: 'node',
          style: {'content': 'data(title)'},
        },

        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
  });
  cy.boxSelectionEnabled(true);

  cy.style().selector('node:selected').style("background-color", "rgb(59,105,213)");
  cy.style().selector('node.done').style("background-blacken", "-0.8");

  // on RIGHT CLICK
  cy.on('cxttapstart', function(event){
    var evtTarget = event.cyTarget;
    console.log(event);
    console.log("adding new node");
    var seles = cy.$(':selected');

    if (seles.length == 1) {
      if (seles[0]._private.group == "edges") {
        // switch edge direction
        var new_id = seles[0]._private.data.id
        var new_source = seles[0]._private.data.target
        var new_target = seles[0]._private.data.source
        // delete edge,
        cy.$(':selected').remove();
        // add edge with reversed direction
        var eles = cy.add([
          { group: 'edges', data: { id: new_id, source: new_source, target: new_target } }
        ]);
      } else {
        // add a new child node and a new edge
        var new_node_id = makeid(20);
        var source_id = seles[0]._private.data.id;
        var eles = cy.add([
          { group: 'nodes', data: { id: new_node_id, title: "title", description: "description", tag: "none", done: "false"},
                            position: { x: event.cyPosition.x,
                                        y: event.cyPosition.y } },
          { group: 'edges', data: { id: makeid(20), source: source_id, target: new_node_id } }
        ]);
        // select the newly added node
        cy.$(':selected').deselect();
        cy.$('#'+new_node_id).select();
        document.getElementById("title_form").value =
                          cy.$('#'+new_node_id)._private.ids[new_node_id]._private.data.title;
        document.getElementById("description_form").value =
                          cy.$('#'+new_node_id)._private.ids[new_node_id]._private.data.description;
        document.getElementById("id_form").value =
                          cy.$('#'+new_node_id)._private.ids[new_node_id]._private.data.id;
        make_unordered_table(cy)
      }
    } else if (seles.length > 1) {
      var source_id = seles[0]._private.data.id;
      var target_id = seles[1]._private.data.id;
      var eles = cy.add([
        { group: 'edges',
        data: { id: makeid(20), title: "title", source: source_id, target: target_id } }
      ]);
    } else {
      // add single orphan node
      var new_node_id = makeid(20);
      var eles = cy.add([
        { group: 'nodes', data: { id: new_node_id, title: "title", description: "description", tag: "none", done: "false"},
          position: { x: event.cyPosition.x,
                      y: event.cyPosition.y } }
        ]);
      make_unordered_table(cy);
    }

  })
  // listener for button pushes within cytoscape
  window.addEventListener("activate", function(event) {
    var source = event.srcElement;
    console.log(source);
    if (source.id == "todo_button") {
      console.log("TODO LIST");
      update_table(cy);
    }

    // if we are changing a color tag in the graph window
    else if (source.classList.contains("set_tag")) {
      var new_tag = source.id;
      var seles = cy.$('node:selected');

      for (var i=0 ; i<seles.length ; i++) {
        id = seles[i]._private.data.id;

        seles[i]._private.data.tag = new_tag;
        update_tr(cy,id)

        cy.style().selector('node#'+id).style('background-color', colors[new_tag]).update()
      }
    }
  });
  // on LEFT CLICK
  cy.on('tap', function(event){
    text_active = false;

    document.activeElement.blur();
    // target holds a reference to the originator
    // of the event (core or element)
    var evtTarget = event.cyTarget;
    if( evtTarget === cy ){
      // clear the form
      console.log('tap on background');
      document.getElementById("title_form").value = "";
      document.getElementById("description_form").value = "";
      document.getElementById("id_form").value = "";
      // set the color tags
      var tags = document.getElementById("tag_select").items
      for (var i=0 ; i<tags.length ; i++) {
        tags[i].classList.remove("active");
      }
    } else {
      // set the state of the form to the node's values
      console.log('tap on element');
      document.getElementById("title_form").value = event.cyTarget._private.data.title;
      document.getElementById("description_form").value = event.cyTarget._private.data.description;
      document.getElementById("id_form").value = event.cyTarget._private.data.id;
      // set the color tags
      var set_tag = event.cyTarget._private.data.tag;
      var tags = document.getElementById("tag_select").items;

      for (var i=0 ; i<tags.length ; i++) {
        if (tags[i].id === set_tag) {
          tags[i].classList.add("active");
        } else {
          tags[i].classList.remove("active");
        }
      }
    }
  });
  // delete listener for cytoscape
  var text_active = false;
  document.addEventListener('keydown', function(event) {
    const key = event.keyCode; // const {key} = event; ES6+
    if (document.activeElement.nodeName == 'TEXTAREA' || document.activeElement.nodeName == 'INPUT') {
      // UI does NOTHING because user is writing in textbox
    } else {
      if (!text_active) {
        if (key === 8 || key === 46) {
          console.log("cytoscape delete");
          cy.$(':selected').remove();
          make_unordered_table(cy)
        }
      }
    }
  });
  // on input event for title text box in form
  document.getElementById("title_form").oninput = function () {
    text_active = true;
    if (cy.$(':selected').length > 0) {
      id = document.getElementById("id_form").value;
      cy.$("#"+id)._private.ids[id]._private.data.title =
              document.getElementById("title_form").value;
      update_tr(cy, id);
    }
  };
  // on input event for description text box in form
  document.getElementById("description_form").oninput = function () {
    text_active = true;
    if (cy.$(':selected').length > 0) {
      id = document.getElementById("id_form").value;
      cy.$("#"+id)._private.ids[id]._private.data.description =
              document.getElementById("description_form").value;
      update_tr(cy, id)
  };
};
make_unordered_table(cy)
return cy;

  function makeid(length) {
    // makes random string of given length
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
  }

  function update_node(id, new_title, new_description) {
    // updates a node's title and description given an id

  }
  function make_node() {
    // creates a new empty node
    id = makeid(20);
    return id;
  }
  function make_edge(source_id, target_id) {
    // creates a new edge from source_id to target_id
    id = makeid(20);
    return id;
  }
  function make_tr(cy, id) {
    // creates a new table row in the task table
    // uses information from the cytoscape db

    var title = cy.$('#'+id)._private.ids[id]._private.data.title;
    var description = cy.$('#'+id)._private.ids[id]._private.data.description;
    var tag = cy.$('#'+id)._private.ids[id]._private.data.tag;
    var done = cy.$('#'+id)._private.ids[id]._private.data.done;
    var done = (done == "true");
    var table = document.getElementById("task_table");
    var row = table.insertRow(-1); // 0 for first position, -1 for last position

    if (done) {
      cy.getElementById(id).addClass('done');
    } else {
      cy.getElementById(id).removeClass('done');
    }

    row.id = id+"row";
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    cell1.innerHTML = "<div class='checkbox'> \
                        <label> \
                        <input type='checkbox' "+(done ? 'checked' : '')+"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "+title+" \
                        </label> \
                      </div>";
    cell2.innerHTML = "<span class='icon icon-record' style='color:"+colors[tag]+"'></span>"+description;
    cell3.innerHTML = id;

    var box = cell1.getElementsByTagName('input')[0];
  }
  /*
  // FUNCTION
  // NOT
  // DONE
  update table should remove rows corresponding to nodes that are done and 
  only show rows corresponding to nodes that are not done
  */
  function update_table(cy) {
    console.log("Updating table, function not written");
    console.log(cy);
    var nodes = cy.$('node');
    for (var i=0 ; i<nodes.length ; i++) {
      var id = nodes[i]._private.data.id;
      update_tr(cy, id);
    }
  }
  function update_tr(cy, id) {
    // updates a table row in the task table
    // uses information from the cytoscape db

    var title = cy.$('#'+id)._private.ids[id]._private.data.title;
    var description = cy.$('#'+id)._private.ids[id]._private.data.description;
    var tag = cy.$('#'+id)._private.ids[id]._private.data.tag;
    var done = cy.$('#'+id)._private.ids[id]._private.data.done;
    var done = (done == "true");
    var table = document.getElementById("task_table")[0];
    var row = document.getElementById(id+"row");

    var cell1 = row.cells[0];
    var cell2 = row.cells[1];
    var cell3 = row.cells[2];

    cell1.innerHTML = "<div class='checkbox'> \
                        <label> \
                          <input type='checkbox' "+(done ? 'checked' : '')+"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "+title+" \
                        </label> \
                      </div>";
    cell2.innerHTML = "<span class='icon icon-record' style='color:"+colors[tag]+"'></span>"+description;
    cell3.innerHTML = id;

    var box = cell1.getElementsByTagName('input')[0];
    // listener for checkboxes in table
    box.addEventListener('change', function() {
      console.log("CHANGED")
      var id = this.parentNode.parentNode.parentNode.parentNode.id.slice(0,-3);
      console.log(id)
      if (box.checked) {
        cy.$('#'+id)._private.ids[id]._private.data.done = "true";
        cy.getElementById(id).addClass('done');
      } else {
        cy.$('#'+id)._private.ids[id]._private.data.done = "false";
        cy.getElementById(id).removeClass('done');
      }
    });
  }
  function make_topological_ordering(cy) {
    // make ordering for table
    // use DFS to find a topological ordering such that all directed edges are satisfied

    // build representation of graph
    // adjacency list

    // perform DFS

    // return topological ordering of node ids
  }
  function make_unordered_table(cy) {
    var eles = cy.nodes();
    // delete all rows from the table
    var table = document.getElementById("task_table");
    for (var i=table.rows.length-1 ; i>=0 ; i--) {
    // for (var i=0 ; i<table.rows.length ; i++) {
      table.rows[i].remove();
    }

    // add new rows to the table
    for (var i=0 ; i<eles.length ; i++) {
      id = eles[i]._private.data.id;
      make_tr(cy, id);
    }
  }
  function make_table(cy) {
    // NOTE: right now this only creates a topological ordering of one project
    // to make an ordering of two projects, we have to figure out how to interleave the two

    // ALSO: we probably want to operate directly on the cytoscape data if possible and not build
    // a second representation.
    // (so that we dont have to maintain this extra representation for each project task)
    // we also probably want to store the topological ordering for each project so that we can
    // interleave them as necessary in the table (according to table filters).

    // create topological ordering
    var topo = make_topological_ordering(cy);

    // iterate through topological ordering and add rows
    for (var i=0 ; i<topo.length ; i++) {
      var id = topo[i];
      make_tr(cy, id);
    }

      // exclude nodes that are finished
      var nodes = cy.filter('node[done = "false"]');
      console.log("FILTERING NODES")
      console.log(nodes)
      // get orphans (nodes with no parents)
      //    either parents are finished so requirement to begin node is met
      //    or node never had parents, so requirement to begin node is met
      nodes.orphans()
  }



};

module.exports = new TestGraph();
