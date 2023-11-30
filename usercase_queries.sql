
--Values used are example might not be actual value in database

--1.createAccount(email, password)
INSERT INTO user(u_userkey, u_name, u_password, u_email)
VALUES (6,NULL,'pinkGhost','user77@gmail.com');
-- the u_userkey is a primary so can't be duplicated on database

--to delete need to remove playlist first followed by library , then last user
DELETE FROM playlist
WHERE p_playlistkey IN
(SELECT DISTINCT p_playlistkey
FROM playlist,library,song
WHERE
    l_playlistkey = p_playlistkey AND
    p_songID = s_songID AND
    l_name = 'Library#3' AND
    l_song_id IS NULL);

DELETE FROM library
WHERE l_userkey = 6; 

DELETE FROM user
WHERE u_userkey = 6; 


--2.changeEmail(userKey, email)
UPDATE user
SET u_email = 'user45@gmail.com'
WHERE u_userkey = '6';

--3.changePassword(userKey, password)
UPDATE user
SET u_password = 'newPassword'
WHERE u_userkey = '6';

--4.createLibrary(userKey, libraryName)
--create library that empty
INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
VALUES (2,3,'Library#3',NULL,NULL); 

--if you want to add song ot playlist need to duplicate this and change the NULL
--adding library with playlist first null is playlistKey
INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
VALUES (2,3,'Library#3',3,NULL); 
-- how to add playlist to library
INSERT INTO playlist(p_playlistkey,p_name, p_songID)
VALUES (3,'Selena_songs','2dRvMEW4EwySxRUtEamSfG'),
(3,'Selena_songs','3CJvmtWw2bJsudbAC5uCQk'),
(3,'Selena_songs','6ZANrVuAMp2rpjhfbOuJly'),
(3,'Selena_songs','2OsEJFTfzfjG4oC92cuP2c');


--adding  song to library second null has song_id
INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
VALUES (2,3,'Library#3',NULL,'2OsEJFTfzfjG4oC92cuP2c'); 
--need to do this for every sone added alone to library


--5.deleteLibrary(userKey, libraryKey)
-- need to delete playlist in that library first
-- then can remove specific library 
DELETE FROM playlist
WHERE p_playlistkey IN
(SELECT DISTINCT p_playlistkey
FROM playlist,library,song
WHERE
    l_playlistkey = p_playlistkey AND
    p_songID = s_songID AND
    l_librarykey = '6' AND
    l_song_id IS NULL);

DELETE FROM library
WHERE l_libraryKey = 6 
    AND l_userKey = 2;

--6.createPlaylist(userKey, libraryKey, playlistName)
--to add more playlist use same insert library just change l_playlistkey
INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
VALUES (2,3,'Library#3',3,NULL); 
--here you assign playlist name to playlistkey
--p_playlistkey,p_name stay the same just change song id to add song to playlist
-- song with the same p_playlistkey,p_name belong to same playlist
INSERT INTO playlist(p_playlistkey,p_name, p_songID)
VALUES (3,'Selena_songs','2dRvMEW4EwySxRUtEamSfG'),
(3,'Selena_songs','3CJvmtWw2bJsudbAC5uCQk'),
(3,'Selena_songs','6ZANrVuAMp2rpjhfbOuJly'),
(3,'Selena_songs','2OsEJFTfzfjG4oC92cuP2c');

--7.deletePlaylist(userKey, libraryKey, playlistKey)
DELETE FROM playlist
WHERE p_playlistkey = 2;

DELETE FROM library
WHERE l_libraryKey = 3
    AND l_playlistkey= 3
    AND l_userkey = 2;



--8.addSong(userKey, playlistKey, songID)
INSERT INTO library(l_userkey,l_librarykey,l_name, l_playlistkey, l_song_id)
VALUES (2,3,'Library#3',NULL,'2OsEJFTfzfjG4oC92cuP2c');
--make sure l_playlistkey is NULL and just add songid to second null
-- need to do this for everysong added to library

--9.removeSong(userKey, playlistKey, songID)
DELETE FROM library
WHERE l_libraryKey = 3
    AND l_userKey = 2
    AND l_song_id= '2OsEJFTfzfjG4oC92cuP2c';

--10.shufflePlaylist(userKey, playlistID)
-- not sure for this one but 
