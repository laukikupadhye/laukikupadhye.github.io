function plotNestedPie(data, year = 2019, month = 'Jan', delay = 0) {
    let dataOuter = data[0].filter(function (d) {
        return d.release_year == year & d.release_month == month
    })
    let dataInner = data[1].filter(function (d) {
        return d.release_year == year & d.release_month == month
    })
    //console.log(dataOuter)
    let width = 1000 - 80;
    let height = 1000 - 80;
    let sliceWidth = 100;
    let radius1 = Math.min(width, height) / 2;
    let radius2 = radius1 - sliceWidth;

    let outColorData = ['DarkBlue', 'DarkGreen', 'FireBrick', 'Tomato', 'RebeccaPurple']
    let outcolor = d3.scaleOrdinal(outColorData)
    let incolor = d3.scaleOrdinal(d3.schemePaired)

    let svg = d3.select('#nestedpie')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 1000);
    /*let title=svg.append('g')
        .attr('transform', 'translate(60,60)');*/
    let svg1 = svg.append('g')
        .attr('transform', 'translate(' + (width / 2 + 40) +
            ',' + (height / 2 + 40) + ')');

    let svg2 = svg.append('g')
        .attr('transform', 'translate(' + (width / 2 + 40) +
            ',' + (height / 2 + 40) + ')');

    //Tooltip div
    let div = d3.select('body').append("div")
        .attr("class", "tooltip_heatmap")
        .style("opacity", 0);

    //Creating pie
    //for outer pie
    let arc1 = d3.arc()
        .innerRadius(radius1 - 100 - sliceWidth)
        .outerRadius(radius1 - 100);
    //for inner pie
    let arc2 = d3.arc()
        .innerRadius(radius2 - 100 - sliceWidth)
        .outerRadius(radius2 - 100);

    //for label arc
    var labelarc = d3.arc()
        .innerRadius(radius1 - sliceWidth + 40 - 100)
        .outerRadius(radius1 - 100)

    let outerPie = d3.layout.pie()
        .value(function (d) {
            return d.count_movies;
        })
        .sort(null);

    let innerPie = d3.layout.pie()
        .value(function (d) {
            if (d.count_movies < 2) {
                return d.count_movies
            }
            return d.count_movies / 2
        })
        .sort(null);


    //Outer Pie chart
    let path1 = svg1.selectAll('path')
        .data(outerPie(dataOuter))
        .enter()
        .append('path')

    //draw paths with transition
    path1.transition().delay(function (d, i) {
        return (i + 1) * 70;
    }).duration(500)
        .attr('d', arc1)
        .attr('fill', function (d, i) {
            return outcolor(i);
        })

    //hover function
    path1.on('mouseover', function (d, i) {
        //highlight pie
        let selectedPie = d3.select(this);
        let num = (Math.round((selectedPie._groups[0][0].__data__.data.count_movies / d3.sum(outerPie(dataOuter), function (d) {
            return d.value
        }) * 100)) + '%' + ' (' + selectedPie._groups[0][0].__data__.data.count_movies + ')')
        let arr = [].concat(selectedPie._groups[0][0].__data__.data.country_x, "%   |  Count", num);
        popupTooltip(selectedPie, '0.8', arr)

    })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('250')
                .attr('opacity', '1')

            div.transition()
                .duration('250')
                .style("opacity", 0);
        });

    //Inner Pie chart
    let path2 = svg2.selectAll('path')
        .data(innerPie(dataInner))
        .enter()
        .append('path')
    path2.transition().delay(function (d, i) {
        return ((i + 1) * 150)*0.6;
    }).duration(500)
        .attr('d', arc2)
        .attr('fill', function (d, i) {
            return incolor(i);
        })
        .style('opacity', '0.6')

    path2.on('mouseover', function (d, i) {
        //highlight pie
        let selectedPie = d3.select(this);
        let num = selectedPie._groups[0][0].__data__.data.avg_vote;
        let arr = [].concat("Movie: " + selectedPie._groups[0][0].__data__.data.title_x, "IMDB: " + num);
        popupTooltip(selectedPie, '1', arr)
    })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('250')
                .attr('opacity', '0.5')

            div.transition()
                .duration('250')
                .style("opacity", 0);
        });
    path2.on('click',function (d){
        window.scroll(0,600)
        let selectedPie = d3.select(this);
        let movieName=selectedPie._groups[0][0].__data__.data.title_x
        rebuildNetwork(movieName)

     })
    // adding labels to outer pie
    svg1.append("g")
        .attr("class", "pielabel");
    let labelOut = svg.select('.pielabel').selectAll('text').data(outerPie(dataOuter))
    labelOut.enter()
        .append('text')
        .attr("transform", function (d) {
            return "translate(" + (labelarc.centroid(d))[0] + "," + (labelarc.centroid(d))[1] + ")";
        })
        .text(function (d) {
            return d.data.country_x
        })
        .style('fill', 'white')

    function popupTooltip(selectedPie, opacity, arr) {
        selectedPie.transition()
            .duration('50')
            .attr('opacity', opacity)

        //displaying blank div
        div.transition()
            .duration('50')
            .style("opacity", 0.8);
        //adding values to the div
        div.html(arr.join('<br/>'))
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 15) + "px");
    }

}

function pieOnYearSelection(year, month) {
    let svg = d3.select('#nestedpie')
    //first remove all paths
    let remov = svg.selectAll('path')
    remov.transition().duration(20).remove()
    svg.selectAll('text').remove()

    //then call plot new path
    Promise.all(
        [d3.dsv(',', 'data/country_wise_count_all_years.csv'),
            d3.dsv(',', 'data/country_movies_ratings.csv')], d3.autoType())
        .then(function (data) {
            plotNestedPie(data, year, month, 1000)
        })
    /**/
}