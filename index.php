<!DOCTYPE>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>WTWUploader</title>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
	<script type="text/javascript" src="js/wtwUploader.js"></script>
	<script type="text/javascript">
	$( document ).ready( function() {
		$( "#dropZone" ).wtwUploader( {
			url: "upload.php",
			postUpload: postUpload,
			postDrop: postDrop,
			preUpload: preUpload
		} );
		$( "#upload" ).click(function() {
			$( "#dropZone" ).wtwUploader( 'uploadFiles' )
		})
	})

	// Add a representation (HTML) of the files
	function postDrop( files ) {
		for ( var i = files.length; i-- > 0; ) {
			var $dfile = $( "<div class='dfile' id='"+files[i].id+"'>" )
			var $dlabel = $( "<label>" )
			$dlabel.html( files[i].name )
			$dfile.append( "<img src='images/image.png' class='prev' />" )
			$dfile.append( $dlabel );
			$( "#dropZone" ).append( $dfile );
		}
	}

	// Remove uploaded file from the list
	function postUpload( file, response ) {
		$( "#"+file.id ).slideUp( "normal", function() { $( this ).remove()} )
	}

	// Add animation
	function preUpload( id ) {
		console.log(id)
		$( "#"+id ).append( $("<img src='images/ajax-loader.gif' class='progress' />") )
	}

	</script>
	<link href="css/style.css" type="text/css" rel="stylesheet" />
</head>
<body lang="en">
	<div id="content">
		<div id="dropZone" class="uploadArea">
			<div class="title">Drop files here</div>
		</div>
		<input type="button" value="Upload files" id="upload" />
	</div>
</body>
</html>