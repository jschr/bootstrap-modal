/* ===========================================================
 * bootstrap-modal.js 
 * ===========================================================
 * Copyright 2012 Jordan Schroter
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
	
	/* MODAL CLASS DEFINITION
	* ====================== */

	var Modal = function (element, options) {
		this.init(element, options);
	}

	Modal.prototype = {

		constructor: Modal, 
		
		init: function(element, options){
			this.options = options;
		
			this.$element = $(element)
				.delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this));
				
			this.options.remote && this.$element.find('.modal-body').load(this.options.remote);
			
			var manager = typeof this.options.manager === 'function' ? this.options.manager.call(this) : this.options.manager;
			manager && manager.appendModal && manager.appendModal(this);
		}, 
		
		toggle: function () {
			return this[!this.isShown ? 'show' : 'hide']();
		}, 
		
		show: function () {
			var that = this, 
				e = $.Event('show');
			
			this.$element.triggerHandler(e);

			if (e.isDefaultPrevented()) return;
			
			if (this.options.width){
				this.$element.css('width', this.options.width);
				
				var that = this;
				this.$element.css('margin-left', function(){
					if (/%/ig.test(that.options.width)){
						return -(parseInt(that.options.width) / 2) + '%';
					} else {
						return -($(this).width() / 2) + 'px';
					}
				});
			}

		
			var prop = this.options.height ? 'height' : 'max-height';
			var value = this.options.height || this.options.maxHeight;
			
			if (value){
				this.$element.find('.modal-body')
					.css('overflow', 'auto')
					.css(prop, value);
			}

			this.escape();
			
			this.options.loading && this.loading();
		}, 
		
		hide: function (e) {
			e && e.preventDefault();

			var that = this;

			e = $.Event('hide');

			this.$element.triggerHandler(e);

			if (!this.isShown || e.isDefaultPrevented()) return (this.isShown = false);

			this.isShown = false;

			this.escape();
			
			this.isLoading && this.loading();

			$(document).off('focusin.modal');

			this.$element
				.removeClass('in')
				.removeClass('modal-overflow')
				.attr('aria-hidden', true);

			$.support.transition && this.$element.hasClass('fade') ?
				this.hideWithTransition() :
				this.hideModal();
		}, 
		
		escape: function () {
			var that = this;
			if (this.isShown && this.options.keyboard) {
				if (!this.$element.attr('tabindex')) this.$element.attr('tabindex', -1);
				
				this.$element.on('keyup.dismiss.modal', function ( e ) {
					e.which == 27 && that.hide()
				});
			} else if (!this.isShown) {
				this.$element.off('keyup.dismiss.modal')
			}
		}, 
		
		hideWithTransition: function () {
			var that = this
				, timeout = setTimeout(function () {
					that.$element.off($.support.transition.end)
					that.hideModal()
				}, 500);

			this.$element.one($.support.transition.end, function () {
				clearTimeout(timeout)
				that.hideModal()
			});
		}, 
		
		hideModal: function () {
			this.$element
				.hide()
				.triggerHandler('hidden');


			var prop = this.options.height ? 'height' : 'max-height';
			var value = this.options.height || this.options.maxHeight;
			
			if (value){
				this.$element.find('.modal-body')
					.css('overflow', '')
					.css(prop, '');
			}

		}, 
		
		removeLoading: function(){
			this.$loading.remove();
			this.$loading = null;
			this.isLoading = false;
		},
		
		loading: function(callback){
			callback = callback || function(){};
		
			var animate = this.$element.hasClass('fade') ? 'fade' : '';
			
			if (!this.isLoading) {
				var doAnimate = $.support.transition && animate;
				
				this.$loading = $('<div class="loading-mask ' + animate + '">')
					.append(this.options.spinner)
					.appendTo(this.$element);

				if (doAnimate) this.$loading[0].offsetWidth // force reflow	
					
				this.$loading.addClass('in')

				this.isLoading = true;
				
				doAnimate ?
					this.$loading.one($.support.transition.end, callback) :
					callback();

			} else if (this.isLoading && this.$loading) {
				this.$loading.removeClass('in');

				var that = this;
				$.support.transition && this.$element.hasClass('fade')?
					this.$loading.one($.support.transition.end, function(){ that.removeLoading() }) :
					that.removeLoading();

			} else if (callback) {
				callback(this.isLoading);
			}
		},
		
		toggleLoading: function(callback){ this.loading(callback); }, 
		
		destroy: function(){
			var e = $.Event('destroy');
			this.$element.triggerHandler(e);
			if (e.isDefaultPrevented()) return;
			
			this.teardown();
		},
		
		teardown: function(){
			var $parent = this.$parent;
			
			if (!$parent.length){
				this.$element.remove();
				this.$element = null;
				return;
			}
			
			if ($parent !== this.$element.parent()){
				this.$element.appendTo(this.$parent);
			}
			
			this.$element.off('.modal');
			this.$element.removeData('modal');
			this.$element
				.removeClass('in')
				.attr('aria-hidden', true);
		}
	}


	/* MODAL PLUGIN DEFINITION
	* ======================= */

	$.fn.modal = function (option) {
		return this.each(function () {
			var $this = $(this), 
				data = $this.data('modal'), 
				options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option);

			if (!data) $this.data('modal', (data = new Modal(this, options)))
			if (typeof option == 'string') data[option]()
			else if (options.show) data.show()
		})
	}

	$.fn.modal.defaults = {
		keyboard: true, 
		backdrop: true,
		loading: false,
		show: true,
		width: null,
		height: null,
		maxHeight: null,
		modalOverflow: false,
		manager: function(){ return GlobalModalManager },
		spinner: '<div class="loading-spinner" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>'
	}

	$.fn.modal.Constructor = Modal


	/* MODAL DATA-API
	* ============== */
	
	$(function () {
		$(document).off('.modal').on('click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
			var $this = $(this), 
				href = $this.attr('href'), 
				$target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7 
				option = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

			e.preventDefault();
			$target
				.modal(option)
				.one('hide', function () {
					$this.focus();
				})
		});
	});

}(window.jQuery);