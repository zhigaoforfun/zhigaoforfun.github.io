	var ThreeDScene = {
		createNew: function()
		{
			var threedScene = {};

			threedScene.well = {};
			threedScene.mainDomFilter = "#maincontainer";
			threedScene.threedDomFilter = '#threescene';
			threedScene.compassDomFilter = "#compasscontainer";
			
			var radius = 8000;
			var compassRadius = 100;
			var wellController = {
					boreholeRadius: 50
			};

			var controls, maincamera, mainscene, mainrender;
			var well;
			var compasscamera, compassscene, compassrender;

			var self;
			threedScene.init = function(containerFilter) {
				$( containerFilter ).append("<div id =\"threescene\" > <div id=\"maincontainer\" ></div> <div id=\"compasscontainer\"></div></div>" );
				self = this;
				initGUI()
				makeMainScene(radius);
				makeCompassScene(compassRadius);
				window.addEventListener( 'resize', onWindowResize, false );
				animate();
			}
			threedScene.updateLayout = function()
			{
				update3DLayout();
			}

			function initGUI() {
				var gui = new dat.GUI( { autoPlace: false } );
				gui.domElement.id = 'datGUI';
				$(self.threedDomFilter).prepend($(gui.domElement));
				gui.add( wellController, "boreholeRadius", 10, 100 ).onChange( function( value ) {
					if (well!=null)
					{
						well.boreholeRadius = value;
						well.updateMesh(radius / 2);
						render();
					}
				});

			}
				
			function makeCompassScene(compassSize)
			{
				var compasscontainer = $( self.compassDomFilter )[0];
				compassrender = new THREE.WebGLRenderer();
				compasscontainer.appendChild( compassrender.domElement );
				compassrender.setSize( compassSize, compassSize );
				compassscene = new THREE.Scene();
				compasscamera = new THREE.PerspectiveCamera( 45, 1, 1, compassSize * 10);
				compasscamera.up = maincamera.up;
				compassscene.add( compasscamera );
				compasscamera.position.z = compassSize * 1.75;
				compassscene.add( makeCoordinateArrows(compassSize * 0.6) );
			}
			
			function makeMainScene(radius)
			{
				var maincontainer = $(self.mainDomFilter)[0];

				maincamera = new THREE.PerspectiveCamera( 45, $(self.mainDomFilter).width()/$(self.mainDomFilter).height(), 1, radius * 12.5 );
				maincamera.position.y = -radius * 2.2;
				maincamera.up = new THREE.Vector3( 0, 0, 1 );
				
				controls = new THREE.OrbitControls( maincamera, maincontainer );
				// How far you can orbit vertically, upper and lower limits.
				// Range is 0 to Math.PI radians.
				controls.minPolarAngle = - Infinity // radians
				controls.maxPolarAngle = Infinity; // radians

				// How far you can orbit horizontally, upper and lower limits.
				// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
				controls.minAzimuthAngle = - Infinity; // radians
				controls.maxAzimuthAngle = Infinity; // radians
				
				mainrender = new THREE.WebGLRenderer( { antialias: true } );
				maincontainer.appendChild( mainrender.domElement );
				
				mainscene = new THREE.Scene();
				mainscene.add( makeBoundaryBox(radius / 2) );

				well = Well3D.createNew();
				well.color = 0x00ff00;
				well.surveyData = surveyData1;
				mainscene.add(well.makeMesh(radius / 2));

				mainrender.setPixelRatio( window.devicePixelRatio );
				
				mainrender.setSize($(self.mainDomFilter).width(), $(self.mainDomFilter).height() );

				mainrender.gammaInput = true;
				mainrender.gammaOutput = true;
			}

			function makeBoundaryBox(halfradious)
			{
				var r = halfradious * 2;
				var group =  new THREE.Object3D();
				var boundarybox = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( r, r, r ) ) );
				boundarybox.material.color.setHex( 0x080808 );
				boundarybox.material.blending = THREE.AdditiveBlending;
				boundarybox.material.transparent = true;
				group.add(boundarybox);
				
				var gridXZ = new THREE.GridHelper(halfradious, halfradious/5);
				gridXZ.setColors( new THREE.Color(0x001100), new THREE.Color(0x001100) );
				gridXZ.position.set( 0,halfradious,0 );
				group.add(gridXZ);
				
				var gridXY = new THREE.GridHelper(halfradious, halfradious/5);
				gridXY.position.set( 0,0,-halfradious );
				gridXY.rotation.x = Math.PI/2;
				gridXY.setColors( new THREE.Color(0x000011), new THREE.Color(0x000011) );
				group.add(gridXY);

				var gridYZ = new THREE.GridHelper(halfradious, halfradious/5);
				gridYZ.position.set( -halfradious,0,0 );
				gridYZ.rotation.z = Math.PI/2;
				gridYZ.setColors( new THREE.Color(0x110000), new THREE.Color(0x110000) );
				group.add(gridYZ);
				return group;
			}
			
			/* COORDINATE ARROWS */
			function makeCoordinateArrows(comrassSize) {
				var coordinateArrows = new THREE.Object3D();
				var org = new THREE.Vector3( 0, 0, 0);
				var dir = new THREE.Vector3( 0, 0, 1 );
				coordinateArrows.add( new THREE.ArrowHelper( dir, org, comrassSize, 0x0000FF ) ); // Blue = z
				dir = new THREE.Vector3( 0, 1, 0 );
				coordinateArrows.add( new THREE.ArrowHelper( dir, org, comrassSize, 0x00FF00 ) ); // Green = y
				dir = new THREE.Vector3( 1, 0, 0 );
				coordinateArrows.add( new THREE.ArrowHelper( dir, org, comrassSize, 0xFF0000 ) ); // Red = x
				return coordinateArrows;
			}
		
			function update3DLayout()
			{
				// $('#threedcontainer').height(window.innerHeight/2);
 			// 	$('#maincontainer').height($('#threedcontainer').height() - $('#datGUI').height());

				maincamera.aspect =$(self.mainDomFilter).width()/$(self.mainDomFilter).height();
				mainrender.setSize( $(self.mainDomFilter).width(), $(self.mainDomFilter).height());
				maincamera.updateProjectionMatrix();
			}
		
			function onWindowResize() {
				update3DLayout();
	
			}

			function animate() {
				requestAnimationFrame( animate );
				compasscamera.position.copy( maincamera.position );
				compasscamera.position.sub( controls.target ); // added by @libe
				compasscamera.position.setLength( 175 );
				compasscamera.lookAt( compassscene.position );
				render();
			}

			function render() {
				mainrender.render( mainscene, maincamera );
				compassrender.render(compassscene, compasscamera);
			}
			return threedScene;
		}
	}