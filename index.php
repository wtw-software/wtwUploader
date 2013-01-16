<!DOCTYPE>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>WTWUpload</title>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
<script type="text/javascript" src="js/wtwUploader.js"></script>
<script type="text/javascript">

// Whatever you want to do after dropping files to #dropZone
postDrop = function( files ) {

};

// Whatever you want to do after uploading a file
// Response is what was given to $.ajax.success (json)
// {id: "123"} is an example of such a response
postUpload = function( response ) {
	$( "#file_" + response.id ).slideUp( "normal", function() {
		$( this ).remove();
	} );
	//Note, you have to remove the file so it's not uploaded again
	$( "#dropZone" ).wtwUploader( "removeFile", reponse.id );
};

// Whatever you want to do before uploading a file
// Id is the id of the file
preUpload = function( id ) {
	
};

// When uploading a file failed (response.error)
// Response is what was given to $.ajax.success (json)
// {error: "msg"} is an example of such a response
uploadError = function( response ) {
	//Note, you have to remove all files on error
	$( "#dropZone" ).wtwUploader( "removeAll" );
	$( ".dFile" ).remove();
}

var options = {
	supports: {
		'image/jpg',
		'image/jpeg',
		'image/png'	
	},
	url: 'upload.php',
	postDrop: postDrop,
	postUpload: postUpload,
	preUpload: preUpload,
	uploadError: uploadError
};

$( document ).ready( function() {
	$( "#dropZone" ).wtwUploader( options );
});
</script>

<link href="css/style.css" type="text/css" rel="stylesheet" />
</head>
<body lang="en">
<center><h1 class="title">Multiple Drag and Drop File Upload</h1></center>
<div id="dragAndDropFiles" class="uploadArea">
	<h1>Drop Images Here</h1>
</div>
<form name="demoFiler" id="demoFiler" enctype="multipart/form-data">
<input type="file" name="multiUpload" id="multiUpload" multiple />
<input type="submit" name="submitHandler" id="submitHandler" value="Upload" class="buttonUpload" />
</form>
<div class="progressBar">
	<div class="status"></div>
</div>
</body>
</html>