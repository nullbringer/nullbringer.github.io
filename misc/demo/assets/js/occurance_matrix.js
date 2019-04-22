function createOccuranceMatrix(id, file){
	
	var margin = {
          top: 50,
          right: 0,
          bottom: 0,
          left: 80
          },
          width = 400,
          height = 400;

        var svg = d3version4.select("#"+id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height);



        d3version4.json("assets/demo_data/"+file, function(data) {
            var matrix = [];
            var nodes = data.nodes;
            var total_items = nodes.length;

            


            // Create rows for the matrix
            nodes.forEach(function(node) {
                node.count = 0;
                node.group = groupToInt(node.group);
                matrix[node.index] = d3version4.range(total_items).map(item_index => {
                    return {
                        x: item_index,
                        y: node.index,
                        z: 0
                    };
                });
            });

            var max_range =0; 
            var min_range = 0;

            // Fill matrix with data from links and count how many times each item appears
            data.links.forEach(function(link) {
                matrix[link.source][link.target].z += link.value;
                matrix[link.target][link.source].z += link.value;
                nodes[link.source].count += link.value;
                nodes[link.target].count += link.value;

                max_range = Math.max(max_range, link.value)
                min_range = Math.min(min_range, link.value)

            });

            console.log("max: "+max_range);
            console.log("min:"+max_range);


            var matrixScale = d3version4.scaleBand().range([0, width]).domain(d3version4.range(total_items));
            var opacityScale = d3version4.scaleLinear().domain([min_range, max_range]).range([0.1, 1.0]).clamp(true);
            var colorScale = d3version4.scaleOrdinal(d3version4.schemeCategory20);



            // Draw each row (translating the y coordinate)
            var rows = svg.selectAll(".row")
                .data(matrix)
                .enter().append("g")
                .attr("class", "row")
                .attr("transform", (d, i) => {
                    return "translate(0," + matrixScale(i) + ")";
                });

            var squares = rows.selectAll(".cell")
                .data(d => d.filter(item => item.z > 0))
                .enter().append("rect")
                .attr("class", "cell")
                .attr("x", d => matrixScale(d.x))
                .attr("width", matrixScale.bandwidth())
                .attr("height", matrixScale.bandwidth())
                .style("fill-opacity", d => opacityScale(d.z)).style("fill", d => {
                    return nodes[d.x].group == nodes[d.y].group ? colorScale(nodes[d.x].group) : "grey";
                })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);

            var columns = svg.selectAll(".column")
                .data(matrix)
                .enter().append("g")
                .attr("class", "column")
                .attr("transform", (d, i) => {
                    return "translate(" + matrixScale(i) + ")rotate(-90)";
                });

            rows.append("text")
                .attr("class", "label")
                .attr("x", -5)
                .attr("y", matrixScale.bandwidth() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "end")
                .text((d, i) => capitalize_Words(nodes[i].name));

            columns.append("text")
                .attr("class", "label")
                .attr("y", 100)
                .attr("y", matrixScale.bandwidth() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "start")
                .text((d, i) => capitalize_Words(nodes[i].name));

            // Precompute the orders.
            var orders = {
                name: d3version4.range(total_items).sort((a, b) => {
                    return d3version4.ascending(nodes[a].name, nodes[b].name);
                }),
                count: d3version4.range(total_items).sort((a, b) => {
                    return nodes[b].count - nodes[a].count;
                }),
                group: d3version4.range(total_items).sort((a, b) => {
                    return nodes[b].group - nodes[a].group;
                })
            };



            rows.append("line")
                .attr("x2", width);

            columns.append("line")
                .attr("x1", -width);

            var tooltip = d3version4.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            function mouseover(p) {
                d3version4.selectAll(".row text").classed("active", (d, i) => {
                    return i == p.y;
                });
                d3version4.selectAll(".column text").classed("active", (d, i) => {
                    return i == p.x;
                });
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(capitalize_Words(nodes[p.y].name) + " - " +
                        capitalize_Words(nodes[p.x].name) + "</br>" +
                        p.z + " times!")
                    .style("left", (d3version4.event.pageX + 30) + "px")
                    .style("top", (d3version4.event.pageY - 50) + "px");

            }

            function mouseout() {
                d3version4.selectAll("text").classed("active", false);
                tooltip.transition().duration(500).style("opacity", 0);
            }
        });
            
        /* utils */ 
            
          var groupToInt = function(area) {
          if(area == "exatas"){
              return 1;
          }else if (area == "educacao"){
              return 2;
          }else if (area == "humanas"){
              return 3;
          }else if (area == "biologicas"){
              return 4;
          }else if (area == "linguagem"){
              return 5;
          }else if (area == "saude"){
              return 6;
          }
      };

      var intToGroup = function(area) {
          if(area == 1){
              return "exatas";
          }else if (area == 2){
              return "educacao";
          }else if (area == 3){
              return "humanas";
          }else if (area == 4){
              return "biologicas";
          }else if (area == 5){
              return "linguagem";
          }else if (area == 6){
              return "saude";
          }
      };

      function capitalize_Words(str){
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      }
}


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    createOccuranceMatrix('d3-matrix-ny','amazon/ny/matrix-cooc.json');
    createOccuranceMatrix('d3-matrix-tw','amazon/tw/matrix-cooc.json');
    createOccuranceMatrix('d3-matrix-cc','amazon/cc/matrix-cooc.json');

    createOccuranceMatrix('all-d3-matrix-ny','all/ny/matrix-cooc.json');
    createOccuranceMatrix('all-d3-matrix-tw','all/tw/matrix-cooc.json');
    createOccuranceMatrix('all-d3-matrix-cc','all/cc/matrix-cooc.json');
});