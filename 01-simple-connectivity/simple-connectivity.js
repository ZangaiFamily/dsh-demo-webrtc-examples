const log = msg => {
	$( '.output' ).append( '<li>' + msg + '</li>' );
};

log( 'connecting to deepstreamHub' );

const ds = deepstream( 'wss://013.deepstreamhub.com?apiKey=d02f8752-7d26-4cf0-965a-90c21536410f' ).login( null, success => {
	
	const userName = 'user/' + ds.getUid();

	const isInitiator = document.location.hash === '#initiator';

	log( 'connected to deepstreamHub' );

	log( `${isInitiator ? 'initiating' : 'awaiting'} peer connection as ${userName}` );

	const p2pConnection = new SimplePeer({
		initiator: isInitiator
	});

	p2pConnection.on( 'error', error => {
		log( 'error: ' + error );
	});

	p2pConnection.on( 'signal', signal => {
		ds.event.emit( 'rtc-signal', {
			sender: userName,
			signal: signal
		});
	});

	ds.event.subscribe( 'rtc-signal', msg => {
		if( msg.sender !== userName ) {
			p2pConnection.signal( msg.signal );
		}
	});

	p2pConnection.on( 'connect', () => {
		log( 'webrtc datachannel connected' );
		p2pConnection.send( 'Hello from user ' + userName );
	});

	p2pConnection.on( 'close', () => {
		log( 'webrtc datachannel closed' );
	});

	p2pConnection.on( 'data', data => {
		log( 'received data <b>' + data + '</b>' );
	});
});