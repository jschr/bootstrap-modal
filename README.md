Bootstrap Modal
=============

See live demo [here](http://jschr.github.com/bootstrap-modal/).

Extends Bootstrap's native modals to provide additional functionality. Introduces a **ModalManager** class that operates behind the scenes to handle multiple modals by listening on their events. 

A single ModalManager is created by default that can be accessed through the `GlobalModalManager` variable. 

Can be used as a replacement for Bootstrap's Modal class or as a patch to the library.

Overview
-----------

+ Backwards compatible
+ Responsive
+ Stackable
+ Full width
+ Load content via AJAX
+ Disable background scrolling

Options
-----------

In addition to the standard bootstrap options, you now have access to the following options

**Modal**

+ **width**
Set the inital width of the modal.

+ **height**
Set the inital height of the modal.

+ **loading**
Toggle the loading state.

+ **spinner**
Provide a custom image or animation for the loading spinner

+ **manager**
Set the modal's manager. By default this is set to the GlobalModalManager and will most likely not need to be overridden.

**ModalManager**
+ **spinner**
Provide a custom image or animation for the loading spinner

Disable Background Scrolling
-----------

If you want to prevent the background page from scrolling (see [demo](http://jschr.github.com/bootstrap-modal/) for example) there is one extra step required. You must wrap the page contents in a `<div class="page-container">` and provide a `<div class="modal-container">`. For example:

	<body>
		<div class="page-container">
			<div class="navbar navbar-fixed-top">...</div>
			<div class="container">...</div>
		</div>
		<div class="modal-container">
			<!-- You can put your modal definitions here but it is not required -->
		</div>
	</body>

The reason for doing this instead of just simply setting `overflow: hidden` when a modal is open is because I wanted to avoid having the page shift as a result of the scrollbar appearing/disappearing. I also require that the document be scrollable when there is a tall modal but only wanted it to scroll to fit the height of the modal, not the entire page.

Known Issues
-----------

On mobile safari, the background page will still scroll if the modal is smaller then the window size. We get desired behaviour if the modal is larger then the window however. I have not been able to figure out a fix for this yet.


	



