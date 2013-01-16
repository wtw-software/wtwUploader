// Object for files
function FileObject() {}

// Should be used as a read-only object by user
FileObject.prototype = {
  id: null,
  name: null,
  size: null,
  type: null,
  fileListIndex: null,
  fileListsIndex: null,
  userData: {}
};

// The plugin
(function( $ ) {

  // Mime types that are supported by default,
  // empty array means all types
  var supports = [];

  // The methods that are supported by this plugin
  var methods = {};

  // The handlers for the events
  var handlers = {};

  // Private methods/functions
  var functions = {};

  // Options given on init
  var options = {};

  // Dictionary of FileObjects (the files that will be uploaded)
  var fileObjects = {};

  // Array of files stored in FileLists (read-only object)
  // Files here may never be uploaded (because the user choose to remove after drop)
  var fileLists = [];

  // Like an auto-increment counter for IDs
  var idCounter = 1;

  // Function to add files to upload object
  functions.addFiles = function( files ) {
    var added = [];

    // We dont want to push empty array
    if ( files.length == 0 ) {
      return added;
    }

    fileLists.push( files );
    fileListsIndex = fileLists.length - 1;
    for ( var i in files ) {
      fileListIndex = i;
      var file = files[ i ];
      var fileO = new FileObject();
      var id = idCounter++; 
      fileO.id = id;
      fileO.name = file.name;
      fileO.size = file.size;
      fileO.type = file.type;
      fileO.fileListsIndex = fileListsIndex;
      fileO.fileListIndex = fileListIndex;

      // Adds the FileObject to be uploaded
      fileObjects[ id ] = fileO;
      added.push( fileO );
    }

    return added;
  };

  functions.validate = function( file ) {
    return (support.length == 0) ? true : file.type in support;
  };

  // Function to POST a file
  functions.POSTFile = function( file, id, data ) {
    if ( typeof file != undefined && functions.validate(file) ) {
      var form = new FormData();
      form.append( file );
      form.append( 'id', id );

      // Adds the userdata
      for ( key in data ) {
        form.append( key, data[key] );
      }

      var success = true;
      // Checks for any preUpload function(s)
      if ( preUpload in options && $.isArray(options.preUpload) ) {
        for ( var i in options.preUpload ) {
          if ( typeof options.preUpload[i] != 'function' ||
            !options.preUpload[i](id) ) {
            success = false;
            break;
          }
        }
      } else if ( typeof options.preUpload == 'function' ) {
        if ( !options.preUpload(id) ) {
          success = false;
        }
      }
      if ( success ) {
        $.ajax({
          type: 'POST',
          url: options.url,
          data: form,
          dataType: 'json', //options.dataType
          success: function( response ) {
            if ( $.isEmptyObject(response) ||  
                ("error" in response && 
                uploadError in options &&
                typeof options.uploadError == 'function') ) {
                options.uploadError( response );
            } else if ( postUpload in options &&
                  typeof options.postUpload == 'function' ) {
                options.postUpload( response );
              }
            }
          }
        });
      } //else don't care
    } else {
      $.error ( 'jQuery.wtwUploader - invalid file type - ' + file.name );
    }
  };

  // Handler for dragover
  handlers.dragover = function( e ) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  };

  // Handler for dropping (adding) files
  handlers.drop = function( e ) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;

    // We just add the files and then remove if postDrop doesn't return true
    var added = functions.addFiles( files );

    // Checks if there should be any postDrop functions(s)
    // Typically for creating HTML that shows list of files etc
    var success = true;
    if ( postDrop in options && $.isArray(options.postDrop) ) {
      for ( var i in options.postDrop ) {
        if ( typeof options.postDrop[i] != 'function' || 
          !options.postDrop[i](added) ) {
          success = false;
          break;
        }
      }
    } else if ( typeof options.postDrop == 'function' ) {
      if ( !options.postDrop(added) ) {
        success = false;
      }
    }
    if ( !succes ) {
      for ( var i in added ) {
        var id = added[i].id;
        if ( id in fileObjects ) {
          delete fileObjects[id];
        }
      }
    }
  };

  // Init
  methods.init = function( opts ) {
    // Make options available for handlers and private functions
    options = opts;

    // We start by checking if every option is included
    if ( false ) {
      $.error ( 'jQuery.wtwUploader - options are missing' );
      return this;
    }

    // Override default mime types if optional types are provided
    if ( supports in options ) {
      supports = options.supports;
    }

    // Bind event for dragover
    $( this ).bind( 'dragover', dragover );

    // Bind event for drop
    $( this ).bind( 'drop', drop );

    return this;
  }

  // Method for uploading all files
  methods.upload = function() {
    for ( var id in fileObjects ) {
      var fileO = fileObjects[ id ];
      var file = fileLists[ fileO.fileListsIndex ][ fileO.fileListIndex ];
      functions.POSTFile( file, fileO.id, fileO.userData );
    }
    return this;
  };

  // Method for removing all files
  methods.removeAll = function() {
    fileObjects = {};
    return this;
  };

  // Method for removing one file
  methods.removeFile = function( fileId ) {
    if ( !fileId in fileObjects ) {
      $.error( 'jQuery.wtwUploader method removeFile - invalid fileId' );
      return this;
    }
    delete fileObjects[ fileId ];
    return this;
  };

  // Method that lets the plugin-user set data to files,
  // that will be posted in the ajax
  methods.setData = function( fileId, data ) {
    if ( !fileId in fileObjects ) {
      $.error( 'jQuery.wtwUploader method setData - invalid fileId' );
      return this;
    }
    fileObjects[ fileId ].userData = data;
    return this;
  };

  // Method to get data on a file - not chainable
  methods.getData = function( fileId ) {
    if ( !fileId in fileObjects ) {
      $.error( 'jQuery.wtwUploader method getData - invalid fileId' );
      return null;
    }
    return fileObjects[ fileId ].userData;
  };

  $.fn.wtwUploader = function( method ) {
    // Checks browser support
    if ( ! ( window.File && 
             window.FileReader && 
             window.FileList && 
             window.Blob ) ) {
      $.error ( 'No browser support for jQuery.wtwUploader' );
    } else {
      if ( methods[ method ] ) {
        return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.wtwUploader' );
      }
    } 
  };
} )( jQuery );


/* Dont need this
  functions.guid = function() {
    var S4 = function() {
      return Math.floor(
        Math.random() * 0x10000
        ).toString(16);
    };

    return (
      S4() + S4() + "-" +
      S4() + "-" +
      S4() + "-" +
      S4() + "-" +
      S4() + S4() + S4()
    );
  }
  */