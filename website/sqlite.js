const SQL = await initSqlJs({ locateFile: filename => `./dist/${filename}` })
const buffer = await fetch('./musicCollection.db').then(r => r.arrayBuffer())
var db = new SQL.Database(new Uint8Array(buffer))

var userkey = undefined;
var username = undefined;

function execute_sql(sql_string, params = {}) {
    return db.exec(sql_string, params)[0]
}

document.getElementById('custom database upload').onchange = function() {
    let file = document.getElementById('custom database upload').files[0];
    let reader = new FileReader();
    reader.addEventListener("load", () => {
        var uints = new Uint8Array(reader.result);
        db = new SQL.Database(uints);
    });
    reader.readAsArrayBuffer(file);
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

function execute_with_debug(text) {
    try {
        create_table(execute_sql(text))
    } catch (error) {
        showAlert(`<h2>Your SQLite query encountered a fatal error:</h2>
        
        <p style="font-size:20px;">`+ error.message +`</p>
        
        <div><gp5-accordion>Show Stack</gp5-accordion>
		<div class="panel">
        
        ` + error.stack + `</div></div>`)
        console.error(error)
    }
}

document.getElementById("submit").onclick = ()=>{
    execute_with_debug(document.getElementById("input").value)
};


document.getElementById('loginButton').onclick = ()=>{
    try {
        
        var output = execute_sql(`
    select * from user where
    u_email = @EM and
     u_password = @PS;`, {
        '@EM' : document.getElementById('email_input').value,
        '@PS' : document.getElementById('password_input').value,
     });
    userkey = output.values[0][0]
    username = output.values[0][1]
    console.log(userkey)
    showAlert("Logged in as " + username)
    } catch (error) {
        showAlert("Incorrect email or password!")
        console.error(error)
        userkey = undefined;
    }
    
};

document.getElementById('fetchPlaylists').onclick = ()=>{
    if (userkey != undefined) {
        var output;
        try {
        
            output = execute_sql(`
        select p_name as Playlist_Name, p_songID as SongID from user join library on l_userkey = u_userkey join playlist on l_playlistkey = p_playlistkey
        where u_userkey = @userkey`, {
            '@userkey' : userkey
        });

        } catch (error) {
            console.log(error);
        }
        if (output != undefined) {
            create_table(output)
        } else {
            showAlert("You have no playlists!")
        }
    } else {
        showAlert("ERROR: You must login first.");
    }

    
};


document.getElementById('openLibrary').onclick = ()=>{
    if (userkey != undefined) {
        var output;
        try {
        
            output = execute_sql(`
        select l_librarykey as LibraryID, l_name as LibraryName, l_playlistkey as PlaylistID, l_song_id as SongID from user join library on l_userkey = u_userkey
        where u_userkey = @userkey`, {
            '@userkey' : userkey
        });

        } catch (error) {
            console.log(error);
        }
        if (output != undefined) {
            create_table(output)
        } else {
            showAlert("You have no libraries!")
        }
    } else {
        showAlert("ERROR: You must login first.");
    }

    
};

