class PriorityQueue{ //Sorts elements as they are inserted into array
    constructor(){
        this.queue = [];
    }
    enqueue(element, priority){
        this.queue.push({element, priority});
        this.queue.sort((a, b) => a.priority - b.priority);
    }
    dequeue(){
        if(this.isEmpty()) return null;
        return this.queue.shift().element;
    }
    isEmpty(){
        return this.queue.length === 0;
    }
}
var edges;
const edgeMap = new Map();
var nodes;
var destination;
var nextRoads = new PriorityQueue();
$.getJSON('./nodes.json', function(data){ //Load the node JSON data
    nodes = data.features;
    destination = nodes[14995]; 
});
$.getJSON('./edges.json', function(data) { // Load the edges JSON data
    edges = data.features;
    loadEdgeMap(); //Fills hashmap with roads
    loadQueue(nodes[0].geometry.coordinates.toString()); //Loads roads connected to starting node into priority queue
    
});
function loadQueue(startCoords){ //Queues starting roads
    edgeMap.get(startCoords).forEach((road) =>{
        nextRoads.enqueue(road, road.properties.length);
    });
}
var visited = new Map();
var roadsToShow = [];
var found = false;
function dijkstraShortestPath(map){ //Finds shortest path
    for(let i = 0; i <= 1; i++){ //To speed up animation
        if(found) return;
        road = nextRoads.dequeue();
        if(!road) return;
        roadsToShow.push(road); //Adds road to the array to be displayed on the map
        var roadCoords = road.geometry.coordinates;
        var endCoords = roadCoords[roadCoords.length - 1][0] + "," + roadCoords[roadCoords.length - 1][1]; //Gets last pair of coordinates
        var endNode = visited.get(endCoords);
        document.getElementById("debugLbl").innerHTML = "F";
        if(endNode){ //If the node has been visited
            requestAnimationFrame(() => {showRoad(map, 'blue', roadsToShow)}); //Show road
            requestAnimationFrame(dijkstraShortestPath);
            return;
        }
        var startNode = visited.get(roadCoords[0][0] + "," + roadCoords[0][1]); //Gets the node the road started at
        var distance = startNode ? startNode[1] + road.properties.length: road.properties.length; //Gets the total distance from the start point to the end of the road
        var path = startNode ? [...startNode[0], road] : [road]; //Gets and updates the path that's been taken to get to the node at the end of the road
        visited.set(endCoords,[path, distance]);
        if(endCoords == destination.geometry.coordinates){ //If destination is reached
            found = true;
            for(let i = 0; i < path.length; i++) requestAnimationFrame(() => {showRoad(map, 'red', path, 3)}); //Show shortest path
            return;
        }
        edgeMap.get(endCoords).forEach((newRoad) => { //Queue roads connecting to the node at the end of the current road
            if(road.id != newRoad.id) nextRoads.enqueue(newRoad, distance + newRoad.properties.length);
        });
        requestAnimationFrame(() => {showRoad(map, 'blue', roadsToShow)}); //Show road
        requestAnimationFrame(dijkstraShortestPath);
    }
}
function showRoad(map, color, arr, thickness = 1){ //Displays line on map
    var road = arr.pop();
    L.geoJSON(road, {
        style: {color: color, weight:  thickness}
    }).addTo(map);
}
function loadEdgeMap(){
    for(let i = 0; i < edges.length; i++){
        var coords = edges[i].geometry.coordinates; //The coordinate array for the road
        //Return the value in the hashmap for the first set of coordinates in the list. These coordinates will correspond to a node at the start of the road
        var node = edgeMap.get(coords[0][0] + "," + coords[0][1]); 
        if(node) node.push(edges[i]); //Append the new edge to the edges already at those coordinates
        edgeMap.set(coords[0][0] + "," + coords[0][1], node ? node : [edges[i]]); //Update edgemap
        //Return the value in the hashmap for the last set of coordinates in the list. These coordinates will correspond to a node at the end of the road
        node = edgeMap.get(coords[coords.length - 1][0] + "," + coords[coords.length - 1][1]);
        if(node) node.push(edges[i]);
        edgeMap.set(coords[coords.length - 1][0] + "," + coords[coords.length - 1][1], node ? node : [edges[i]]);
    }
}