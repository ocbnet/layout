
// @@@ toggle @@@
// toggle widget/image
function toggle()
{

	// toggle image/widget
	jQuery('DIV.image').toggle();
	jQuery('DIV.widget').toggle();

	// re-layout
	OCBNET.Layout()

}
// @@@ EO toggle @@@


// @@@ animate @@@
// aniamte viewport
function animate()
{

	function start ()
	{

		jQuery('DIV.wrapper')
		.stop(false, false)
		.animate({
			'margin-left': '100px',
			'margin-right': '100px'
		}, {
			duration: 2000,
			complete: function ()
			{
				OCBNET.Layout();
				stop();
			},
			step: OCBNET.Layout
		});
	}

	function stop ()
	{
		jQuery('DIV.wrapper')
		.stop(false, false)
		.animate({
			'margin-left': '200px',
			'margin-right': '200px'
		}, {
			duration: 2000,
			complete: function ()
			{
				OCBNET.Layout();
				start();
			},
			step: OCBNET.Layout
		});
	}

	start();

}
// EO animate