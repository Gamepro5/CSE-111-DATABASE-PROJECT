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
        select p_playlistkey as Playlist_Key, p_name as Playlist_Name, p_songID as SongID from user join library on l_userkey = u_userkey join playlist on l_playlistkey = p_playlistkey
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

document.getElementById('getSong').onclick = ()=>{
    
        var output;
        try {
        
            output = execute_sql(`
            select * from song
            where s_songID = @songID`, {
            '@songID' : document.getElementById("getSongID").value
        });

        } catch (error) {
            console.log(error);
        }
        if (output != undefined) {
            create_table(output)
        } else {
            showAlert("No song with that ID found.")
        }

    
};

document.getElementById('searchSong').onclick = ()=>{
    
        var output;
        try {
        
            output = execute_sql(`
        select * from song
        where upper(s_name) = upper(@songName) or INSTR(upper(s_name), upper(@songName))`, {
            '@songName' : document.getElementById("searchSongName").value
        });

        } catch (error) {
            console.log(error);
        }
        if (output != undefined) {
            create_table(output)
        } else {
            showAlert("No songs found!")
        }
    

    
};

document.getElementById('searchSongByArtistName').onclick = ()=>{
    
    var output;
    try {
    
        output = execute_sql(`
        select * from song join artist on s_artist_id = artist_id
        where upper(artist.name) = upper(@artistName) or INSTR(upper(artist.name), upper(@artistName))`, {
        '@artistName' : document.getElementById("searchSongByArtistName_name").value
    });

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("No songs found by that artist!")
    }



};

document.getElementById('createAccountButton').onclick = ()=>{
    
    var output;
    try {
        output = execute_sql(`select * from user where u_email = @email`, {'@email' : document.getElementById("create_account_email_input").value})
        console.log(output)
        if (output != undefined) {
            showAlert("You already have an account under that email address. Please login.")
            return
        }
        if (document.getElementById("create_account_password_input").value == "" || document.getElementById("create_account_email_input").value == "" || document.getElementById("create_account_username_input").value == "") {
            showAlert("Please enter an email, a password, and a username.")
            return
        }
        output = execute_sql(`
        INSERT INTO user(u_userkey, u_name, u_password, u_email)
        VALUES (   (select max(u_userkey) from user)+1    ,@username,@password,@email);`, {
        '@email' : document.getElementById("create_account_email_input").value,
        '@password' : document.getElementById("create_account_password_input").value,
        '@username' : document.getElementById("create_account_username_input").value
    });

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Account created!")
    }



};


document.getElementById('changeEmail').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    if (document.getElementById("changeEmail_input").value == "") {
        showAlert("You must enter a valid email address.")
        return
    }
    var output;
    try {
        output = output = execute_sql(`
        select * from user
where u_email = @email`, {
        '@email' : document.getElementById("changeEmail_input").value});
    if (output != undefined) {
        showAlert("You already have an account under that email address.")
        return
    }
        output = execute_sql(`
        UPDATE user
SET u_email = @email
WHERE u_userkey = @userkey;`, {
        '@email' : document.getElementById("changeEmail_input").value,
        '@userkey' : userkey
    });

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Email Updated!")
    }



};

document.getElementById('changePassword').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    if (document.getElementById("changePassword_input").value == "") {
        showAlert("You must enter a valid password.")
        return
    }
    var output;
    try {
        
        output = execute_sql(`
        UPDATE user
SET u_password = @password
WHERE u_userkey = @userkey;`, {
        '@password' : document.getElementById("changePassword_input").value,
        '@userkey' : userkey
    });

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Password Updated!")
    }



};

document.getElementById('changeUsername').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    if (document.getElementById("changeUsername_input").value == "") {
        showAlert("You must enter a valid username.")
        return
    }
    var output;
    try {
        
        output = execute_sql(`
        UPDATE user
SET u_name = @username
WHERE u_userkey = @userkey;`, {
        '@username' : document.getElementById("changeUsername_input").value,
        '@userkey' : userkey
    });

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Username Updated!")
    }



};



document.getElementById('deleteLibrary').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    
    var output;
    try {
        output = execute_sql(`
        DELETE FROM playlist
WHERE p_playlistkey IN
(SELECT DISTINCT p_playlistkey
FROM playlist,library,song
WHERE
    l_playlistkey = p_playlistkey AND
    p_songID = s_songID AND
    l_librarykey = @libKey AND
    l_song_id IS NULL);

DELETE FROM library
WHERE l_libraryKey = @libKey 
    AND l_userKey = @userkey;`, {
        '@libKey' : document.getElementById("libraryID").value,
        '@userkey' : userkey
    });

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Library Deleted!")
    }



};


document.getElementById('createLibrary').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    
    var output;
    try {
        output = execute_sql(`
        INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
VALUES (@userkey,(select max(l_librarykey) from library)+1,@libName,NULL,NULL); `, {
        '@libName' : document.getElementById("libraryName_input").value,
        '@userkey' : userkey
    });

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Library Created!")
    }



};


document.getElementById('newSongToLib').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    
    var output;
    try {
        output = execute_sql(`select * from library where l_librarykey = (@libKey) and l_userkey = (@userkey)`, {
            '@libKey' : document.getElementById("addSongLibraryID").value,
            '@userkey' : userkey
        });
        console.log(output)
        if (output == undefined) {
            showAlert("Invalid Library Key.")
            return
        }
        output = execute_sql(`select * from library join user on l_userkey = u_userkey where l_song_id = @songKey`, {
            '@libKey' : document.getElementById("addSongLibraryID").value,
            '@userkey' : userkey,
            '@songKey' : document.getElementById("addSongToLib_SongID").value
        });
        if (output != undefined) {
            showAlert("Song is already in this library.")
            return
        }
        
        

        output = execute_sql(`
        INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
        VALUES ((@userkey),(@libKey),  (select l_name from library where l_librarykey = `+document.getElementById("addSongLibraryID").value+` limit 1) ,NULL,(@songKey));`, {
        '@libKey' : document.getElementById("addSongLibraryID").value,
        '@userkey' : userkey,
        '@songKey' : document.getElementById("addSongToLib_SongID").value})
        

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Song Added!")
    }



};


document.getElementById('removeSongFromLibrary').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    
    var output;
    try {
        output = execute_sql(`select * from library where l_librarykey = (@libKey) and l_userkey = (@userkey)`, {
            '@libKey' : document.getElementById("addSongLibraryID").value,
            '@userkey' : userkey
        });
        console.log(output)
        if (output == undefined) {
            showAlert("Invalid Library Key.")
            return
        }
        output = execute_sql(`select * from library join user on l_userkey = u_userkey where l_song_id = @songKey`, {
            '@libKey' : document.getElementById("addSongLibraryID").value,
            '@userkey' : userkey,
            '@songKey' : document.getElementById("addSongToLib_SongID").value
        });
        if (output == undefined) {
            showAlert("Song is not in this library.")
            return
        }
        
        
        // needed to stop using the parameter system because there is a security feature built into the library that prevents parameters from being used in delete and limit statements.
        output = execute_sql(`
        DELETE FROM library
        WHERE l_libraryKey = `+document.getElementById("addSongLibraryID").value+` 
        AND l_userKey = `+ userkey +`
        AND l_song_id = `+document.getElementById("addSongToLib_SongID").value+`;
        `)

        

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Song Removed!")
    }



};



document.getElementById('createPlaylist').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    if (document.getElementById("playlsitLibraryID").value == "") {
        showAlert("You need to specify in what library you want your playlist to be in.")
        return
    }
    var output;
    try {
        
        let playlistCount = execute_sql(`select max(l_playlistkey) from library`).values[0]+1;
        output = execute_sql(`

        INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
        VALUES (`+userkey+`,`+document.getElementById("playlsitLibraryID").value+`,(select l_name from library where l_librarykey = `+document.getElementById("playlsitLibraryID").value+` limit 1),`+playlistCount+`,NULL); 

        INSERT INTO playlist(p_playlistkey, p_name, p_songID)
        VALUES (`+playlistCount+`, @PlaylistName,'NULL: EMPTY PLAYLIST');
        `, {"@PlaylistName": document.getElementById("playlistName").value, "@LibID": document.getElementById("playlsitLibraryID").value})
        

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Playlist Added!")
    }



};


document.getElementById('deletePlaylist').onclick = ()=>{
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    
    var output;
    try {
        output = execute_sql(`
        select * FROM playlist
        WHERE p_playlistkey = `+document.getElementById('playlistID').value+`;`)
        if (output == undefined) {
            showAlert("Playlist does not exist.")
            return
        }
        
        

        output = execute_sql(`
        DELETE FROM playlist
        WHERE p_playlistkey = `+document.getElementById('playlistID').value+`;

        DELETE FROM library
        where l_playlistkey = `+document.getElementById('playlistID').value+`
        AND l_userkey = `+userkey+`;`)
        

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Playlist Removed!")
    }



};


document.getElementById('newSongToPlaylist').onclick = ()=>{ //NOT IMPLEMENTED
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    let playlistID = document.getElementById('addSongPlaylistID').value
    let songID = document.getElementById('addSongToPlaylist_SongID').value
    var output;
    try {
        
        output = execute_sql(`select * from playlist where p_playlistkey = `+playlistID+` and p_songID == @SongID;`, {"@SongID": songID})
        if (output != undefined) {
            showAlert("Song is already in playlist!")
            return
        }
        output = execute_sql(`
        INSERT INTO playlist(p_playlistkey,p_name, p_songID)
        VALUES (@PlayListID,(select p_name from playlist where p_playlistkey = @PlayListID limit 1), CAST( @SongID AS varchar));
        `, {"@SongID": songID, "@PlayListID" : playlistID})
        

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        create_table(output)
    } else {
        showAlert("Song Added to playlist!")
        execute_sql(`
        delete from playlist where p_songID = 'NULL: EMPTY PLAYLIST' and p_playlistkey = ` + playlistID + `;`)
    }



};


document.getElementById('removeSongFromPlaylist').onclick = ()=>{ //NOT IMPLEMENTED
    if (userkey == undefined) {
        showAlert("You must login first.")
        return
    }
    if (document.getElementById('addSongToPlaylist_SongID').value == 'NULL: EMPTY PLAYLIST') {
        showAlert("Invalid songID.")
        return
    }
    
    var output;
    try {
        
        let playlistID = document.getElementById('addSongPlaylistID').value
        let songID = document.getElementById('addSongToPlaylist_SongID').value
        output = execute_sql(`select * from playlist where p_playlistkey = `+playlistID+` and p_songID = @SongID;`, {"@SongID": songID})
        if (output == undefined) {
            showAlert("Song is not in the playlist.")
            return
        }
        output = execute_sql(`
        delete From playlist
where p_songID in (select p_songID
from library, playlist,user
where 
l_playlistkey = p_playlistkey
AND u_userkey = l_userkey
and p_songID = @SongID
and l_playlistkey = `+playlistID+`
and l_userkey = `+userkey+`);

select count(p_playlistkey) from playlist where p_playlistkey = `+playlistID+`;

        `, {"@SongID": songID})
        
        if (output) {
            if (output.values[0] == 0) {
                execute_sql(`delete From library where l_playlistkey = `+playlistID+`;`)
            }
        }
        
        

    } catch (error) {
        console.log(error);
    }
    if (output != undefined) {
        showAlert("Song Removed from playlist!")
    } else {
        showAlert("Something went wrong...")
    }



};