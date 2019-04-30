const http    = require( 'http' );
const express = require( 'express' );
const fs      = require( 'fs' );

var app = express();

app.use( express.static( 'img' ) );

http.createServer( function ( req, res ) {
	fs.readFile( 'index.php', function( err, data ) {
		res.writeHead( 200, { 'Content-Type': 'text/html' } );
		res.write( 'Hello, Melanie.' );
		res.end();
	} );
} ).listen( 8080 );

console.log( 'Server running at http://localhost:8080/' );