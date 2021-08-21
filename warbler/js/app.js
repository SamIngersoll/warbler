const tg = require('./cy_graph');
// console.log("IMPORT WORKED");
// console.log(tg);

// Require Photon
const Photon = require('./../');
// Lop Photon instance
console.log(Photon);

// const cyoptions = require('./js/cyoptions.js')

window.addEventListener("activate", function(event) {
  console.log(event);
});

window.addEventListener("load", function() {
  var componentGroup = document.getElementsByClassName("component-groups")[0];
  componentGroup.addEventListener("activate", function(event) {
    var viewSelector = event.detail.button.getAttribute("data-view");
    var btns = this.getElementsByTagName("button");
    for (var i = 0; i < btns.length; i++) {
      document.querySelector(btns[i].getAttribute("data-view")).style.display = "none";
    }
    document.querySelector(viewSelector).style.removeProperty("display");
  });

  document.getElementsByClassName("btn-show-menu")[0].addEventListener("mousedown", function() {
    Photon.DropDown(this, [
      {
        label: "Item 1",
        submenu: [
          {
            label: "Sub Item 1.1",
            click: function() {
              console.log("Clicked Sub Item 1.1");
            }
          }
        ]
      },
      {
        label: "Item 2",
        submenu: [
          {
            label: "Sub Item 2.1"
          }
        ]
      }
    ]);
  });

  //document.getElementsByClassName("progress-circle")[0].updateCircleProgress(62.5);


  const tabGroup = document.getElementsByTagName("tab-group")[0];
  tabGroup.addEventListener("tabActivate", function(event) {
    console.log(event);
  });
  tabGroup.addEventListener("tabClose", function(event) {
    console.log(event);
  });
  tabGroup.addEventListener("tabMove", function(event) {
    console.log(event);
  });
  tabGroup.addEventListener("tabAdd", function(event) {
    console.log(event);
  });

  window.addEventListener("swipe", function(event) {
    console.log(event);
  });

  const circularSlider = document.getElementsByTagName("circular-slider")[0];
  circularSlider.addEventListener("input", function(event) {
    console.log(event);
  });
  circularSlider.addEventListener("change", function(event) {
    console.log(event);
  });


  window.addEventListener("resize", function(event) {
    //console.log(event);
  });

  window.addEventListener("input", function(event) {
    console.log(event);
  });



});
