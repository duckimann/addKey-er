// Run once after extension installation
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({dlShelf: true});
	chrome.runtime.setUninstallURL("https://www.facebook.com/100006849889044");
});
// Functions
var cr = {
	cNoti: (msg) => chrome.notifications.create({type: "basic", iconUrl: "favicon.png", title: "Thêm Phím Tắt-er", message: msg}),
	dl: (dlUrl) => {
		chrome.storage.local.get("dlShelf", ({dlShelf: a}) => {
			if (!a) {
				chrome.downloads.setShelfEnabled(!a);
				setTimeout(() => chrome.downloads.setShelfEnabled(!!a), 2000);
			}
			chrome.downloads.download({url: dlUrl});
		});
	},
	newTab: (url) => chrome.tabs.create({url: url, selected: true})
}, Flickr = {
	getSize: (photoId) => fetch(`https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=621b3655c517a25e35ec61f6b9e4fbf3&photo_id=${photoId}&format=json&nojsoncallback=1`).then((a) => a.json()).then((a) => a.sizes.size.pop())
};
// Run at startup
chrome.runtime.onStartup.addListener(() => {

	chrome.storage.local.get("dlShelf", ({dlShelf: a}) => {
		chrome.downloads.setShelfEnabled(a);
	});

});
// Listen on message send to extension
chrome.runtime.onMessage.addListener((a, b) => {
	switch(Object.keys(a)[0]) {
		case "dlImg":
			cr.dl(a.dlImg);
			break;
		case "createNoti":
			cr.cNoti(a.createNoti);
			break;
		case "newTab":
			cr.newTab(a.newTab);
			break;
	}
});
// Listen on command
chrome.commands.onCommand.addListener((a) => {
	switch(a) {
		case "clickCBtnFB":
			chrome.tabs.executeScript({code: `for (let btn of Array.from(document.querySelectorAll("button.layerConfirm.uiOverlayButton[type='submit']"))) btn.click();`});
			break;
		case "dlShelf":
			chrome.storage.local.get("dlShelf", ({dlShelf: a}) => {
				let val = !a;
				chrome.downloads.setShelfEnabled(val);
				chrome.storage.local.set({dlShelf: val});
				cr.cNoti(`Đã ${(val) ? "Bật" : "Tắt"} Thanh Download.`);
			});
			break;
		case "flickrPhotoNewTab":
			console.log("New Tab");
			chrome.tabs.query({active: true}, ([{url: tab}]) => {
				let url = new URL(tab);
				if (url.hostname == "www.flickr.com" && /photos\/.*?\/\d+/g.test(url.pathname)) Flickr.getSize(url.pathname.match(/(?<=photos\/\w+\/)\d+/g).pop()).then((a) => cr.newTab(a.source));
			});
			break;
		case "dl":
			chrome.tabs.query({active: true}, ([{url: tab}]) => {
				let url = new URL(tab);
				if (/(jpg|png|jpeg)$/g.test(tab)) cr.dl(tab);
				if (url.hostname == "www.flickr.com" && /photos\/.*?\/\d+/g.test(url.pathname)) Flickr.getSize(url.pathname.match(/(?<=photos\/\w+\/)\d+/g).pop()).then((a) => cr.dl(a.source));
			});
			break;
	}
});