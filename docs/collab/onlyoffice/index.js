String.prototype.hashCode = function()
{
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

var bgWindow = null, extensionParams = {}

window.addEventListener("unload", function()
{
    var setSetting = function(name, value)
    {
        window.localStorage["store.settings." + name] = JSON.stringify(value);
    }

    setSetting(location.href, {top: window.screenTop, left: window.screenLeft, width: window.outerWidth, height: window.outerHeight});
});

window.addEventListener("load", function()
{
    chrome.runtime.getBackgroundPage(function(win)
    {
        bgWindow = win;

        var urlParam = function(name)
        {
            var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
            if (!results) { return undefined; }
            return unescape(results[1] || undefined);
        };

        var onlyOfficeVersion = bgWindow.getSetting("onlyOfficeVersion", "5.2.2-2");
        extensionParams = {url: "https://" + bgWindow.pade.server + "/v" + onlyOfficeVersion + "/web-apps/"};

        if (bgWindow.pade.server == "desktop-545pc5b:7443")   // dev testing
        {
            extensionParams = {url: "http://desktop-545pc5b:7070/v" + onlyOfficeVersion + "/web-apps/"};
        }

        var title = urlParam("title");
        var from = urlParam("from");
        var to = urlParam("to");
        var chatType = urlParam("type");
        var url = urlParam("url");
        var pos = url.lastIndexOf(".");

        if (url && pos > -1)
        {
            if (!title)
            {
                var pos1 = url.lastIndexOf("/");
                title = url.substring(pos1 + 1);
            }

            var type = url.substring(pos + 1);

            new DocsAPI.DocEditor("placeholder",
            {
                documentType: type == "xslx" || type == "xls" || type == "csv" ? "spreadsheet" : (type == "pptx" || type == "ppt" ? "presentation" : "text"),
                document: {
                    fileType: type,
                    key: url.hashCode(),
                    title: title ? title : url,
                    url: url
                },
                editorConfig: {
                    user: {
                        id: btoa(JSON.stringify({from: from, to: to, type: chatType})),
                        name: bgWindow.pade.displayName
                    },
                    customization: {
                        chat: bgWindow.getSetting("onlychat", true),
                        comments: bgWindow.getSetting("onlycomments", true),
                        zoom: bgWindow.getSetting("onlyzoom", 100),
                        compactToolbar: bgWindow.getSetting("onlycompactToolbar", false),
                        leftMenu: bgWindow.getSetting("onlyleftMenu", true),
                        rightMenu: bgWindow.getSetting("onlyrightMenu", true),
                        toolbar: bgWindow.getSetting("onlytoolbar", true),
                        header: bgWindow.getSetting("onlyheader", true),
                        statusBar: bgWindow.getSetting("onlystatusBar", true),
                        autosave: bgWindow.getSetting("onlyautosave", true),
                        forcesave: bgWindow.getSetting("onlyforcesave", true),
                        commentAuthorOnly: bgWindow.getSetting("onlycommentAuthorOnly", false),
                        showReviewChanges: bgWindow.getSetting("onlyshowReviewChanges", false)
                    },
                }
            });

            setTimeout(function()
            {
                document.title = chrome.i18n.getMessage('manifest_shortExtensionName') + " Collaboration - " + title;

            }, 1000);
        }
    });
});



