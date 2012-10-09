!function ($) {

	"use strict"; // jshint ;_;
	
	/* MODAL CLASS DEFINITION
	* ====================== */

	var Modal = function (element, options) {
		this.init(element, options);
	}
	
	window.Modal = Modal;

	Modal.prototype = {

		constructor: Modal, 
		
		init: function(element, options){
			this.options = options;
		
			this.$element = $(element)
				.delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this));
				
			this.options.remote && this.$element.find('.modal-body').load(this.options.remote);
			
			this.options.manager && this.options.manager.appendModal(this);
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
			
			if (this.options.height){
				this.$element.css('height', this.options.height);
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
		manager: GlobalModalManager,
		spinner: '<div class="loading-spinner progress progress-striped active" style="width: 250px; margin-left: -125px;"><div class="bar" style="width: 100%;"></div></div>'
	}

	$.fn.modal.Constructor = Modal


	/* MODAL DATA-API
	* ============== */
	
	$(function () {
		$('body').off('.modal').on('click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
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