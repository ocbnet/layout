/*

  Copyright (c) Marcel Greter 2012 - OCBNET Layouter 1.0.0
  This plugin available for use in all personal or commercial projects under both MIT and GPL licenses.

  The Layouter takes care of widgets that have aspect ratios.
  These Widgets can run into problem when the scrollbar appears.
  This lib does the same as any (tested) browser does when displaying
  images with an aspect ratio and a flexible width. When the vertical
  scrollbar appears due to the widget/image beeing to tall, the width
  of the widget would be decreased which in turn decreases the height.
  This then can make the scrollbar to disapear again, which in turn
  would increase the width and height of the widget again. To solve
  this endless loop, we force a vertical scrollbar to be shown.

  This fixes layout and scrollbar problems like these:
  http://stackoverflow.com/questions/6818096

*/

/* @@@@@@@@@@ STATIC CLASS @@@@@@@@@@ */

// create private scope
(function (jQuery)
{

	// jquery win and body object
	// body will be set when the first
	// widget is added to the collection
	var win = jQuery(window), body = null;

	// frames per second to layout
	// only needed when not in vsync mode
	var fps = 60;

	// store scheduled timeout
	var scheduled;

	// widgets without parent
	var roots = jQuery();

	// widgets to be layouted
	var widgets = jQuery();

	// old body overflow style
	var overflow_x, overflow_y;

	// get the user agent string in lowercase
	// copy feature from jquery migrate plugin
	// this was included in jquery before v1.9
	var ua = navigator.userAgent.toLowerCase();

	// only match for ie and mozilla so far
	var match = // /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
	            // /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
	            // /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
	            /(msie) ([\w.]+)/.exec( ua ) ||
	            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
	            [];

	// get splitted information about the user agent
	var browser = match[ 1 ] || '', version = match[ 2 ] || '0';

	// defer the resize event and filter multiple calls
	// this is a bugfix for ie 8 where the resize event may is
	// triggered multiple times when scrollbars appear/disappear
	var vsync = ! browser == 'msie' || parseInt(version, 10) != 8;

	// get firefox mode on startup / initialization
	// firefox will show both scrollbars when the layout
	// does not 'fit' perfectly. All other browsers will
	// only show the scrollbar in the direction needed.
	var firefox_overflow = browser == 'mozilla';

	// use requestAnimationFrame to defer functions
	// this seems to work quite well, so include it
	var setDefered = window.requestAnimationFrame,
	    clearDefered = window.cancelRequestAnimationFrame;
	// search for requestAnimationFrame by vendor
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	// loop vendors until the request animation frame function is found
	for(var x = 0; x < vendors.length && !setDefered; ++x)
	{
		setDefered = window[vendors[x]+'RequestAnimationFrame'];
		clearDefered = window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	// create function to take out delay argument
	if (setDefered) var callDefered = function (cb) { setDefered(cb); };

	// use timeouts as a fallback
	if (!callDefered) callDefered = window.setTimeout;
	if (!clearDefered) clearDefered = window.clearTimeout;

	// remember default functions
	var defCallDefered = callDefered;
	var defClearDefered = clearDefered;

	// static local function
	// call function on all widgets
	function exec(fn, data, widgets)
	{

		// loop all widgets in order of registration
		for(var i = 0, l = widgets.length; i < l; i++)
		{

			// call method in widget context
			if (jQuery.isFunction(widgets[i][fn]))
			{ widgets[i][fn].call(widgets[i], data); }

		}

	}
	// EO exec


	// static local function
	// call function on all widgets
	function layout(data, widgets)
	{

		// first call pre on all widgets
		exec('preLayout', data, widgets);

		// loop all widgets in order of registration
		for(var i = 0, l = widgets.length; i < l; i++)
		{

			// get childrens for widget from options
			var children = widgets[i].layout.children;

			// call layout for all childrens
			if (children && children.length)
			{ layout(data, children); }

		}

		// then call update on all widgets
		exec('postLayout', data, widgets);

	}
	// EO layout

	// static local function
	// call function on all widgets
	function finalize(data, widgets)
	{

		// first call post on all widgets
		exec('updateLayout', data, widgets);

		// loop all widgets in order of registration
		for(var i = 0, l = widgets.length; i < l; i++)
		{

			// get childrens for widget from options
			var children = widgets[i].layout.children;

			// call finalize for all childrens
			if (children && children.length)
			{ finalize(data, children); }

		}

	}
	// EO finalize


	// static global function
	// do the layout on all widgets
	function Manager (force)
	{

		// shared data (assign flag)
		var data = { force: force };

		// restore the previous overflow style on the document body
		// needed so our layout can trigger the scrollbar to appear/disapear
		if (overflow_y) { body.css('overflow-y', overflow_y); overflow_y = null; }
		if (overflow_x) { body.css('overflow-x', overflow_x); overflow_x = null; }

		// get the initial dimensions
		var body_1st_x = win.innerWidth();
		var body_1st_y = win.innerHeight();

		// reflow layout
		layout(data, roots);

		// get the dimensions afterwards
		var body_2nd_x = win.innerWidth();
		var body_2nd_y = win.innerHeight();

		if (body_1st_x != body_2nd_x || body_1st_y != body_2nd_y)
		// if (body_1st_x > body_2nd_x || body_1st_y > body_2nd_y)
		{

			// reflow layout
			layout(data, roots);

			// get the dimensions afterwards
			var body_3rd_x = win.innerWidth();
			var body_3rd_y = win.innerHeight();

			if (body_2nd_x != body_3rd_x || body_2nd_y != body_3rd_y)
			// if (body_2nd_x < body_3rd_x || body_2nd_y < body_3rd_y)
			{

				// check if we should force the horizontal scrollbar
				if (firefox_overflow || body_2nd_y != body_3rd_y)
				{
					// store previous scollbar setting
					overflow_x = body.css('overflow-x');
					// reset to scroll if not hidden
					if (overflow_x != 'hidden')
					{ body.css('overflow-x', 'scroll'); }
				}

				// check if we should force the vertical scrollbar
				if (firefox_overflow || body_2nd_x != body_3rd_x)
				{
					// store previous scollbar setting
					overflow_y = body.css('overflow-y');
					// reset to scroll if not hidden
					if (overflow_y != 'hidden')
					{ body.css('overflow-y', 'scroll'); }
				}

				// reflow layout
				layout(data, roots);

			}
			// EO if 2nd changed

		}
		// EO if 1st changed

		// execute last (only once)
		finalize(data, roots);

	};
	// EO Manager


	// static global function
	Manager.config = function (key, value)
	{

		// assign config option
		switch (key)
		{
			case 'fps': fps = value; break;
			case 'vsync': vsync = value; break;
			case 'default':
				callDefered = defCallDefered;
				clearDefered = defClearDefered;
			break;
			case 'fallback':
				callDefered = window.setTimeout;
				clearDefered = window.clearTimeout;
			break;
		}

		// reassign the resizer function
		resizer = vsync ? function () { Manager(); } : deferer;

	};
	// EO config

	// static global function
	// schedule a layout call in delay ms
	// normally we keep the current waiting timeout
	// set reset if you want to reschedule the repaint
	Manager.schedule = function (delay, reset)
	{

		// do not re-schedule, execute the first timeout.
		// we want it to be called from time to time
		if (!reset && scheduled) return;

		// we should reset the scheduled callback
		// this will enforce the delay to stay
		if (scheduled) clearDefered(scheduled);

		// schedule a layout execution
		scheduled = callDefered(function()
		{

			// call layout
			Manager();

			// reset timer status
			// we are ready for more
			scheduled = null;

		}, delay || 0);

	}
	// EO Manager.schedule


	// EO Manager.defer
	Manager.defer = function (fn, delay)
	{
		// delay is optional
		if (typeof delay == 'undefined')
		{ delay = 1000 / fps; }
		// add scheduled function
		return callDefered(fn, delay);
	}
	// EO Manager.defer

	// EO Manager.undefer
	Manager.undefer = function (scheduled)
	{
		// clear scheduled function
		return clearDefered(scheduled);
	}
	// EO Manager.undefer


	// static global function
	// add a widget under our control
	Manager.add = function (widget)
	{

		// assign the body object only once
		if (!body) body = jQuery('BODY:first');

		// extend/initialize layout options property
		widget.layout = jQuery.extend({ children: [] }, widget.layout)

		// check if widget has a parent with children
		// add ourself to our parent's children array
		if (widget.layout && widget.layout.parent)
		{
			if (!widget.layout.parent.layout.children)
			{ widget.layout.parent.layout.children = []; }
			widget.layout.parent.layout.children.push(widget);
		}
		// otherwise it's a root widget without parent
		else { roots = roots.add(jQuery(widget)); }

		// jQueryfy input argument
		widget = jQuery(widget);

		// attach resize event to call resizer
		if (widgets.length == 0 && widget.length > 0)
		{ jQuery(window).bind('resize', resizer); }

		// push instances to static array
		widgets = widgets.add(widget)

		// make static array a global
		// Manager.widgets = widgets;

	};
	// EO Manager.add


	// static global function
	// add a widget under our control
	Manager.del = function (widget)
	{

		// jQueryfy input argument
		widget = jQuery(widget);

		// remove instances from static array
		widgets = widgets.not(widget)

		// remove the resize handler when there are no widgets left
		if (widgets.length == 0) jQuery(window).unbind('resize', resizer);

		// make static array a global
		// Manager.widgets = widgets;

	};
	// EO Manager.del


	// make static array a global
	// Manager.widgets = widgets;


	// Maybe we should defer the resize event.
	// This is needed to avoid a possible endless
	// loop in internet explorer 8. This Browser
	// can trigger resize events after scrollbars
	// appear/disapear or on reflow of some element.
	// IE 7 and below always show a scrollbar, so this
	// problem does not seem to exist, otherwise we
	// should also set those browsers to defer the resize.

	// only enqueue one
	var resizing = false;

	// @@@ function: deferer @@@
	var deferer = function ()
	{

		// only register one callback
		if (resizing) return false;

		// register a callback for next idle loop
		resizing = callDefered(function()
		{

			// call layouter
			Manager();

			// reset the lock
			resizing = false;

		}, 1000 / fps)

	}
	// @@@ EO function: deferer @@@


	// Set resizer to the desired function to execute.
	// Set this on initialization as the decision is always
	// based on information that must not change during runtime.
	// Will be bound to resize event when first widget is added.
	var resizer = vsync ? function () { Manager(); } : deferer;


	// make sure our global namespace exists
	// but do not reset it if already present
	if (typeof OCBNET == 'undefined') OCBNET = {};

	// assign class to global namespace
	OCBNET.Layout = Manager;


})(jQuery);
// EO private scope