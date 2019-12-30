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
				t.style.left = ((e.offsetLeft + e.offsetWidth) - t.offsetWidth)  + "px"
			};
		}
	},
	dialog: {
		registerAll: function () {
			dialogt = document.getElementsByClassName("dialog-trigger");
			for (var i = 0; i < dialogt.length; i++) {
				dialogt[i].addEventListener("click", 
					function (e) {
						t = document.querySelector(e.target.getAttribute("target"));
						if (t) {
							t.hide =  t.hide || function() {
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
				value = "<span>"+ value + "</span>"
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
		register: function(link) {
			if (typeof link == "undefined") {
				return 0;
			}
			link.addEventListener("click", function(e) {
				e.preventDefault();
				t = e.target
				try {
					x = new XMLHttpRequest;
					x.open(t.getAttribute("method") || "GET", t.getAttribute("href"));
					lp = document.getElementById("load");
					if (lp) {
						window.scroll(0, 0);
						lp.innerHTML = "LOADING";
					}
					x.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
							document.children[0].innerHTML = x.response;
							try {
								state = document.getElementsByTagName("title")[0].textContent;
							} catch {
								state = t.getAttribute("href");
							}
							history.pushState(state, state, t.getAttribute("href"));
						}
						else {
							lp.innerHTML = "An error occurred while loading: " + x.status + " " + x.statusText;
						}
					}
					x.onerror = function() {
						lp.innerHTML = "An error occured while loading. Check your connection.";
					}
					x.send();
				} catch {
					window.location = t.getAttribute("href");
				}
			})
		}
	}
}

famous = {
	list: [
		{ names: "Zuckerberg", hint: "I made the famous site when I was 19"},
		{ names: "Gates", hint: "Look at the successful windows."},
		{ names: "Linus", hint: "I run on most of your mobiles."},
		{ names: "Jobs", hint: "I died, but I really liked the fruit."},
		{ names: "Bezos", hint: "Oh, I love shopping."},
		{ names: "Musk", hint: "Tweet, tweet and tweet."},
		{ names: "Packard", hint: "Hewlett, let's buy a PC."},
		{ names: "Berners", hint: "You can see everywhere? Thanks to who?"},
		{ names: "Babbage", hint: "Wep. What you are using, it was my idea." },
		{ names: "Page", hint: "You can find everything, thanks to who?" },
		{ names: "Eich", hint: "Static, static, get away!" },
		{ names: "Yukihiro", hint: "Ruby, you know?" },
		{ names: "Eich", hint: "You can do everything? Thanks to who?" },
	],
	trials: 0,
	current_word: 0,
	current_id: 0,
	score: 0,
	get_word: function(id) {
		id = id % 13;
		let word = famous.list[id];
		word_hints = [];
		if (word.length < 5) {
			word_hints.push(Math.round(Math.random() * 13));
		} else {
			word_hints.push(Math.round(Math.random() * word.names.length));
			word_hints.push(Math.round(Math.random() * word.names.length));
		}
		return { names: word.names, hint: word.hint, hints: word_hints, id: id }
	},
	check: function(n) {
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
			famous.trials += l
			V.notifs.new("You won", "success", 1000); /* This require vix */
			fails = famous.trials - famous.current_word.names.length;
			score = (famous.score + 1000) - (fails * 100);
			if (score < 0) {
				score = 0;
			}
			famous.score = score
			famous.trials = 0;
			document.getElementById("score").textContent = score;
			famous.next();
		}
	},
	focusnext: function(id) {
		function playgame(id) {
			if (typeof id == "undefined") {
				return 1
			}
			num = parseInt(id.split("card")[1]) + 1;
			newid = "card" + num;
			e = document.getElementById(newid);
			if (!typeof e == "undefined") {
				if (e.value.length == 1) {
					playgame(newid);
				} else {
					e.focus()
				}
			}
		}
		playgame(id);
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
					famous.focusnext(e.target.id);
					famous.check(e.target.parentElement);
				}
			}
		}
	},
	next: function(id) {
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
	},
	description: 0,
	cards: 0,
	init: function(description, cards) {
		famous.description = description;
		famous.cards = cards;
		let start = Math.round(Math.random() * 13);
		famous.next(start);
	}
}
document.addEventListener("load", V.init());
document.addEventListener("load", famous.init(document.querySelector("#description"), document.querySelector("#cards")));
document.getElementById("next").addEventListener("click", function(e) { e.preventDefault(); famous.next()});