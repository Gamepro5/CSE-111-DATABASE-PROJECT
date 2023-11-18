
.header on
-- 1.find user libraries using login info
--(Point query)
--connect to login page part of usercase
-- where user info connected to libraries
SELECT DISTINCT l_name as library_name
FROM user,library
WHERE 
    u_userkey = l_userkey AND
    u_name = 'User#0001' AND
    u_password ='guess';
-- can also be done for another user

SELECT DISTINCT p_name as playlist_name
FROM playlist, 
(SELECT DISTINCT l_name as library_name,l_playlistkey
FROM user,library
WHERE 
    u_userkey = l_userkey AND
    u_name = 'User#0002' AND
    u_password ='orangePie')
WHERE
    p_playlistkey = l_playlistkey;

-- 2.counts items in library can be playlist or song
--(point quiery)
--connects to saved song and created playlist since it count 
--how many of these items are connected to a user library
SELECT COUNT(l_librarykey)
FROM user,library
WHERE 
    u_userkey = l_userkey AND
    u_name = 'User#0001' AND
    u_password ='guess';




-- 3.find all songs from artist order them by popularity
--(Point query)
--connect to search part of user case since it help find songs of a certain artist
SELECT s_songID,s_name,s_popularity
FROM song 
WHERE 
    s_artists LIKE '%Queen%'
ORDER BY s_popularity DESC;


--4.find top songs from certain years
--(Range query)
--connects to filtering part of usercase making searching easier
SELECT s_name,s_popularity,strftime('%Y',release_date)
FROM song,track t
WHERE 
    s_songID = t.song_id AND
    strftime('%Y',release_date) BETWEEN '2010' AND '2018'
    AND s_popularity > 80
ORDER BY s_popularity DESC;


--5. Count song produce by artist
--(Full table scan)
-- good for information about artist
--useful when adding songs to database using admin actor
--give a value of song avalible by a artist in databasr
SELECT a.name,COUNT(s_name) as song_cnt
FROM song,artist a
WHERE
    s_artist_id = a.artist_id
GROUP BY a.name;

---6. Count song produce by main artist
-- Who have more than 20 songs gives info about well know artist is
-- (Range query)
-- also gives idea of artist that might have more album connection due to value of song
SELECT name,song_cnt
FROM
(SELECT a.name as name,COUNT(s_name) as song_cnt
FROM song,artist a
WHERE
    s_artist_id = a.artist_id
GROUP BY a.name)
WHERE
    song_cnt > 20
ORDER BY song_cnt DESC;

--7. used to connect song to a album
--artist can have multiple song but not all are connected to an album
--(point query)
-- help show witch song are connected to album for a specific artist
SELECT ar.name,a.al_name,s.s_name,t.track_number
FROM track t ,song s,album a,artist ar
WHERE
    t.song_id = s.s_songID AND
    t.album_id = a.album_id AND
    a.al_artist_id = s.s_artist_id AND
    ar.artist_id = a.al_artist_id AND
    ar.name = 'Selena Gomez'
ORDER BY a.al_name,t.track_number;

--8. Gives ID of song that are connected to album
--(point query)
--make it earier to find song from a album if avalible in database
SELECT ar.name,a.al_name,t.song_id
FROM album a,artist ar,track t
WHERE
    ar.artist_id = a.al_artist_id AND
    a. album_id = t.album_id and
    ar.name = 'Selena Gomez'
ORDER BY a.al_name;

--9.only list song that are not explicit
-- filters song and allow song that are not explicit to appear
--(point query)
--good for age restriction, might need to add user name
SELECT ar.name,s_name
FROM artist ar,song
WHERE
    ar.artist_id = s_artist_id AND
    s_explicit = 'FALSE'
GROUP BY ar.name,s_name
ORDER BY ar.name,s_name;

--10.show artist's albums songs connected to albums 
--also show release date for song and album
-- can notice what song were not released on the same day as album
-- can help with cleaning data and finding data that is not in great format
--(Full table scan)
SELECT ar.name, a.al_name, r.release_date as album_releasedate, s.s_name, t.release_date as song_releasedate
FROM releases r ,song s,album a,artist ar, track t
WHERE
    r.album_id = a.album_id AND
    r.artist_id = ar.artist_id AND
    ar.artist_id = s_artist_id AND
    s.s_songID = t.song_id AND
    a.album_id = t.album_id AND
    r.release_date <> t.release_date
ORDER BY ar.name,a.al_name;

--11 find user that have same playlist
-- useful to find playlist shared among user
--(point quiery)
SELECT u_name
FROM user,library
WHERE
    u_userkey = l_userkey AND
    l_playlistkey = 1;


--12 list all song in Library#1
--which is library of User#0001
--useful in getting name of song stored in user library
--not includeing the one in playlist
--(point quiery)
SELECT s_name as song_name
FROM song,library
WHERE
    l_song_id = s_songID AND
    l_name = 'Library#1' AND
    l_playlistkey IS NULL;

--13 list all playlist in library and the song in the playlist
--helps show song that are in a playlist in user's library 
--(point quiery)
--helpful when keeping track of created playlist
SELECT p_name as playlist_name,s_name as song_name
FROM playlist,library,song
WHERE
    l_playlistkey = p_playlistkey AND
    p_songID = s_songID AND
    l_name = 'Library#1' AND
    l_song_id IS NULL;

--14 list all song in database which is helpful when
--trying song that start with a specific name since 
--user can search song by first letter in it name
--(Full table scan)
--can also be done with album to see song that are avaliable based on album name

SELECT s_name as song_name
FROM song
ORDER BY s_name;

--15 find an artist most popular song in database
--(point quiery)
--Help with song search
SELECT ar.name,s.s_name,MAX(s.s_popularity)
FROM song s,artist ar
WHERE
    ar.artist_id  = s.s_artist_id AND
    ar.name = 'Selena Gomez';
    
--16 instead of a specific artist max can find most popular song of all artist
-- can help find song faster if they are wellknown
--(FULL table scan)
SELECT ar.name,s.s_name,MAX(s.s_popularity)
FROM song s,artist ar
WHERE
    ar.artist_id  = s.s_artist_id
GROUP BY ar.name;

--17 This help filter artist that only have one song this means 
-- that artist is upcomming or onehit wonder
--help with search and add song to database
--(range quiery)
SELECT name,song_cnt
FROM
(SELECT a.name as name,COUNT(s_name) as song_cnt
FROM song,artist a
WHERE
    s_artist_id = a.artist_id
GROUP BY a.name)
WHERE
    song_cnt < 2
ORDER BY song_cnt DESC;

--18 help order artist by main_genere and sort by followers
--help recomment artist based on there mains genere, user can add to a library or playlist in library
--(point quiery)
SELECT name as artist
FROM artist
WHERE
    main_genre = 'dance pop'
ORDER BY followers DESC;

--19 Sort based on artist_type then it order by artist popularity, Then it find 
--most popular song of that artist of that specific artist type,and order based on song popularity
--print top 10 artist_type singer based on their most popular song value
-- comes in handy when filtering and searching for songs to add to library or playlist
--(point quiery)
SELECT artist,MAX(s_popularity),s_name,art.artist_type
FROM song,
(SELECT name as artist,artist_type,popularity,artist_id
FROM artist
WHERE artist_type = 'singer'
ORDER BY popularity DESC) as art
WHERE
    s_artist_id = art.artist_id
GROUP BY artist
ORDER BY s_popularity DESC
limit 10;


--20 uses key words in s_name to find song that deal with 
--heart and break this help search song with words that relate to 
--user input since 
SELECT s_name as song_name, ar.name as artist_name
FROM song,artist ar
WHERE
    s_artist_id = ar.artist_id AND
    s_name LIKE '%heart%' AND
    s_name LIKE '%break%';

-- can also order by popularity and get top 10 popular songs
SELECT s_name as song_name, ar.name as artist_name,s_popularity
FROM song,artist ar
WHERE
    s_artist_id = ar.artist_id AND
    s_name LIKE '%heart%' AND
    s_name LIKE '%break%'
ORDER BY s_popularity DESC
LIMIT 10;


--21. how to insert into a table
-- good for adding user when they create an account also to add
-- to library when a song or playlist is added
INSERT INTO user(u_userkey, u_name, u_password, u_email)
VALUES (6,'User#0007','pinkGhost','user77@gmail.com');

--quiery to see list of user in table
SELECT *  FROM user;

DELETE FROM user
WHERE u_userkey = 6;

--22. WHEN user updates password
--can also be use to update username or email
--changes password for User#0005
UPDATE user
SET u_password = 'blueBerry'
WHERE u_name = 'User#0005';

--changes password back to 'blueBonnet'
UPDATE user
SET u_password = 'blueBonnet'
WHERE u_name = 'User#0005';

-- to add playlist would need to modify the library for user and playlist table
INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
VALUES (2,3,'Library#3',3,NULL);

INSERT INTO playlist(p_playlistkey,p_name, p_songID)
VALUES (3,'Selena_songs','2dRvMEW4EwySxRUtEamSfG'),
(3,'Selena_songs','3CJvmtWw2bJsudbAC5uCQk'),
(3,'Selena_songs','6ZANrVuAMp2rpjhfbOuJly'),
(3,'Selena_songs','2OsEJFTfzfjG4oC92cuP2c');

SELECT p_name as playlist_name,s_name as song_name
FROM playlist,library,song
WHERE
    l_playlistkey = p_playlistkey AND
    p_songID = s_songID AND
    l_name = 'Library#3' AND
    l_song_id IS NULL;





