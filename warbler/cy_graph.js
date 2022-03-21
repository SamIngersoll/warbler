//
/* TODO
  todo here: https://github.com/SamIngersoll/warbler/projects/1?fullscreen=true
*/

var cytoscape = require('./cytoscape');

var TestGraph = function() {};

var colors = {
  red:    "#fc605b",
  orange: "#fdbc40",
  green:  "#34c84a",
  blue:   "#57acf5",
  gray:   "#888888"
};
var outline_colors = {
  red:    "#e82b25",
  orange: "#f09226",
  green:  "#11a627",
  blue:   "#1080e0",
  gray:   "#636363"
};

TestGraph.prototype.saveGraph = function() {
  
}

TestGraph.prototype.formatGraph = function(cy) {
  console.log("formatted network")
  var eles = cy.nodes().components();
  console.log(eles)
  // set color here
  // console.log(eles[i]._private.eles[0]._private.data.tag.style)
  for (var i=0 ; i<eles.length ; i+=1) {
    var elem = eles[i];
    var tag = elem._private.eles[0]._private.data.tag;
    // cy.style().selector('node#'+id).style('background-color', colors[new_tag]).update()
    // var seles = cy.$(':selected');
    elem.style('background-color', colors[tag]);
    elem.style('border-color', outline_colors[tag]);
  }
  make_unordered_table(cy);

  // fix formatting from old files (old files may not have certain styles, in this case :selected selector)
  var count = 0;
  for (var i=0 ; i<cy._private.style.length ;i++ ) {
    count += (cy._private.style[i].selector.inputText == ":selected")
  }
  
  if (count == 1) {
    console.log("attempting to fix formatting")
    cy._private.style[4].properties[6] = {}
    cy._private.style[4].properties[6].name = "border-width"
    cy._private.style[4].properties[6].pfValue = 4
    cy._private.style[4].properties[6].units = "px"
    cy._private.style[4].properties[6].value = 4
  }
  
}

TestGraph.prototype.createGraph = function() {

  var cy = cytoscape({
    container: document.getElementById('cy'),
    elements: {
    // nodes: [],
    nodes: [
      {data: { id: 'a', title: "start the project", description: "this is a node", tag: "red", done: 'false' }},
      {data: { id: 'b', title: "finish the project", description: "this is b node", tag: "gray", done: 'false' }}
    ],
    edges: [
      {data: { id: 'ab', source: 'a', target: 'b', colors: 'red gray', arrow_color: 'gray'}}
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
          style: {
            'content': 'data(title)',
            'color' : 'data(tag)'
          }
        },

        {
          selector: 'edge',
          style: {
            // 'curve-style': 'taxi',
            'curve-style': 'bezier',
            // 'curve-style': 'unbundled-bezier',
            // 'control-point-distance': '20px',
            // 'control-point-weight': '0.7', // '0': curve towards source node, '1': towards target node.
            'target-arrow-shape': 'triangle',
            'line-fill': 'linear-gradient',
            'line-gradient-stop-colors': 'data(colors)',
            'target-arrow-color': 'data(arrow_color)',
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': '4'
          }
        },
        {
          selector: '.done',
          style: {
            'opacity': '0.5'
          }
        },
      
      ],
  });
  cy.boxSelectionEnabled(true);
  format_network(cy);
  
  // cy.style().selector('node:selected').style("background-color", "rgb(59,105,213)");
  // cy.style().selector('node.done').style("background-blacken", "-0.8");

 

  // on RIGHT CLICK
  cy.on('cxttapstart', function(event){
    var evtTarget = event.target;
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

        // get colors for edge gradient
        var col1 = get_edge_color(cy.$('#'+new_source)[0]._private.data.tag);
        var col2 = get_edge_color(cy.$('#'+new_target)[0]._private.data.tag);

        // add edge with reversed direction
        var eles = cy.add([
          { group: 'edges', data: { id: new_id, source: new_source, target: new_target, colors: col1.concat(' ',col2), arrow_color: col2} }
        ]);
      } else {
        // add a new child node and a new edge
        var new_node_id = makeid(20);
        var source_id = seles[0]._private.data.id;

        // get colors for edge gradient
        var col1 = get_edge_color(cy.$('#'+source_id)[0]._private.data.tag);
        var col2 = "lightslategray"

        var eles = cy.add([
          { group: 'nodes', data: { id: new_node_id, title: "title", description: "description", tag: "gray", done: "false"},
                            position: { x: event.position.x,
                                        y: event.position.y } },
          { group: 'edges', data: { id: makeid(20), source: source_id, target: new_node_id, colors: col1.concat(' ',col2), arrow_color: col2 } }
        ]);
        // select the newly added node
        cy.$(':selected').deselect();
        cy.$('#'+new_node_id).select();

        cy.$('#'+new_node_id).style('background-color', colors["gray"]);
        cy.$('#'+new_node_id).style('border-color', outline_colors["gray"]);
        document.getElementById("title_form").value =
                          cy.$('#'+new_node_id)._private.eles[0]._private.data.title;
        document.getElementById("description_form").value =
                          cy.$('#'+new_node_id)._private.eles[0]._private.data.description;
        document.getElementById("id_form").value =
                          cy.$('#'+new_node_id)._private.eles[0]._private.data.id;
        make_unordered_table(cy)
        
      }
    } else if (seles.length > 1) {
      // add an edge between two nodes
      var source_id = seles[0]._private.data.id;
      var target_id = seles[1]._private.data.id;

      // get colors for edge gradient
      var col1 = get_edge_color(cy.$('#'+source_id)[0]._private.data.tag);
      var col2 = get_edge_color(cy.$('#'+target_id)[0]._private.data.tag);

      var eles = cy.add([
        { group: 'edges',
        data: { id: makeid(20), title: "title", source: source_id, target: target_id, colors: col1.concat(' ',col2), arrow_color: col2 } }
      ]);
    } else {
      // add single orphan node
      var new_node_id = makeid(20);
      var eles = cy.add([
        { group: 'nodes', data: { id: new_node_id, title: "title", description: "description", tag: "gray", done: "false"},
          position: { x: event.position.x,
                      y: event.position.y } }
        ]);
      cy.$('#'+new_node_id).style('background-color', colors["gray"]);
      cy.$('#'+new_node_id).style('border-color', outline_colors["gray"]);
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
    if (source.id == "graph_button") {
      console.log("GRAPH VIEW");
      cy.resize();
    }

    // change node color
    // if we are changing a color tag in the graph window
    else if (source.classList.contains("set_tag")) {
      var new_tag = source.id;
      var seles = cy.$('node:selected');

      for (var i=0 ; i<seles.length ; i++) {
        id = seles[i]._private.data.id;

        seles[i]._private.data.tag = new_tag;
        update_tr(cy,id)

        // set color here
        cy.$('#'+id).style('background-color', colors[new_tag]);
        cy.$('#'+id).style('border-color', outline_colors[new_tag]);
        cy.$('#'+id).style('color', outline_colors[new_tag]);

        // update connected edges
        var _edges = seles[i].connectedEdges()
        for (var j = 0 ; j<_edges.length ; j++) {
          var col1 = get_edge_color(cy.$('#'+_edges[j].data('source'))[0]._private.data.tag);
          var col2 = get_edge_color(cy.$('#'+_edges[j].data('target'))[0]._private.data.tag);
          console.log("NEW COLORS", col1.concat(' ',col2))
          _edges[j].data('colors', col1.concat(' ',col2));
          _edges[j].data('arrow_color', col2);
        }
      }
    }
  });

  // figure out how to make this function fire when network loads from file.
  cy.on('layoutstop', format_network(cy));

  // on LEFT CLICK
  cy.on('tap', function(event){
    text_active = false;

    document.activeElement.blur();
    // target holds a reference to the originator
    // of the event (core or element)
    var evtTarget = event.target;
    console.log("target",event.target)
    console.log("cy",cy)
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
      // works for old version of cytoscape
    //   var title = cy.$('#'+id)._private.eles[0]._private.data.title;
    // var description = cy.$('#'+id)._private.eles[0]._private.data.description;
    // var tag = cy.$('#'+id)._private.eles[0]._private.data.tag;
    // var done = cy.$('#'+id)._private.eles[0]._private.data.done;

      // for new version of cytoscape
      console.log(event.target)
      document.getElementById("title_form").value = event.target._private.data.title;
      document.getElementById("description_form").value = event.target._private.data.description;
      document.getElementById("id_form").value = event.target._private.data.id;
      // set the color tags
      var set_tag = event.target._private.data.tag;
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
      cy.$("#"+id).data('title',
              document.getElementById("title_form").value);
      update_tr(cy, id);
    }
  };
  // on input event for description text box in form
  document.getElementById("description_form").oninput = function () {
    text_active = true;
    if (cy.$(':selected').length > 0) {
      id = document.getElementById("id_form").value;
      cy.$("#"+id).data('description',
              document.getElementById("description_form").value);
      update_tr(cy, id)
  };
};
make_unordered_table(cy);
return cy;
};
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
  function make_empty_tr() {
    var table = document.getElementById("task_table");
    var row = table.insertRow(-1); // 0 for first position, -1 for last position
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    cell1.innerHTML = " ";
    cell2.innerHTML = " ";
    cell3.innerHTML = " ";
  }
  function make_tr(cy, id) {
    // creates a new table row in the task table
    // uses information from the cytoscape db
   
    // for new version of cytoscape
    var title = cy.$('#'+id)._private.eles[0]._private.data.title;
    var description = cy.$('#'+id)._private.eles[0]._private.data.description;
    var tag = cy.$('#'+id)._private.eles[0]._private.data.tag;
    var done = cy.$('#'+id)._private.eles[0]._private.data.done;
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
  }
  /*
  // FUNCTION
  // NOT
  // DONE
  update table should remove rows corresponding to nodes that are done and 
  only show rows corresponding to nodes that are not done
  */
  function update_table(cy) {
    
    // delete all rows from the table
    var table = document.getElementById("task_table");
    for (var i=table.rows.length-1 ; i>=0 ; i--) {
    // for (var i=0 ; i<table.rows.length ; i++) {
      table.rows[i].remove();
    }

    var done_eles = cy.filter('node[done = "true"]').remove();


    // IMMEDIATE TODO ITEMS
    // add all notdone orphan tasks to table
    var eles = cy.nodes();
    eles = cy.filter('node[done = "false"]');
    eles = eles.roots();
    // add new rows to the table
    for (var i=0 ; i<eles.length ; i++) {
      id = eles[i]._private.data.id;
      make_tr(cy, id);
      update_tr(cy, id);
    }
    make_empty_tr();
    make_empty_tr();
    make_empty_tr();
    root_eles = cy.nodes().roots().remove();

    // LATER TODO ITEMS
    // add all notdone nonorphan tasks to table
    var eles = cy.nodes();
    eles = cy.filter('node[done = "false"]');
    // eles = eles.nonorphans();
    // add new rows to the table
    for (var i=0 ; i<eles.length ; i++) {
      id = eles[i]._private.data.id;
      make_tr(cy, id);
      update_tr(cy, id);
    }
    make_empty_tr();
    make_empty_tr();
    make_empty_tr();

    root_eles.restore();
    done_eles.restore();
    // DONE ITEMS

    // // add all finished tasks to table
    var eles = cy.nodes();
    var eles = cy.filter('node[done = "true"]');
    // add new rows to the table
    for (var i=0 ; i<eles.length ; i++) {
      id = eles[i]._private.data.id;
      make_tr(cy, id);
      update_tr(cy, id);
    }
    
  }
  function update_tr(cy, id) {
    // updates a table row in the task table
    // uses information from the cytoscape db

    var title = cy.$('#'+id)._private.eles[0]._private.data.title;
    var description = cy.$('#'+id)._private.eles[0]._private.data.description;
    var tag = cy.$('#'+id)._private.eles[0]._private.data.tag;
    var done = cy.$('#'+id)._private.eles[0]._private.data.done;

    var done = (done == "true");
    var table = document.getElementById("task_table")[0];
    var row = document.getElementById(id+"row");

    console.log("ID", id)
    console.log("ROW", row);

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
      // var tag = cy.$('#'+id)._private.eles[0]._private.data.tag;
      if (box.checked) {
        cy.$('#'+id)._private.eles[0]._private.data.done = "true";
        cy.getElementById(id).addClass('done');
      } else {
        cy.$('#'+id)._private.eles[0]._private.data.done = "false";
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
  function format_network(cy) {
    console.log("formatted network")
    var eles = cy.nodes().components();
    console.log(eles)
    // set color here
    for (var i=0 ; i<eles.length ; i+=1) {
      var elem = eles[i];
      var tag = elem._private.eles[0]._private.data.tag;
      // cy.style().selector('node#'+id).style('background-color', colors[new_tag]).update()
      // var seles = cy.$(':selected');
      elem.style('background-color', colors[tag]);
      elem.style('border-color', outline_colors[tag]);
    }
  }

  function get_edge_color(col1, done=false) {
    // correct the red color
    col1 = (col1 == "red") ? "orangered" : col1;
    // correct the orange color
    col1 = (col1 == "orange") ? "gold" : col1;
    // correct the green color
    col1 = (col1 == "green") ? "lawngreen" : col1;
    // correct the blue color
    col1 = (col1 == "blue") ? "deepskyblue" : col1;
    // correct the gray color
    col1 = (col1 == "gray") ? "lightslategray" : col1;
    // correct the edge case gray color
    col1 = (col1 == "none") ? "lightslategray" : col1;
    return col1;
  }

module.exports = new TestGraph();
