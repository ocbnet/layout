OCBNET Layout Manager
=====================

This utility class abstracts the complex logic to layout all widgets on a html page correctly.
It will handle the browser resize event for you and dispatch layout methods for on each widget.

So whats the problem?
=====================

Handling the layout by yourself is easy, you may say. The most common approach is to bind to the
resize event for every instance you create. On the resize event you measure the available width and
would resize the widget accordingly. This will works in most situations, but has a very ugly race
condition when the browser decides to add a scrollbar after you laid out your widget. You can see
this behaviour on the "broken" demo page.

How to fix the mess?
====================

I realized quite soon that there is no "perfect" layout in this situation. But I didn't had a clue
how to solve this problem until I realized that a browser should have the same problem when it has
to layout a fluid image (width 100% and height auto). It seems quite obvious now that the solution
is to force the scrollbar to be shown in this situation.

Anything more to look out for?
======

Multiple widgets on a page that re-layout themselve on resize will cause another race condition.
Imagine the second widget increases it's height which would trigger the scrollbar to appear. All
other widgets would need to re-layout again. Maybe the first widget would get so small that the
scrollbar would disappear again. So widget 2 would need a re-layout then. You are basically
begging for an endless loop. It may look funky but certainly not the way you would want it to.

So what's the magic trick?
======

You need a central Layout Manager to handle all your widgets. Each widget is laid out in two phases.
First it should read and store all values that are needed for the layout. The second phase only
should use those values to do the actual layout. In the demo this would mean reading the width first
and setting the height in the second phase. The Layout Manager will dispatch each phases for all
widgets, so all widgets first read their values before updating something.

A little more about scrollbar detection
======

To solve the scrollbar race condition we have to run quite an exspensive check. The Layout Manager
will check if the browser viewport has changed after it has laid out all known widgets. It will then
go for another run to layout all widgets with the new viewport dimensions. Another check will be made
to catch the scrollbar race condition. In this case we will force a scrollbar and redo the layout
once again. Resizing can be quite jerky when this condition is happening. The best way to avoid the
performance penalty is to force a scrollbar to show all the time (css overflow).

How do I use it?
======

The Layout Manager must not be instantiated. It's a static "class", basically just a bunch of static
functions with static data. This makes sense since we want to manage all widget instances on a page.

What is a widget?
======

The widgets you register can be simple objects or instantiated objects. To work with the Layout Manager
these objects need to have preLayout, updateLayout and postLayout set to functions. The Manager will
always call them in the context of the widget. On preLayout you should read all values / dimensions and
on updateLayout you can adjust your widget elements.

Utility Functions
======

<pre>OCBNET.Layout(force)</pre>

Main function to layout all widgets. Take an optional argument force which is passed to each layout method.

<pre>OCBNET.Layout.add(widget)</pre>

Add another widget to the Layout Manager (widget must be an object).

<pre>OCBNET.Layout.del(widget)</pre>

Remove the widget from the Layout Manager (widget must be same object as on add).

<pre>OCBNET.Layout.schedule(delay, reset)</pre>

Schedule a delay in X miliseconds. Optional argument to reset already scheduled update.

Widget methods
======

A widget must be an object and should define function on reserved keywords. All methods are optional.

<pre>{ 'preLayout' : function (data) { if (data.force) {} } }</pre>

Read the values needed to do the layout.

<pre>{ 'updateLayout' : function (data) { if (data.force) {} } }</pre>

Use readed values to do the layout.

<pre>{ 'postLayout' : function (data) { if (data.force) {} } }</pre>

Optional step to do some tidy up.


Demo
======

Resize the browser window until the content will overflow and see what happens!