const SQL = await initSqlJs({ locateFile: filename => `/dist/${filename}` })
const buffer = await fetch('/tpch.sqlite').then(r => r.arrayBuffer())
const db = new SQL.Database(new Uint8Array(buffer))


function execute_sql(sql_string) {
    return db.exec(sql_string)[0]
}

function create_table(arr) {
    let table = document.getElementById('resultTable');
    table.innerHTML = ``; /*delete table*/
    var def_row = table.insertRow();
    for (var i=0;i<arr.columns.length;i++) {
        var cel = def_row.insertCell();
        cel.textContent = arr.columns[i];
    }
    for (var i=0;i<(arr.values.length);i++) { /*generate table*/
        var row = table.insertRow();
        for (var j=0;j<arr.columns.length;j++) {
            var cell = row.insertCell();
            cell.textContent = arr.values[i][j];
        }
    }

}

console.log(execute_sql("select * from customer"))

create_table(execute_sql("select * from customer"))

create_table(execute_sql("select sum(c_acctbal) from customer"))