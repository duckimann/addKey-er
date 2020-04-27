// Run once after extension installation
chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({
		fbPopup: [0, 0, 0, 0]
	});
	chrome.runtime.setUninstallURL("https://www.facebook.com/100006849889044");
});
// Functions
let create = {
	noti: (msg) => chrome.notifications.create({type: "basic", iconUrl: "favicon.png", title: "Thêm Phím Tắt-er", message: msg}),
	dl: (dlUrl) => chrome.downloads.download({url: dlUrl}),
	newTab: (url) => chrome.tabs.create({url: url, selected: true})
}, Flickr = {
	getSize: (photoId) => fetch(`https://www.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=621b3655c517a25e35ec61f6b9e4fbf3&photo_id=${photoId}&format=json&nojsoncallback=1`).then((a) => a.json()).then((a) => a.sizes.size.pop())
};
// Listen on command
chrome.commands.onCommand.addListener((a) => {
	let commands = {
		clickCBtnFB: () => {
			chrome.storage.local.get("fbPopup", ({fbPopup: fbPopup}) => {
				let inject = `
					var fbPopupSetting = ${JSON.stringify(fbPopup)},
						isMute = document.querySelector("#group_mute_member_dialog_title"),
						listenKey = ({code, key}) => {
							if (code.includes("Digit")) {
								isMute.parentElement.querySelectorAll("li")[key - 1].querySelector("input").click();
								document.removeEventListener("keydown", listenKey);
								document.getElementById("customF").remove();
								document.querySelector(".selected[class*='layer']").click();
								for (let btn of document.querySelectorAll(".selected[class*='layer']")) btn.click();
							}
						};
					if (isMute) {
						let customF = document.createElement("div");
						customF.id = "customF";
						customF.innerHTML = "Press any number in range 0-9";
						customF.style = "position: fixed;top: 0;color: #FFF;z-index: 999999999;width: 100%;text-align: center;font-size: 5vh;padding-top: 20%;height: 100vh;background: rgba(0, 0, 0, 0.6);"
						document.body.appendChild(customF);
						document.addEventListener("keypress", listenKey);
					} else {
						Array.from(document.querySelectorAll(".uiInputLabel > input[type='checkbox']")).forEach((item, index) => {item.checked = !!fbPopupSetting[index];});
						document.querySelector(".selected[class*='layer']").click();
					}
				`;
				chrome.tabs.executeScript({code: inject});
			});
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
// Listening on new download item
chrome.downloads.onCreated.addListener((dlItem) => {
	setTimeout(() => {
		chrome.downloads.setShelfEnabled(false);
		chrome.downloads.setShelfEnabled(true);
	}, 2000);
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
