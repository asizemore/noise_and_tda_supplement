// Inspired by https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89
        // and https://www.d3-graph-gallery.com/graph/line_change_data.html
        // and https://bl.ocks.org/jadiehm/0d341b74bef30889c893a3b14cbeb974
        // and https://bl.ocks.org/dimitardanailov/99950eee511375b97de749b597147d19

        svg = d3.select("#svg0");
        svg1 = d3.select("#svg-pair1")
        svg2 = d3.select("#svg-pair2")
        const svg_pair_s = +svg1.attr("width")   // Both paired svgs are squares so we only need one side.
        console.log(svg_pair_s)


        const width = +svg.attr("width"),
        height = +svg.attr("height")

        // Data things
        const nEdges = 2415;
        const betti_colors = ["#243A4C", "#406372", "#66939E", "#9BC3C6"];

        // UPDATE LATER
        const model_names = ["IID","assortative","coreperiphery", "cosineGeometric","disassortative", "discreteUniform","dotProduct", "geometricConf", "randomGeometric", "ringLattice", "rmsd", "squaredEuclidean" ];
        const model_abbrevs = ["IID", "ast", "cp", "cosG", "dast", "disU", "dp", "geom","rg", "rl", "rmsd", "se"];
        const rho_vals = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9];


        // Pick one threshold, create matrix
        let visible_threshold = "thresh05";
        let visible_edge = "1208";
        let g_1 = model_names[1];
        let g_2 = model_names[2];

        const axis_scale = d3.scaleLinear();
        axis_scale.domain([0, 12]);
        axis_scale.range([100, width-60]);

        // Set colormaps
        const color_scale_correct = d3.scaleSequential().domain([1,100])
            .interpolator(d3.interpolateBlues);
        const color_scale_incorrect = d3.scaleSequential().domain([1,100])
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
        .attr("transform","translate(" + (svg_pair_s-35) + ",0)");
        
        
        // Draw axes
        svg.append("text")
            .attr("class","titles")
            .attr("transform","translate(" + (width/2-20) + "," + 60 + ")")
            .text("Predicted model")

        svg.append("text")
            .attr("class","titles")
            .attr("transform","translate(" + 40 + "," + (height/2+20) + "),rotate(-90)")
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
                    "translate(" + (svg_pair_s/2 + 35) + " ," + 
                                (svg_pair_s - margin) + ")")
            .attr("opacity", 0)
            .text("Edge density");

        svg2.append("text") 
            .attr("class","axis-labels")            
            .attr("transform",
                    "translate(" + (svg_pair_s/2 + 35) + " ," + 
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


        svg1.append("text")
            .attr("class", "axis-labels")
            .attr("id","g1-title")
            .attr("transform", "translate(" + (svg_pair_s/2 + 35) + "," + 20 + ")")
            .attr("opacity",0)
            .text("True model: " + g_1);

        svg2.append("text")
            .attr("class", "axis-labels")
            .attr("id", "g2-title")
            .attr("transform", "translate(" + (svg_pair_s/2 + 35) + "," + 20 + ")")
            .attr("opacity",0)
            .text("True model: " + g_2);



            


        d3.csv("../data/test.csv", function(error, data) {
            d3.json("../data/foo4b.json", function(error, bettis) {
            


                const nModels = Math.sqrt(data.length);
                const box_s = 35;

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
                        .attr("fill",function(d) {return (d.TP.split("_")[0] === d.TP.split("_")[1]) ? "teal" : "pink";})
                        .attr("stroke","white")
                        .attr("stroke-width", 0.5)
                        .attr("stroke-opacity", 0.5)
                        .style("fill-opacity", function(d) {console.log(d[visible_threshold]/100); return d[visible_threshold]/100})
                        .on("mouseover", mouseover)
                        .on("mouseout", mouseout)
                        .on("click",onclick);

                let box_text;

                

                // Write names
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
                            .text(d[visible_threshold])
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
                        .call(d3.axisRight().scale(y_scale));
        
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
        
                    }
                };
        
                function onclick(d) {
        

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
                            .text(d[visible_threshold])
                            .attr("id","click-text")
                            .attr("x",position_map.get(d.TP.split("_")[1]) + box_s/2)
                            .attr("y",position_map.get(d.TP.split("_")[0]) + box_s/2 + 4)
                            .attr("fill", "white")
                            .style("text-anchor","middle");

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
                    
        
                    // // Make the div visible
                    // div_pair.transition()
                    // .duration('50')
                    // .style("opacity", 1)
        

        
                };
        
                let changed = function() {
                    value_edge = this.value;
                    // console.log(rho_vals[value_edge].toString().replace(".", ""));
        
                    visible_threshold = "thresh"+rho_vals[value_edge].toString().replace(".", "");
                    visible_edge = Math.round(rho_vals[value_edge]*2415);
                    console.log(visible_edge)
        
                    d3.selectAll(".boxes")
                        .transition()
                        .ease(d3.easeLinear)           // control the speed of the transition
                        .duration(200)
                        .style("fill-opacity", function(d) { return d[visible_threshold]/100});
        
        
                    // Draw bettis
                    drawBettis(g_1,g_2,visible_edge)

                };
        
                // Input actions
                d3.select("#slider-range")
                    .on("input", changed)
                    .on("change", changed);


                
                
                
                
                
                
                
                
                
            }) 
        });
        










        // d3.json("../data/foo4_clique.json", function(error, dict) {

        //     if (error) throw error;

        //     console.log(dict)


           
        //     const models = Object.keys(dict)
        //     console.log(models)
        //     console.log("hello")

        //     let model = "clique20"
        //     console.log(dict[model])


        //     // Pick one threshold and draw on the svg
        //     let threshold_vals = Object.keys(dict[model])
        //     let n_threshold_vals = threshold_vals.length
        //     console.log(n_threshold_vals)
            

        //     // Set x and y scales
        //     let x_scale = d3.scaleLinear()
        //         .domain([0, 1])
        //         .range([100, 500]);

            
        //     let y_scale = d3.scaleLinear().range([500,100]);
        //     let yAxis = d3.axisLeft().scale(y_scale);

        //     svg.append("g")
        //         .attr("class","myYaxis")
        //         .attr("transform", `translate(100,0)`);



        //     // Draw axis labels
        //     let margin = 40;
        //     svg.append("text") 
        //         .attr("class","axis-title")            
        //         .attr("transform",
        //                 "translate(" + (width/2) + " ," + 
        //                             (height - margin) + ")")
        //         .style("text-anchor", "middle")
        //         .text("Edge density");

        //     svg.append("text") 
        //         .attr("class","axis-title")            
        //         .attr("transform",
        //                 "translate(" + (margin) + " ," + 
        //                             (height/2) + ")")
        //         .style("text-anchor", "middle")
        //         .text("β_k");

            

        //     // Draw axes
        //     svg.append("g")
        //         .attr("class", "xaxis")
        //         .attr("transform", `translate(0,${height-100})`)
        //         .call(d3.axisBottom(x_scale));


        //     // Draw titles
        //     svg.append("text") 
        //         .attr("class","title")            
        //         .attr("transform",
        //                 "translate(" + (width/2) + " ," + 
        //                             (margin) + ")")
        //         .style("text-anchor", "middle")
        //         .text("Model + added noise");

            


        //     // Draw data
        //     const betti_colors = ["#243A4C", "#406372", "#66939E", "#9BC3C6"];
        //     const real_color = "#B48677";
        //     const noise_color = "#BFA658";
        //     const nEdges = 2415;

        //     const update_threshold_plot = (data, threshold_edge) => {


                
        //         let max_y = d3.max([d3.max(data.dim1), d3.max(data.dim2), d3.max(data.dim3), d3.max(data.dim4)]);
        //         console.log(max_y)
        //         let buffer = max_y*(0.4)


                
        //         y_scale.domain([0, max_y+buffer]);


        //         svg.selectAll(".myYaxis")
        //             .transition()
        //             .duration(1000)
        //             .call(yAxis);


        //         let area = function(dimn) {
                    
        //             return d3.area()
        //             .x(function(d, i) {return x_scale(i/nEdges); }) 
        //             .y0(function(d,i) {
        //                 return ((data[`dim${dimn}`][i] - d > 0) ? y_scale(data[`dim${dimn}`][i] - d) : y_scale(0)); })
        //             .y1(function(d,i) { return y_scale(data[`dim${dimn}`][i] + d); }); 
        //         };

 
        //         let lines = {line1: svg.selectAll(".dim1").data([data.dim1]),
        //             line2: svg.selectAll(".dim2").data([data.dim2]),
        //             line3: svg.selectAll(".dim3").data([data.dim3]),
        //             line4: svg.selectAll(".dim4").data([data.dim4])};

        //         let std_areas = {std1: svg.selectAll(".std1").data([data.std1]),
        //             std2: svg.selectAll(".std2").data([data.std2]),
        //             std3: svg.selectAll(".std3").data([data.std3]),
        //             std4: svg.selectAll(".std4").data([data.std4])};


        //         for (let index = 0; index < 4; index++) {


        //             lines[`line${index+1}`].enter()
        //                 .append("path")
        //                     .attr("class","dims")
        //                     .attr("class",`dim${index+1}`)
        //                     .merge(d3.selectAll(`.dim${index+1}`))
        //                     .transition()
        //                     .duration(1000)
        //                     .attr("d", d3.line()
        //                         .x(function(d, i) {return x_scale(i/nEdges); })
        //                         .y(function(d) {return y_scale(d); }))
        //                     .attr("stroke", betti_colors[index])
        //                     .attr("fill", "none")
        //                     .attr("stroke-width", 3);


                    
        //             std_areas[`std${index+1}`].enter()
        //                 .append("path")
        //                 .attr("class","stds")
        //                 .attr("class",`std${index+1}`)
        //                 .merge(d3.selectAll(`.std${index+1}`))
        //                 .transition()
        //                 .duration(1000)
        //                 .attr("d",area(index+1))
        //                 .attr("opacity", 0.2)
        //                 .attr("fill", betti_colors[index])


                   
        //         }


            

        //         let threshold_line = svg.selectAll(".threshline").data([threshold_edge]);
        //         threshold_line.enter()
        //             .append("path")
        //             .attr("class", "threshline")
        //             .merge(d3.selectAll(".threshline"))
        //             .transition()
        //             .duration(1000)
        //             .attr("d", function(d) {console.log(d); return `M ${x_scale(d/nEdges)} ${y_scale(0)} L ${x_scale(d/nEdges)} ${y_scale(max_y+buffer)}`})
        //             .attr("stroke", "black")
        //             .attr("stroke-width", 2);


        //         let model_rect = svg.selectAll(".real-rect").data([threshold_edge])
        //         model_rect.enter()
        //             .append("rect")
        //             .attr("class","real-rect")
        //             .merge(svg.selectAll(".real-rect"))
        //             .transition()
        //             .duration(1000)
        //             .attr("x", 100)
        //             .attr("y", `${height - 70}`)
        //             .attr("height", 7)
        //             .attr("fill", real_color)
        //             .attr("width", function() {return x_scale(threshold_edge/nEdges)- 100 - 5});

        //         let noise_rect = svg.selectAll(".noise-rect").data([threshold_edge])
        //         noise_rect.enter()
        //             .append("rect")
        //             .attr("class","noise-rect")
        //             .merge(svg.selectAll(".noise-rect"))
        //             .transition()
        //             .duration(1000)
        //             .attr("x", function() {return 5+ x_scale(threshold_edge/nEdges)})
        //             .attr("y", `${height - 70}`)
        //             .attr("height", 7)
        //             .attr("fill", noise_color)
        //             .attr("width", function() {return 500 - x_scale(threshold_edge/nEdges)});





            
        //     };

        //     let edge_num = 242;
        //     let value_edge = 0;
            
        //     update_threshold_plot(dict[model][edge_num], edge_num);


        //     let changed = function() {
        //         value_edge = this.value;
        //         console.log(value_edge);
        //         console.log(model)
        //         edge_num = Number(threshold_vals[value_edge]);
        //         update_threshold_plot(dict[model][edge_num],  edge_num);

        //     };

        //     let next_button = function() {
        //         if (value_edge < (n_threshold_vals-1)) {
        //             value_edge++
        //         }
        //         console.log(value_edge);
        //         console.log(model)
        //         edge_num = Number(threshold_vals[value_edge]);
        //         update_threshold_plot(dict[model][edge_num], edge_num);

        //     };

        //     let back_button = function() {
        //         if (value_edge > 0) {
        //             value_edge--
        //         }
        //         console.log(value_edge);
        //         console.log(model)
        //         edge_num = Number(threshold_vals[value_edge]);
        //         update_threshold_plot(dict[model][edge_num], edge_num);

        // };


        //     const dropdownChange = function() {
        //         model = this.value;
        //         console.log(model)
        //         console.log(edge_num)

        //         update_threshold_plot(dict[model][edge_num], edge_num);
                
        //     };





        //     d3.select("input")
        //         .on("input", changed)
        //         .on("change", changed);


            
        //     var dropdown = d3.select("#dropdown")
        //         .insert("select", "svg")
        //         .on("change", dropdownChange);

        //     dropdown.selectAll("option")
        //         .data(models)
        //         .enter().append("option")
        //         .attr("value", function (d) { return d; })
        //         .text(function (d) {
        //             return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
        //         });

        //     d3.select("#next-button")
        //         .on("click",next_button)

        //     d3.select("#back-button")
        //         .on("click",back_button)


        // })
