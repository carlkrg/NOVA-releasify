(function () {

    /**************************************************************************
     * Authentication related functions
     **************************************************************************/
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        const hashParams = {};
        const regex = /([^&;=]+)=?([^&;]*)/g;
        const queryString = window.location.hash.substring(1);
        let match;
        while (match = regex.exec(queryString)) {
            const key = decodeURIComponent(match[1]);
            const value = decodeURIComponent(match[2]);
            hashParams[key] = value;
        }
        return hashParams;
    }

    /**
     * Function to get a new access token
     * @param {*} refresh_token
     * @returns
     */
    function getNewToken(event) {
        fetch('/refresh_token?refresh_token=' + refresh_token)
            .then(response => response.json())
            .then(data => {
                access_token = data.access_token;
                oauth.placeholder.innerHTML = oauth.template({
                    access_token: access_token,
                    refresh_token: refresh_token
                });
            });
    }

    function invalidateCookie(cookieName, cookiePath) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${cookiePath};`;
    }


    // Function to show the notification popup with a message
    function showNotification(message, type) {
        // Set the message text

        document.getElementById('alert-placeholder').innerHTML =alertTemp.template();
        // Get the notification popup element
        const notificationPopup = document.getElementById('notification-popup');

        // Get the notification message element
        const notificationMessage = document.getElementById('notification-message');

        // Show the notification popup using Bootstrap's "show" class
        if (type === 'success') {
            notificationMessage.textContent = message;
            notificationPopup.classList.add('alert-success');
            notificationPopup.classList.add('show');
        } 
        
        if (type === 'danger') {
            notificationMessage.textContent = message;
            notificationPopup.classList.add('alert-danger');
            notificationPopup.classList.add('show');
        } 

    }


    /**************************************************************************
     * Side render Functions
     **************************************************************************/
    /**
     * Creates Template and Placeholder objects
     * @param {*} templateId
     * @param {*} placeholderId
     * @returns
     */
    function initHandlebars(templateId, placeholderId) {
        const source = document.getElementById(templateId).innerHTML;
        const template = Handlebars.compile(source);
        const placeholder = document.getElementById(placeholderId);
        return { source, template, placeholder };
    }

    Handlebars.registerHelper('convertMsToMins', function (ms) {
        let seconds = Math.floor(ms / 1000);
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return minutes + ":" + seconds;
    });

    /**
     * Function to render the login screen
     */
    function renderLoginScreen() {
        $('#loading-screen').hide();
        $('#login').show();
        $('#loggedin').hide();
        $('#navLogin').show();
        $('#navLoggedin').hide();
        $('#footerLoggedin').hide();
    }

    function logOut(event) {
        access_token = null;
        renderLoginScreen();
        location.href = "/";
    }

    /**
     * Function to render the logged in screen
     * @param {*} access_token
     * @param {*} refresh_token
     * @param {*} oauth
     * @param {*} userProfile
     * @param {*} userImage
     * @param {*} album
     */
    function renderLoggedInScreen(access_token, refresh_token, oauth, userProfile, userImage) {
        showLoadingScreen();
        oauth.placeholder.innerHTML = oauth.template({
            access_token: access_token,
            refresh_token: refresh_token
        });

        fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                userProfile.placeholder.innerHTML = userProfile.template(data);
                userImage.placeholder.innerHTML = userImage.template(data);
                document.getElementById('logOutButton').addEventListener('click', logOut, false);

                $('#login').hide();
                $('#loggedin').show();
                $('#navLogin').hide();
                $('#navLoggedin').show();
                $('#footerLoggedin').show();
            })
            .catch(error => {
                console.error('Error:', error);
                if (error.status == 401) {
                    invalidateCookie("username-localhost-8888", "/");
                    renderLoginScreen();
                    console.log("token not valid");
                }
            });

        document.getElementById('obtain-new-token').addEventListener('click', getNewToken, false);
        getAlbums("PT", "Portugal");
        hideLoadingScreen();
    }


    function saveTracks(songID) {
        const url = `https://api.spotify.com/v1/me/tracks?ids=${songID}`;
        fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log(`Successfully saved tracks with ID ${songID}`);
                    showNotification(`Successfully saved tracks with ID ${songID}`, "success");
                    document.getElementById("like-" + songID).getElementsByTagName("i")[0].classList.replace("bi-heart", "bi-heart-fill");
                } else {
                    console.error(`Failed to save track with ID ${songID}: ${response.status} ${response.statusText}`);
                    showNotification(`Failed to save track with ID ${songID}`, "danger");
                }
            })
            .catch(error => console.error(`Failed to save track with ID ${songID}:`, error));
            showNotification(`Failed to save track with ID ${songID}`, "danger");
    }

    function followArtist(artistId) {
        const followUrl = `https://api.spotify.com/v1/me/following/contains?type=artist&ids=${artistId}`;
        fetch(followUrl, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data[0]) {
                    console.log(`You are already following artist with ID ${artistId}`);
                    document.getElementById('Artist-Follow-' + artistId).getElementsByTagName("i")[0].classList.replace("bi-heart", "bi-heart-fill");
                    showNotification(`You are already following artist with ID ${artistId}`, "success");
                } else {
                    const followUrl = `https://api.spotify.com/v1/me/following?type=artist&ids=${artistId}`;
                    fetch(followUrl, {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        }
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log(`Successfully followed artist with ID ${artistId}`);
                                document.getElementById('Artist-Follow-' + artistId).getElementsByTagName("i")[0].classList.replace("bi-heart", "bi-heart-fill");
                                showNotification(`Successfully followed artist with ID ${artistId}`, "success");

                            } else {
                                console.error(`Failed to follow artist with ID ${artistId}: ${response.status} ${response.statusText}`);
                                showNotification(`Failed to follow artist with ID ${artistId}`, "danger");
                            }
                        })
                        .catch(error => console.error(`Failed to follow artist with ID ${artistId}:`, error));
                        showNotification(`Failed to follow artist with ID ${artistId}`, "danger");
                }
            })
            .catch(error => console.error(`Failed to check if you are following artist with ID ${artistId}:`, error));
            showNotification(`Failed to follow artist with ID ${artistId}`, "danger");
    }

    function showLoadingScreen() {
        $('#loading-screen').show();
    }

    function hideLoadingScreen() {
        setTimeout(() => {
            $('#loading-screen').hide();
        }, 1000);
    }


    function getAlbums(countryCode, countryName) {
        $('#loading-screen').show();
        const parent = document.getElementById("albumslist")
        while (parent.firstChild != null) {
            parent.removeChild(parent.firstChild);
        }
        document.getElementById("countryHeader").textContent = countryName

        fetch("https://api.spotify.com/v1/browse/new-releases?country=" + countryCode + "&limit=50", {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                data.albums.items.forEach(iter1);

                function iter1(currentValue, index) {
                    var div = document.createElement('div');
                    div.id = currentValue.id;
                    div.className = 'album';

                    var urlgenre = 'https://api.spotify.com/v1/artists/' + currentValue.artists[0].id;
                    fetch(urlgenre, {
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        }
                    })
                        .then(response => response.json())
                        .then(artistinfo => {
                            var mergedObject = Object.assign(currentValue, {
                                'artistID': artistinfo.id,
                                'artistGenres': artistinfo.genres,
                                'artistPopularity': artistinfo.popularity,
                                'artistFollowers': artistinfo.followers,
                                'artistImage': artistinfo.images[0].url,
                                'artistsList': currentValue.artists.map(element => element.name),
                                'artistUrl': artistinfo.external_urls.spotify,
                                'artistName': artistinfo.name,
                            });

                            var urlrelatedartists = 'https://api.spotify.com/v1/artists/' + currentValue.artists[0].id + '/related-artists';
                            fetch(urlrelatedartists, {
                                headers: {
                                    'Authorization': 'Bearer ' + access_token
                                }
                            })
                                .then(response => response.json())
                                .then(relatedArtists => {
                                    var finalObject = Object.assign(mergedObject, {
                                        related_artists: relatedArtists.artists
                                    });
                                    div.innerHTML = album.template(finalObject);
                                    div.querySelector(".getSongs").addEventListener('click', function () {
                                        getAlbumTracks(div.id, finalObject);
                                    }, false);
                                    console.log(finalObject);
                                    document.getElementById('albumslist').appendChild(div);

                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                });
                            $('#loading-screen').hide();
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function sortAlbums(input, ascending) {
        const albums = document.querySelectorAll('.album');
        let albumsArr = Array.prototype.slice.call(albums);
        article = ".album-info-article";
        let sortedAlbumsArr;

        if (input === "data-total-tracks") {
            if (ascending === true) {
                console.log("data tracks small first")
                sortedAlbumsArr = albumsArr.sort((d1, d2) =>
                    (parseInt(d1.querySelector(article).getAttribute(input)) > parseInt(d2.querySelector(article).getAttribute(input))) ? 1 :
                        (parseInt(d1.querySelector(article).getAttribute(input)) < parseInt(d2.querySelector(article).getAttribute(input))) ? -1 : 0);
            } else {
                console.log("data tracks large first")
                sortedAlbumsArr = albumsArr.sort((d1, d2) =>
                    (parseInt(d1.querySelector(article).getAttribute(input)) < parseInt(d2.querySelector(article).getAttribute(input))) ? 1 :
                        (parseInt(d1.querySelector(article).getAttribute(input)) > parseInt(d2.querySelector(article).getAttribute(input))) ? -1 : 0);
            }
        } else if (input === "data-popularity") {
            if (ascending === true) {
                console.log("data popularity small first")
                sortedAlbumsArr = albumsArr.sort((d1, d2) =>
                    (parseInt(d1.querySelector(article).getAttribute(input)) > parseInt(d2.querySelector(article).getAttribute(input))) ? 1 :
                        (parseInt(d1.querySelector(article).getAttribute(input)) < parseInt(d2.querySelector(article).getAttribute(input))) ? -1 : 0);
            } else {
                console.log("data popularity large first")
                sortedAlbumsArr = albumsArr.sort((d1, d2) =>
                    (parseInt(d1.querySelector(article).getAttribute(input)) < parseInt(d2.querySelector(article).getAttribute(input))) ? 1 :
                        (parseInt(d1.querySelector(article).getAttribute(input)) > parseInt(d2.querySelector(article).getAttribute(input))) ? -1 : 0);
            }
        } else if (input === 'data-release-date') {
            if (ascending === true) {
                console.log("data release old first")
                sortedAlbumsArr = albumsArr.sort((d1, d2) =>
                    (Date.parse(d1.querySelector(article).getAttribute(input)) > Date.parse(d2.querySelector(article).getAttribute(input))) ? 1 :
                        (Date.parse(d1.querySelector(article).getAttribute(input)) < Date.parse(d2.querySelector(article).getAttribute(input))) ? -1 : 0);
            } else {
                console.log("data release new first")
                sortedAlbumsArr = albumsArr.sort((d1, d2) =>
                    (Date.parse(d1.querySelector(article).getAttribute(input)) < Date.parse(d2.querySelector(article).getAttribute(input))) ? 1 :
                        (Date.parse(d1.querySelector(article).getAttribute(input)) > Date.parse(d2.querySelector(article).getAttribute(input))) ? -1 : 0);
            }
        } else {
            console.log("ERROR IN ALBUMSORT")
        }
        const albumslist = document.getElementById('albumslist')
        sortedAlbumsArr.forEach(function (item) {
            albumslist.appendChild(item);
        })
    }

    // Function to get album tracks and display in modal
    function getAlbumTracks(albumId, albumObject) {
        console.log(albumObject);

        artistFullPlaceholder = document.getElementById('artistFull');
        while (artistFullPlaceholder.firstChild != null) {
            artistFullPlaceholder.removeChild(artistFullPlaceholder.firstChild);
        }
        artistFullPlaceholder.innerHTML = artistFull.template(albumObject);
        document.getElementById('Artist-Follow-' + albumObject.artistID).addEventListener('click', function () { followArtist(albumObject.artistID); }, false);

        albumFullPlaceholder = document.getElementById('albumFull');
        while (albumFullPlaceholder.firstChild != null) {
            albumFullPlaceholder.removeChild(albumFullPlaceholder.firstChild);
        }
        albumFullPlaceholder.innerHTML = albumFull.template(albumObject);

        const url = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`;
        fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const songs = data.items.map(item => {
                    return {
                        name: item.name,
                        id: item.id,
                        artists: item.artists.map(element => element.name),
                        albumImage: albumObject.images[0].url,
                        track_number: item.track_number,
                        duration_ms: item.duration_ms,
                    };
                });
                songList = document.getElementById('songList')
                while (songList.firstChild != null) {
                    songList.removeChild(songList.firstChild);
                }
                songs.forEach((song, index) => {
                    let songDiv = document.createElement('div');
                    songDiv.id = song.id;
                    songDiv.innerHTML = songTemp.template(song);
                    songList.appendChild(songDiv)
                    document.getElementById("like-" + song.id).addEventListener('click', function () { saveTracks(song.id) });
                    document.getElementById("play-" + song.id).addEventListener('click', function () {
                        player = getPlayerObject();
                        if (player) {
                            console.log(player)
                            console.log(song.id)
                            player.getCurrentState().then(state => {
                                playSong(song.id, state);
                            })
                        }
                    });
                });
                $('#songListModal').modal('show');
            })
            .catch(error => console.error(error));
    }

    function getMarkets() {
        let urlmarkets = 'https://api.spotify.com/v1/markets';
        fetch(urlmarkets, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
            .then(response => response.json())
            .then(data => {
                let urlcountryapi = 'https://restcountries.com/v3.1/alpha?codes=' + data.markets.toString();
                fetch(urlcountryapi, {
                    headers: {}
                })
                    .then(response => response.json())
                    .then(data => {
                        let sortedCountries = data.sort(
                            (c1, c2) => (c1.name.common > c2.name.common) ? 1 : (c1.name.common < c2.name.common) ? -1 : 0);
                        sortedCountries.forEach(iter1);
                        function iter1(currentCountryObj, index) {
                            var li = document.createElement('li');
                            var a = document.createElement('a')
                            a.classList.add("dropdown-item");
                            a.id = currentCountryObj.cca2
                            a.innerText = currentCountryObj.name.common;
                            li.appendChild(a);
                            document.getElementById("countries-dropdown").appendChild(li);
                            document.getElementById(currentCountryObj.cca2).addEventListener('click', function () {
                                getAlbums(currentCountryObj.cca2, currentCountryObj.name.common);
                                clearInput()
                            }, false);
                        }
                    })
            })
    }

    function searchCountries() {
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById('searchCountryDropdown');
        filter = input.value.toUpperCase();
        ul = document.getElementById("countries-dropdown");
        li = ul.getElementsByTagName('li');

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("a")[0];
            txtValue = a.textContent;
            if (txtValue.toUpperCase().startsWith(filter) === true) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }

    function clearInput() {
        let searchInput = document.getElementById("searchCountryDropdown");
        if (searchInput.value != "") {
            searchInput.value = "";
            ul = document.getElementById("countries-dropdown");
            li = ul.getElementsByTagName('li');
            for (i = 0; i < li.length; i++) {
                li[i].style.display = "";
            }
        }
    }

    /**************************************************************************
     * Function Calls
     **************************************************************************/
    renderLoginScreen();
    const userProfile = initHandlebars('user-profile-template', 'user-profile');
    const userImage = initHandlebars('user-profile-image-template', 'user-profile-image');
    const oauth = initHandlebars('oauth-template', 'oauth');
    const album = initHandlebars('album-template', null);
    const albumFull = initHandlebars('album-template-full', null);
    const artistFull = initHandlebars('artist-template-full', null);
    const songTemp = initHandlebars('song-template', null);
    const alertTemp = initHandlebars('alert-template', null);

    const params = getHashParams();

    let access_token = params.access_token;
    let refresh_token = params.refresh_token;
    let error = params.error;

    if (error) {
        alert('There was an error during the authentication');
        renderLoginScreen();
    } else {
        if (access_token) {
            renderLoggedInScreen(access_token, refresh_token, oauth, userProfile, userImage);
            getMarkets();

            const playButton = document.querySelector('.play-pause-button');
            const previousButton = document.querySelector('#previous-button');
            const nextButton = document.querySelector('#next-button');
            const songTitle = document.querySelector('#song-title');
            const albumCover = document.getElementById('album-cover');
            const artistName = document.querySelector('#artist-name');
            const currentTime = document.querySelector('#current-time');
            const progressBar = document.querySelector('.progress-bar');

            let playerObject;
            let trackIndex = 0;
            let playbackInterval;
            let playerid;

            // Initialize the player with your access token and set up event listeners
            window.onSpotifyWebPlaybackSDKReady = () => {
                player = new Spotify.Player({
                    name: 'My Cool Web Player',
                    getOAuthToken: cb => { cb(access_token); }
                });

                player.addListener('ready', ({ device_id }) => {
                    console.log('Device ID', device_id);
                    playerid = device_id;
                });

                player.addListener('player_state_changed', state => {
                    console.log('Player state changed', state);
                    updatePlayerUI(state);
                });

                player.connect().then(success => {
                    if (success) {
                        console.log('Connected to Spotify SDK');
                    }
                });

                playerObject = player;
            };

            // Click handler for play button
            playButton.addEventListener('click', () => {
                if (player) {
                    player.togglePlay();
                }
            });

            // Click handler for previous button
            previousButton.addEventListener('click', () => {
                if (player) {
                    player.previousTrack()
                    player.togglePlay();
                }
            });

            // Click handler for next button
            nextButton.addEventListener('click', () => {
                if (player) {
                    player.nextTrack();
                };
            });

            // Get the access token from your application
            function getAccessToken() {
                return access_token;
            }

            function updatePlayerUI(state) {
                if (!state) {
                    return;
                }

                const track = state.track_window.current_track;
                if (!track) {
                    console.error('No track is currently playing');
                    return;
                }

                const album = track.album;
                if (!album) {
                    console.error('No album metadata is available for the currently playing track');
                    return;
                }

                const albumImage = album.images && album.images.length > 0 ? album.images[0].url : '';
                albumCover.src = albumImage || 'https://dummyimage.com/64x64/000/fff';

                songTitle.innerText = track.name;
                artistName.innerText = track.artists.map(artist => artist.name).join(', ');

                const duration = state.duration;
                const position = state.position;
                currentTime.innerText = `${Math.floor(position / 1000 / 60)}:${('00' + Math.floor(position / 1000 % 60)).slice(-2)}`;
                progressBar.style.width = `${position / duration * 100}%`;

                // Update play/pause button icon
                const isPlaying = !state.paused;
                playButton.innerHTML = isPlaying ? '<i class="bi bi-pause-fill"></i>' : '<i class="bi bi-play-fill"></i>';

                // Add click event listener for the progress bar
                progressBar.addEventListener('click', (e) => {
                    const newTime = (e.offsetX / progressBar.offsetWidth) * duration;
                    playerObject.seek(newTime);
                });
            }


            function playSong(id) {
                const accessToken = getAccessToken();
                const songID = 'spotify:track:' + id;

                fetch(`https://api.spotify.com/v1/me/player/play?device_id=${playerid}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        uris: [songID]
                    })
                }).then(response => {
                    if (response.status === 403) {
                        console.error('Unable to play song. The user may not have a Spotify Premium account.');
                    }
                }).catch(error => {
                    console.error('Error playing song:', error);
                });

                clearInterval(playbackInterval);
                playbackInterval = setInterval(() => {
                    player.getCurrentState().then(state => {
                        updatePlayerUI(state);
                    });
                }, 1000);
            }



            const sortbutton1a = document.getElementById('sort-total-tracks-largefirst');
            sortbutton1a.addEventListener('click', function () { sortAlbums('data-total-tracks', false); });

            const sortbutton1b = document.getElementById('sort-total-tracks-smallfirst');
            sortbutton1b.addEventListener('click', function () { sortAlbums('data-total-tracks', true); });

            const sortbutton2a = document.getElementById('sort-release-date-newfirst');
            sortbutton2a.addEventListener('click', function () { sortAlbums('data-release-date', false); });

            const sortbutton2b = document.getElementById('sort-release-date-oldfirst');
            sortbutton2b.addEventListener('click', function () { sortAlbums('data-release-date', true); });

            const sortbutton3a = document.getElementById('sort-popularity-largefirst');
            sortbutton3a.addEventListener('click', function () { sortAlbums('data-popularity', false); });

            const sortbutton3b = document.getElementById('sort-popularity-smallfirst');
            sortbutton3b.addEventListener('click', function () { sortAlbums('data-popularity', true); });

            document.getElementById('searchCountryDropdown').addEventListener('keyup', function () { searchCountries(); })

            function getPlayerObject() {
                return playerObject;
            }

        } else {
            renderLoginScreen();
        }
    }

})();
