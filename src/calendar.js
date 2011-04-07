function Calendar(options) {
	function turbo($this, delay, func) {
		var evt;
		var count;
		var timer;
		var obj;
		function clickit() {
			evt.count = ++count;
			func.call(obj, evt);
			timer = setTimeout(clickit, evt.delay);
		}
		function start(e) {
			$this.bind("touchend mouseup mouseleave", end);
			evt = {delay: delay, count: 0, e: e};
			count = 0;
			obj = this;
			clickit();
		}
		function end(e) {
			$this.unbind("touchend mouseup mouseleave", end);
			if (timer !== undefined) {
				clearTimeout(timer);
				timer = undefined;
			}
		}
		var bindStart = ("ontouchstart" in window) ? "touchstart" : "mousedown";
		$this.bind(bindStart, start);
		$this.bind("keypress", function(e){
			// TODO: implement timer, count, etc.
			if (e.charCode == 13) {
				func.call(this, e);
			}
		});
	};

	var template =
"<div class=\"calendar-popup days\" onselectstart=\"return false;\">"
	+"<header>"
		+"<a href=\"\" class=\"status\"></a>"
		+"<span class=\"prev\" tabindex=\"0\">&#x25C0;</span>"
		+"<span class=\"next\" tabindex=\"0\">&#x25b6;</span>"
    +"</header>"
	+"<div class=\"pickers\">"
    	+"<div class=\"slider\">"
			+"<div class=\"decades\">"
				+"<table cellpadding=\"0\" cellspacing=\"0\">"
					+"<tr><td></td><td></td><td></td><td></td></tr>"
					+"<tr><td></td><td></td><td></td><td></td></tr>"
					+"<tr><td></td><td></td><td></td><td></td></tr>"
				+"</table>"
			+"</div>"
			+"<div class=\"years\">"
				+"<table cellpadding=\"0\" cellspacing=\"0\">"
					+"<tr><td></td><td></td><td></td><td></td></tr>"
					+"<tr><td></td><td></td><td></td><td></td></tr>"
					+"<tr><td></td><td></td><td></td><td></td></tr>"
				+"</table>"
			+"</div>"
			+"<div class=\"months\">"
				+"<table cellpadding=\"0\" cellspacing=\"0\">"
					+"<tr><td data-month=\"0\">Jan</td><td data-month=\"1\">Feb</td><td data-month=\"2\">Mar</td><td data-month=\"3\">Apr</td></tr>"
					+"<tr><td data-month=\"4\">May</td><td data-month=\"5\">Jun</td><td data-month=\"6\">Jul</td><td data-month=\"7\">Aug</td></tr>"
					+"<tr><td data-month=\"8\">Sep</td><td data-month=\"9\">Oct</td><td data-month=\"10\">Nov</td><td data-month=\"11\">Dec</td></tr>"
				+"</table>"
			+"</div>"
			+"<div class=\"days\">"
				+"<table cellspacing=\"0\" cellpadding=\"0\">"
					+"<thead><tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr></thead>"
					+"<tbody>"
						+"<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
						+"<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
						+"<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
						+"<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
						+"<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
						+"<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
					+"</tbody>"
				+"</table>"
			+"</div>"
        +"</div>"
    +"</div>"
	+"<footer>"
		+"<span class=\"this-month\">This month</span>"
		+"<span class=\"today\">Today</span>"
    	+"<span class=\"cancel\">Cancel</span>"
    +"</footer>"
+"</div>";

	var currentView = "days";
	var cal = this;

	var popup = $(template).hide();
	$(document.body).append(popup);

	var today = new Date();
	today.setHours(0, 0, 0, 0);

	var visibleYear;
	var visibleMonth;

	var slider = popup.find(".slider");
	var daysTable = slider.find(".days table");
	var monthsTable = slider.find(".months table");
	var yearsTable = slider.find(".years table");
	var decadesTable = slider.find(".decades table");
	function setView(view) {
		currentView = view;
		popup.removeClass("days months years decades").addClass(view);
		// <if height>
			if (view === "days") {
				slider.css({marginTop: -3 * daysTable.height()});
			}
			else if (view === "months") {
				slider.css({marginTop: -2 * monthsTable.height()});
			}
			else if (view === "years") {
				slider.css({marginTop: -yearsTable.height()});
			}
			else if (view === "decades") {
				slider.css({marginTop: 0});
			}
		// </if>
	}

	var title = popup.find("header .status");
	function setTitle(header) {
		title.text(header);
	}

	this.showDays = function(year, month, allowAnimation) {
		var date = new Date(year, month, 1)

		var next, direction = "left";
		var animate = allowAnimation !== false && currentView === "days" && (visibleYear !== date.getFullYear() || visibleMonth !== date.getMonth());
		if (animate) {
			// stop currently running animations
			popup.find("table").stop(false, true);
			next = daysTable.clone();
			if (visibleYear > date.getFullYear() || (visibleYear === date.getFullYear() && visibleMonth > date.getMonth())){
				direction = "right";
			}
		}

		visibleYear = date.getFullYear();
		visibleMonth = date.getMonth();
		setView("days");
		setTitle(["January","February","March","April","May","June","July","August","September","October","November","December"][visibleMonth] + " " + visibleYear);

		var firstDoW = date.getDay();
		date.setDate(1 - firstDoW);
		daysTable.find("td").each(function(){
			$(this)
				.text(date.getDate())
				.attr("class", "")
				.toggleClass("x", date.getMonth() != visibleMonth)
				.data("date", {year:date.getFullYear(), month:date.getMonth(), day: date.getDate()})
				.toggleClass("today", !(date < today || date > today))
				.addClass(cal.setClass(date))
			;
			date.setDate(date.getDate()+1);
		});

		if (animate) {
			slide(daysTable, next, direction);
		}
	};
	this.showMonths = function(year, allowAnimation) {
		year = 1*year;
		var next, direction = "left";
		var animate = allowAnimation !== false && currentView === "months" && visibleYear !== year;
		if (animate) {
			// stop currently running animations
			popup.find("table").stop(false, true);
			next = monthsTable.clone();
			if (visibleYear > year){
				direction = "right";
			}
		}

		visibleYear = year;
		setView("months");
		setTitle(visibleYear);
		monthsTable.find("td").data("year", visibleYear);

		if (animate) {
			slide(monthsTable, next, direction);
		}
	}
	this.showYears = function(decade, allowAnimation) {
		decade = Math.floor(decade / 10) * 10;
		visibleYear = Math.floor(visibleYear / 10) * 10;

		var next, direction = "left";
		var animate = allowAnimation !== false && currentView === "years" && visibleYear !== decade;
		if (animate) {
			// stop currently running animations
			popup.find("table").stop(false, true);
			next = yearsTable.clone();
			if (visibleYear > decade){
				direction = "right";
			}
		}

		visibleYear = decade;
		setView("years");
		setTitle(visibleYear + "\u2013" + (visibleYear + 9));
		var year = visibleYear - 1;
		yearsTable.find("td").each(function(){
			$(this)
				.text(year)
				.toggleClass("x", year < visibleYear || year >= visibleYear + 10)
				.data("year", year)
			;
			year += 1;
		});

		if (animate) {
			slide(yearsTable, next, direction);
		}
	}
	this.showDecades = function(century, allowAnimation) {
		century = Math.floor(century / 100) * 100;
		visibleYear = Math.floor(visibleYear / 100) * 100;

		var next, direction = "left";
		var animate = allowAnimation !== false && currentView === "decades" && visibleYear !== century;
		if (animate) {
			// stop currently running animations
			popup.find("table").stop(false, true);
			next = decadesTable.clone();
			if (visibleYear > century){
				direction = "right";
			}
		}

		visibleYear = century;
		setView("decades");
		setTitle(visibleYear + " \u2013 " + (visibleYear + 99));
		var decade = visibleYear - 10;
		decadesTable.find("td").each(function(){
			$(this)
				.text(decade + " \u2013 " + (decade + 9))
				.toggleClass("x", decade < visibleYear || decade >= visibleYear + 100)
				.data("decade", decade)
			;
			decade += 10;
		});

		if (animate) {
			slide(decadesTable, next, direction);
		}
	}

	popup.click(function(e){ e.stopPropagation(); e.preventDefault(); });
	turbo(popup.find("header .next, header .prev"), 500, function(e){
		if (e.count == 5) { e.delay = 333; }
		var direction = $(this).hasClass("prev") ? -1 : +1;
		switch(currentView) {
		case "days":    cal.showDays   (visibleYear, visibleMonth + 1 * direction); break;
		case "months":  cal.showMonths (visibleYear + 1 * direction); break;
		case "years":   cal.showYears  (visibleYear + 10 * direction); break;
		case "decades": cal.showDecades(visibleYear + 100 * direction); break;
		}
	});

	function slide(now, next, direction) {
		if (direction === "right") {
			now.after(next);
			now.parent().css({width: "200%"});
			now.add(next).css({float: "left"});
			now.css({marginLeft: -now.width()});
			now.css({width: "50%"});
			next.css({width: "50%"});
			now.animate({marginLeft: "0"}, 250, function(){
				var height = now.height();
				now.removeAttr("style").height(height);
				now.parent().removeAttr("style").height(height);
				next.remove();
			});
		} else {
			now.before(next);
			now.parent().css({width: "200%"});
			now.add(next).css({float: "left"});
			now.css({width: "50%"});
			next.css({width: "50%"});
			next.animate({marginLeft: -next.width()}, 250, function(){
				var height = now.height();
				now.removeAttr("style").height(height);
				now.parent().removeAttr("style").height(height);
				next.remove();
			});
		}
	}

	popup.find("footer .cancel").click(function() {
		var result, e;
		e = {cancel: false};
		result = cal.onCancel.call(cal, e);
		if (result !== false && !e.cancel) {
			cal.hide();
		}
	});
	popup.find("footer .this-month").click(function() {
		cal.showDays(today.getFullYear(), today.getMonth());
	});
	popup.find("footer .today").click(function() {
		var result, e;
		if ($(this).hasClass("disabled")) return;
		e = {cancel: false};
		result = cal.onSelect.call(cal, today, e);
		if (result !== false && !e.cancel) {
			cal.hide();
		}
	});

	//popup.find("header .status").bind("touchstop", function(e){ e.stopPropagation(); e.preventDefault(); });
	popup.find("header .status").bind("click", function(e) {
		e.preventDefault();
		if (currentView === "days") {
			cal.showMonths(visibleYear);
		}
		else if (currentView === "months") {
			cal.showYears(visibleYear);
		}
		else if (currentView === "years") {
			cal.showDecades(visibleYear);
		}
	});
	popup.delegate("td", "click", function() {
		if (currentView === "days") {
			if ($(this).hasClass("disabled")) return;
			var date = $(this).data("date");
			var e = {cancel: false};
			var result = cal.onSelect.call(cal, new Date(date.year, date.month, date.day), e);
			if (result !== false && !e.cancel) {
				cal.hide();
			}
		}
		else if (currentView === "months") {
			cal.showDays($(this).data("year"), $(this).data("month"));
		}
		else if (currentView === "years") {
			cal.showMonths($(this).data("year"));
		}
		else if (currentView === "decades") {
			cal.showYears($(this).data("decade"));
		}
	});

	if ('ontouchstart' in window) {
		var touchdisplay = $("<div style=\"position: absolute; font-size: 24px; font-weight: bold; padding: 1em; margin-bottom: 1em; color: white; background: black; text-align: center; white-space: nowrap;\"/>");
		popup.after(touchdisplay.hide());
		popup.delegate("td", "touchstart", function(e){
			function move(e){
				e.preventDefault();
				touchdisplay.hide();
				$(this).unbind("touchmove", move).unbind("touchend", end);
			}
			function end() {
				touchdisplay.fadeOut();
				$(this).unbind("touchmove", move).unbind("touchend", end);
			}
			if (e.originalEvent.touches && e.originalEvent.currentTarget) {
				var touch = e.originalEvent.touches[e.originalEvent.touches.length-1];
				touchdisplay.text($(this).text());
				touchdisplay.fadeIn();
				touchdisplay.offset({top: touch.pageY-(touchdisplay.outerHeight(true)), left: touch.pageX - touchdisplay.outerWidth()/2});
			}
			$(this).bind("touchmove", move).bind("touchend", end);
		});
		if ($.fn.calendarSwipe) {
			popup.calendarSwipe(function(e){
				switch (e.direction) {
				case "left":
				case "right":
					var direction = e.direction === "right" ? -1 : +1;
					switch(currentView) {
					case "days":    cal.showDays   (visibleYear, visibleMonth + 1 * direction); break;
					case "months":  cal.showMonths (visibleYear + 1 * direction); break;
					case "years":   cal.showYears  (visibleYear + 10 * direction); break;
					case "decades": cal.showDecades(visibleYear + 100 * direction); break;
					}
					break;
				case "down":
					switch(currentView) {
					case "days":    cal.showMonths (visibleYear); break;
					case "months":  cal.showYears  (visibleYear); break;
					case "years":   cal.showDecades(visibleYear); break;
					}
					break;
				case "up":
					switch(currentView) {
					case "months":  cal.showDays   (visibleYear, visibleMonth || 0); break;
					case "years":   cal.showMonths (visibleYear); break;
					case "decades": cal.showYears  (visibleYear); break;
					}
					break;
				}
			});
		}
	}

	this.show = function(pos) {
		var disabled = cal.setClass(today);
		disabled = disabled && disabled.match(/disabled/) ? true : false;
		popup.find("footer .today").toggleClass("disabled", disabled);

		this.showDays(visibleYear !== undefined ? visibleYear : today.getFullYear(), visibleMonth !== undefined ? visibleMonth : today.getMonth(), false);
		popup.hide().slideDown("fast").offset(pos);
	}
	this.hide = function() {
		popup.slideUp("fast");
	}
	this.destroy = function() {
		popup.remove();
	}

	this.onSelect = function(date){};
	this.onCancel = function(date){};
	this.setClass = function(date){};

	this.setValue = function(input) {
		var oldOnSelect = cal.onSelect;
		var oldOnCancel = cal.onCancel;
		var oldSetClass = cal.setClass;
		cal.onSelect = function(d, e) {
			var result = oldOnSelect.call(cal, d, e);
			if (result === false || e.cancel) return;
			if (input.type === "date" && input.hasOwnProperty("valueAsDate")) {
				input.valueAsDate = d;
			} else {
				var year = d.getFullYear();
				var month = d.getMonth() + 1;
				var day = d.getDate();
				input.value = year + "-" + (month < 10 ? "0"+month : month) + "-" + (day < 10 ? "0"+day : day);
			}
			cal.onSelect = oldOnSelect;
			cal.onCancel = oldOnCancel;
			cal.setClass = oldSetClass;
		};
		cal.onCancel = function(e) {
			var result = oldOnCancel.call(cal, e);
			if (result === false || e.cancel) return;
			cal.onSelect = oldOnSelect;
			cal.onCancel = oldOnCancel;
			cal.setClass = oldSetClass;
		}
		cal.setClass = function(d) {
			var oldClass = oldSetClass.call(cal, d);
			if (oldClass === null || oldClass === undefined) oldClass = "";
			var year, month, day, matchdate;
			if (input.type === "date" && input.hasOwnProperty("valueAsDate") && input.valueAsDate) {
				year = input.valueAsDate.getFullYear();
				month = input.valueAsDate.getMonth();
				day = input.valueAsDate.getDate();
			} else if (matchdate = input.value.match(/^(\d{2,4})-(\d{1,2})-(\d{1,2})/)) {
				year = matchdate[1];
				month = matchdate[2]-1;
				day = matchdate[3];
			}
			if (year !== undefined && month !== undefined && day !== undefined) {
				return oldClass + ((d.getFullYear() == year && d.getMonth() == month && d.getDate() == day) ? " selected" : "");
			}
			return oldClass;
		}
		var year, month, matchdate;
		if (input.type === "date" && input.hasOwnProperty("valueAsDate") && input.valueAsDate) {
			year = input.valueAsDate.getFullYear();
			month = input.valueAsDate.getMonth();
		} else if (matchdate = input.value.match(/^(\d{2,4})-(\d{1,2})/)) {
			year = matchdate[1];
			month = matchdate[2]-1;
		} else {
			year = new Date().getFullYear();
			month = new Date().getMonth();
		}
		cal.showDays(year, month, false);
		var pos = $(input).offset();
		cal.show({top: pos.top + $(input).outerHeight(), left: pos.left});
		//cal.show({top: 0, left: 0, height: document.height, width: document.width});
	}
}
