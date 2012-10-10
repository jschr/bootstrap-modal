Bootstrap Modal
=============

See live demo [here](http://jschr.github.com/bootstrap-modal/)

Extends Bootstrap's native modals to provide additional functionality. Introduces a **ModalManager** class that operates behind the scenes to handle multiple modals by listening on their events. 

A single ModalManager is created by default that can be accessed through the `GlobalModalManager` variable. 

Can be used as a replacement for Bootstrap's Modal class or as a patch to the library.

Overview
-----------

+ Backwards compatible
+ Responsive
+ Stackable
+ Load content via AJAX

Options
-----------

In addition to the standard bootstrap options, you now have access to the following options

**Modal**

+ **width**
Set the inital width of the modal.

+ **loading**
Toggle the loading state.

+ **spinner**
Provide a custom image or animation for the loading spinner

+ **manager**
Set the modal's manager. By default this is set to the GlobalModalManager and will most likely not need to be overriden.


**ModalManager**
+ **spinner**
Provide a custom image or animation for the loading spinner