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
};
// Run at startup
chrome.runtime.onStartup.addListener(() => {

	chrome.storage.local.get("dlShelf", ({dlShelf: a}) => {
		chrome.downloads.setShelfEnabled(a);
	});

});
// Listen on message send to extension
chrome.runtime.onMessage.addListener((a, b) => {
	console.log(a);
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
		case "dlHoverZoomImg":
			chrome.tabs.executeScript({code: `chrome.runtime.sendMessage(chrome.runtime.id, {dlImg: document.querySelector("#hzImg > img").src});`});
			break;
		case "clickCBtnFB":
			chrome.tabs.executeScript({code: `document.querySelector("button.layerConfirm.uiOverlayButton[type='submit']").click();`});
			break;
		case "turnOffFbPostNoti":
			console.log("Off Noti");
			chrome.tabs.executeScript({code: `((gid, pid, dtoken) => {let a = new FormData(); a.append("group_id", gid); a.append("message_id", pid); a.append("follow", 0); a.append("fb_dtsg", dtoken);fetch("https://www.facebook.com/ajax/litestand/follow_group_post", {method: "POST", body: a}).then((b) => chrome.runtime.sendMessage(chrome.runtime.id, {createNoti: \`\${(b.ok) ? "Đã " : ""}Tắt Thông Báo Post \${pid}\${(b.ok) ? "" : " Không Thành Công"}\`}));})(document.documentElement.outerHTML.match(/(?<=group_id=)\\d+/g)[0], document.querySelector("[name='ft_ent_identifier']").value, document.querySelector('[name="fb_dtsg"]').value);`});
			break;
		case "dlShelf":
			chrome.storage.local.get("dlShelf", ({dlShelf: a}) => {
				let val = !a;
				chrome.downloads.setShelfEnabled(val);
				chrome.storage.local.set({dlShelf: val});
				cr.cNoti(`Đã ${(val) ? "Bật" : "Tắt"} Thanh Download.`);
			});
			break;
		case "dl":
			chrome.tabs.query({active: true}, ([{url: tab}]) => {
				if (/(jpg|png|jpeg)$/g.test(tab)) cr.dl(tab);
			});
			break;
	}
});