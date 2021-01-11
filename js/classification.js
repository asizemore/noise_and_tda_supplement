// Inspired by https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89
        // and https://www.d3-graph-gallery.com/graph/line_change_data.html
        // and https://bl.ocks.org/jadiehm/0d341b74bef30889c893a3b14cbeb974
        // and https://bl.ocks.org/dimitardanailov/99950eee511375b97de749b597147d19

        svg = d3.select("#svg0");
        svg1 = d3.select("#svg-pair1")
        svg2 = d3.select("#svg-pair2")
        const svg_pair_s = +svg1.attr("width")   // Both paired svgs are squares so we only need one side.




        const width = +svg.attr("width"),
        height = +svg.attr("height")

        // Data things
        const nEdges = 604;
        const nEdges_total = 2415;
        const betti_colors = ["#243A4C", "#406372", "#66939E", "#9BC3C6"];

        // UPDATE LATER
        const model_names = ["IID","assortative","coreperiphery", "cosineGeometric","disassortative", "discreteUniform","dotProduct", "geometricConf", "randomGeometric", "ringLattice", "rmsd", "squaredEuclidean" ];
        const model_abbrevs = ["IID", "ast", "cp", "cosG", "dast", "disU", "dp", "geom","rg", "rl", "rmsd", "se"];
        const rho_vals = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9];

        // Set click boolean to 0 so we know when a box has been clicked.
        box_click_yn = 0;


        // Pick one threshold, create matrix
        let visible_threshold = "thresh05";
        let visible_edge = "1208";
        let g_1 = model_names[1];
        let g_2 = model_names[2];

        const axis_scale = d3.scaleLinear();
        axis_scale.domain([0, 12]);
        axis_scale.range([100, width-60]);


        // Set colormaps
        const colormap_max = 250;
        const color_scale_correct = d3.scaleSequential().domain([1,colormap_max])
            .interpolator(d3.interpolateBlues);
        const color_scale_incorrect = d3.scaleSequential().domain([1,colormap_max])
            .interpolator(d3.interpolateReds);

        
        // Set x and y scales
        let x_scale = d3.scaleLinear()
        .domain([0, 1])
        .range([80, svg_pair_s-50]);
        
        
        let y_scale = d3.scaleLinear().range([svg_pair_s-60,40]);

        
        svg1.append("g")
        .attr("id","yaxis1")
        .attr("class","axis")
        .attr("transform", `translate(65,0)`);

        svg2.append("g")
        .attr("id","yaxis2")
        .attr("class","axis")
        .attr("transform", `translate(65,0)`);
        // .attr("transform","translate(" + (svg_pair_s-35) + ",0)");
        
        
        // Draw axes
        svg.append("text")
            .attr("class","titles")
            .attr("transform","translate(" + (width/2-20) + "," + 60 + ")")
            .text("Predicted model")

        svg.append("text")
            .attr("class","titles")
            .attr("transform","translate(" + 40 + "," + ((width-160)/2 + 100) + "),rotate(-90)")
            .attr("text-anchor", "middle")
            .text("True model")

        svg1.append("g")
            .attr("class","axis")
            .attr("transform", `translate(0, ${svg_pair_s-45})`)
            .attr("opacity",0)
            .call(d3.axisBottom(x_scale));
    
        svg2.append("g")
            .attr("class","axis")
            .attr("transform", `translate(0, ${svg_pair_s-45})`)
            .attr("opacity",0)
            .call(d3.axisBottom(x_scale));

        let margin = 10;
        svg1.append("text") 
            .attr("class","axis-labels")            
            .attr("transform",
                    "translate(" + ((svg_pair_s-50-80)/2 + 80) + " ," + 
                                (svg_pair_s - margin) + ")")
            .attr("opacity", 0)
            .text("Edge density");

        svg2.append("text") 
            .attr("class","axis-labels")            
            .attr("transform",
                    "translate(" + ((svg_pair_s-50-80)/2 + 80) + " ," + 
                                (svg_pair_s - margin) + ")")
            .attr("opacity", 0)
            .text("Edge density");

        svg1.append("text") 
            .attr("class","axis-labels")            
            .attr("transform",
                    "translate(" + 10 + " ," + 
                                (svg_pair_s/2) + ")")
            .attr("opacity", 0)
            .text("β_k");

        svg2.append("text") 
            .attr("class","axis-labels")            
            .attr("transform",
                    "translate(" + 10 + " ," + 
                                (svg_pair_s/2) + ")")
            .attr("opacity", 0)
            .text("β_k");




        svg1.append("text")
            .attr("class", "axis-labels")
            .attr("id","g1-title")
            .attr("transform", "translate(" + ((svg_pair_s-50-80)/2 + 80) + "," + 20 + ")")
            .attr("text-anchor", "middle")
            .attr("opacity",0)
            .text("True model: " + g_1);

        svg2.append("text")
            .attr("class", "axis-labels")
            .attr("id", "g2-title")
            .attr("transform", "translate(" + ((svg_pair_s-50-80)/2 + 80) + "," + 20 + ")")
            .attr("opacity",0)
            .text("True model: " + g_2);



            


        d3.csv("../data/classification_all_101220.csv", function(error, data) {
            d3.json("../data/main_k4.json", function(error, bettis) {
            


                // const nModels = Math.sqrt(data.length);
                const box_s = 35;
                console.log(data)
                console.log(data.filter(t => t.TP === "IID_IID")[0])

                let position_scale = model_names.map((e,i) => [e, axis_scale(i)])
                console.log(position_scale)
                let position_map = new Map(position_scale);
                console.log(position_map)

                console.log(bettis)



                // Draw boxes
                let boxes = svg.append("g")

                boxes.selectAll("g")
                    .data(data)
                    .enter()
                    .append("rect")
                        .attr("x",function(d) {return position_map.get(d.TP.split("_")[1]);})
                        .attr("y",function(d) {return position_map.get(d.TP.split("_")[0]);})
                        .attr("class","boxes")
                        .attr("width", box_s)
                        .attr("height",box_s)
                        .attr("fill",function(d) {return (d.TP.split("_")[0] === d.TP.split("_")[1]) ? "#1E9662" : "#BA2F74";})
                        .attr("stroke","white")
                        .attr("stroke-width", 0.5)
                        .attr("stroke-opacity", 0.5)
                        .style("fill-opacity", function(d) {console.log(d[visible_threshold]/colormap_max); return d[visible_threshold]/colormap_max})
                        .on("mouseover", mouseover)
                        .on("mouseout", mouseout)
                        .on("click",onclick);

                svg.append("text")
                        .text("")
                        .attr("id","click-text")
                        .attr("fill", "white")
                        .style("text-anchor","middle");

                // Write names on axes
                const predicted_names = svg.append("g")
                predicted_names.selectAll("text")
                    .data(model_abbrevs)
                    .enter()
                    .append("text")
                        .text(function(d) {return d})
                        .attr("fill", "white")
                        .attr("x",function(d,i) {return position_map.get(model_names[i]) + box_s/2;})
                        .attr("y",95)
                        .attr("text-anchor","middle");

                const correct_names = svg.append("g")
                correct_names.selectAll("text")
                    .data(model_abbrevs)
                    .enter()
                    .append("text")
                        .text(function(d) {return d})
                        .attr("fill", "white")
                        .attr("y",function(d,i) {return position_map.get(model_names[i])+box_s/2;})
                        .attr("x",95)
                        .attr("text-anchor","end");


                function mouseover(d) {

                    d3.select(this).transition().duration(50).attr("stroke-opacity",1).attr("stroke-width", 2);

                    box_text = svg.append("text")
                            .text(d[visible_threshold].split(".")[0])
                            .attr("id","hover-text")
                            .attr("x",position_map.get(d.TP.split("_")[1]) + box_s/2)
                            .attr("y",position_map.get(d.TP.split("_")[0]) + box_s/2 + 4)
                            .attr("fill", "white")
                            .style("text-anchor","middle");


                };

                function mouseout(d) {

                    d3.select(this).transition().duration(50).attr("stroke-opacity",0.5).attr("stroke-width", 0.5);
                    d3.selectAll("#hover-text").remove();
  

                };


                function drawThresholdBar(visible_edge, x_scale, y_scale, svg_i, max_y, buffer, nEdges_total, thresh_line_class) {

                    // Draw the vertical bar representing the threshold value on the svg_i plot.
                    console.log(visible_edge)
                    let threshold_line = svg_i.selectAll(`#${thresh_line_class}`).data([+visible_edge]);
                    threshold_line.enter()
                        .append("path")
                        .attr("class", "threshline")
                        .attr("id", `${thresh_line_class}`)
                        .merge(d3.selectAll(`#${thresh_line_class}`))
                        .transition()
                        .duration(1000)
                        .attr("d", function(d) {return `M ${x_scale(d/nEdges_total)} ${y_scale(0)} L ${x_scale(d/nEdges_total)} ${y_scale(max_y+buffer)}`})
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .attr("stroke-dasharray", "10,10");


                }

                

                function drawBettis(g_1,g_2,visible_edge) {
        
                    // bettis1 = bettis[d.TP.split("_")[0]][visible_edge];
                    // bettis2 = bettis[d.TP.split("_")[1]][visible_edge];
                    console.log(g_1)
                    console.log(g_2)
                    bettis1 = bettis[g_1][visible_edge];
                    bettis2 = bettis[g_2][visible_edge];
        
                    let lines1 = {line1: svg1.selectAll(".dim1_t").data([bettis1.dim1]),
                    line2: svg1.selectAll(".dim2_t").data([bettis1.dim2]),
                    line3: svg1.selectAll(".dim3_t").data([bettis1.dim3]),
                    line4: svg1.selectAll(".dim4_t").data([bettis1.dim4])};
        
                    let lines2 = {line1: svg2.selectAll(".dim1_p").data([bettis2.dim1]),
                    line2: svg2.selectAll(".dim2_p").data([bettis2.dim2]),
                    line3: svg2.selectAll(".dim3_p").data([bettis2.dim3]),
                    line4: svg2.selectAll(".dim4_p").data([bettis2.dim4])};
        
                    // Adjust y axis
                    let max_y = d3.max([d3.max(bettis1.dim1), d3.max(bettis1.dim2), d3.max(bettis1.dim3), d3.max(bettis1.dim4),
                        d3.max(bettis2.dim1), d3.max(bettis2.dim2), d3.max(bettis2.dim3), d3.max(bettis2.dim4)]);
        
                    let buffer = max_y*(0.1);
        
        
                    
                    y_scale.domain([0, max_y+buffer]);
                    svg1.selectAll("#yaxis1")
                        .transition()
                        .duration(1000)
                        .call(d3.axisLeft().scale(y_scale));
                    
                    svg2.selectAll("#yaxis2")
                        .transition()
                        .duration(1000)
                        .call(d3.axisLeft().scale(y_scale));
        
                    for (let index = 0; index < 4; index++) {
        
                                    lines1[`line${index+1}`].enter()
                                        .append("path")
                                            .attr("class","dims")
                                            .attr("class",`dim${index+1}_t`)
                                            .merge(d3.selectAll(`.dim${index+1}_t`))
                                            .transition()
                                            .duration(1000)
                                            .attr("d", d3.line()
                                                .x(function(d, i) {return x_scale(i/nEdges); })
                                                .y(function(d) {return y_scale(d); }))
                                            .attr("stroke", betti_colors[index])
                                            .attr("fill", "none")
                                            .attr("stroke-width", 3);
        
        
        
                                    lines2[`line${index+1}`].enter()
                                        .append("path")
                                            .attr("class","dims")
                                            .attr("class",`dim${index+1}_p`)
                                            .merge(d3.selectAll(`.dim${index+1}_p`))
                                            .transition()
                                            .duration(1000)
                                            .attr("d", d3.line()
                                                .x(function(d, i) {return x_scale(i/nEdges); })
                                                .y(function(d) {return y_scale(d); }))
                                            .attr("stroke", betti_colors[index])
                                            .attr("fill", "none")
                                            .attr("stroke-width", 3);
        
                    };

                    // Draw threshold lines
                    drawThresholdBar(visible_edge, x_scale, y_scale, svg1, max_y, buffer, nEdges_total, "threshold_line_1");
                    drawThresholdBar(visible_edge, x_scale, y_scale, svg2, max_y, buffer, nEdges_total, "threshold_line_2");
                };
        
                function onclick(d) {


                    // Add .clicked class to the text
                    let clicked_text = d3.select("#click-text")
                    clicked_text.attr("class","clicked")


                    // remove clicked class after 750ms.
                    setTimeout(function () { clicked_text.attr("class", null) }, 750);
        

                    // Replace and update box stroke properties
                    d3.selectAll(".boxes").transition().duration(50).attr("stroke-opacity",0.5).attr("stroke-width", 0.5).attr("rx",0);
                    d3.select(this).transition().duration(50).attr("stroke-opacity",1).attr("stroke-width", 5).attr("rx",4);

                    // Replace mouseout event
                    d3.selectAll(".boxes").on("mouseout",mouseout)
                    d3.select(this).on("mouseout", null);
                    d3.selectAll(".boxes").on("mouseover",mouseover)
                    d3.select(this).on("mouseover", null);

                    // Update accuracy text
                    d3.selectAll("#click-text").remove();
                    svg.append("text")
                        .attr("id","click-text")
                        .attr("x",position_map.get(d.TP.split("_")[1]) + box_s/2)
                        .attr("y",position_map.get(d.TP.split("_")[0]) + box_s/2 + 4)
                        .attr("fill", "white")
                        .style("text-anchor","middle")
                        .text("");

                    d3.select("#click-text").text(d[visible_threshold].split(".")[0]).transition().delay(750).duration(200);

                    console.log(d3.select("#click-text").attr("text"))



                    // Redefine g_1, g_2
                    g_1 = d.TP.split("_")[0];
                    g_2 = d.TP.split("_")[1];

                    // Show axes
                    d3.selectAll(".axis")
                        .attr("opacity", 1);
                    d3.selectAll(".axis-labels")
                        .attr("opacity", 1);

                    // Rewrite titles
                    d3.select("#g1-title")
                        .text("True model: " + g_1)
                    d3.select("#g2-title")
                        .text("Predicted model: " + g_2)

                    // Draw bettis
                    drawBettis(g_1,g_2,visible_edge)

                    // Set click boolean to 1
                    box_click_yn = 1;

        

        
                };
        
                // What happens when we change the Slider Input?
                let changed = function() {

                    
                    // Get the slider value
                    value_edge = this.value;
        
                    visible_threshold = "thresh"+rho_vals[value_edge].toString().replace(".", "");
                    visible_edge = Math.ceil(rho_vals[value_edge]*2415);

        
                    d3.selectAll(".boxes")
                        .transition()
                        .ease(d3.easeLinear)           // control the speed of the transition
                        .duration(200)
                        .style("fill-opacity", function(d) { return d[visible_threshold]/colormap_max});
        
        
                    // Draw bettis and update box text if a box has already been clicked
                    if (box_click_yn) {
                        
                        drawBettis(g_1,g_2,visible_edge);

                        d3.select("#click-text").text(data.filter(x => x.TP === `${g_1}_${g_2}`)[0][visible_threshold].split(".")[0]);

                    };


                };

   
        
                // Input actions
                d3.select("#slider-range")
                    .on("input", changed)
                    .on("change", changed);



                function setBubble(range, bubble) {
                    const val = range.value;
                    const min = range.min ? range.min : 0;
                    const max = range.max ? range.max : 100;
                    const newVal = Number(((val - min) * 100) / (max - min));
                    bubble.innerHTML = val;
                    
                    // Sorta magic numbers based on size of the native UI thumb
                    bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
                }


                
                
                
                
                
                
                
                
                
            }) 
        });
        



