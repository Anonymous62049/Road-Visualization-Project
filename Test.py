import osmnx as ox
import networkx as nx
import json

# Get the road network for a specific location
G = ox.graph_from_place('Randwick, Sydney, NSW, Australia', network_type='drive')

# Get the edges and nodes
edges = ox.graph_to_gdfs(G, nodes=False, edges=True)
nodes = ox.graph_to_gdfs(G, nodes=True, edges=False)

# Convert to a format suitable for JavaScript (e.g., GeoJSON)
edges_json = edges.to_json()
nodes_json = nodes.to_json()

# Save as JSON files
with open('edges.json', 'w') as f:
    f.write(edges_json)
with open('nodes.json', 'w') as f:
    f.write(nodes_json)