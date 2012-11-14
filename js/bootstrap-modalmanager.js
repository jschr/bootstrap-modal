 /* ===========================================================
 * bootstrap-modalmanager.js v2.0
 * ===========================================================
 * Copyright 2012 Jordan Schroter.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

	"use strict"; // jshint ;_;

	/* MODAL MANAGER CLASS DEFINITION
	* ====================== */

	var ModalManager = function (element, options) {
		this.init(element, options);
	}

	ModalManager.prototype = {

		constructor: ModalManager,

		init: function (element, options) {
			this.$element = $(element);
			this.options = $.extend({}, $.fn.modalmanager.defaults, this.$element.data(), typeof options == 'object' && options);
			this.stack = [];
			this.backdropCount = 0;
		},

		createModal: function (element, options) {
			$(element).modal($.extend({ manager: this }, options));
		},

		appendModal: function (modal) {
			this.stack.push(modal);

			var that = this;

			modal.$element.on('show.modalmanager', targetIsSelf(function (e) {
				modal.isShown = true;

				var transition = $.support.transition && modal.$element.hasClass('fade');
				
				that.$element
					.toggleClass('modal-open', that.hasOpenModal())		
					.toggleClass('page-overflow', $(window).height() < that.$element.height());
			
				modal.$parent = modal.$element.parent();
				
				modal.$container = that.createContainer(modal);

				modal.$element.appendTo(modal.$container);

				var modalOverflow = $(window).height() < modal.$element.height() || modal.options.modalOverflow;
					
				that.backdrop(modal, function () {

					modal.$element.show();

					if (transition) {
						modal.$element[0].style.display = 'run-in'; 
						modal.$element[0].offsetWidth;
						modal.$element.one($.support.transition.end, function () { modal.$element[0].style.display = 'block' });
					}

					modal.$element
						.toggleClass('modal-overflow', modalOverflow)
						.css('margin-top', modalOverflow ? 0 : 0 - modal.$element.height()/2)
						.addClass('in')
						.attr('aria-hidden', false);
					
					var complete = function () {
						that.setFocus();
						modal.$element.triggerHandler('shown');
					}

					transition ?
						modal.$element.one($.support.transition.end, complete) :
						complete();
				});
			}));

			modal.$element.on('hidden.modalmanager', targetIsSelf(function (e) {

				that.backdrop(modal);

				if (modal.$backdrop){
					$.support.transition && modal.$element.hasClass('fade')?
						modal.$backdrop.one($.support.transition.end, function () { that.destroyModal(modal) }) :
						that.destroyModal(modal);
				} else {
					that.destroyModal(modal);
				}

			}));

			modal.$element.on('destroy.modalmanager', targetIsSelf(function (e) {
				that.removeModal(modal);
			}));
		},

		destroyModal: function (modal) {

			modal.destroy();

			var hasOpenModal = this.hasOpenModal();

			this.$element.toggleClass('modal-open', hasOpenModal);
			
			if (!hasOpenModal){
				this.$element.removeClass('page-overflow');
			}

			this.removeContainer(modal);

			this.setFocus();
		},

		hasOpenModal: function () {
			for (var i = 0; i < this.stack.length; i++){
				if (this.stack[i].isShown) return true;
			}

			return false;
		},

		setFocus: function () {
			var topModal;

			for (var i = 0; i < this.stack.length; i++){
				if (this.stack[i].isShown) topModal = this.stack[i];
			}

			if (!topModal) return;

			topModal.focus();

		},

		removeModal: function (modal) {
			modal.$element.off('.modalmanager');
			if (modal.$backdrop) this.removeBackdrop.call(modal);
			this.stack.splice(this.getIndexOfModal(modal), 1);
		},

		getModalAt: function (index) {
			return this.stack[index];
		},

		getIndexOfModal: function (modal) {
			for (var i = 0; i < this.stack.length; i++){
				if (modal === this.stack[i]) return i;
			}
		},

		removeBackdrop: function (modal) {
			modal.$backdrop.remove();
			modal.$backdrop = null;
		}, 

		createBackdrop: function (animate) {
			var $backdrop;

			if (!this.isLoading) {
				$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
					.appendTo(this.$element);

			} else {
				$backdrop = this.$loading;
				$backdrop.off('.modalmanager');
				this.$spinner.remove();
				this.isLoading = false;
				this.$loading = this.$spinner = null;
			}

			return $backdrop
		},

		removeContainer: function (modal) {
			modal.$container.remove();
			modal.$container = null;
		}, 

		createContainer: function (modal) {
			var $container;

			$container = $('<div class="modal-scrollable">')
				.css('z-index', getzIndex( 'modal', 
					modal ? this.getIndexOfModal(modal) : this.stack.length ))
				.appendTo(this.$element);

			if (modal && modal.options.backdrop != 'static') {
				$container.on('click.modal', targetIsSelf(function (e) {
					modal.hide();
				}));
			} else if (modal) {
				$container.on('click.modal', targetIsSelf(function (e) {
					modal.attention();
				}));
			}

			return $container;

		},

		backdrop: function (modal, callback) {
			var animate = modal.$element.hasClass('fade') ? 'fade' : '',
				showBackdrop = modal.options.backdrop && 
					this.backdropCount < this.options.backdropLimit;

			if (modal.isShown && showBackdrop) {
				var doAnimate = $.support.transition && animate && !this.isLoading;


				modal.$backdrop = this.createBackdrop(animate);

				modal.$backdrop.css('z-index', getzIndex( 'backdrop', this.getIndexOfModal(modal) ))

				if (doAnimate) modal.$backdrop[0].offsetWidth // force reflow

				modal.$backdrop.addClass('in')

				this.backdropCount += 1;

				doAnimate ?
					modal.$backdrop.one($.support.transition.end, callback) :
					callback();

			} else if (!modal.isShown && modal.$backdrop) {
				modal.$backdrop.removeClass('in');

				this.backdropCount -= 1;

				var that = this;

				$.support.transition && modal.$element.hasClass('fade')?
					modal.$backdrop.one($.support.transition.end, function () { that.removeBackdrop(modal) }) :
					that.removeBackdrop(modal);

			} else if (callback) {
				callback();
			}
		},

		removeLoading: function () {
			this.$loading && this.$loading.remove();
			this.$loading = null;
			this.isLoading = false;
		},

		loading: function (callback) {
			callback = callback || function () { };
			
			this.$element
				.toggleClass('modal-open', !this.isLoading || this.hasOpenModal())
				.toggleClass('page-overflow', $(window).height() < this.$element.height());
			
			if (!this.isLoading) {

				this.$loading = this.createBackdrop('fade');

				this.$loading[0].offsetWidth // force reflow	

				this.$loading
					.css('z-index', getzIndex('backdrop', this.stack.length))
					.addClass('in');

				var $spinner = $(this.options.spinner)
					.css('z-index', getzIndex('modal', this.stack.length))
					.appendTo(this.$element)
					.addClass('in');

				this.$spinner = $(this.createContainer())
					.append($spinner)
					.on('click.modalmanager', $.proxy(this.loading, this));

				this.isLoading = true;

				$.support.transition ?
				this.$loading.one($.support.transition.end, callback) :
				callback();

			} else if (this.isLoading && this.$loading) {
				this.$loading.removeClass('in');

				if (this.$spinner) this.$spinner.remove();

				var that = this;
				$.support.transition ?
					this.$loading.one($.support.transition.end, function () { that.removeLoading() }) :
					that.removeLoading();

			} else if (callback) {
				callback(this.isLoading);
			}
		}
	}

	/* PRIVATE METHODS
	* ======================= */

	// computes and caches the zindexes
	var getzIndex = (function () {
		var zIndexFactor, 
			baseIndex = {};

		return function (type, pos) {

			if (typeof zIndexFactor === 'undefined'){
				var $baseModal = $('<div class="modal hide" />').appendTo('body'),
					$baseBackdrop = $('<div class="modal-backdrop hide" />').appendTo('body');

				baseIndex['modal'] = +$baseModal.css('z-index'),
				baseIndex['backdrop'] = +$baseBackdrop.css('z-index'),
				zIndexFactor = baseIndex['modal'] - baseIndex['backdrop'];
				
				$baseModal.remove();
				$baseBackdrop.remove();
				$baseBackdrop = $baseModal = null;
			}

			return baseIndex[type] + (zIndexFactor * pos);

		}
	}())

	// make sure the event target is the modal itself in order to prevent 
	// other components such as tabsfrom triggering the modal manager. 
	// if Boostsrap namespaced events, this would not be needed.
	function targetIsSelf(callback){
		return function (e) {
			if (this === e.target){
				return callback.apply(this, arguments);
			} 
		}
	}


	/* MODAL MANAGER PLUGIN DEFINITION
	* ======================= */

	$.fn.modalmanager = function (option) {
		return this.each(function () {
			var $this = $(this), 
				data = $this.data('modalmanager');

			if (!data) $this.data('modalmanager', (data = new ModalManager(this, option)))
			if (typeof option === 'string') data[option]()
		})
	}

	$.fn.modalmanager.defaults = {
		backdropLimit: 999,
		spinner: '<div class="loading-spinner fade" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>'
	}

	$.fn.modalmanager.Constructor = ModalManager

}(jQuery);