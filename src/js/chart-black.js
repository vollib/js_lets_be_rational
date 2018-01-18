
var calculateDiscountedBlackData = function (xaxis, F, T, r, sigma, callback) {
    var blackCallData = [];
    var blackPutData = [];
    var callIntrinsicData = [];
    var putIntrinsicData = [];

    for (i = 100; i <= 2000; i += 5) {
        var moneyness = i / 1000;
        var xaxis_value = xaxis == 'log-moneyness' ? Math.log(moneyness) : moneyness;

        var K = F * moneyness;

        var deflater = Math.exp(-r * T);

        var call = 1;
        var put = -1;
        var black_call_price = js_lets_be_rational.black(F, K, sigma, T, call) * deflater;
        var black_put_price = js_lets_be_rational.black(F, K, sigma, T, put) * deflater;
        blackCallData.push({xaxis: xaxis_value, price: black_call_price});
        blackPutData.push({xaxis: xaxis_value, price: black_put_price});

        var callIntrinsicValue = Math.max(F - K, 0);
        var putIntrinsicValue = Math.max(K - F, 0);
        callIntrinsicData.push({xaxis: xaxis_value, price: callIntrinsicValue});
        putIntrinsicData.push({xaxis: xaxis_value, price: putIntrinsicValue});
    }
    callback(blackCallData, blackPutData, callIntrinsicData, putIntrinsicData);
};

var calculateUndiscountedBlackData = function (xaxis, F, T, sigma, callback) {
    var blackCallData = [];
    var blackPutData = [];
    var callIntrinsicData = [];
    var putIntrinsicData = [];
    for (i = 100; i <= 2000; i += 5) {
        var moneyness = i / 1000;
        var xaxis_value = xaxis == 'log-moneyness' ? Math.log(moneyness) : moneyness;

        var K = F * moneyness;

        var call = 1;
        var put = -1;
        var black_call_price = js_lets_be_rational.black(F, K, sigma, T, call);
        var black_put_price = js_lets_be_rational.black(F, K, sigma, T, put);
        blackCallData.push({xaxis: xaxis_value, price: black_call_price});
        blackPutData.push({xaxis: xaxis_value, price: black_put_price});

        var callIntrinsicValue = Math.max(F - K, 0);
        var putIntrinsicValue = Math.max(K - F, 0);
        callIntrinsicData.push({xaxis: xaxis_value, price: callIntrinsicValue});
        putIntrinsicData.push({xaxis: xaxis_value, price: putIntrinsicValue});

    }
    callback(blackCallData, blackPutData, callIntrinsicData, putIntrinsicData);
};

var calculateValues = function (xaxis, F, T, r, sigma, callback) {
    if (r === undefined) {
        calculateUndiscountedBlackData(xaxis, F, T, sigma, callback);
    } else {
        calculateDiscountedBlackData(xaxis, F, T, r, sigma, callback);
    }
};

$(document).ready(function () {
    var F = 10;
    var t = 0.0;
    var r = 0.0;
    var sigma = 0.05;

    var blackCallData = [];
    var blackPutData = [];
    var callIntrinsicData = [];
    var putIntrinsicData = [];

    calculateValues('moneyness', F, t, r, sigma, function (bcall, bput, calli, puti) {
        blackCallData = bcall;
        blackPutData = bput;
        callIntrinsicData = calli;
        putIntrinsicData = puti;
    });

    var chartContainer = d3.select(".chart-container");

    chartContainer.append("svg")
        .attr("width", chartContainer.node().getBoundingClientRect().width)
        .attr("height", 500);

    var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    function createArea() {
        return d3.area()
            .x(function (d) {
                return x(d.xaxis);
            })
            .y0(y(0))
            .y1(function (d) {
                return y(d.price);
            });
    }

    function createLine() {
        return d3.line()
            .x(function(d){ return x(d.xaxis); })
            .y(function(d){ return y(d.price); });
    }

    var callIntrinsicLine = createLine();
    var putIntrinsicLine = createLine();
    var callIntrinsicArea = createArea();
    var putIntrinsicArea = createArea();
    var blackCallArea = createArea();
    var blackPutArea = createArea();

    var max_price = d3.max(blackCallData.concat(blackPutData).concat(callIntrinsicData).concat(putIntrinsicData), function (d) {
        return d.price;
    });

    x.domain(d3.extent(callIntrinsicData, function(d) { return d.xaxis; }));
    y.domain([0, max_price + max_price / 4]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    var yGrid = d3.axisLeft(y);
    var xGrid = d3.axisBottom(x);

    g.append("g")
        .attr("class", "y grid")
        .call(yGrid
            .tickSize(-width)
            .tickFormat(""));

    g.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + height + ")")
        .call(xGrid
            .tickSize(-height)
            .tickFormat(""));

    var path = g.append("g");

    function showArea(callIntrinsicData, putIntrinsicData, blackCallData, blackPutData) {
        path.append("path")
            .data([callIntrinsicData])
            .attr("fill", "grey")
            .attr("opacity", "0.4")
            .attr("d", callIntrinsicArea);
        path.append("path")
            .data([putIntrinsicData])
            .attr("fill", "grey")
            .attr("opacity", "0.7")
            .attr("d", putIntrinsicArea);


        path.append("path")
            .data([blackPutData])
            .attr("fill", "red")
            .attr("opacity", "0.6")
            .attr("d", blackPutArea);
        path.append("path")
            .data([blackCallData])
            .attr("fill", "orange")
            .attr("opacity", "0.6")
            .attr("d", blackCallArea);

        path.append("path")
            .data([callIntrinsicData])
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", callIntrinsicLine);
        path.append("path")
            .data([putIntrinsicData])
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-dasharray",( "5,5"))
            .attr("stroke-width", 1.5)
            .attr("d", putIntrinsicLine);
    }
    showArea(callIntrinsicData, putIntrinsicData, blackCallData, blackPutData);
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    g.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

    var callIntrinsicFocus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    callIntrinsicFocus.append("circle")
        .attr("opacity", "0.8")
        .attr("fill", "black")
        .attr("r", 3.0);

    var putIntrinsicFocus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    putIntrinsicFocus.append("circle")
        .attr("opacity", "0.8")
        .attr("fill", "black")
        .attr("r", 3.0);

    var blackCallFocus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    blackCallFocus.append("circle")
        .attr("opacity", "0.8")
        .attr("fill", "orange")
        .attr("r", 3.0);

    var blackPutFocus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    blackPutFocus.append("circle")
        .attr("fill", "red")
        .attr("opacity", "0.8")
        .attr("r", 3.0);

    var detailsbg = g.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("width", 160)
        .attr("height", 70)
        .attr("fill", "white");

    var details = g.append("g")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .attr("class", "details")
        .style("font-size", "13px");

    function displayDetails(blackCallPriceStr, callIntrinsicStr, blackPutPriceStr, putIntrinsicStr) {
        var detailsText = "Black Call Price: " + blackCallPriceStr + "<br> (Solid) Call Intrinsic: " + callIntrinsicStr + "<br> Black Put Price: " + blackPutPriceStr + "<br> (Dashed) Put Intrinsic: " + putIntrinsicStr;
        var textColors = ["orange", "grey", "red", "grey"];
        details.selectAll("text").remove().exit();
        detailsText.split("<br>").forEach(function (str, index) {
            details.append("text")
                .attr("dy", (index + 3) + "em")
                .attr("fill", textColors[index])
                .text(str);
        });
    }
    displayDetails("", "", "", "");

    var overlay = svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", svg.attr("width"))
        .attr("height", height)
        .on("mouseover", function () {
            blackCallFocus.style("display", null);
            blackPutFocus.style("display", null);
            callIntrinsicFocus.style("display", null);
            putIntrinsicFocus.style("display", null);
            displayDetails("", "", "", "");
        })
        .on("mouseout", function () {
            blackCallFocus.style("display", "none");
            blackPutFocus.style("display", "none");
            callIntrinsicFocus.style("display", "none");
            putIntrinsicFocus.style("display", "none");
            displayDetails("", "", "", "");
            svg.select(".x.axis").selectAll(".hover").remove().exit();
        });

    updateChart = function () {
        var radio_xaxis = $( "[name='radio-xaxis']" ).filter( ":checked" );
        var xaxis = radio_xaxis.attr('id');

        var F = $("input[name='F']").val();
        var t = $("input[name='t']").val();
        var r = $("input[name='r']").val();
        var sigma = $("input[name='sigma']").val();

        calculateValues(xaxis, F, t, r, sigma, function (blackCallData, blackPutData, callIntrinsicData, putIntrinsicData) {

            var max_price = d3.max(blackCallData.concat(blackPutData).concat(callIntrinsicData).concat(putIntrinsicData), function (d) {
                return d.price;
            });
            var min_price = d3.min(blackCallData.concat(blackPutData).concat(callIntrinsicData).concat(putIntrinsicData), function (d) {
                return d.price;
            });

            var containerWidth = Math.max(500, d3.select(".chart-container").node().getBoundingClientRect().width);
            containerWidth = Math.min(containerWidth, 1200);

            width = containerWidth - margin.left - margin.right;
            svg.attr("width", containerWidth) ;

            x.rangeRound([0, width]);

            x.domain(d3.extent(callIntrinsicData, function(d) { return d.xaxis; }));
            y.domain([min_price, max_price + max_price / 3]);


            path.selectAll("path").remove().exit();

            svg.select(".y.grid")
                .call(yGrid
                    .tickSize(-width)
                    .tickFormat(""));

            svg.select(".x.grid")
                .attr("transform", "translate(0," + height + ")")
                .call(xGrid
                    .tickSize(-height)
                    .tickFormat(""));

            showArea(callIntrinsicData, putIntrinsicData, blackCallData, blackPutData);

            svg.select(".x.axis") // change the x axis
                .call(xAxis);
            svg.select(".y.axis") // change the y axis
                .call(yAxis);

            overlay.attr("width", width)
                .on("mousemove", mousemove);

            var formatPrice = d3.format(".2f");

            function mousemove() {
                var x0 = x.invert(d3.mouse(this)[0]);

                var callIntrinsicValue = findData(callIntrinsicData, x0);
                callIntrinsicFocus.attr("transform", "translate(" + x(callIntrinsicValue.xaxis) + "," + y(callIntrinsicValue.price) + ")");

                var putIntrinsicValue = findData(putIntrinsicData, x0);
                putIntrinsicFocus.attr("transform", "translate(" + x(putIntrinsicValue.xaxis) + "," + y(putIntrinsicValue.price) + ")");

                var blackCallValue = findData(blackCallData, x0);
                blackCallFocus.attr("transform", "translate(" + x(blackCallValue.xaxis) + "," + y(blackCallValue.price) + ")");

                var blackPutValue = findData(blackPutData, x0);
                blackPutFocus.attr("transform", "translate(" + x(blackPutValue.xaxis) + "," + y(blackPutValue.price) + ")");

                displayDetails(formatPrice(blackCallValue.price), formatPrice(callIntrinsicValue.price), formatPrice(blackPutValue.price), formatPrice(putIntrinsicValue.price));

                svg.select(".x.axis").selectAll(".hover").remove().exit();
                var xHover = svg.select(".x.axis").append("g")
                    .attr("class", "tick hover")
                    .attr("opacity", "1")
                    .attr("transform", "translate(" + x(blackPutValue.xaxis) + "," + 0 + ")");
                xHover.append("line")
                    .attr("stroke", "#000")
                    .attr("y2", "6")
                    .attr("x1", "0.5")
                    .attr("x2", "0.5");
                xHover.append("text")
                    .attr("fill", "#000")
                    .attr("y", "9")
                    .attr("x", "0.5")
                    .attr("dy", "1.71em")
                    .text(blackCallValue.xaxis);

            }
                
        });

        function findData(data, x0) {
            var bisectData = d3.bisector(function (d) {
                    return d.xaxis;
                }).left,
                i = bisectData(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.xaxis > d1.xaxis - x0 ? d1 : d0;
            return d;
        }


    };


    $( "input[type='radio']" ).checkboxradio({
        icon: false
    });

    $( "input[name='radio-xaxis']").on( "change", function (e) {
        updateChart();
    } );

    $("#F_slider").slider({
        step: 1,
        value: 10,
        min: 10,
        max: 1000,
        slide: function (event, ui) {
            $("input[name='F']").val(ui.value);
            updateChart();
        }
    });
    $("#t_slider").slider({
        step: 0.01,
        value: 0.0,
        min: 0.0,
        max: 2.0,
        slide: function (event, ui) {
            $("input[name='t']").val(ui.value);
            updateChart();
        }
    });
    $("#r_slider").slider({
        step: 0.01,
        value: 0.0,
        min: 0.0,
        max: 0.15,
        slide: function (event, ui) {
            $("input[name='r']").val(ui.value);
            updateChart();
        }
    });
    $("#sigma_slider").slider({
        step: 0.01,
        value: 0.0,
        min: 0.05,
        max: 1.00,
        slide: function (event, ui) {
            $("input[name='sigma']").val(ui.value);
            updateChart();
        }
    });

    $("input").change(function () {
        $("#F_slider").slider("option", "value", $("input[name='F']").val());
        $("#t_slider").slider("option", "value", $("input[name='t']").val());
        $("#r_slider").slider("option", "value", $("input[name='r']").val());
        $("#sigma_slider").slider("option", "value", $("input[name='sigma']").val());

        updateChart();
    });

    updateChart();

    $(window).resize(function(){
        updateChart();
    });

});