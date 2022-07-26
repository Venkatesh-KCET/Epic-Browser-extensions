$( document ).ready( function() {
  url = $( location ).attr( 'href' );

  //Event Click: More formats
  $( document ).on( 'click', '#btnMore', function() {
    $( this ).remove();
    $( '#tableMore' ).removeClass( 'hide' );
  });

  //Event form: Get video from url
  $( '#getVideo' ).submit( function( e ) {
    e.preventDefault();
    GetUrl();
  });

  //Event: Change page
  $( window ).on( 'hashchange', function() {
    main( getPage() );
  });

  //Get request with get vars or not
  if( url.split( '?' ).length != 1 ) {
    $( '#vidoeUrl' ).val( url.substr( url.indexOf( '?' ) + 1, url.length ) );
    $( location ).attr( 'hash','#Get' );
  } else {
    main( getPage() );
  }
});

function main( page ) {

    initUI();
    loadPage( page );
}

function initUI() {
  //Containers
  $( '#main' ).hide();
  $( '#get' ).hide();
  $( '#extractors' ).hide();
  $( '#settings' ).hide();
  $( '#loading' ).show();

  //Buttons
  $( '#btnExtractors' ).removeClass( 'active' );
  $( '#btnSettings' ).removeClass( 'active' );

  //Status
  $( '#alertLoading' ).hide();
  $( '#imgLoading' ).show();

  //Remove old tags
  $( '.remove' ).remove();
}

function getPage() {
  if( $( location ).attr( 'hash' ) == '' ) {
    return 'Settings';
  } else {
    return $( location ).attr( 'hash' ).substr( 1 );
  }
}

function loadPage( page ) {
  switch( page ) {
    case 'Main':       loadMain();       break;
    case 'Alert':       loadAlert();       break;
  }
}

function loadMain() {
  $.get( 'version.txt', function( version ) {
      $( '#hMain' ).append( ' <small class="remove">' + version + '</small>' );
      $( '#loading' ).hide();
      $( '#main' ).show();
  });
}

function loadAlert() {
  $.get( 'version.txt', function( version ) {
      $( '#hMain' ).append( ' <small class="remove">' + version + '</small>' );
      $( '#loading' ).hide();
      $( '#main' ).show();
  });
}

function getAPIURL() {
  return 'https://vd2.epicbrowser.net/?';
}

function GetUrl() {
  var baseurl = getAPIURL()
  var vidurl = $( '#vidoeUrl' ).val();

  location.href = baseurl + vidurl;
}