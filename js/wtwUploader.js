(function( $ ) {

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

  Uploader.prototype.upload = function() {
    for ( var id in this.fileObjects ) {
      var fileObject = this.fileObjects[ id ]
      var file = this.fileLists[ fileObject.fileListsIndex ][ fileObject.fileListIndex ]
      POSTFile.call( this, file, fileObject.id, fileObject.userData )
    }
    return this.el
  }

  Uploader.prototype.removeAllFiles = function() {
    this.fileObjects = {}
    return this.el
  }

  Uploader.prototype.removeFile = function( fileId ) {
    if ( !fileId in this.fileObjects ) {
      $.error( 'jQuery.wtwUploader method removeFile - invalid fileId' )
      return this
    }
    delete this.fileObjects[ fileId ]
    return this.el
  }

  Uploader.prototype.setFileData = function( fileId, data ) {
    if ( !fileId in this.fileObjects ) {
      $.error( 'jQuery.wtwUploader method setFileData - invalid fileId' )
      return this.el
    }
    this.fileObjects[ fileId ].userData = data
    return this.el
  }

  Uploader.prototype.getFileData = function( fileId ) {
    if ( !fileId in this.fileObjects ) {
      $.error( 'jQuery.wtwUploader method getFileData - invalid fileId' )
      return null
    }
    return this.fileObjects[ fileId ].userData
  }

  Uploader.prototype.getFiles = function() {
    return this.fileObjects
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
        $.ajax( {
          type: 'POST',
          url: this.options.url,
          data: form,
          dataType: 'json',
          contentType: false,
          cache: false,
          processData: false,
          success: function( response ) {
            if ( $.isEmptyObject(response) || !("id" in response) ) {
              $.error( 'jQuery.wtwUploader - please follow guidelines for server-side upload script ')
            } else {
              this.removeFile( response.id )
              if ( "error" in response ) {
                if ( "uploadError" in this.options ) {
                  this.options.uploadError( response.error )
                }
              } else if ( "postUpload" in this.options ) {
                if ( "responseData" in response ) {
                  this.options.postUpload( response.responseData )
                } else {
                  this.options.postUpload()
                }
              } else {
                $.error( 'jQuery.wtwUploader - error uploading file ')
              }
            }
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