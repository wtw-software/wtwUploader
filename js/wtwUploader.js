(function( $ ) {
  $.event.props.push( 'dataTransfer' )
  //$.support.xhrFileUpload = !!(window.XMLHttpRequestUpload && window.FileReader);
  //$.support.xhrFormDataFileUpload = !!window.FormData;
  
  function FileObject() {
    this.id = null
    this.name = null
    this.size = null
    this.type = null
    this.fileListIndex = null
    this.fileListsIndex = null
    this.userData = {}
  }

  function Uploader( el, opts ) {
    var self = this
    this.el = el
    this.options = opts
    this.idCounter = 1
    this.fileObjects = {}
    this.fileLists = []
    this.el.bind( 'dragover', dragoverHandler )
    this.el.bind( 'drop', function() { 
      dropHandler.apply(self, arguments) 
    } )
  }

  Uploader.prototype.uploadFile = function( fileId ) {
    if ( !(fileId in this.fileObjects) ) {
      $.error( 'jQuery.wtwUploader method uploadFile - invalid fileId' )
      return this.el
    }
    var fileObject = this.fileObjects[ fileId ]
    var file = this.fileLists[ fileObject.fileListsIndex ][ fileObject.fileListIndex ]
    POSTFile.call( this, file, fileObject.id, fileObject.userData )
    return this.el
  }

  Uploader.prototype.uploadFiles = function() {
    for ( var id in this.fileObjects ) {
      var fileObject = this.fileObjects[ id ]
      var file = this.fileLists[ fileObject.fileListsIndex ][ fileObject.fileListIndex ]
      POSTFile.call( this, file, fileObject.id, fileObject.userData )
    }
    return this.el
  }

  Uploader.prototype.removeFiles = function() {
    this.fileObjects = {}
    return this.el
  }

  Uploader.prototype.removeFile = function( fileId ) {
    if ( !(fileId in this.fileObjects) ) {
      $.error( 'jQuery.wtwUploader method removeFile - invalid fileId' )
      return this.el
    }
    delete this.fileObjects[ fileId ]
    return this.el
  }

  Uploader.prototype.setFileData = function( fileId, data ) {
    if ( !(fileId in this.fileObjects) ) {
      $.error( 'jQuery.wtwUploader method setFileData - invalid fileId' )
      return this.el
    }
    this.fileObjects[ fileId ].userData = data
    return this.el
  }

  Uploader.prototype.getFileData = function( fileId ) {
    if ( !(fileId in this.fileObjects) ) {
      $.error( 'jQuery.wtwUploader method getFileData - invalid fileId' )
      return null
    }
    var copy = $.extend( true, {}, this.fileObjects[ fileId ].userData )
    return copy
  }

  Uploader.prototype.getFiles = function() {
    var copy = $.extend( true, {}, this.fileObjects)
    return copy
  }

  Uploader.prototype.getFile = function( fileId ) {
    if ( !(fileId in this.fileObjects) ) {
      $.error( 'jQuery.wtwUploader method getFile - invalid fileId' )
      return null
    }
    var copy = $.extend( true, {}, this.fileObjects[ fileId ])
    return copy
  }

  function validate( file ) {
    return ( !("supports" in this.options) || this.options.supports.length == 0 ) ?
      true : file.type in this.options.supports
  }

  function dropHandler( e ) {
    e.stopPropagation()
    e.preventDefault()
    var files = e.dataTransfer.files
    var added = addFiles.call( this, files )
    var success = true
    if ( "postDrop" in this.options && $.isArray(this.options.postDrop) ) {
      for ( var i in this.options.postDrop ) {
        if ( this.options.postDrop[i](added) === false ) {
          success = false
          break
        }
      }
    } else if ( "postDrop" in this.options && 
        this.options.postDrop(added) === false ) {
      success = false
    }
    if ( !success ) {
      for ( var i in added ) {
        delete fileObjects[ added[i].id ]
      }
    }
  }

  function dragoverHandler( e ) {
    e.stopPropagation()
    e.preventDefault()
    return false
  }

  function ajaxSuccess( response, id ) {
    var file = this.getFile( id )
    this.removeFile( id )
    if ( "postUpload" in this.options && $.isArray(this.options.postUpload) ) {
      for ( var i in this.options.postUpload ) {
        this.options.postUpload[ i ]( file, response )
      }
    } else if ( "postUpload" in this.options ) {
      this.options.postUpload( file, response )
    }
  }

  function POSTFile( file, id, data ) {
    if ( typeof file != "undefined" && validate.call(this,file) ) {
      var form = new FormData()
      form.append( 'file', file )
      form.append( 'id', id )
      for ( key in data ) {
        form.append( key, data[key] )
      }
      var success = true
      if ( "preUpload" in this.options && $.isArray(this.options.preUpload) ) {
        for ( var i in this.options.preUpload ) {
          if ( this.options.preUpload[i](id) === false ) {
            success = false
            break
          }
        }
      } else if ( "preUpload" in this.options && 
          this.options.preUpload(id) === false ) {
        success = false
      }
      if ( success ) {
        var self = this
        $.ajax( {
          type: 'POST',
          url: this.options.url,
          data: form,
          dataType: 'json',
          contentType: false,
          cache: false,
          processData: false,
          success: function( response ) { 
            ajaxSuccess.call( self, response, id ) 
            }
        } )
      } //else - do nothing
    } else {
      $.error( 'jQuery.wtwUploader - invalid file type - ' + file.name )
    }
  }

  function addFiles( files ) {
    var added = []
    if ( files.length == 0 ) {
      return added
    }
    this.fileLists.push( files )
    var fileListsIndex = this.fileLists.length - 1
    for ( var i = files.length; i-- > 0; ) {
      var file = files[ i ]
      var fileObject = new FileObject()
      var id = this.idCounter++
      fileObject.id = id
      fileObject.name = file.name
      fileObject.size = file.size
      fileObject.type = file.type
      fileObject.fileListsIndex = fileListsIndex
      fileObject.fileListIndex = i
      this.fileObjects[ id ] = fileObject
      added.push( fileObject )
    }
    return added
  }

  $.fn.wtwUploader = function( method ) {
    if ( !(window.File && window.FileReader && window.FileList && window.Blob) ) {
      $.error ( 'No browser support for jQuery.wtwUploader' );
    } else {
      var uploader = this.data( 'wtwUploader' );
      if ( method === 'destroy' && uploader ) {
        uploader.el.unbind()
        $( this ).removeData( 'wtwUploader' )
        return this
      } else if ( !uploader ) {
        if ( typeof method !== 'object' || !("url" in method) ) {
          $.error( 'jQuery.wtwUploader needs to init with required options for element ' + $(this).selector )
          return this
        } else {
          uploader = new Uploader( $(this), method );
          $( this ).data( 'wtwUploader', uploader )
          return this
        }
      } else if ( Uploader.prototype.hasOwnProperty(method) ) {
        return uploader[ method ].apply( uploader, Array.prototype.slice.call(arguments, 1) )
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.wtwUploader' );
      }
    } 
  }
} )( jQuery )

//TODO: have som type of invalidFile cb