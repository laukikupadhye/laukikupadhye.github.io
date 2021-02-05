function plotHeatMap(data) {
    //let MonthSet = new Set(months)
    let margin = {top: 40, right: 65, bottom: 40, left: 65}
    let svg = d3.selectAll('#heatmap');
    svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    let height = svg.attr('height')
    let width = svg.attr('width')

    let monthset = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let yearset = new Set(d3.map(data, function (d) {
        return d.Years
    }))

    let y = d3.scaleBand()
        .range([1000 - margin.bottom, 0])
        .domain(monthset)
        .padding(0.10);
    //Y axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .call(d3.axisLeft(y))
        .style('font-size', '22px')

    let x = d3.scaleBand()
        .range([margin.left, 1000 - margin.right])
        .domain(yearset)
        .padding(0.10);
    //X axis
    svg.append("g")
        .attr("transform", "translate(" + 0 + "," + (1000 - margin.bottom) + ")")      //" + (height-margin.bottom) + "
        .call(d3.axisBottom(x))
        .style('font-size', '24px');


    // Build color scale
    let dataRange=d3.extent(d3.map(data,function (d){return d.count_movies}))
    let myColor = d3.scaleLinear()
        .range(["#f0f4f7", "#e50914"])  //006999
        .domain(dataRange);

    //creating Div
    let div = d3.select('body').append("div")
        .attr("class", "tooltip_heatmap")
        .style("opacity", 0);

    let rect = svg.selectAll()
        .data(data)//, function(d) {return d.Years+':'+d.Months;}
        .enter()
        .append("rect");

    rect.transition().duration(function (d, i) {return i * 15;})
        .attr("x", function (d) {return x(d.Years)})
        .attr("y", function (d) {return y(d.Months)})
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) {
            return myColor(d.count_movies)
        });
    //rect.transition().duration(function (d,i){return i*10;});

    rect
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85')
            div.transition()
                .duration('50')
                .style("opacity", 0.8);
            let selection=d3.select(this)
            let arr=[].concat(selection._groups[0][0].__data__.Years+"-"+selection._groups[0][0].__data__.Months
                ,"Movies count: "+selection._groups[0][0].__data__.count_movies)
            div.html(arr.join('<br/>'))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('250')
                .attr('opacity', '1')

            div.transition()
                .duration('250')
                .style("opacity", 0);
        })
    rect.on('click', function (d) {
        document.getElementById('pieheading').textContent="Top 5 countries with top rated movies in "
            +d3.select(this)._groups[0][0].__data__.Months+"-"
            +d3.select(this)._groups[0][0].__data__.Years
        pieOnYearSelection(d3.select(this)._groups[0][0].__data__.Years, d3.select(this)._groups[0][0].__data__.Months)
    })

}