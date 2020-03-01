/* Menu */
let V = {
	menu: {
		registerAll: function() {
			let menuts = document.getElementsByClassName('menu-trigger');
			for (var i = 0; i < menuts.length; i++) {
				if (menuts[i].classList.contains("menu-hover")) {
					menuts[i].addEventListener("mouseenter",
						function(e) {
							t = document.querySelector(e.target.getAttribute("target"));
							if (t) {
								t.setAttribute("open", "");
								/* calculate if the menu can't fit in the space below */
								V.menu.toporbottom(t, e.target);
								V.menu.leftorright(t, e.target);
							}
						}
					);
					menuts[i].addEventListener("mouseleave",
						function(e) {
							t = document.querySelector(e.target.getAttribute("target"));
							if (t) {
								t.removeAttribute("open");
							}
						}
					)
				} else {
					menuts[i].addEventListener("click",
						function(e) {
							t = document.querySelector(e.target.getAttribute("target"));
							if (t) {
								t.toggleAttribute("open");
								/* calculate if the menu can't fit in the space below */
								V.menu.toporbottom(t, e.target);
								V.menu.leftorright(t, e.target);
							}
						}
					)
				}
			}
		},
		toporbottom(t, e) {
			if (document.body.offsetHeight - (e.offsetTop + e.offsetHeight) < t.offsetHeight) {
				t.style.top = (e.offsetTop - t.offsetHeight) + "px";
			} else {
				t.style.top = (e.offsetTop + e.offsetHeight) + "px"
			};
		},
		leftorright(t, e) {
			if ((document.body.offsetWidth - (e.offsetLeft + e.offsetWidth)) > t.offsetWidth) {
				t.style.left = (e.offsetLeft) + "px";
			} else {
				t.style.left = ((e.offsetLeft + e.offsetWidth) - t.offsetWidth) + "px"
			};
		}
	},
	dialog: {
		registerAll: function() {
			dialogt = document.getElementsByClassName("dialog-trigger");
			for (var i = 0; i < dialogt.length; i++) {
				dialogt[i].addEventListener("click",
					function(e) {
						t = document.querySelector(e.target.getAttribute("target"));
						if (t) {
							t.hide = t.hide || function() {
								t.removeAttribute("open");
							}
							t.showModal = t.showModal || function() {
								t.setAttribute("open", "open");
							}
							if (t.hasAttribute("open")) {
								t.hide();
							} else {
								t.showModal();
							}
						}
					}
				)
			}
		}
	},
	init: function() {
		V.menu.registerAll();
		V.dialog.registerAll();
		V.notifs.registerAll();
		V.loader.registerAll();
	},
	notifs: {
		new: function(value = "Working", type = "default", wait = 5000) {
			notif = document.createElement("div");
			notif.classList.add("notif-float");
			notif.classList.add("notif");
			notif.classList.add("notif-" + type);
			if (!value.startsWith("<")) {
				value = "<span>" + value + "</span>"
			}
			notif.innerHTML = value;
			document.body.appendChild(notif);
			V.notifs.register(notif, wait);
			setTimeout(function() {
				V.notifs.close(notif);
			}, wait);
			return notif;
		},
		close: function(notif, wait = 0) {
			if (typeof notif == "undefined") {
				return 1
			}
			setTimeout(function() {
				notif.setAttribute("closed", "");
			}, wait + 300);
			setTimeout(function() {
				notif.hidden = true;
			}, wait);
		},
		registerAll: function() {
			notifs = document.getElementsByClassName("notif");
			for (var i = 0; i < notifs.length; i++) {
				V.notifs.register(notifs[i]);
			}
		},
		register: function(notif, wait = Infinity) {
			if (typeof notif == "undefined") {
				return 1
			}
			notif.onclick = function() {
				V.notifs.close(notif);
			}
		}
	},
	loader: {
		registerAll: function() {
			links = document.querySelectorAll("a[href].internal-link");
			for (var i = links.length - 1; i >= 0; i--) {
				V.loader.register(links[i]);
			}
		},
		local: function() {
			return typeof localStorage == "object";
		},
		localExist: function() {
			if (!localStorage.getItem("vloader") == "test") {
				localStorage.setItem("vloader", "test")
			}
		},
		parseURL: function(url) {
			a = document.createElement("a");
			a.href = url;
			return a.href;
		},
		setLocal: function(url, data, method) {
			if (!typeof data == "object") {
				new Error("V loader only store request objects");
			}
			url = V.loader.parseURL(url);
			d = { response: data.response, url: url, status: data.status, method: method, statusText: data.status, time: Date.now };
			localStorage["vload_" + url] = JSON.stringify(d);
		},
		getLocal: function(url) {
			url = V.loader.parseURL(url);
			V.loader.localExist();
			if (localStorage["vload_" + url]) {
				return JSON.parse(localStorage["vload_" + url]);
			} else {
				return false;
			}
		},
		parse: function(html) {
			ht = document.createElement("html");
			ht.innerHTML = html;
			loads = ht.querySelectorAll("link[rel=\"stylesheet\"],script[src]");
			scripts = [];
			links = [];
			for (var i = 0; i < loads.length; i++) {
				if (loads[i].tagName.toLowerCase() == "script") {
					content = V.loader.load(loads[i].getAttribute("src"));
					s = document.createElement("script");
					s.innerHTML = content.response;
					ht.appendChild(s);
					loads[i].remove();
				}
				if (loads[i].tagName.toLowerCase() == "link") {
					content = V.loader.load(loads[i].getAttribute("href"));
					s = "<style>" + content.response + "</style>";
					links.push(loads[i]);
					loads[i].outerHTML = s;
				}
			}
			document.documentElement.innerHTML = ht.innerHTML;
			lp = document.getElementById("load");
			if (lp) {
				window.scroll(0, 0);
				lp.innerHTML = "";
			}
			scripts = [];
		},
		exec_scripts: function() {
			scripts = [];
			scrtags = document.getElementsByTagName("script"); 
			for (var i = scrtags.length - 1; i >= 0; i--) {
				eval(scrtags[i].innerHTML);
			}
			var e = new Event('load', {
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(e);
			window.dispatchEvent(e);
		},
		load: function(url, method = "GET") {
			function xmlfetch(url, method) {
				try {
					x = new XMLHttpRequest;
					x.open(method.toUpperCase(), url, false);
					x.send();
				} catch {
					new Error("AJAX Not Supported")
				}
				return x;
			}
			if (V.loader.local()) {
				if (V.loader.getLocal(url)) {
					v = V.loader.getLocal(url)
					return v;
				} else {
					res = xmlfetch(url, method);
					V.loader.setLocal(url, res, method);
					return V.loader.getLocal(url);
				}
			}
		},
		fetchEvent: function(url, method = "GET", popping = false) {
			lp = document.getElementById("load");
			if (lp) {
				window.scroll(0, 0);
				lp.innerHTML = "LOADING";
			}
			r = V.loader.load(url, method || "GET");
			V.loader.parse(r.response);
			if (r.status == 404) {
				lp = document.getElementById("load");
				if (lp) {
					window.scroll(0, 0);
					lp.innerHTML = "ERROR";
				}
				window.location = r.url;
			}
			if (typeof history.pushState != "undefined") { }
			if (!popping) {
				history.pushState({ url: r.url, method: r.method }, "vixalien", url);
			}
			onpopstate = function(e) {
				V.loader.fetchEvent(e.state.url, e.state.method, true);
			}
			V.loader.exec_scripts();
		},
		register: function(link) {
			if (typeof link == "undefined") {
				return 0;
			}
			link.addEventListener("click", function(e) {
				e.preventDefault();
				t = e.target;
				V.loader.fetchEvent(t.getAttribute("href"));
			})
		}
	}
}

famous = {
	list: [
		{ names: "Zuckerberg", hint: "The holy book of faces." },
		{ names: "Gates", hint: "In your face, Steve Jobs." },
		{ names: "Torvalds", hint: "Linux, I love the kernel." },
		{ names: "Jobs", hint: "We started in a garage but now everything starts with `i`." },
		{ names: "Bezos", hint: "Amazon made me rich." },
		{ names: "Musk", hint: "Tweeter, Paypal, SolarCity and Tesla." },
		{ names: "Packard", hint: "Hewlett, let's buy a PC." },
		{ names: "Berners", hint: "You surf it, you enjoy it, I made it" },
		{ names: "Babbage", hint: "Me also, I didn't think the analytical engine would be PC." },
		{ names: "Page", hint: "Googol, Oh my search !" },
		{ names: "Eich", hint: "I made Mozilla, Javascript but I now prefer Brave." },
		{ names: "Yukihiro", hint: "Ruby, you know?" },
		{ names: "Nadella", hint: "Side to side with Windows 10." },
		{ names: "Pichai", hint: "India, we can too search." },
		{ names: "Stallman", hint: "Free Software Forever." },
		{ names: "Buterin", hint: "Ethereum: Oh bitcoin, lovely bitcoin." },
		{ names: "Ma", hint: "Alibaba, you know?" },
		{ names: "Graham", hint: "Y Combinator pays for you and hacker news keep you update." },
		{ names: "Chambers", hint: "Cisco; The largest networking equipment provider in the world." },
		{ names: "O'Reilly", hint: "In my room, you can't miss any software book." },
		{ names: "Dell", hint: "The Predator computer, it was my idea." },
		{ names: "Ellison", hint: "Oracle, oracle, tell me the future!" },
		{ names: "Sandberg", hint: "I'm COO, but Zuckerberg won't let me fame." },
		{ names: "Luckey", hint: "It all started in the garage, then kickstarter, then Oculus." },
		{ names: "Butterfield", hint: "Slack here, slack there." },
		{ names: "Lovelace", hint: "I loved (invented) programming." },
	],
	trials: 0,
	current_word: 0,
	current_id: 0,
	score: 0,
	calckey: function(word = famous.current_word.names, word_hints = famous.current_word.hints) {
		var m = Math.round(Math.random() * word.length);
		if (word_hints.includes(m) || m == word.length) {
			for (var i = m; i < ((word.length + m) * 2); i++) {
				if (!word_hints.includes(i % word.length)) {
					m = i % word.length;
					break;
				}
			}
		};
		return m % word.length;
	},
	hint_loan: false,
	hint: function() {
		if (famous.check(famous.cards) == false) {
			if (famous.hint_loan == false) {
				if (famous.score < 300) {
					famous.hint_loan = true;
				} else {
					famous.updatescore(famous.score - 300);
				}
			}
			famous.trials += 1;
			h = famous.calckey();
			e = document.getElementById("card" + h);
			famous.current_word.hints.push(h);
			if (e) {
				e.classList.remove("card-blank");
				e.classList.add("card-fill");
				e.value = famous.current_word.names[h];
				famous.updatescore(famous.score - 100);
				famous.check(famous.cards, e.id);
			}
		}
	},
	get_word: function(id) {
		id = id % famous.list.length;
		let word = famous.list[id];
		word_hints = [];
		if (word.names.length < 5) {
			word_hints.push(Math.round(Math.random() * word.names.length));
		} else {
			word_hints.push(Math.round(Math.random() * word.names.length));
			word_hints.push(famous.calckey(word.names, word_hints));
		}
		return { names: word.names, hint: word.hint, hints: word_hints, id: id }
	},
	check: function(n, id) {
		children = n.getElementsByClassName("card-i");
		count = children.length;
		fillcount = 0;
		for (var i = 0; i < children.length; i++) {
			if (children[i].value.length == 1) {
				fillcount += 1;
			}
		}
		done = 0;
		if (count == fillcount) {
			for (var i = 0; i < children.length; i++) {
				if (children[i].value.toUpperCase() == famous.current_word.names[i].toUpperCase()) {
					done += 1;
				}
			}
		}
		if (done == famous.current_word.names.length) {
			l = famous.current_word.hints[0] == famous.current_word.hints[1] ? 1 : 2;
			famous.trials += l;
			famous.fails = famous.trials - famous.current_word.names.length;
			score = (famous.score + 1000) - (famous.fails * 100);
			if (famous.hint_loan != true) {
				famous.updatescore(score);
			} else {
				famous.hint_loan = false;
			}
			famous.trials = 0;
			setTimeout(
				function() {
					famous.focusnext(id);
					famous.next(1);
				}
				, 500);
			return true;
		} else {
			return false;
		}
	},
	scoreholder: "",
	updatescore: function(newscore) {
		if (newscore < 0) { newscore = 0 }
		diff = (newscore - famous.score) / 30;
		looped = 0;
		var i = setInterval(
			function() {
				if (looped == 30) {
					clearInterval(i);
					famous.score = parseInt(famous.scoreholder.innerHTML);
					if (typeof localStorage == "object") {
						localStorage.setItem("famous_score", parseInt(famous.scoreholder.innerHTML));
					}
				} else {
					famous.scoreholder.innerHTML = (parseInt(famous.scoreholder.innerHTML) + Math.round(diff));
					looped += 1;
				}
			}, 10
		);
	},
	focusnext: function(id) {
		if (typeof id == "undefined") {
			return 1
		}
		num = parseInt(id.split("card")[1]);
		for (var i = (num); i < (famous.cards.children.length); i++) {
			if (famous.cards.children[i].value.length == 0) {
				famous.cards.children[i].focus();
				break;
			}
		}
	},
	focusprev: function(id) {
		if (typeof id == "undefined") {
			return 1
		}
		num = parseInt(id.split("card")[1]);
		for (var i = num; i >= 0; i--) {
			if (famous.cards.children[i].value.length == 0) {
				famous.cards.children[i].focus();
				break;
			}
		}
	},
	registerAll: function() {
		cards = document.getElementsByClassName("card-i");
		for (var i = 0; i < cards.length; i++) {
			cards[i].onkeydown = function(e) {
				if (e.key.length == 1) {
					e.preventDefault();
					famous.trials += 1;
					e.target.classList.remove("card-blank");
					e.target.classList.add("card-fill");
					e.target.value = e.key;
					famous.current_word.hints.push(parseInt(e.target.id.split("card")[1]));
					famous.focusnext(e.target.id);
					famous.check(e.target.parentElement, e.target.id);
				}
				if (e.key.toUpperCase() == "BACKSPACE") {
					e.preventDefault();
					famous.trials += 1;
					e.target.classList.remove("card-fill");
					e.target.classList.add("card-blank");
					e.target.value = "";
					famous.focusnext(e.target.id);
					famous.check(e.target.parentElement, e.target.id);
				}
				if (e.key.toUpperCase() == "ARROWRIGHT") {
					e.preventDefault();
					id = e.target.id;
					famous.focusnext(id.replace(id.split("card")[1], parseInt(id.split("card")[1]) + 1));
					famous.check(e.target.parentElement, e.target.id);
				}
				if (e.key.toUpperCase() == "ARROWLEFT") {
					e.preventDefault();
					id = e.target.id;
					famous.focusprev(id.replace(id.split("card")[1], parseInt(id.split("card")[1]) - 1));
					famous.check(e.target.parentElement, e.target.id);
				}
			}
		}
	},
	next: function(win, id, firsttime = false) {
		if (!win == 1) {
			famous.updatescore(famous.score -= 200);
		}
		id = id || famous.current_id + 1;
		let word = famous.get_word(id);
		famous.current_word = word;
		famous.current_id = word.id

		cards = famous.cards;
		description = famous.description;
		cards.innerHTML = "";
		description.innerHTML = word.hint;
		for (var i = 0; i < word.names.length; i++) {
			if (word.hints.includes(i)) {
				cards.innerHTML = cards.innerHTML + '<input class="card-i card-fill" value="' + word.names[i] + '" id="card' + i + '">';
			} else {
				cards.innerHTML = cards.innerHTML + '<input class="card-i card-blank" id="card' + i + '">'
			}
		}
		famous.registerAll();
		if(!firsttime) {
			famous.focusnext("card0");
		}
	},
	description: 0,
	cards: 0,
	init: function(description, cards, scoreholder) {
		famous.scoreholder = scoreholder;
		famous.description = description;
		famous.cards = cards;
		let start = Math.round(Math.random() * famous.list.length);
		if (typeof localStorage == "object") {
			famous.updatescore(localStorage.getItem("famous_score") | 0);
		}
		famous.next(1, start, true)
	},
	initHandles: function(next, hint) {
		if (document.querySelector(next) && document.querySelector(next)) {
			document.querySelector(next).addEventListener("click", function(e) { e.preventDefault(); famous.next() });
			document.querySelector(hint).addEventListener("click", function(e) { e.preventDefault(); famous.hint() });
		}
	}
}
document.addEventListener("load", V.init());

if (document.getElementById("description") == true) {
	document.addEventListener("load", famous.init(document.getElementById("description"), document.querySelector("#cards"), document.getElementById("score")));
	document.addEventListener("load", famous.initHandles("#next", "#hint"));
}