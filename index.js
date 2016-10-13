;(function (factory) {

	if (window.jQuery) {
		window.ImageSlideTransitionView = factory(window.jQuery)
	} else {
		console.log('require jQuery')
	}

})(function ($) {

	function View(options) {
		$.extend(this, options)
		this.initialize(options)
	}

	View._transitions = []

	View.addTransition = function (name, fn) {
		if (typeof fn === 'function') {
			View._transitions.push({
				name: name,
				fn: fn
			})
		} else {
			View._transitions.push($.extend({
				name: name
			}, fn))
		}
	}

	View.removeTransition = function (id) {
		return View._transitions.splice(id, 1)
	}

	View.nextTransition = function () {
		var id = this._id
		if (id === undefined) {
			id = this._id = 0
		} else {
			this._id = id = id + 1 >= this._transitions.length ? 0 : id + 1
		}
		return this._transitions[id]
	}

	$.extend(View.prototype, {

		el: '.image-slide-container',
		partNum: 12,
		partDelay: 100,
		slideInterval: 5000,

		initialize: function (options) {
			this.$el = $(this.el)
			this.width = this.$el.width()
			this.height = this.$el.height()
			this.$el.css('background-image', 'url(' + this.data[0] + ')')
			this.initParts()
		},

		initParts: function () {
			var partNum = this.partNum
			var partWidth = this.width / partNum
			for (var i = 0; i < partNum; i++) {
				var $part = $('<div class="image-slide-part">').css({
					left: i * partWidth,
					backgroundPositionX: -i * partWidth
				})
				$part.appendTo(this.$el)
			}
			this.$parts = this.$('.image-slide-part')
		},

		start: function () {
			if (!this.timer) {
				var view = this
				var imgs = this.data
				var current = 0
				var max = imgs.length - 1
				this.timer = setInterval(function () {
					current = current + 1 > max ? 0 : current + 1;
					view.changeImage(imgs[current], View.nextTransition())
				}, this.slideInterval)
			}
		},

		stop: function () {
			if (this.timer) {
				clearInterval(this.timer)
				this.timer = null
			}
		},

		changeImage: function (url, transition) {
			if (transition && typeof transition.fn === 'function') {
				var view = this
				var partDelay = this.partDelay

				// transition effort
				this.$parts.each(function (i, part) {
					var delay
					if (typeof transition.delay === 'function') {
						delay = transition.delay(i, view)
					} else {
						delay = i * partDelay
					}
					setTimeout(function () {
						transition.fn(i, part, url, view)
					}, delay)
				})

				// after transition update the slide's background
				setTimeout(function () {
					view.$el.css('background-image', 'url(' + url + ')');
					view.$parts.hide();
				}, 12 * partDelay);
			}
		},

		$: function (el) {
			return this.$el.find(el)
		}
	})

	/* default transitions */

	View.addTransition('leftToRight', function (i, part, url, view) {
		$(part).css('background-image', 'url(' + url + ')').fadeIn(view.partDelay);
	})

	View.addTransition('topToBottom', function (i, part, url, view) {
		$(part).css({
			top: -view.height,
			'background-image': 'url(' + url + ')'
		}).show().animate({
			top: 0
		}, 2 * view.partDelay);
	})

	View.addTransition('rightBottomToTopLeft', {
		delay: function (i, view) {
			return (view.partNum - i) * view.partDelay
		},
		fn: function (i, part, url, view) {
			$(part).css({
				top: view.height,
				'background-image': 'url(' + url + ')'
			}).show().animate({
				top: 0
			}, 2 * view.partDelay);
		}
	})

	return View
})