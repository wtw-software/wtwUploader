<!DOCTYPE>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>WTWUploader</title>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
<script type="text/javascript" src="js/wtwUploader.js"></script>
<script type="text/javascript">
/*
postDrop = function( files ) {
	return true;
};

postUpload = function( response ) {
	$( "#file_" + response.id ).slideUp( "normal", function() {
		$( this ).remove();
	} );
	$( "#dropZone" ).wtwUploader( "removeFile", reponse.id );
};

preUpload = function( id ) {
	
};

uploadError = function( response ) {
	$( "#dropZone" ).wtwUploader( "removeAll" );
	$( ".dFile" ).remove();
}

var options = {
	supports: [
	 'image/jpg',
	 'image/jpeg',
	 'image/png'
	 ],
	url: 'upload.php',
	postDrop: postDrop,
	postUpload: postUpload,
	preUpload: preUpload,
	uploadError: uploadError
};
*/


$( document ).ready( function() {
	$.event.props.push('dataTransfer');
	$("#dropZone").wtwUploader({url: "upload.php"});
});
</script>
<link href="css/style.css" type="text/css" rel="stylesheet" />
</head>
<body lang="en">
<div id="dropZone" class="uploadArea">
	
</div>
<input type="button" value="Upload files" />
<div id="dropZone2" class="uploadArea">
	
</div>
<input type="button" value="Upload files" />
</body>
</html>