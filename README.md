**Note**: Since this plugin was created to solve a lot of the issues with BS2, it still uses the BS2 markup syntax. Currently I believe the default BS3 modal addresses some of the bigger issues and is not worth maintaining two versions of this plugin.


Bootstrap Modal v2.2.6
=============
[![Backers on Open Collective](https://opencollective.com/bootstrap-modal/backers/badge.svg)](#backers)
 [![Sponsors on Open Collective](https://opencollective.com/bootstrap-modal/sponsors/badge.svg)](#sponsors) 

See live demo [here](http://jschr.github.com/bootstrap-modal/).

Extends Bootstrap's native modals to provide additional functionality. Introduces a **ModalManager** class that operates behind the scenes to handle multiple modals by listening on their events. 

A single ModalManager is created by default on body and can be accessed through the jQuery plugin interface.
```javascript
    $('body').modalmanager('loading');
```
Bootstrap-Modal can be used as a replacement for Bootstrap's Modal class or as a patch to the library.


Bootstrap 3
-----------

If you're using BS3, I've provided a compatible css patch. Include `bootstrap-modal-bs3patch.css` **before** the main `bootstrap-modal.css` file to use this plugin with Bootstrap 3.

If you're using the loading spinner functionality you may also need to change the default template to be compatible in js:
```html
    $.fn.modal.defaults.spinner = $.fn.modalmanager.defaults.spinner = 
        '<div class="loading-spinner" style="width: 200px; margin-left: -100px;">' +
            '<div class="progress progress-striped active">' +
                '<div class="progress-bar" style="width: 100%;"></div>' +
            '</div>' +
        '</div>';
```


Overview
-----------

+ Backwards compatible
+ Responsive
+ Stackable
+ Full width
+ Load content via AJAX
+ Disable background scrolling

Installation 
-----------
+ Include `css/bootstrap-modal.css` after the main bootstrap css files.
+ Include `js/bootstrap-modalmanager.js` and `js/bootstrap-modal.js` after the main bootstrap js files.
```html
	<link href="css/bootstrap.css" rel="stylesheet" />
	<link href="css/bootstrap-responsive.css" rel="stylesheet" />
 	<link href="css/bootstrap-modal.css" rel="stylesheet" />

 	<script src="js/bootstrap.js"></script>
 	<script src="js/bootstrap-modalmanager.js"></script>
 	<script src="js/bootstrap-modal.js"></script>
```
Options
-----------

In addition to the standard bootstrap options, you now have access to the following options

**Modal**

+ **width**
Set the initial width of the modal.

+ **height**
Set the initial height of the modal.

+ **maxHeight**
Set the max-height of the modal-body.

+ **loading**
Toggle the loading state.

+ **spinner**
Provide a custom image or animation for the loading spinner.

+ **backdropTemplate**
Provide a custom modal backdrop.

+ **consumeTab**
Used to enable tabindexing for modals with `data-tabindex`. This is set to true by default.

+ **focusOn**
The element or selector to set the focus to once the modal is shown.

+ **replace**
If set to true, the modal will replace the topmost modal when opened.

+ **attentionAnimation**
Set the animation used by the `attention` method. Any animation in [animate.css](http://daneden.me/animate/) is supported but only the *shake* animation is included by default.

+ **modalOverflow**
Set this property to true for modals with highly dynamic content. This will force the modal to behave as if it is larger than the viewport.

+ **manager**
Set the modal's manager. By default this is set to the `GlobalModalManager` and will most likely not need to be overridden.

**ModalManager**

+ **loading**
Toggle the loading state.

+ **backdropLimit**
Limit the amount of backdrops that will appear on the page at the same time.

+ **spinner**
Provide a custom image or animation for the loading spinner.

+ **backdropTemplate**
Provide a custom modalmanager backdrop. This backdrop is used when `$element.modalmanager('loading')` is called.

Getting a reference to the modal manager
-----------

If you did not created your own ModalManager, perhaps you'll need a reference to it. That can be easily accomplished using the following snippet:

```javascript
	var modalManager = $("body").data("modalmanager");
	var openModals = modalManager.getOpenModals();
	modalManager.removeLoading();
```

After that, you'll be able to call any methods that modal manager has, such as:

* removeLoading (remove the loading and backdrop window);
* getOpenModals (to get the modals that are already open);
* etc;


Disable Background Scrolling
-----------

If you want to prevent the background page from scrolling (see [demo](http://jschr.github.com/bootstrap-modal/) for example) you must wrap the page contents in a `<div class="page-container">`. For example:
```html
	<body>
	   <div class="page-container">
		  <div class="navbar navbar-fixed-top">...</div>
		  <div class="container">...</div>
	   </div>
	</body>
```

The reason for doing this instead of just simply setting `overflow: hidden` when a modal is open is to avoid having the page shift as a result of the scrollbar appearing/disappearing. This also allows the document to be scrollable when there is a tall modal but only to the height of the modal, not the entire page.

Constrain Modal to Window Size
-----------
	
You can bind the height of the modal body to the window with something like this:
```javascript
    $.fn.modal.defaults.maxHeight = function(){
        // subtract the height of the modal header and footer
        return $(window).height() - 165; 
    }
```
	
**Note:** This will be overwritten by the responsiveness and is only set when the modal is displayed, not when the window is resized.
	
Tab Index for Modal Forms
-----------
You can use `data-tabindex` instead of the default `tabindex` to specify the tabindex within a modal.
```html
    <input type="text" data-tabindex="1" />
    <input type="text" data-tabindex="2" />
```
See the stackable example on the [demo](http://jschr.github.com/bootstrap-modal/) page for an example.


	





[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jschr/bootstrap-modal/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

## Contributors

This project exists thanks to all the people who contribute. 
<a href="https://github.com/jschr/bootstrap-modal/graphs/contributors"><img src="https://opencollective.com/bootstrap-modal/contributors.svg?width=890&button=false" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/bootstrap-modal#backer)]

<a href="https://opencollective.com/bootstrap-modal#backers" target="_blank"><img src="https://opencollective.com/bootstrap-modal/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/bootstrap-modal#sponsor)]

<a href="https://opencollective.com/bootstrap-modal/sponsor/0/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/1/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/2/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/3/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/4/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/5/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/6/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/7/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/8/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/bootstrap-modal/sponsor/9/website" target="_blank"><img src="https://opencollective.com/bootstrap-modal/sponsor/9/avatar.svg"></a>


