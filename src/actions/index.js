import * as types from "../constants/ActionTypes";
import v4 from 'uuid';

export const nextLyric = (currentSongId) => ({
  type: types.NEXT_LYRIC,
  currentSongId
});

export const restartSong = (currentSongId) => ({
  type: types.RESTART_SONG,
  currentSongId
});

export const changeSong = (newSelectedSongId) => ({
  type: types.CHANGE_SONG,
  newSelectedSongId
});

export const receiveSong = (title, artist, songId, songArray) => ({
  type: types.RECEIVE_SONG,
  songId,
  title,
  artist,
  songArray,
  receivedAt: Date.now()
});

export function fetchSongId(title) {
  return async function (dispatch) {
    const localSongId = v4();
    let json;
    dispatch(requestSong(title, localSongId));
    title = title.replace(' ', '_');
    try {
      const response = await fetch('http://api.musixmatch.com/ws/1.1/track.search?&q_track=' + title + '&page_size=1&s_track_rating=desc&apikey=95d92aea0a48520d614faaa13b9e4414')
      json = await response.json();
      console.log(json.message.body.track_list[0]);
      if (json.message.body.track_list.length > 0) {
        const musicMatchId = json.message.body.track_list[0].track.track_id;
        const artist = json.message.body.track_list[0].track.artist_name;
        const title = json.message.body.track_list[0].track.track_name;
        fetchLyrics(title, artist, musicMatchId, localSongId, dispatch);
      } else {
        console.log('We couldn\'t locate a song under that ID!');
      }
    }
    catch (e) {
      json = console.log('An ERROR!', e)
    }
  };
}

export function fetchLyrics(title, artist, musicMatchId, localSongId, dispatch) {
  return fetch('http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=' + musicMatchId + '&apikey=95d92aea0a48520d614faaa13b9e4414').then(
    response => response.json(),
    error => console.log('An error occurred.', error)
  ).then(function(json) {
    console.log(json);

    if (json.message.body.lyrics) {
      let lyrics = json.message.body.lyrics.lyrics_body;
      lyrics = lyrics.replace('"', '');
      const songArray = lyrics.split(/\n/g).filter(entry => entry!="");
      dispatch(receiveSong(title, artist, localSongId, songArray));
    } else {
      console.log('We couldn\'t locate lyrics for this song!');
    }
  });
}

export const requestSong = (title, localSongId) => ({
  type: types.REQUEST_SONG,
  title,
  songId: localSongId
});