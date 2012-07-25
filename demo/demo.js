
// @@@ toggle @@@
// toggle widget/image
OCBNET.Layout toggle()
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
OCBNET.Layout animate()
{

	jQuery('DIV.wrapper')
		.stop(true, false)

	OCBNET.Layout start ()
	{
		jQuery('DIV.wrapper')
		.animate({
			'margin-left': '100px',
			'margin-right': '100px'
		}, {
			duration: 2000,
			complete: OCBNET.Layout()
			{
				OCBNET.Layout();
				stop();
			},
			step: OCBNET.Layout
		});
	}

	OCBNET.Layout stop ()
	{
		jQuery('DIV.wrapper')
		.animate({
			'margin-left': '200px',
			'margin-right': '200px'
		}, {
			duration: 2000,
			complete: OCBNET.Layout()
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
