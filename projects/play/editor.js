myTextArea = document.getElementById('textarea');
var myCodeMirror = CodeMirror.fromTextArea(myTextArea, {
  lineNumbers: true,
  mode: "htmlmixed",
  theme: "nord",
  autoCloseTags: true,
  autoCloseBrackets: true,
  scrollBarStyle: "simple",
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  indentWithTabs: false,
  tabSize: 2
});
myStylesArea = document.getElementById('stylesarea');
var myStylesMirror = CodeMirror.fromTextArea(myStylesArea, {
  lineNumbers: true,
  mode: "css",
  theme: "nord",
  autoCloseTags: true,
  autoCloseBrackets: true,
  scrollBarStyle: "simple",
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  indentWithTabs: false,
  tabSize: 2
});
myPreview = document.getElementById('preview');
myCodeblock = document.getElementsByClassName('CodeMirror')[0];
myPreview.innerHTML = myCodeMirror.getValue();
myNewStyles = document.getElementById("newstyles");

function previewKeyUp (e) {
	myCodeMirror.setValue(myPreview.innerHTML);
}
function parseLibraries(libs) {
	libsplace = document.getElementsByClassName("libraries")[0];
	for (var i = libs.length - 1; i >= 0; i--) {
		console.log(libs[i]);
		resp = V.loader.load(libs[i].href);
		url = new URL(V.loader.parseURL(libs[i].href));
		name = url.pathname.split("/")[url.pathname.split("/").length - 1];
		lib = document.createElement("div");
		lib.classList.add("library");
		lib.id = url;
		lib_name = document.createElement("div");
		lib_name.classList.add("library-name");
		lib_name.textContent = name;
		lib_url = document.createElement("div");
		lib_url.classList.add("library-url");
		lib_url.textContent = url;
		lib_content = document.createElement("div");
		lib_content.classList.add("library-content");
		lib_style = document.createElement("style");
		lib_style.innerHTML = resp.response;
		lib_content.appendChild(lib_style);
		lib.appendChild(lib_name);
		lib.appendChild(lib_url);
		lib.appendChild(lib_content);
		window.libs.push(lib_url);
		if (!window.libs.includes(url)) {
			libsplace.appendChild(lib);
			myCodeMirror.setValue(myPreview.innerHTML);
		}
		libs[i].remove();
	}
}
function codeKeyUp(e) {
	div = document.createElement("div");
	div.innerHTML = myCodeMirror.getValue();
	styles = div.getElementsByTagName('style');
	onestyle = myStylesMirror.getValue();
	links = div.querySelectorAll('link[rel="stylesheet"][href]');
	if (links.length > 0) {
		parseLibraries(links);
	} 
	
	for (var i = styles.length - 1; i >= 0; i--) {
		onestyle += styles[i].innerHTML;
		styles[i].remove();
	}
	if (myNewStyles.innerHTML != onestyle) {
		myNewStyles.innerHTML = onestyle;
		myStylesArea.innerHTML = onestyle;
	}
	myPreview.innerHTML = div.innerHTML;
	a = document.createElement("div");
	a.innerHTML = myCodeMirror.getValue();
	if (a.textContent != myPreview.textContent) {
		myCodeMirror.setValue(myPreview.innerHTML);
		myStylesMirror.setValue(onestyle);
	}
}
codeblocks = document.getElementsByClassName("CodeMirror");
for (var i = codeblocks.length - 1; i >= 0; i--) {
	codeblocks[i].addEventListener("keyup", function(e) {
	codeKeyUp(e)
})
}
myPreview.addEventListener("keyup", function(e) {
	previewKeyUp()
})
document.addEventListener("DOMContentLoaded", function(e) {
	window.libs = [];
	codeKeyUp()
})