(function(){
    var wsUri = "ws://" +"192.168.0.105:4545"+"/watcher";
    var styleSheetType = "scss";



    function getFileList(){
        var ans = [];

        var link = document.getElementsByTagName("link");
        var i,path;
        for( i = 0 ;i <link.length ; i++){
            path = link[i].getAttribute("href");
            ans.push(path.substring(0,path.length - 3) + styleSheetType);
        }

        var script = document.getElementsByTagName("script");
        for( i =0;i < script.length ; i++){
            path = script[i].getAttribute("src");
            if(path != null && path != undefined && path.substr(path.lastIndexOf("/") + 1) != "watcher.js"){
                ans.push(path);
            }
        }



        //for itself
        ans.push(window.location.pathname.substring(1));
        //ans.push("index.html");
        return ans;
    }
    function init(){


        var top = getCookie('scrollY');
        var left = getCookie('scrollX');
        if(top == ""){
            top = 0;
        }else{
            top =  parseInt(top);
        }
        if(left == ""){
            left = parseInt(0);
        }else{
            left = parseInt(left);
        }

        window.scrollTo(left,top);
        window.addEventListener("scroll", function(){
            setCookie("scrollY",window.scrollY,7);
            setCookie("scrollX",window.scrollX,7);
        }, false);

        testWebSocket();
    }

    function testWebSocket() {
        var websocket = new WebSocket(wsUri);
        websocket.onopen = function (evt) {
            onOpen(evt,websocket)
        };
        websocket.onclose = function (evt) {
            onClose(evt)
        };
        websocket.onmessage = function (evt) {
            onMessage(evt)
        };
        websocket.onerror = function (evt) {
            onError(evt)
        };
    }

    function onMessage(evt) {
        if(evt.data == "Reload"){

            console.log("ok");
            location.reload();

           /* if(window.navigator.appVersion == "5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.76 Safari/537.36"){
                var gui = require("nw.gui");
                var win = gui.Window.get();
                win.reload();
            }*/

        }
    }

    function onOpen(evt,webscoket) {
        writeToScreen("WATCHER CONNECTED");

        var ans = getFileList();
        var msg = "";
        for(var i = 0; i <ans.length ; i++){
            msg = msg + ans[i] + ":";
        }
        msg = msg.substr(0,msg.length -1);
        doSend(msg,webscoket);
    }
    function onClose(evt) {
        writeToScreen("DISCONNECTED");
    }

    function writeToScreen(message) {

        console.log (message);
    }

    function onError(evt) {
        writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
    }

    function doSend(message,websocket) {
        websocket.send(message);
    }


    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }
    window.addEventListener("load", init, false);

})();