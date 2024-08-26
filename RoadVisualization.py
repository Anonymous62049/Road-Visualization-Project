import osmnx as ox
import networkx as nx
place = "Charlestown, Newcastle, NSW"
G = ox.graph_from_place(place, network_type="drive", truncate_by_edge=True)
G_proj = ox.project_graph(G)
ox.consolidate_intersections(G_proj, rebuild_graph=True, tolerance=30)
nodes, edges = ox.graph_to_gdfs(G_proj)
for edge in list(G_proj.edges(data=True)):
    geometry = edge[2].get('geometry')
    if geometry != None:
        points = str(geometry).replace("LINESTRING (", "").replace(")", "").split(", ")
        for point in points:
            x, y = long(point.split(" "))
            print(x, y)
