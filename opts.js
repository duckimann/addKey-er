chrome.storage.local.get("fbPopup", ({fbPopup: fbPopup}) => {
	Array.from(document.querySelectorAll("#formDelete > input")).forEach((item, index) => {
		item.checked = !!fbPopup.del[index];
	});
	
	document.querySelectorAll("#formMute > input")[fbPopup.mute].click();

	document.body.onchange = (a) => {
		chrome.storage.local.set({
			fbPopup: {
				del: Array.from(document.querySelectorAll("#formDelete > input"), (a) => +a.checked),
				mute: Array.from(document.querySelectorAll("input[type='radio']"), (a, index) => ({index, checked: a.checked})).filter((a) => a.checked)[0].index
			}
		});
	};
});