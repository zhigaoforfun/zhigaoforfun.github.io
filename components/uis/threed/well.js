　var Well3D = {
	　　　　createNew: function(){
		　　　　　　var well = {};
		　　　　　　well.name = "My Test Well";
					well.color = 0x00ff00;
					well.boreholeRadius = 50;
					
					well.surveyData = new Array([]);
					well.mesh;
					
					well.makeMesh = function(rHalf){
						var points = prepareVectors(this.surveyData, rHalf);
						var tubeGeometry = new THREE.TubeGeometry(new THREE.SplineCurve3(points), 100, this.boreholeRadius, 18, false);
						var meshMaterial = new THREE.MeshBasicMaterial({color: this.color, transparent: false});
						var wireFrameMat = new THREE.MeshBasicMaterial();
						this.mesh = THREE.SceneUtils.createMultiMaterialObject(tubeGeometry, [meshMaterial]);
						return  this.mesh;
					}
					
					well.updateMesh = function(rHalf){
						
						var points = prepareVectors(this.surveyData, rHalf);
						var tubeGeometry = new THREE.TubeGeometry(new THREE.SplineCurve3(points), 100, this.boreholeRadius, 18, false);
						
						for (var i =0; i < tubeGeometry.vertices.length; i++)
						{
							this.mesh.children[0].geometry.vertices[i].x = tubeGeometry.vertices[i].x;
							this.mesh.children[0].geometry.vertices[i].y = tubeGeometry.vertices[i].y;
							this.mesh.children[0].geometry.vertices[i].z = tubeGeometry.vertices[i].z;
						}
						this.mesh.children[0].geometry.verticesNeedUpdate = true;
						return this.mesh;
					}
					
					function prepareVectors(surveyData, rHalf)
					{
						var points =[];
						for (var i = 0; i < surveyData.length; i++)
						{
							var point = surveyData[i];
							points.push(new THREE.Vector3(point[0], point[1], point[2] + rHalf));
						}
						return points;
					}
		　　　return well;
	　　　　}
　　};