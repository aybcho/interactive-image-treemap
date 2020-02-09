/** Built from Mike Bostocks's example of a treemap implementation
https://bl.ocks.org/mbostock/6bbb0a7ff7686b124d80
And also,
https://bl.ocks.org/shimizu/79409cca5bcc57c32ddae0a5f0a1a564
**/

let treemapWidth = 1200,
  treemapHeight = 600

// sets x and y scale to determine size of visible boxes
let x = d3.scaleLinear()
  .domain([0, treemapWidth])
  .range([0, treemapWidth]);

let y = d3.scaleLinear()
  .domain([0, treemapHeight])
  .range([0, treemapHeight]);

let treemapClicked = 0;

// ************************************
// Execute functions
// ************************************

// Draw treemap
drawTreemap();
// Append event listeners to treemap
treemapEvents();

// Redraw treemap every 3 seconds
setInterval(function(){
  // Draw treemap
  drawTreemap();
  // Append event listeners to treemap
  treemapEvents();
}, 3000);

// ************************************
// Function definitions
// ************************************

// Draw D3 treemap
function drawTreemap() {
  randomize();
  let stratify = d3.stratify()
    .parentId(function(d) {
      return d.id.substring(0, d.id.lastIndexOf("."));
    });
  let root = stratify(treemapData).sum(function(d) {
    return d.value;
  });
  let treemap = d3.treemap()
    .tile(d3.treemapBinary)
    .size([treemapWidth, treemapHeight])
    .padding(10)
    .round(true);
  treemap(root);

  let treemapSVG = d3.select('#aboutTreemapContainer');
  let node = treemapSVG.selectAll(".treemapNode").data(root.children);
  let newNode = node.enter()
    .append("div")
    .attr("class", "treemapNode")
    .attr("id", function(d, i) {
      return d.data.id;
    })
    .style("background-image", function(d) {
      return "url(" + d.data.dir + ")";
    });
  node.merge(newNode)
    .transition()
    .duration(1000)
    .style("left", function(d) {
      return d.x0 + "px";
    })
    .style("top", function(d) {
      return d.y0 + "px";
    })
    .style("width", function(d) {
      return (d.x1 - d.x0) + "px";
    })
    .style("height", function(d) {
      return (d.y1 - d.y0) + "px";
    });
}

//Helper function for all event handling on treemap
function treemapEvents() {
  // Remove any event listeners from previous interval
  $('.treemapNode').unbind();

  // Attach on click event listeners
  $('.treemapNode').on("click", function(d) {
    let selectedTreemapNode = treemapData.filter(function(child, index) {
      if (d.target.id == child.id) {
        return child;
      }
    })[0];

    let imageWHRatio = +selectedTreemapNode.width / +selectedTreemapNode.height;
    let divWHRatio = treemapWidth / treemapHeight;

    if (treemapClicked == 0) {
      treemapClicked = 1;
      let imageWidth, imageHeight;
      if (divWHRatio > imageWHRatio) {
        imageHeight = treemapHeight;
        imageWidth = treemapHeight * imageWHRatio;
      } else {
        imageHeight = treemapWidth / imageWHRatio;
        imageWidth = treemapWidth;
      }

      $('.treemapNode').addClass('hiddenTreemapNode');

      d3.select('#aboutTreemapContainer')
        .data([selectedTreemapNode])
        .append("img")
        .attr("class", "selectedTreemapNode")
        .attr("src", function(de) {
          return de.dir;
        })
        .style("height", imageHeight + 'px')
        .style("width", imageWidth + 'px')
        .transition()
        .duration(750)
        .style('transform', function() {
          let left = (treemapWidth - imageWidth) / 2 + 'px';
          let top = (treemapHeight - imageHeight) / 2 + 'px';
          return 'translate(' + left + ',' + top + ')';
        });

      //Descriptive text of selected image
      let selectedTreemapNodeDesc = selectedTreemapNode.desc;
      d3.select('#aboutTreemapContainer')
        .append('p')
        .attr('class', 'aboutText selectedTreemapNodeText text-center')
        .style("width", imageWidth + 'px')
        .text(selectedTreemapNodeDesc)
        .transition()
        .duration(750)
        .style('transform', function() {
          let left = (treemapWidth - imageWidth) / 2 + 'px';
          let top = (treemapHeight - imageHeight) / 2 + 'px';
          return 'translate(' + left + ',' + top + ')';
        });
      $('.selectedTreemapNode').on('click', function() {
        treemapClicked = 0;
        $('.treemapNode').removeClass('hiddenTreemapNode');
        $('.selectedTreemapNode').remove();
        $('.selectedTreemapNodeText').remove();
      })
    } else {
      treemapClicked = 0;
      $('.treemapNode').removeClass('hiddenTreemapNode');
      $('.selectedTreemapNode').remove();
      $('.selectedTreemapNodeText').remove();
    }
  });
}

// Randomize the order of images to be displayed on treemap
function randomize() {
  treemapData.filter(function(d) {
      return d.id !== "root";
    })
    .forEach(function(d) {
      d.value = ~~(d3.randomUniform(1, 10)());
    });
}
