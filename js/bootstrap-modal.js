/* ===========================================================
 * bootstrap-modal.js v3.0.0
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
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) this.$element.load(this.options.remote)

    var manager = typeof this.options.manager === 'function' ?
      this.options.manager.call(this) : this.options.manager;

    manager = manager.appendModal ?
      manager : $(manager).modalmanager().data('modalmanager');

    manager.appendModal(this);
  }

  Modal.DEFAULTS = {
    keyboard: true,
    backdrop: true,
    loading: false,
    show: true,
    width: null,
    height: null,
    maxHeight: null,
    modalOverflow: false,
    consumeTab: true,
    focusOn: null,
    replace: false,
    resize: false,
    attentionAnimation: 'shake',
    manager: 'body',
    spinner: '<div class="loading-spinner" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>'
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.tab();

    this.options.loading && this.loading();

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element.show()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    this.tab();
    this.isLoading && this.loading();

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .removeClass('animated')
      .removeClass(this.options.attentionAnimation)
      .removeClass('modal-overflow')
      .attr('aria-hidden', true)
      .off('click.dismiss.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.layout = function() {
    var prop = this.options.height ? 'height' : 'max-height',
      value = this.options.height || this.options.maxHeight;

    if (this.options.width){
      this.$element.css('width', this.options.width);

      var that = this;
      this.$element.css('margin-left', function () {
        if (/%/ig.test(that.options.width)){
          return -(parseInt(that.options.width) / 2) + '%';
        } else {
          return -($(this).width() / 2) + 'px';
        }
      });
    } else {
      this.$element.css('width', '');
      this.$element.css('margin-left', '');
    }

    this.$element.find('.modal-body')
      .css('overflow', '')
      .css(prop, '');

    if (value){
      this.$element.find('.modal-body')
        .css('overflow', 'auto')
        .css(prop, value);
    }

    var modalOverflow = $(window).height() - 10 < this.$element.height();

    if (modalOverflow || this.options.modalOverflow) {
      this.$element
        .css('margin-top', 0)
        .addClass('modal-overflow');
    } else {
      this.$element
        .css('margin-top', 0 - this.$element.height() / 2)
        .removeClass('modal-overflow');
    }
  }

  Modal.prototype.tab = function() {
    var that = this;

    if (this.isShown && this.options.consumeTab) {
      this.$element.on('keydown.tabindex.modal', '[data-tabindex]', function (e) {
          if (e.keyCode && e.keyCode == 9){
          var $next = $(this),
            $rollover = $(this);

          that.$element.find('[data-tabindex]:enabled:not([readonly])').each(function (e) {
            if (!e.shiftKey){
              $next = $next.data('tabindex') < $(this).data('tabindex') ?
                $next = $(this) :
                $rollover = $(this);
            } else {
              $next = $next.data('tabindex') > $(this).data('tabindex') ?
                $next = $(this) :
                $rollover = $(this);
            }
          });

          $next[0] !== $(this)[0] ?
            $next.focus() : $rollover.focus();

          e.preventDefault();
        }
      });
    } else if (!this.isShown) {
      this.$element.off('keydown.tabindex.modal');
    }
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      if (!this.$element.attr('tabindex')) this.$element.attr('tabindex', -1);
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {

    var prop = this.options.height ? 'height' : 'max-height';
    var value = this.options.height || this.options.maxHeight;

    if (value) {
      this.$element.find('.modal-body')
        .css('overflow', '')
        .css(prop, '');
    }

    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeLoading = function () {
    this.$loading.remove();
    this.$loading = null;
    this.isLoading = false;
  }

  Modal.prototype.loading = function (callback) {
    callback = callback || function () {};

    var animate = this.$element.hasClass('fade') ? 'fade' : '';

    if (!this.isLoading) {
      var doAnimate = $.support.transition && animate;

      this.$loading = $('<div class="loading-mask ' + animate + '">')
        .append(this.options.spinner)
        .appendTo(this.$element);

      if (doAnimate) this.$loading[0].offsetWidth; // force reflow

      this.$loading.addClass('in');

      this.isLoading = true;

      doAnimate ?
        this.$loading.one($.support.transition.end, callback) :
        callback();

    } else if (this.isLoading && this.$loading) {
      this.$loading.removeClass('in');

      var that = this;
      $.support.transition && this.$element.hasClass('fade')?
        this.$loading.one($.support.transition.end, function () { that.removeLoading() }) :
        that.removeLoading();

    } else if (callback) {
      callback(this.isLoading);
    }
  }

  Modal.prototype.focus = function () {
    var $focusElem = this.$element.find(this.options.focusOn);

    $focusElem = $focusElem.length ? $focusElem : this.$element;

    $focusElem.focus();
  }

  Modal.prototype.attention = function () {
    // NOTE: transitionEnd with keyframes causes odd behaviour

    if (this.options.attentionAnimation){
      this.$element
        .removeClass('animated')
        .removeClass(this.options.attentionAnimation);

      var that = this;

      setTimeout(function () {
        that.$element
          .addClass('animated')
          .addClass(that.options.attentionAnimation);
      }, 0);
    }


    this.focus();
  }

  Modal.prototype.destroy = function () {
    var e = $.Event('destroy.bs.modal');
    this.$element.trigger(e);
    if (e.isDefaultPrevented()) return;

    this.teardown();
  }

  Modal.prototype.teardown = function () {
    if (!this.$parent.length){
      this.$element.remove();
      this.$element = null;
      return;
    }

    if (this.$parent !== this.$element.parent()){
      this.$element.appendTo(this.$parent);
    }

    this.$element.off('.modal');
    this.$element.removeData('modal');
    this.$element
      .removeClass('in')
      .attr('aria-hidden', true);
  }


  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that    = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade')?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }

  /* MODAL PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.defaults = Modal.DEFAULTS;

  $.fn.modal.Constructor = Modal

  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }

  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal',  '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(window.jQuery);
