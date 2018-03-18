
const {app,BrowserWindow,session} = require('electron');
const path =require('path');
const url = require('url');

let win;

function createWindow() {
    win = new BrowserWindow({
        width:1000,
        height:600,
        webPreferences:{
             devTools:true,
             webSecurity:false,
             allowRunningInsecureContent:true
        }
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname,'dist/index.html'),
        protocol: 'file:',
        slashes: true
    }))
    
    win.on('closed',() =>{
        win = null;
    })

    //Tweak for Jira server bug
    const filter = {
        urls:['*://*']
    }
    session.defaultSession.webRequest.onBeforeSendHeaders(filter,(details,callback)=>{
        details.requestHeaders['User-Agent'] = 'chrome';
        callback({cancel:false,requestHeaders:details.requestHeaders});
    });

    // Open the DevTools.
    //win.webContents.openDevTools();
}

app.on('ready',createWindow)

app.on('window-all-closed', () =>{
    if(process.platform !== 'darwin'){
        app.quit();
    }
})

app.on('activate',() => {
    if(win === null){
        createWindow();
    }
})