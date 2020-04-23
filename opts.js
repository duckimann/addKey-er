chrome.storage.local.get("fbPopup", ({fbPopup: fbPopup}) => {
	Array.from(document.querySelectorAll("#formDelete > input")).forEach((item, index) => {
		item.checked = !!fbPopup[index];
	});
	
	document.body.onchange = (a) => {
		chrome.storage.local.set({
			fbPopup: Array.from(document.querySelectorAll("#formDelete > input"), (a) => +a.checked)
		});
	};
});