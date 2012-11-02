 /* ===========================================================
 * bootstrap-modalmanager.js 
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

!function($){

	"use strict"; // jshint ;_;

	var baseModalzIndex, baseModalAbszIndex, baseBackdropzIndex, baseBackdropAbszIndex,	zIndexFactor;

	$(function(){
		var $baseModal = $('<div class="modal hide" />').appendTo('body'),
			$baseBackdrop = $('<div class="modal-backdrop hide" />').appendTo('body'),
			$baseModalAbs = $('<div class="modal modal-absolute hide" />').appendTo('body'),
			$baseBackdropAbs = $('<div class="modal-backdrop modal-absolute hide" />').appendTo('body');

		baseModalzIndex = +$baseModal.css('z-index'),
		baseModalAbszIndex = +$baseModalAbs.css('z-index'),
		baseBackdropzIndex = +$baseBackdrop.css('z-index'),
		baseBackdropAbszIndex = +$baseBackdropAbs.css('z-index'),
		zIndexFactor = baseModalzIndex - baseBackdropzIndex;

		$baseModal.remove();
		$baseBackdrop.remove();
		$baseModalAbs.remove();
		$baseBackdropAbs.remove();
		$baseBackdrop = $baseModal = $baseModalAbs = $baseBackdrop = null;
	});

	/* MODAL MANAGER CLASS DEFINITION
	* ====================== */

	var ModalManager = function (element, options) {
		this.init(element, options);
	}

	window.ModalManager = ModalManager;

	ModalManager.prototype = {

		constructor: ModalManager,

		init: function(element, options){
			this.$element = $(element);
			this.options = $.extend({}, $.fn.modalmanager.defaults, this.$element.data(), typeof options == 'object' && options);
			this.stack = [];
			this.isBody = this.$element[0] === $('body')[0];
			
			this.$container = this.$element.find('.modal-container');
			this.$parent = this.$container.length ? this.$container : this.$element;
	
			this.$element.toggleClass('has-modal-container', !!this.$container.length);
		},

		createModal: function(element, options){
			$(element).modal($.extend({ manager: this }, options));
		},

		appendModal: function(modal){
			this.stack.push(modal);

			var that = this;

			modal.$element.on('show.modalmanager', targetIsModal(function(e){
				modal.isShown = true;

				that.$element
					.toggleClass('modal-open', that.hasOpenModal())		
					.toggleClass('page-overflow', $(window).height() < that.$element.height());
				

				var $scrollElement = (that.$container.length ? that.$container : 
					(that.isBody ? $(window) : that.$element));
				
				var modalOverflow = $(window).height() < modal.$element.height() || modal.options.modalOverflow;

				modal.$element
					.toggleClass('modal-overflow', modalOverflow)
					.css('margin-top', $scrollElement.scrollTop() - (modalOverflow ? 0 : modal.$element.height()/2))
					.css('z-index', (!that.isBody ? baseModalAbszIndex : baseModalzIndex) 
						+ (zIndexFactor * that.getIndexOfModal(modal)));
					
				that.backdrop(modal, function () {
					var transition = $.support.transition && modal.$element.hasClass('fade')

					
					modal.$parent =  modal.$element.parent();
					if (!modal.$parent.length || modal.$parent[0] !== that.$parent[0]) {
						modal.$element.detach().appendTo(that.$parent);
					}


					modal.$element.show();

					if (transition) {
						modal.$element[0].style.display = 'run-in'; 
						modal.$element[0].offsetWidth;
						modal.$element.one($.support.transition.end, function () { modal.$element[0].style.display = 'block' });
					}

					modal.$element
						.addClass('in')
						.attr('aria-hidden', false)
						.toggleClass('modal-absolute', !that.isBody);
					
					var complete = function(){
						that.setFocus();
						modal.$element.triggerHandler('shown');
					}

					transition ?
						modal.$element.one($.support.transition.end, complete) :
						complete();
				});
			}));

			modal.$element.on('hidden.modalmanager', targetIsModal(function(e){
				that.backdrop(modal);

				if (modal.$backdrop){
					$.support.transition && modal.$element.hasClass('fade')?
						modal.$backdrop.one($.support.transition.end, function(){ that.destroyModal(modal) }) :
						that.destroyModal(modal);
				} else {
					that.destroyModal(modal);
				}

			}));

			modal.$element.on('destroy.modalmanager', targetIsModal(function(e){
				that.removeModal(modal);
			}));
		},

		destroyModal: function(modal){
			modal.destroy();
			var hasOpenModal = this.hasOpenModal();
			this.$element.toggleClass('modal-open', hasOpenModal);
			if (!hasOpenModal){
				this.$element.removeClass('page-overflow');
			}
			this.setFocus();
		},

		hasOpenModal: function(){
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

			topModal && topModal.$element.focus();
		},

		removeModal: function(modal){
			modal.$element.off('.modalmanager');
			if (modal.$backdrop) this.removeBackdrop.call(modal);
			this.stack.splice(this.getIndexOfModal(modal), 1);
		},

		getModalAt: function(index){
			return this.stack[index];
		},

		getIndexOfModal: function(modal){
			for (var i = 0; i < this.stack.length; i++){
				if (modal === this.stack[i]) return i;
			}
		},

		removeBackdrop: function (modal) {
			modal.$backdrop.remove();
			modal.$backdrop = null;
		}, 

		createBackdrop: function(animate){
			var $backdrop;

			if (!this.isLoading) {
				$backdrop =  $('<div class="modal-backdrop ' + animate + '" />')
					.appendTo(this.$parent)
					.toggleClass('modal-absolute', !this.isBody);
			} else {
				$backdrop = this.$loading;
				$backdrop.off('.modalmanager');
				this.$spinner.remove();
				this.isLoading = false;
				this.$loading = this.$spinner = null;
			}

			return $backdrop
		},

		backdrop: function (modal, callback) {
			var animate = modal.$element.hasClass('fade') ? 'fade' : '',
				showBackdrop = $.extend({}, this.options, modal.options).backdrop;

			if (modal.isShown && showBackdrop) {
				var doAnimate = $.support.transition && animate && !this.isLoading;


				modal.$backdrop = this.createBackdrop(animate);

				modal.$backdrop.css('z-index', 
						(!this.isBody ? baseBackdropAbszIndex : baseBackdropzIndex) 
						+ (zIndexFactor * this.getIndexOfModal(modal)));


				if (modal.options.backdrop != 'static') {
					modal.$backdrop.on('click.modal', $.proxy(modal.hide, modal));
				}

				if (doAnimate) modal.$backdrop[0].offsetWidth // force reflow

				modal.$backdrop.addClass('in')

				doAnimate ?
				modal.$backdrop.one($.support.transition.end, callback) :
				callback();

			} else if (!modal.isShown && modal.$backdrop) {
				modal.$backdrop.removeClass('in');

				var that = this;
				$.support.transition && modal.$element.hasClass('fade')?
					modal.$backdrop.one($.support.transition.end, function(){ that.removeBackdrop(modal) }) :
					that.removeBackdrop(modal);

			} else if (callback) {
				callback();
			}
		},

		removeLoading: function(){
			this.$loading && this.$loading.remove();
			this.$loading = null;
			this.isLoading = false;
		},

		loading: function(callback){
			callback = callback || function(){ };
			
			this.$element.toggleClass('modal-open', !this.isLoading || this.hasOpenModal());
			
			if (!this.isLoading) {

				this.$loading = this.createBackdrop('fade');

				this.$loading[0].offsetWidth // force reflow	

				this.$loading
					.css('z-index', 
						(!this.isBody ? baseBackdropAbszIndex : baseBackdropzIndex) 
						+ (zIndexFactor * this.stack.length))
					.on('click.modalmanager', $.proxy(this.loading, this))
					.addClass('in');

				var $scrollElement = (this.$container.length ? this.$container : 
						(this.isBody ? $(window) : this.$element));

				this.$spinner = $('<div class="modal-spinner fade">')
					.append(this.options.spinner)
					.css('z-index', this.$loading.css('z-index'))
					.css('margin-top', $scrollElement.scrollTop())
					.appendTo(this.$parent)
					.addClass('in');

				this.isLoading = true;

				$.support.transition ?
				this.$loading.one($.support.transition.end, callback) :
				callback();

			} else if (this.isLoading && this.$loading) {
				this.$loading.removeClass('in');

				if (this.$spinner) this.$spinner.remove();

				var that = this;
				$.support.transition ?
					this.$loading.one($.support.transition.end, function(){ that.removeLoading() }) :
					that.removeLoading();

			} else if (callback) {
				callback(this.isLoading);
			}
		},

		toggleLoading: function(callback){ this.loading(callback); }
	}

	/* PRIVATE METHODS
	* ======================= */

	// make sure the event target is the modal itself in order to prevent 
	// other components such as tabsfrom triggering the modal manager. 
	// if Boostsrap namespaced events, this would not be needed.
	function targetIsModal(callback){
		return function(e){
			if (this === e.target){
				callback.apply(this, arguments);
			}
		}
	}


	/* MODAL MANAGER PLUGIN DEFINITION
	* ======================= */

	$.fn.modalmanager = function (option) {
		return this.each(function () {
			var $this = $(this)
			, data = $this.data('modalmanager');

			if (!data) $this.data('modalmanager', (data = new ModalManager(this, options)))
			if (typeof option == 'string') data[option]()
		})
	}

	$.fn.modalmanager.defaults = {
		backdrop: true,
		spinner: '<div class="loading-spinner" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>'
	}

	$.fn.modalmanager.Constructor = ModalManager

	// Create a default global modal manager 
	$(function(){
		window.GlobalModalManager = new ModalManager('body');
	})

}(jQuery);