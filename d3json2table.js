let tableIndex = 0;

function makeTable (selection, data) {
    d3.select(selection).selectAll("table")
        .data([data])
        .enter().append("div").attr('class','table-responsive').append("table").attr('class','table-bordered table-striped table-sm')
        .call(recurse);
}

function makeHead(table, colnames) {
    // create header row using standard 1D data join and enter()
    table.append("thead").attr('id','th'+tableIndex).append("tr").selectAll("th")
        .data(colnames)
        .enter().append("th")
        .text(function (d) { return d; });

}

function makeCells(table, colnames, d, isObject) {

    let data = null;
    if (isObject) data = [d]
    else data = d;

    let tds = table.append("tbody").selectAll("tr")
        .data(data)                            // each row gets one object
        .enter().append("tr").selectAll("td")
        .data(function (d) {                 // each cell gets one value
            return colnames.map(function (k) { // for each colname (i.e. key) find the corresponding value
                return d[k] || "";              // use empty string if key doesn't exist for that object
            });
        })
        .enter().append("td");

    // cell contents depends on the data bound to the cell
    // fill with text if data is not an Array
    tds.filter(function (d) { return (typeof d == "string" || typeof d == "number"); })
        .text(function (d) { return d; });
    // fill with a new table if data is an Array
    tds.filter(function (d) { return (d instanceof Array || d instanceof Object); })
        .append("table")
        .call(recurse);

}

function recurse(sel) {

    tableIndex ++;
    // sel is a d3.selection of one or more empty tables
    sel.each(function (d) {
        // d is an array of objects
        var colnames,
            table = d3.select(this);

        if (d instanceof Array) {
            // obtain column names by gathering unique key names in all 1st level objects
            // following method emulates a set by using the keys of a d3.map()
            colnames = d                                                          // array of objects
                .reduce(function (p, c) { return p.concat(d3.keys(c)); }, [])       // array with all keynames
                .reduce(function (p, c) { return (p.set(c, 0), p); }, d3.map())     // map with unique keynames as keys
                .keys();                                                            // array with unique keynames (arb. order)

            // colnames array is in arbitrary order
            // sort colnames here if required
            //console.log(colnames);
            makeHead(table, colnames);
            makeCells(table, colnames, d, false);
            table.append("tfoot").attr('id','tf'+tableIndex);

        } else {
            //object
            colnames = Object.keys(d);

            // colnames array is in arbitrary order
            // sort colnames here if required
            // console.log(colnames);
            makeHead(table, colnames);
            makeCells(table, colnames, d, true);
            table.append("tfoot").attr('id','tf'+tableIndex);

        }
    });
}