OCBNET Layout Manager
=====================

This static utility class abstracts the complex logic to layout all javascript widgets on a fluid /
responsive html page correctly. It will handle the browser resize event for you and dispatchs
layout callbacks for each registered widget.

### Where's the problem?

Handling the layout by yourself is easy, you may say. The most common approach is to bind the
resize event for every instance you create. When the event fires you measure the available width and
would resize the widget accordingly. This will works in most situations, but has a very ugly race
condition when the browser decides to add a scrollbar after you laid out your widget. You can see
this behaviour in the "broken" demo page.

### How to fix the mess?

I realized quite soon that there is no "perfect" layout in this situation! But I didn't had a clue
how to solve this problem until I realized that a browser should have the same problem when it has
to layout a fluid image (width 100% and height auto). It seems quite obvious now that the solution
is to force the scrollbar to be shown in this situation.

### Anything more to look out for?

Multiple widgets on a page that re-layout themselve on resize will cause another race condition.
Imagine the second widget increases it's height which would trigger a vertical scrollbar to appear.
All other widgets would need to re-layout again. Maybe the first widget would get so small that the
scrollbar would disappear again. So the second widget would need a re-layout again. You are basically
begging for an endless loop here. It may look funky but certainly not the way you want it to.

### So what's the magic trick?

You need a central Layout Manager to handle all your widgets. Each widget is laid out in two phases.
First it reads and stores all values that are needed for the layout. In the second phase it will
use these value to do the actual layout adjustments. The widget in the demo will first read the
width of itself (preLayout) then setting the height to the same value (on updateLayout). The
Manager will first call preLayout on all widgets, before calling updateLayout.

### A little more about scrollbar detection

To solve the scrollbar race condition we have to run quite an expensive check. The Layout Manager
will check if the browser viewport has changed after it has laid out all registered widgets. It will then
go for another run to layout all widgets with the new viewport dimensions. Another check is done
to catch the scrollbar race condition. If this happens we force a scrollbar and redo the layout
once again. Resizing can be quite jerky when this condition is occuring. The best way to avoid the
performance penalty at all is to force the scrollbar to show at all times (via css overflow).

### How do I use the Layout Manager?

The Layout Manager must not be instantiated. It's a static "class". Basically just a bunch of static
functions with static data. This makes sense since we want to manage every widget instance. To add a
widget to the manager you simply have to add it via OCBNET.Layout.add(widget).

### What is a widget?

The widgets you register can be associative arrays or objects. To work with the Layout Manager
these objects need to have preLayout, updateLayout and postLayout set to functions. The Manager will
always call them in the context of the widget. For the widget this will look like a regular method
call. On preLayout you should read all values / dimensions and on updateLayout you can adjust widget
elements.

### Utility Functions

<pre>OCBNET.Layout(force)</pre>

Main function to layout all widgets. Takes an optional force argument which is passed to each
layout method (as data.force). Always call this function when the widget dimensions changed by
some event other than resize.

<pre>OCBNET.Layout.add(widget)</pre>

Add another widget to the Layout Manager (widget must be an object).

<pre>OCBNET.Layout.del(widget)</pre>

Remove the widget from the Layout Manager (widget must be same object as on add).

<pre>OCBNET.Layout.schedule(delay, reset)</pre>

Schedule a delayed layout run in X miliseconds. Optional argument to reset already scheduled update.
If you reset the scheduler to fast you may not get a layout update in a long time. Uses
RequestAnimationFrame if available to redo the layout.

### Widget methods

A widget must be an object and should define a function on the reserved keyword (all optional).
We pass a data object to all functions with each layout run for you to store your data there.
The force flag will also be present on this data object (data.force).

<pre>{ 'preLayout' : function (data) { if (data.force) {} } }</pre>

Read and store the values needed to redo the layout (do not adjust browser elements).

<pre>{ 'updateLayout' : function (data) { if (data.force) {} } }</pre>

Use stored values to redo the layout (do not measure any browser elements).

<pre>{ 'postLayout' : function (data) { if (data.force) {} } }</pre>

Optional step to do some tidy up after all widgets are updated.


### Demos

Resize the browser window until the content will overflow and see what happens!

 - http://www.ocbnet.ch/github/layout/demo/demo.html
 - http://www.ocbnet.ch/github/layout/demo/broken.html

Note: IE9 shows a bug with the fluid images in the demo.
