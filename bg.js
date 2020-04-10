// Run once after extension installation
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({dlShelf: true});
	chrome.runtime.setUninstallURL("https://www.facebook.com/100006849889044");
});
// Functions
let create = {
	noti: (msg) => chrome.notifications.create({type: "basic", iconUrl: "favicon.png", title: "Thêm Phím Tắt-er", message: msg}),
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
	let func = {
		dlImg: () => create.dl(a.dlImg),
		createNoti: () => create.noti(a.createNoti),
		newTab: () => create.newTab(a.newTab)
	};
	func[Object.keys(a)[0]]();
});
// Listen on command
chrome.commands.onCommand.addListener((a) => {
	let commands = {
		clickCBtnFB: () => {
			chrome.tabs.executeScript({code: `
				var button = document.querySelector("button.layerConfirm.uiOverlayButton[type='submit']");
				if (!button) {
					button = document.querySelector("a.layerCancel[action='cancel']");
					let array_label = document.querySelectorAll("label.uiInputLabelLabel"),
						last_label = array_label[array_label.length - 1];
					last_label.click();
				}
				button.click();
			`});
		},
		dl: () => {
			chrome.tabs.query({active: true}, ([{url: tab}]) => {
				let url = new URL(tab);
				new Promise((resolve) => {
					if (/[^\/]+(jpeg|jpg|png)($|#|\?)/g.test(tab)) resolve(tab);
					if (url.hostname.includes("flickr.com") && /photos\/.*?\/\d+/g.test(url.pathname)) Flickr.getSize(url.pathname.match(/(?<=photos\/\w+\/)\d+/g).pop()).then((a) => resolve(a.source));
				}).then((result) => create.dl(result));
			});
		},
		dlShelf: () => {
			chrome.storage.local.get("dlShelf", ({dlShelf: a}) => {
				console.log("Before", a);
				a = !a;
				console.log("After", a);
				chrome.downloads.setShelfEnabled(a);
				chrome.storage.local.set({dlShelf: a});
				create.noti(`Đã ${(a) ? "Bật" : "Tắt"} Thanh Download.`);
			});
		},
		flickrPhotoNewTab: () => {
			console.log("New Tab");
			chrome.tabs.query({active: true}, ([{url: tab}]) => {
				let url = new URL(tab);
				if (url.hostname.includes("flickr.com") && /photos\/.*?\/\d+/g.test(url.pathname)) Flickr.getSize(url.pathname.match(/(?<=photos\/\w+\/)\d+/g).pop()).then((a) => create.newTab(a.source));
			});
		},
	};
	commands[a]();
});
