# Releasify

## Disclaimer: 

This project was developed as part of a university course at the Nova School of Business and Economics to learn about web and cloud technologies, and should not be considered a professional or commercial application.

## Team:

- Carl Krogmann
- Ines Dewever
- Jannis Schmidt
- Leon Kahrig



Releasify is a university project created at the Nova School of Business and Economics to learn about web and cloud technologies, as well as how to code with JavaScript. The website showcases the latest released albums from Spotify per country, and includes an in-built player to directly play the songs in the browser.


---

![](images/video.gif)

---
### Setup: 

- install [node.js](https://nodejs.org/en/)
- navigate into the project folder: ```cd Recommendify```
- install required dependencies: ```npm install```
- run ```npm audit fix --force``` if necessary
- add a client_id and client_secret to the file app/app.js which can be created here: [Spotify Developer Dashboard](https://developer.spotify.com/)
---
### Startup: 

- navigate into the folder app: ```cd app```
- start a local webserver with: ```node app.js```
- open the link http://localhost:8888/ in your browser (third party cookies should be allowed otherwise the login will not work)
    - if you see a jupyter notebook interface a notebook is running somewhere and using the same port. You need to shut it down first!
    - you can run ```jupyter notebook list``` to see if notebooks are still running
    - to stop jupyter from running you can do: ```jupyter notebook stop 8888``` (make sure to save changes to your notebooks beforhand)

### Potential Problems: 
- since we are using third party cookies from spotify you can add http://localhost:8888/ as an exeption to be allowed to use any third party cookies in your browser settings (in Firefox under Privacy & Security)
- you should deactivate the extension Privacy Badger if you are using it
---

### Links: 

- [Web API Tutorial](https://developer.spotify.com/documentation/web-api/quick-start/)
- [Spotify Web API Examples (Github)](https://github.com/spotify/web-api-examples)


---
### Project File Structure: 

- package.json  -> a list of all dependencies that need to be installed by npm
- LICENSE -> MIT License
- README.md -> information on the project
- ```app``` -> application folder (you may do changes in here)
    - app.js -> main file to run a node server
    - ```public``` -> contains all files that will be sent to the client's browser
        - index.html -> first html file to be seen by the client
- ```node_modules``` -> includes all the packages installed by [npm](https://www.npmjs.com/) (do not change) 
- package-lock.json -> (do not change)
- .gitignore -> a list of all files and folders to be ignored by git
- ```.git``` -> contains files for git (can be ignored by you)

