(function($) {

$.fn.extend({
calendarSwipe: function(fn) {
	$(this).bind("touchstart", function(e){

		function touchmove(e) {
			e.preventDefault();

			updateChanges(e);
			var absX = Math.abs(deltaX);
			var absY = Math.abs(deltaY);

			if (absX > absY && (absX > 35) && deltaT < 1000) {
				touchend();
			}
			if (absY > absX && (absY > 35) && deltaT < 1000) {
				touchend();
			}
		}
		function touchend(e) {
			updateChanges(e);
			var absX = Math.abs(deltaX);
			var absY = Math.abs(deltaY);

			// Check for swipe
			if (absX > absY && (absX > 35) && deltaT < 1000) {
				fn.call(el, {direction: (deltaX < 0) ? 'left' : 'right', deltaX: deltaX, deltaY: deltaY, deltaT: deltaT });
			}
			if (absY > absX && (absY > 35) && deltaT < 1000) {
				fn.call(el, {direction: (deltaY < 0) ? 'up' : 'down', deltaX: deltaX, deltaY: deltaY, deltaT: deltaT });
			}

			$el.unbind("touchmove",touchmove).unbind("touchend",touchend);
		}
		function updateChanges(e) {
			var first = e.originalEvent.changedTouches[0] || null;
			if (first) {
				deltaX = first.pageX - startX;
				deltaY = first.pageY - startY;
			}
			deltaT = (new Date).getTime() - startTime;
		}

		var el = this;
		var $el = $(this);
		var startX = e.originalEvent.changedTouches[0].clientX,
			startY = e.originalEvent.changedTouches[0].clientY,
			startTime = new Date().getTime(),
			deltaX = 0,
			deltaY = 0,
			deltaT = 0;
		$el.bind('touchend', touchend);//.bind('touchmove', touchmove);
	});
}
});


})(jQuery);
