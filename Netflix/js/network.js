function plotNetwork(data) {

    //creating data set for network

    //Push target node as director
    netData = {nodes: [], links: []}

    let director = new Set(d3.map(data, function (d) {
        return d.director_x
    }))
    netData.nodes.push({
        name: director.values().next().value, group: 0,imdb:10.1
    })

    d3.map(data, function (d, i) {
        netData["nodes"].push({
            name: d.title_x, group: i + 1,imdb:d.avg_vote
        })
    })
    d3.map(data, function (d, i) {
        netData["links"].push({
            source: i + 1,
            target: 0,
            value: d.avg_vote
        })
    })


    let margin = 40;
    let svg = d3.select('#net');
    let width = parseInt(svg.attr("viewBox").split(' ')[2]) - margin * 2
    let height = parseInt(svg.attr("viewBox").split(' ')[3]) - margin * 2
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    let circleRedius=d3.scaleLinear().range([30,50]).domain([6.9,10.2])
    let div = d3.select('body').append("div")
        .attr("class", "tooltip_heatmap")
        .style("opacity", 0);

    let link_elements = svg.append("g")
        .attr('transform', `translate(${width / 2},${200})`)
        .selectAll(".line")
        .data(netData.links)
        .enter()
        .append("line")
        .style("stroke-width",'3')


    let node_elements = svg.append("g")
        .attr('transform', `translate(${width / 2},${200})`)
        .selectAll(".circle")
        .data(netData.nodes)
        .enter()
        .append("g")
        .on('mouseenter',function (d,data){
            div.transition()
                .duration('50')
                .style("opacity", 0.8);
            let tooltipText = ''
            if (data.imdb>10){
                tooltipText='Director'
            }
            else{
                tooltipText="IMDB rating:"+data.imdb
            }
            div.html(tooltipText)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on('mouseleave',function (d){
            div.transition()
                .duration('250')
                .style("opacity", 0);
        })

    node_elements
        .append('circle')
        .attr("r", function (d) {
            return circleRedius(d.imdb)
        })
        .attr("fill", function (d, i) {
            if (d.group===0){
                return 'darkorange'
            }
            return 'Steelblue'
        })

    //label to nodes
    node_elements.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(function (d) {
            /*if (d.group===0){
                return d.name+" (Director)"
            }*/
            return d.name
        })

    let ForceSimulation = d3.forceSimulation(netData.nodes)
        .force("collide",
            d3.forceCollide().radius(function (d) {
                return 150
            }))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        //.force("link",d3.forceLink(data.links)) // we add links data to this layout
        .force("link", d3.forceLink(netData.links)
            .id(function (d) {
                return d.index
            })
            .distance(function (d) {
                return d.value
            })
            .strength(function (d) {
                return d.value * 0.4
            })
        )

        .on("tick", ticked);


    function ticked() {
        node_elements
            .attr('transform', function (d) {
                return `translate(${d.x},${d.y})`
            })

        link_elements
            .attr("x1", function (d) {
                return d.source.x
            })
            .attr("x2", function (d) {
                return d.target.x
            })
            .attr("y1", function (d) {
                return d.source.y
            })
            .attr("y2", function (d) {
                return d.target.y
            })

    }
}

function rebuildNetwork(movieName){
    d3.dsv(',','data/netflix_IMDB.csv',d3.autoType).then(function (data){
        let oneRow= data.filter(function (d){ return d.title_x==movieName})
        let director=oneRow[0].director_x
        let newData=data.filter(function (d){
            return  d.director_x==director & d.avg_vote>6.9
        })
        document.getElementById('netheading').textContent='Recommended movies by director: '+director
        svg=d3.selectAll('#net')
        svg.selectAll('g').remove()
        plotNetwork(newData)
    })
}