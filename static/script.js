const form = document.getElementById("shortenForm");
const link = document.getElementById("link");

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	link.innerHTML = "";
	const url = form.url.value;
	const uid = form.uid.value;
	const req = await fetch("/api/v1/create", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			url,
			uid,
		}),
	});
	const res = await req.json();
	if (res.status === 200) {
		form.url.value = "";
		form.uid.value = "";
		link.innerHTML = `<a href="${res.url}" target="_blank">${res.url}</a>`;
	} else {
		link.innerHTML = res.message;
	}
});

async function getStats() {
	const req = await fetch("/api/v1/stats");
	const res = await req.json();
	const stats = document.getElementById("stats");
	stats.innerHTML = `Shortened URLs: ${res.shortenedUrls} | Total view count: ${res.totalViews}`;
}

getStats();
