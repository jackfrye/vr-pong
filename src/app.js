import * as THREE from 'three/build/three.module.js';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

var clock = new THREE.Clock();

var container;
var camera, scene, raycaster, renderer;

var room;

var controller, controllerGrip, tempMatrix = new THREE.Matrix4();
var INTERSECTED;

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x505050 );

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
  camera.position.set( 0, 1.6, 3 );
  scene.add( camera );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  container.appendChild( renderer.domElement );

  //

  function onSelectStart() {

    this.userData.isSelecting = true;

  }

  function onSelectEnd() {

    this.userData.isSelecting = false;

  }

  controller = renderer.xr.getController( 0 );
  controller.addEventListener( 'selectstart', onSelectStart );
  controller.addEventListener( 'selectend', onSelectEnd );
  controller.addEventListener( 'connected', function ( event ) {

    this.add( buildController( event.data ) );

  } );
  controller.addEventListener( 'disconnected', function () {

    this.remove( this.children[ 0 ] );

  } );
  scene.add( controller );

  var controllerModelFactory = new XRControllerModelFactory();

  controllerGrip = renderer.xr.getControllerGrip( 0 );
  controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
  scene.add( controllerGrip );

  window.addEventListener( 'resize', onWindowResize, false );

  //

  document.body.appendChild( VRButton.createButton( renderer ) );

}

function buildController( data ) {

  switch ( data.targetRayMode ) {

    case 'tracked-pointer':

      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
      geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

      var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors, blending: THREE.AdditiveBlending } );

      return new THREE.Line( geometry, material );

    case 'gaze':

      var geometry = new THREE.RingBufferGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
      var material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
      return new THREE.Mesh( geometry, material );

  }

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

  renderer.setAnimationLoop( render );

}

function render() {

  var delta = clock.getDelta() * 60;

  // find intersections

  tempMatrix.identity().extractRotation( controller.matrixWorld );

  raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
  raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

  renderer.render( scene, camera );

}
