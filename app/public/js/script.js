(function () {

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    var userImageSource = document.getElementById('user-profile-image-template').innerHTML,
        userImageTemplate = Handlebars.compile(userImageSource),
        userImagePlaceholder = document.getElementById('user-profile-image');

    var oauthSource = document.getElementById('oauth-template').innerHTML,
        oauthTemplate = Handlebars.compile(oauthSource),
        oauthPlaceholder = document.getElementById('oauth');

    var AlbumSource = document.getElementById('album-template').innerHTML,
        AlbumTemplate = Handlebars.compile(AlbumSource);

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            // render oauth info
            oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
            });

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                    userImagePlaceholder.innerHTML = userImageTemplate(response);

                    $('#login').hide();
                    $('#loggedin').show();
                }
            });
        } else {
            // render initial screen
            $('#login').show();
            $('#loggedin').hide();
        }

        document.getElementById('obtain-new-token').addEventListener('click', function () {
            $.ajax({
                url: '/refresh_token',
                data: {
                    'refresh_token': refresh_token
                }
            }).done(function (data) {
                access_token = data.access_token;
                oauthPlaceholder.innerHTML = oauthTemplate({
                    access_token: access_token,
                    refresh_token: refresh_token
                });
            });
        }, false);

        document.getElementById('API-get-new-releases').addEventListener('click', function () {
            $.ajax({
                url: 'https://api.spotify.com/v1/browse/new-releases',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    response.albums.items.forEach(iter1);
                    function iter1(currentValue, index) {
                        var div = document.createElement('div');
                        div.id = 'album';

                        var urlgenre = 'https://api.spotify.com/v1/artists/' + currentValue.artists[0].id;
                        $.ajax({
                            url: urlgenre,
                            headers: {
                                'Authorization': 'Bearer ' + access_token
                            },
                            success: function (response) {
                                var artistinfo = {
                                    'genres': response.genres,
                                    'popularity': response.popularity,
                                    'followers': response.followers
                                }
                                var mergedObject = Object.assign(currentValue, artistinfo);


                                var urlrelatedartists = 'https://api.spotify.com/v1/artists/' + currentValue.artists[0].id + '/related-artists';
                                $.ajax({
                                    url: urlrelatedartists,
                                    headers: {
                                        'Authorization': 'Bearer ' + access_token
                                    },
                                    success: function (response) {
                                        delete Object.assign(response, { related_artists: response.artists })['artists'];
                                        var finalObject = Object.assign(mergedObject, response);
                                        div.innerHTML = AlbumTemplate(finalObject);
                                        document.getElementById('albumslist').appendChild(div);
                                    }
                                })
                            }
                        })
                    }
                }
            });
        }, false);
    }
})();


